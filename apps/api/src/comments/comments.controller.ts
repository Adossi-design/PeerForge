import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { clampInt, SKIP_DEFAULT, SKIP_MAX, TAKE_DEFAULT, TAKE_MAX } from '@/common/pagination';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Create comment on post
   */
  @Post()
  async createComment(
    @Body() data: { postId: string; content: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    // Validate required fields
    if (!data.postId || !data.content?.trim()) {
      throw new BadRequestException('postId and content are required');
    }

    const comment = await this.commentsService.createComment(
      data.postId,
      userId,
      data.content.trim(),
    );
    return { comment };
  }

  /**
   * Get comments for post
   */
  @Get('post/:postId')
  async getComments(
    @Param('postId') postId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    const comments = await this.commentsService.getComments(
      postId,
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
    );
    return { comments };
  }

  /**
   * Delete comment
   */
  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.commentsService.deleteComment(commentId, userId);
    return { success: true };
  }

  /**
   * Like comment
   */
  @Post(':id/like')
  async likeComment(@Param('id') commentId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const result = await this.commentsService.likeComment(commentId, userId);
    return result;
  }
}
