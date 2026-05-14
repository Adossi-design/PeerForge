import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DiscussionsService } from './discussions.service';
import { SendMessageDto } from './dto/message.dto';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/discussions',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class DiscussionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSocketMap = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private discussionsService: DiscussionsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up user socket mapping
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSocketMap.delete(userId);
        }
      }
    }
  }

  /**
   * Join a discussion room
   */
  @SubscribeMessage('join_discussion')
  async handleJoinDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      userId: string;
    },
  ) {
    const { discussionId, userId } = data;

    // Track user socket
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)!.add(client.id);

    // Join socket room
    client.join(`discussion_${discussionId}`);

    // Add user to discussion members
    await this.discussionsService.joinDiscussion(discussionId, userId);

    // Broadcast user joined
    this.server.to(`discussion_${discussionId}`).emit('user_joined', {
      userId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Leave a discussion room
   */
  @SubscribeMessage('leave_discussion')
  async handleLeaveDiscussion(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      userId: string;
    },
  ) {
    const { discussionId, userId } = data;

    client.leave(`discussion_${discussionId}`);

    await this.discussionsService.leaveDiscussion(discussionId, userId);

    // Broadcast user left
    this.server.to(`discussion_${discussionId}`).emit('user_left', {
      userId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Send message to discussion
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      userId: string;
      message: SendMessageDto;
    },
  ) {
    const { discussionId, userId, message } = data;

    try {
      const savedMessage = await this.discussionsService.sendMessage(
        discussionId,
        userId,
        message,
      );

      // Broadcast message to room
      this.server.to(`discussion_${discussionId}`).emit('message_received', {
        id: savedMessage.id,
        content: savedMessage.content,
        type: savedMessage.type,
        author: savedMessage.author,
        codeBlock: savedMessage.codeBlock,
        createdAt: savedMessage.createdAt,
      });

      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'Unknown error' });
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Delete message
   */
  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      messageId: string;
      userId: string;
    },
  ) {
    const { discussionId, messageId, userId } = data;

    try {
      await this.discussionsService.deleteMessage(messageId, userId);

      this.server.to(`discussion_${discussionId}`).emit('message_deleted', {
        messageId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'Unknown error' });
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Add reaction to message
   */
  @SubscribeMessage('react_message')
  async handleReactMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      messageId: string;
      emoji: string;
      userId: string;
    },
  ) {
    const { discussionId, messageId, emoji, userId } = data;

    try {
      await this.discussionsService.addReaction(messageId, emoji, userId);

      this.server.to(`discussion_${discussionId}`).emit('message_reacted', {
        messageId,
        emoji,
        userId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'Unknown error' });
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('user_typing')
  handleUserTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      userId: string;
      username: string;
    },
  ) {
    this.server.to(`discussion_${data.discussionId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username,
    });
  }

  /**
   * Stop typing indicator
   */
  @SubscribeMessage('user_stop_typing')
  handleUserStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      discussionId: string;
      userId: string;
    },
  ) {
    this.server
      .to(`discussion_${data.discussionId}`)
      .emit('user_stop_typing', {
        userId: data.userId,
      });
  }
}
