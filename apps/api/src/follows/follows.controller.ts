import { Controller, Post, Get, Param, Req, BadRequestException } from '@nestjs/common';
import { FollowsService } from './follows.service';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  async follow(@Param('userId') targetId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User not authenticated');
    return this.followsService.follow(userId, targetId);
  }

  @Get(':userId/status')
  async getStatus(@Param('userId') targetId: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return { following: false };
    return this.followsService.getFollowStatus(userId, targetId);
  }

  @Get(':userId/counts')
  async getCounts(@Param('userId') userId: string) {
    return this.followsService.getCounts(userId);
  }
}
