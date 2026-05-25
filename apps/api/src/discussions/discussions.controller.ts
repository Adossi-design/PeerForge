import {
  Controller, Get, Post, Delete, Param, Query, Req, UnauthorizedException,
} from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { clampInt, SKIP_DEFAULT, SKIP_MAX, TAKE_DEFAULT, TAKE_MAX } from '@/common/pagination';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  async getAllDiscussions(
    @Query('skip') skip = '0',
    @Query('take') take = '20',
  ) {
    const discussions = await this.discussionsService.getAllDiscussions(
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
    );
    return { discussions };
  }

  @Get('post/:postId')
  async getDiscussionByPostId(@Param('postId') postId: string) {
    const discussion = await this.discussionsService.getDiscussionByPostId(postId);
    return { discussion };
  }

  @Get(':id')
  async getDiscussionById(@Param('id') id: string) {
    const discussion = await this.discussionsService.getDiscussionById(id);
    return { discussion };
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') discussionId: string,
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    const messages = await this.discussionsService.getDiscussionMessages(
      discussionId,
      clampInt(skip, SKIP_DEFAULT, SKIP_MAX),
      clampInt(take, TAKE_DEFAULT, TAKE_MAX),
    );
    return { messages };
  }

  @Post(':id/join')
  async joinDiscussion(@Param('id') discussionId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const member = await this.discussionsService.joinDiscussion(discussionId, userId);
    return { member };
  }

  @Delete(':id/leave')
  async leaveDiscussion(@Param('id') discussionId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    await this.discussionsService.leaveDiscussion(discussionId, userId);
    return { success: true };
  }
}
