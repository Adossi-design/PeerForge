import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export class CommentDto {
  content!: string;
}

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(postId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getComments(postId: string, skip = 0, take = 20) {
    return this.prisma.comment.findMany({
      where: { postId },
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
            likes: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async likeComment(commentId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
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
        commentId,
      },
    });

    return { liked: true };
  }
}
