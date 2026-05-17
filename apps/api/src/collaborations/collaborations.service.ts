import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationType } from '@/types';

@Injectable()
export class CollaborationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async requestCollaboration(postId: string, userId: string, message?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, username: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId === userId) throw new BadRequestException('You cannot request to collaborate on your own post');

    const existing = await this.prisma.collaboration.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) throw new BadRequestException('You have already requested to collaborate on this post');

    const requester = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

    const collab = await this.prisma.collaboration.create({
      data: { postId, userId, message, status: 'PENDING' },
    });

    await this.notifications.createNotification(
      post.authorId,
      NotificationType.COLLABORATION_REQUEST,
      `${requester?.username ?? 'Someone'} wants to collaborate on your post`,
      message ?? post.title,
      `/posts/${postId}`,
    );

    return collab;
  }

  async respondToCollaboration(collaborationId: string, ownerId: string, accept: boolean) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        post: { select: { id: true, title: true, authorId: true } },
        user: { select: { id: true, username: true } },
      },
    });
    if (!collab) throw new NotFoundException('Collaboration request not found');
    if (collab.post.authorId !== ownerId) throw new ForbiddenException('Only the post author can respond');
    if (collab.status !== 'PENDING') throw new BadRequestException('This request has already been responded to');

    const status = accept ? 'ACCEPTED' : 'REJECTED';
    const updated = await this.prisma.collaboration.update({
      where: { id: collaborationId },
      data: { status },
    });

    const owner = await this.prisma.user.findUnique({ where: { id: ownerId }, select: { username: true } });

    await this.notifications.createNotification(
      collab.user.id,
      accept ? NotificationType.COLLABORATION_ACCEPTED : NotificationType.COLLABORATION_REQUEST,
      accept
        ? `${owner?.username ?? 'The author'} accepted your collaboration request`
        : `${owner?.username ?? 'The author'} declined your collaboration request`,
      collab.post.title,
      `/posts/${collab.post.id}`,
    );

    if (accept) {
      // +5 rep for post author, +2 rep for requester
      await Promise.all([
        this.prisma.user.update({ where: { id: ownerId }, data: { reputation: { increment: 5 } } }).catch(() => {}),
        this.prisma.user.update({ where: { id: collab.user.id }, data: { reputation: { increment: 2 } } }).catch(() => {}),
      ]);
    }

    return updated;
  }

  async getPostCollaborations(postId: string) {
    return this.prisma.collaboration.findMany({
      where: { postId },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserCollaborations(userId: string) {
    return this.prisma.collaboration.findMany({
      where: { userId },
      include: { post: { select: { id: true, title: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCollaborationStatus(postId: string, userId: string) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return { status: collab?.status ?? null, id: collab?.id ?? null };
  }
}
