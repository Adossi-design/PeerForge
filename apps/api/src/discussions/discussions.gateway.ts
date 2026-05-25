import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DiscussionsService } from './discussions.service';
import { SendMessageDto } from './dto/message.dto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { authenticateSocket, getSocketUserId } from '@/common/socket-auth.helper';

@WebSocketGateway({
  namespace: '/discussions',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class DiscussionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(DiscussionsGateway.name);
  private userSocketMap = new Map<string, Set<string>>();

  constructor(
    private discussionsService: DiscussionsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = await authenticateSocket(this.prisma, client);
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
      return;
    }
    if (!this.userSocketMap.has(userId)) this.userSocketMap.set(userId, new Set());
    this.userSocketMap.get(userId)!.add(client.id);
    this.logger.debug(`socket connected: ${client.id} (user ${userId})`);
  }

  handleDisconnect(client: Socket) {
    const userId = getSocketUserId(client);
    if (!userId) return;
    const set = this.userSocketMap.get(userId);
    if (set) {
      set.delete(client.id);
      if (set.size === 0) this.userSocketMap.delete(userId);
    }
  }

  @SubscribeMessage('join_discussion')
  async handleJoinDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string },
  ) {
    const userId = getSocketUserId(client);
    if (!userId) return { success: false, error: 'Unauthorized' };

    client.join(`discussion_${data.discussionId}`);
    await this.discussionsService.joinDiscussion(data.discussionId, userId);
    this.server.to(`discussion_${data.discussionId}`).emit('user_joined', { userId, timestamp: new Date() });
    return { success: true };
  }

  @SubscribeMessage('leave_discussion')
  async handleLeaveDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string },
  ) {
    const userId = getSocketUserId(client);
    if (!userId) return { success: false };

    client.leave(`discussion_${data.discussionId}`);
    await this.discussionsService.leaveDiscussion(data.discussionId, userId);
    this.server.to(`discussion_${data.discussionId}`).emit('user_left', { userId, timestamp: new Date() });
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; message: SendMessageDto },
  ) {
    try {
      const userId = getSocketUserId(client);
      if (!userId) throw new Error('Unauthorized');

      // Auto-join if not already a member
      await this.discussionsService.joinDiscussion(data.discussionId, userId);
      client.join(`discussion_${data.discussionId}`);

      const saved = await this.discussionsService.sendMessage(data.discussionId, userId, data.message);

      this.server.to(`discussion_${data.discussionId}`).emit('message_received', {
        id: saved.id,
        content: saved.content,
        type: saved.type,
        author: saved.author,
        codeBlock: saved.codeBlock,
        createdAt: saved.createdAt,
      });

      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'Failed to send message' });
      return { success: false };
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; messageId: string },
  ) {
    try {
      const userId = getSocketUserId(client);
      if (!userId) throw new Error('Unauthorized');
      // Ownership check is enforced inside discussionsService.deleteMessage
      await this.discussionsService.deleteMessage(data.messageId, userId);
      this.server.to(`discussion_${data.discussionId}`).emit('message_deleted', { messageId: data.messageId });
      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message });
      return { success: false };
    }
  }

  @SubscribeMessage('react_message')
  async handleReactMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; messageId: string; emoji: string },
  ) {
    try {
      const userId = getSocketUserId(client);
      if (!userId) throw new Error('Unauthorized');
      await this.discussionsService.addReaction(data.messageId, data.emoji, userId);
      this.server.to(`discussion_${data.discussionId}`).emit('message_reacted', {
        messageId: data.messageId, emoji: data.emoji, userId,
      });
      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message });
      return { success: false };
    }
  }

  @SubscribeMessage('user_typing')
  handleUserTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { discussionId: string; username: string }) {
    const userId = getSocketUserId(client);
    if (!userId) return;
    this.server.to(`discussion_${data.discussionId}`).emit('user_typing', { userId, username: data.username });
  }

  @SubscribeMessage('user_stop_typing')
  handleUserStopTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { discussionId: string }) {
    const userId = getSocketUserId(client);
    if (!userId) return;
    this.server.to(`discussion_${data.discussionId}`).emit('user_stop_typing', { userId });
  }
}
