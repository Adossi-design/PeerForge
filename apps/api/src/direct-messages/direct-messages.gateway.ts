import {
  WebSocketGateway, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { authenticateSocket, getSocketUserId } from '@/common/socket-auth.helper';

@WebSocketGateway({
  namespace: '/dm',
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})
@Injectable()
export class DirectMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(DirectMessagesGateway.name);
  // userId -> set of socket ids (one user may have multiple tabs / devices)
  private userSocketMap = new Map<string, Set<string>>();

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const userId = await authenticateSocket(this.prisma, client);
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
      return;
    }
    if (!this.userSocketMap.has(userId)) this.userSocketMap.set(userId, new Set());
    this.userSocketMap.get(userId)!.add(client.id);
    this.logger.debug(`dm socket connected: ${client.id} (user ${userId})`);
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

  /**
   * Push a DM in real-time to both participants (called from the REST controller
   * after persisting). Falls back gracefully if either side isn't currently
   * connected — they'll see the message on next poll/refetch.
   */
  deliverMessage(senderId: string, receiverId: string, message: unknown) {
    const targets = [
      ...(this.userSocketMap.get(senderId) ?? []),
      ...(this.userSocketMap.get(receiverId) ?? []),
    ];
    for (const sid of targets) {
      this.server.to(sid).emit('dm_received', message);
    }
  }
}
