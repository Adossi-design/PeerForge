import { Module } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CollaborationsController } from './collaborations.controller';
import { PrismaModule } from '@/database/prisma.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CollaborationsController],
  providers: [CollaborationsService],
})
export class CollaborationsModule {}
