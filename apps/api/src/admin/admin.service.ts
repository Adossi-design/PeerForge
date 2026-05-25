import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // ConfigModule has loaded env files by this point. Warn at startup if
    // admin creds aren't configured.
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_JWT_SECRET) {
      this.logger.warn(
        'ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JWT_SECRET must all be set in the environment. Admin login is disabled until they are configured.',
      );
    }
  }

  login(email: string, password: string) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminJwtSecret = process.env.ADMIN_JWT_SECRET;

    if (!adminEmail || !adminPassword || !adminJwtSecret) {
      throw new UnauthorizedException('Admin login is not configured');
    }
    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
    const token = jwt.sign({ role: 'admin', email }, adminJwtSecret, { expiresIn: '24h' });
    return { token, email };
  }

  verifyToken(token: string) {
    const adminJwtSecret = process.env.ADMIN_JWT_SECRET;
    if (!adminJwtSecret) {
      throw new UnauthorizedException('Admin authentication is not configured');
    }
    try {
      return jwt.verify(token, adminJwtSecret) as { role: string; email: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }

  async getStats() {
    const [
      totalUsers,
      totalPosts,
      totalDiscussions,
      totalMessages,
      totalComments,
      totalCollaborations,
      recentUsers,
      recentPosts,
      postsByType,
      topPosts,
      activeUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.discussion.count(),
      this.prisma.message.count(),
      this.prisma.comment.count(),
      this.prisma.collaboration.count(),
      // Last 7 days signups
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, username: true, fullName: true, avatarUrl: true, createdAt: true, reputation: true },
      }),
      // Last 5 posts
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, type: true, createdAt: true, viewCount: true, shareCount: true, author: { select: { username: true } } },
      }),
      // Posts grouped by type
      this.prisma.post.groupBy({ by: ['type'], _count: { id: true } }),
      // Top posts by likes
      this.prisma.post.findMany({
        orderBy: { likes: { _count: 'desc' } },
        take: 5,
        include: { author: { select: { username: true } }, _count: { select: { likes: true, comments: true } } },
      }),
      // Users with most posts
      this.prisma.user.findMany({
        orderBy: { posts: { _count: 'desc' } },
        take: 5,
        select: { id: true, username: true, fullName: true, avatarUrl: true, reputation: true, _count: { select: { posts: true } } },
      }),
    ]);

    // Daily signups for last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
    const dailyUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: twoWeeksAgo } },
      select: { createdAt: true },
    });
    const dailyPosts = await this.prisma.post.findMany({
      where: { createdAt: { gte: twoWeeksAgo } },
      select: { createdAt: true },
    });

    const activityChart = buildDailyChart(dailyUsers, dailyPosts);

    return {
      overview: { totalUsers, totalPosts, totalDiscussions, totalMessages, totalComments, totalCollaborations },
      recentUsers,
      recentPosts,
      postsByType: postsByType.map((p) => ({ type: p.type, count: p._count.id })),
      topPosts: topPosts.map((p) => ({
        id: p.id, title: p.title, author: p.author.username,
        likes: p._count.likes, comments: p._count.comments,
        views: p.viewCount, shares: p.shareCount,
      })),
      activeUsers,
      activityChart,
    };
  }

  async getUsers(skip = 0, take = 20, search = '') {
    const where = search
      ? { OR: [{ username: { contains: search } }, { email: { contains: search } }, { fullName: { contains: search } }] }
      : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, fullName: true, email: true,
          avatarUrl: true, reputation: true, isVerified: true, createdAt: true,
          _count: { select: { posts: true, followers: true, following: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async getPosts(skip = 0, take = 20, search = '') {
    const where = search
      ? { OR: [{ title: { contains: search } }, { description: { contains: search } }] }
      : {};
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return {
      posts: posts.map((p) => ({
        id: p.id, title: p.title, type: p.type, status: p.status,
        author: p.author.username, authorAvatar: p.author.avatarUrl,
        likes: p._count.likes, comments: p._count.comments,
        views: p.viewCount, shares: p.shareCount,
        createdAt: p.createdAt,
      })),
      total,
    };
  }

  async deletePost(id: string) {
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}

function buildDailyChart(users: { createdAt: Date }[], posts: { createdAt: Date }[]) {
  const days: { date: string; users: number; posts: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: label,
      users: users.filter((u) => u.createdAt.toISOString().slice(0, 10) === dateStr).length,
      posts: posts.filter((p) => p.createdAt.toISOString().slice(0, 10) === dateStr).length,
    });
  }
  return days;
}
