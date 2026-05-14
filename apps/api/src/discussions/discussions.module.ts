import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsGateway } from './discussions.gateway';
import { DiscussionsController } from './discussions.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService, DiscussionsGateway],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
