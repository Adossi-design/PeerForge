import { Controller, Post, Put, Get, Param, Body, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post('posts/:postId/request')
  async request(
    @Param('postId') postId: string,
    @Body('message') message: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const collab = await this.collaborationsService.requestCollaboration(postId, userId, message);
    return { collab };
  }

  @Put(':id/respond')
  async respond(
    @Param('id') id: string,
    @Body('accept') accept: boolean,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const collab = await this.collaborationsService.respondToCollaboration(id, userId, accept);
    return { collab };
  }

  @Get('posts/:postId')
  async getPostCollaborations(@Param('postId') postId: string) {
    const collaborations = await this.collaborationsService.getPostCollaborations(postId);
    return { collaborations };
  }

  @Get('posts/:postId/status')
  async getStatus(@Param('postId') postId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.collaborationsService.getCollaborationStatus(postId, userId);
  }

  @Get('mine')
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const collaborations = await this.collaborationsService.getUserCollaborations(userId);
    return { collaborations };
  }
}
