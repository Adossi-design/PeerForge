import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

const USER_SELECT = { id: true, username: true, avatarUrl: true, fullName: true };

@Injectable()
export class DirectMessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    return this.prisma.directMessage.create({
      data: { senderId, receiverId, content },
      include: { sender: { select: USER_SELECT }, receiver: { select: USER_SELECT } },
    });
  }

  async getConversation(userAId: string, userBId: string, skip = 0, take = 50) {
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
      include: { sender: { select: USER_SELECT } },
    });
    // Mark received messages as read
    await this.prisma.directMessage.updateMany({
      where: { senderId: userBId, receiverId: userAId, read: false },
      data: { read: true },
    });
    return messages;
  }

  async getInbox(userId: string) {
    // Get the latest message per conversation partner
    const sent = await this.prisma.directMessage.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: { receiver: { select: USER_SELECT } },
    });
    const received = await this.prisma.directMessage.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: USER_SELECT } },
    });

    // Build a map of partnerId -> latest message
    const map = new Map<string, any>();
    for (const m of sent) {
      const partner = (m as any).receiver;
      if (!partner) continue;
      if (!map.has(partner.id) || new Date(m.createdAt) > new Date(map.get(partner.id).createdAt)) {
        map.set(partner.id, { ...m, partner });
      }
    }
    for (const m of received) {
      const partner = (m as any).sender;
      if (!partner) continue;
      if (!map.has(partner.id) || new Date(m.createdAt) > new Date(map.get(partner.id).createdAt)) {
        map.set(partner.id, { ...m, partner });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getUnreadCount(userId: string) {
    return this.prisma.directMessage.count({ where: { receiverId: userId, read: false } });
  }
}
