import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) return { following: false };
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId, followingId } });
    await this.prisma.user.update({ where: { id: followingId }, data: { reputation: { increment: 1 } } })
      .catch((err) => this.logger.warn(`rep increment (follow) failed for user ${followingId}: ${err?.message}`));
    return { following: true };
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: !!existing };
  }

  async getCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }
}
