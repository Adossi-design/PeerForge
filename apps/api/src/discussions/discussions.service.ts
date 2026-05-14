import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  async getDiscussionByPostId(postId: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { postId },
      include: {
        members: true,
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    return discussion;
  }

  async joinDiscussion(discussionId: string, userId: string) {
    // Check if already a member
    const existingMember = await this.prisma.discussionMember.findUnique({
      where: {
        discussionId_userId: {
          discussionId,
          userId,
        },
      },
    });

    if (existingMember) {
      return existingMember;
    }

    const member = await this.prisma.discussionMember.create({
      data: {
        discussionId,
        userId,
      },
    });

    // Update member count
    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { memberCount: { increment: 1 } },
    });

    return member;
  }

  async leaveDiscussion(discussionId: string, userId: string) {
    await this.prisma.discussionMember.delete({
      where: {
        discussionId_userId: {
          discussionId,
          userId,
        },
      },
    });

    // Update member count
    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { memberCount: { decrement: 1 } },
    });

    return { success: true };
  }

  async sendMessage(
    discussionId: string,
    userId: string,
    data: SendMessageDto,
  ) {
    // Verify user is member of discussion
    const member = await this.prisma.discussionMember.findUnique({
      where: {
        discussionId_userId: {
          discussionId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this discussion');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        discussionId,
        authorId: userId,
        content: data.content,
        type: data.codeLanguage ? 'CODE' : 'TEXT',
        codeBlock: data.codeLanguage
          ? {
              create: {
                language: data.codeLanguage,
                code: data.codeContent || '',
                filename: data.codeFilename,
              },
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        codeBlock: true,
      },
    });

    // Update message count
    await this.prisma.discussion.update({
      where: { id: discussionId },
      data: { messageCount: { increment: 1 } },
    });

    return message;
  }

  async getDiscussionMessages(
    discussionId: string,
    skip = 0,
    take = 50,
  ) {
    const messages = await this.prisma.message.findMany({
      where: { discussionId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        codeBlock: true,
        reactions: true,
      },
    });

    return messages;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only author or moderator can delete
    if (message.authorId !== userId) {
      throw new NotFoundException('Unauthorized');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    // Update message count
    await this.prisma.discussion.update({
      where: { id: message.discussionId },
      data: { messageCount: { decrement: 1 } },
    });

    return { success: true };
  }

  async addReaction(messageId: string, emoji: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const existingReaction = await this.prisma.reaction.findUnique({
      where: {
        messageId_emoji: {
          messageId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      return this.prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { count: { increment: 1 } },
      });
    }

    return this.prisma.reaction.create({
      data: {
        messageId,
        emoji,
        count: 1,
      },
    });
  }
}
