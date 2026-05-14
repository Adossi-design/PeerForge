import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchAll(
    query: string,
    filters?: {
      type?: string;
      skillIds?: string[];
    },
  ) {
    const [posts, users, skills] = await Promise.all([
      this.searchPosts(query, filters),
      this.searchUsers(query),
      this.searchSkills(query),
    ]);

    return {
      posts,
      users,
      skills,
    };
  }

  private async searchPosts(query: string, filters?: any) {
    return this.prisma.post.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          filters?.type ? { type: filters.type } : {},
        ],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        author: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  private async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        reputation: true,
      },
    });
  }

  private async searchSkills(query: string) {
    return this.prisma.skill.findMany({
      where: {
        name: { contains: query },
      },
      take: 10,
    });
  }
}
