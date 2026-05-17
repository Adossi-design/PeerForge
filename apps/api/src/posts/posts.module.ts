import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '@/database/prisma.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
