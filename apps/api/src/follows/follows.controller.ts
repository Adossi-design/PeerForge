import { Controller, Post, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  async follow(@Param('userId') targetId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.followsService.follow(userId, targetId);
  }

  @Get(':userId/status')
  async getStatus(@Param('userId') targetId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) return { following: false };
    return this.followsService.getFollowStatus(userId, targetId);
  }

  @Get(':userId/counts')
  async getCounts(@Param('userId') userId: string) {
    return this.followsService.getCounts(userId);
  }
}
