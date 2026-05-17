import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';
import { PrismaService } from '@/database/prisma.service';

@WebSocketGateway({
  namespace: '/dm',
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})
@Injectable()
export class DirectMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(private service: DirectMessagesService, private prisma: PrismaService) {}

  private async resolveUserId(id: string): Promise<string | null> {
    let user = await this.prisma.user.findUnique({ where: { id } });
    if (user) return user.id;
    user = await this.prisma.user.findUnique({ where: { clerkId: id } });
    return user?.id ?? null;
  }

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) { this.userSocketMap.delete(userId); break; }
    }
  }

  @SubscribeMessage('dm_register')
  async handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const dbUserId = await this.resolveUserId(data.userId);
    if (dbUserId) this.userSocketMap.set(dbUserId, client.id);
    return { success: true };
  }

  @SubscribeMessage('dm_send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
  ) {
    try {
      const dbSenderId = await this.resolveUserId(data.senderId);
      const dbReceiverId = await this.resolveUserId(data.receiverId);
      if (!dbSenderId || !dbReceiverId) throw new Error('User not found');

      const message = await this.service.sendMessage(dbSenderId, dbReceiverId, data.content);

      // Deliver to receiver if online
      const receiverSocket = this.userSocketMap.get(dbReceiverId);
      if (receiverSocket) {
        this.server.to(receiverSocket).emit('dm_received', message);
      }
      // Echo back to sender
      client.emit('dm_sent', message);
      return { success: true };
    } catch (err: any) {
      client.emit('error', { message: err?.message });
      return { success: false };
    }
  }
}
