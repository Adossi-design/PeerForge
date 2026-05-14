import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DiscussionsService } from './discussions.service';
import { SendMessageDto } from './dto/message.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

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
  private userSocketMap = new Map<string, Set<string>>();

  constructor(
    private discussionsService: DiscussionsService,
    private prisma: PrismaService,
  ) {}

  // Resolve Clerk ID or DB ID to actual DB user ID
  private async resolveUserId(id: string): Promise<string | null> {
    if (!id) return null;
    // Try direct DB id first
    let user = await this.prisma.user.findUnique({ where: { id } });
    if (user) return user.id;
    // Try Clerk id
    user = await this.prisma.user.findUnique({ where: { clerkId: id } });
    return user?.id ?? null;
  }

  handleConnection(client: Socket) {
    console.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) this.userSocketMap.delete(userId);
      }
    }
  }

  @SubscribeMessage('join_discussion')
  async handleJoinDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; userId: string },
  ) {
    const dbUserId = await this.resolveUserId(data.userId);
    if (!dbUserId) return { success: false, error: 'User not found' };

    if (!this.userSocketMap.has(dbUserId)) this.userSocketMap.set(dbUserId, new Set());
    this.userSocketMap.get(dbUserId)!.add(client.id);

    client.join(`discussion_${data.discussionId}`);
    await this.discussionsService.joinDiscussion(data.discussionId, dbUserId);
    this.server.to(`discussion_${data.discussionId}`).emit('user_joined', { userId: dbUserId, timestamp: new Date() });
    return { success: true };
  }

  @SubscribeMessage('leave_discussion')
  async handleLeaveDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; userId: string },
  ) {
    const dbUserId = await this.resolveUserId(data.userId);
    if (!dbUserId) return { success: false };

    client.leave(`discussion_${data.discussionId}`);
    await this.discussionsService.leaveDiscussion(data.discussionId, dbUserId);
    this.server.to(`discussion_${data.discussionId}`).emit('user_left', { userId: dbUserId, timestamp: new Date() });
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { discussionId: string; userId: string; message: SendMessageDto },
  ) {
    try {
      const dbUserId = await this.resolveUserId(data.userId);
      if (!dbUserId) throw new Error('User not found');

      // Auto-join if not already a member
      await this.discussionsService.joinDiscussion(data.discussionId, dbUserId);
      client.join(`discussion_${data.discussionId}`);

      const saved = await this.discussionsService.sendMessage(data.discussionId, dbUserId, data.message);

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
    @MessageBody() data: { discussionId: string; messageId: string; userId: string },
  ) {
    try {
      const dbUserId = await this.resolveUserId(data.userId);
      if (!dbUserId) throw new Error('User not found');
      await this.discussionsService.deleteMessage(data.messageId, dbUserId);
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
    @MessageBody() data: { discussionId: string; messageId: string; emoji: string; userId: string },
  ) {
    try {
      await this.discussionsService.addReaction(data.messageId, data.emoji, data.userId);
      this.server.to(`discussion_${data.discussionId}`).emit('message_reacted', {
        messageId: data.messageId, emoji: data.emoji, userId: data.userId,
      });
      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message });
      return { success: false };
    }
  }

  @SubscribeMessage('user_typing')
  handleUserTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { discussionId: string; userId: string; username: string }) {
    this.server.to(`discussion_${data.discussionId}`).emit('user_typing', { userId: data.userId, username: data.username });
  }

  @SubscribeMessage('user_stop_typing')
  handleUserStopTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { discussionId: string; userId: string }) {
    this.server.to(`discussion_${data.discussionId}`).emit('user_stop_typing', { userId: data.userId });
  }
}
