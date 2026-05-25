import { Controller, Get, Post, Body, Param, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';
import { DirectMessagesGateway } from './direct-messages.gateway';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('messages')
export class DirectMessagesController {
  constructor(
    private readonly service: DirectMessagesService,
    private readonly gateway: DirectMessagesGateway,
  ) {}

  @Get('inbox')
  async getInbox(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const conversations = await this.service.getInbox(userId);
    return { conversations };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const count = await this.service.getUnreadCount(userId);
    return { count };
  }

  @Get(':userId')
  async getConversation(@Param('userId') otherUserId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    const messages = await this.service.getConversation(userId, otherUserId);
    return { messages };
  }

  @Post(':userId')
  async sendMessage(
    @Param('userId') receiverId: string,
    @Body('content') content: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    if (!content?.trim()) throw new BadRequestException('Message content is required');
    const message = await this.service.sendMessage(userId, receiverId, content.trim());
    this.gateway.deliverMessage(userId, receiverId, message);
    return { message };
  }
}
