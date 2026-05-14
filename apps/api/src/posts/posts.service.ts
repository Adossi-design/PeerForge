import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { Post } from '@prisma/client';
import { PostVisibility } from '@/types';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, data: CreatePostDto): Promise<Post> {
    // Resolve author: support both prisma `id` and Clerk `clerkId`.
    let authorPrismaId = authorId;

    // Try find by Prisma id first
    let user = await this.prisma.user.findUnique({ where: { id: authorId } });

    // If not found, try find by clerkId
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { clerkId: authorId } });
    }

    // If still not found, create a new user record (dev fallback)
    if (!user) {
      const created = await this.prisma.user.create({
        data: {
          clerkId: authorId,
          email: `${authorId}@dev.local`,
          username: `user_${authorId}`,
        },
      });
      authorPrismaId = created.id;
    } else {
      authorPrismaId = user.id;
    }

    // Create post
    // Use resolved Prisma author id
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status || 'IDEATION',
        visibility: data.visibility || 'PUBLIC',
        tags: data.tags ? JSON.stringify(data.tags) : null,
        teamSize: data.teamSize,
        deadline: data.deadline,
        budget: data.budget,
        repositoryUrl: data.repositoryUrl,
        authorId: authorPrismaId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        requiredSkills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // Add required skills
    if (data.requiredSkillIds && data.requiredSkillIds.length > 0) {
      for (const skillId of data.requiredSkillIds) {
        await this.prisma.postSkill.create({
          data: {
            postId: post.id,
            skillId,
          },
        });
      }
    }

    // Create associated discussion room
    await this.prisma.discussion.create({
      data: {
        postId: post.id,
        name: `${data.type} - ${data.title}`,
        description: data.description,
      },
    });

    return post;
  }

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            reputation: true,
          },
        },
        requiredSkills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        discussion: {
          select: {
            id: true,
            memberCount: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async getFeed(skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        visibility: PostVisibility.PUBLIC,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        requiredSkills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts;
  }

  async updatePost(postId: string, authorId: string, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        visibility: data.visibility,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async deletePost(postId: string, authorId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  async searchPosts(query: string, tags: string[] = [], skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        AND: [
          { visibility: 'PUBLIC' },
          {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
        ],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts;
  }

  async getUserPosts(userId: string, skip = 0, take = 20) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async likePost(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }

    await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return { liked: true };
  }

  async savePost(postId: string, userId: string) {
    // SavedPost functionality not available in SQLite schema
    // This will be implemented as a separate feature in production
    return { saved: false };
  }
}
