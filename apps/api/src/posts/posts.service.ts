import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PostVisibility } from '@/types';

const POST_INCLUDE = {
  author: { select: { id: true, username: true, avatarUrl: true } },
  _count: { select: { comments: true, likes: true } },
};

function parseTags(post: any) {
  return {
    ...post,
    tags: post.tags
      ? typeof post.tags === 'string'
        ? (() => { try { return JSON.parse(post.tags); } catch { return []; } })()
        : post.tags
      : [],
    attachments: post.attachments
      ? (() => { try { return JSON.parse(post.attachments); } catch { return []; } })()
      : [],
  };
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, data: CreatePostDto) {
    // Resolve to prisma user id
    let user = await this.prisma.user.findUnique({ where: { id: authorId } });
    if (!user) user = await this.prisma.user.findUnique({ where: { clerkId: authorId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { clerkId: authorId, email: `${authorId}@dev.local`, username: `user_${authorId.slice(-8)}` },
      });
    }

    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status || 'IDEATION',
        visibility: data.visibility || 'PUBLIC',
        tags: data.tags ? JSON.stringify(data.tags) : null,
        teamSize: data.teamSize,
        deadline: data.deadline ? new Date(data.deadline) : null,
        budget: data.budget,
        repositoryUrl: data.repositoryUrl,
        attachments: (data as any).attachments ? JSON.stringify((data as any).attachments) : null,
        authorId: user.id,
      },
      include: POST_INCLUDE,
    });

    if (data.requiredSkillIds?.length) {
      for (const skillId of data.requiredSkillIds) {
        await this.prisma.postSkill.create({ data: { postId: post.id, skillId } }).catch(() => {});
      }
    }

    // Create associated discussion room
    await this.prisma.discussion.create({
      data: {
        postId: post.id,
        name: `${data.title}`,
        description: data.description,
        type: 'PROJECT',
      },
    });

    return parseTags(post);
  }

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        ...POST_INCLUDE,
        requiredSkills: { include: { skill: true } },
        discussion: { select: { id: true, memberCount: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return parseTags(post);
  }

  async getFeed(skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: { visibility: PostVisibility.PUBLIC },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });
    return posts.map(parseTags);
  }

  async updatePost(postId: string, authorId: string, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('You can only edit your own posts');

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        visibility: data.visibility,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
      include: POST_INCLUDE,
    });
    return parseTags(updated);
  }

  async deletePost(postId: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('You can only delete your own posts');
    return this.prisma.post.delete({ where: { id: postId } });
  }

  async searchPosts(query: string, tags: string[] = [], skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        AND: [
          { visibility: 'PUBLIC' },
          { OR: [{ title: { contains: query } }, { description: { contains: query } }] },
        ],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });
    return posts.map(parseTags);
  }

  async getUserPosts(userId: string, skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });
    return posts.map(parseTags);
  }

  async likePost(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.like.create({ data: { userId, postId } });
    return { liked: true };
  }

  async savePost(postId: string, userId: string) {
    // Check if already saved
    const existing = await this.prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    }).catch(() => null);

    if (existing) {
      await this.prisma.savedPost.delete({ where: { id: existing.id } }).catch(() => {});
      return { saved: false };
    }

    await this.prisma.savedPost.create({ data: { userId, postId } }).catch(() => {});
    return { saved: true };
  }

  async getSavedPosts(userId: string) {
    const saved = await this.prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);
    return saved.map((s: any) => parseTags(s.post)).filter(Boolean);
  }
}
