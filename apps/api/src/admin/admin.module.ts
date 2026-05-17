import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '@/database/prisma.module';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [PrismaModule, ReportsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
