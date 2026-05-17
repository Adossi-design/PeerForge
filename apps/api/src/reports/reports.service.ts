import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
    reason: string,
    details?: string,
  ) {
    // Prevent duplicate pending reports from same user on same target
    const existing = await this.prisma.report.findFirst({
      where: { reporterId, targetType, targetId, status: 'PENDING' },
    });
    if (existing) throw new BadRequestException('You have already reported this.');

    return this.prisma.report.create({
      data: { reporterId, targetType, targetId, reason, details },
    });
  }

  async getPendingCount() {
    const count = await this.prisma.report.count({ where: { status: 'PENDING' } });
    return { count };
  }

  async getReports(status?: string, skip = 0, take = 50) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async updateStatus(id: string, status: 'REVIEWED' | 'DISMISSED') {
    return this.prisma.report.update({ where: { id }, data: { status } });
  }
}
