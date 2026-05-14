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
} from '@nestjs/common';
import { DiscussionsService } from './discussions.service';

@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  /**
   * Get discussion by post ID
   */
  @Get('post/:postId')
  async getDiscussionByPostId(@Param('postId') postId: string) {
    const discussion =
      await this.discussionsService.getDiscussionByPostId(postId);
    return { discussion };
  }

  /**
   * Get messages in discussion
   */
  @Get(':id/messages')
  async getMessages(
    @Param('id') discussionId: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '50',
  ) {
    const messages = await this.discussionsService.getDiscussionMessages(
      discussionId,
      parseInt(skip),
      parseInt(take),
    );
    return { messages };
  }

  /**
   * Join discussion
   */
  @Post(':id/join')
  async joinDiscussion(@Param('id') discussionId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const member = await this.discussionsService.joinDiscussion(
      discussionId,
      userId,
    );
    return { member };
  }

  /**
   * Leave discussion
   */
  @Delete(':id/leave')
  async leaveDiscussion(@Param('id') discussionId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.discussionsService.leaveDiscussion(discussionId, userId);
    return { success: true };
  }
}
