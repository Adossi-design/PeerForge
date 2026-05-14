import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get user notifications
   */
  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const notifications =
      await this.notificationsService.getUserNotifications(userId);
    return { notifications };
  }

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notification as read
   */
  @Put(':id/read')
  async markAsRead(@Param('id') notificationId: string) {
    await this.notificationsService.markAsRead(notificationId);
    return { success: true };
  }

  /**
   * Mark all as read
   */
  @Put('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }

  /**
   * Delete notification
   */
  @Delete(':id')
  async deleteNotification(@Param('id') notificationId: string) {
    await this.notificationsService.deleteNotification(notificationId);
    return { success: true };
  }
}
