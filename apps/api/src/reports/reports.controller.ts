import { Controller, Post, Body, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportTargetType } from '@/types';
import { AuthenticatedRequest } from '@/common/auth-request';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: { targetType: ReportTargetType; targetId: string; reason: string; details?: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    if (!body.targetType || !body.targetId || !body.reason) {
      throw new BadRequestException('targetType, targetId and reason are required');
    }
    const report = await this.reportsService.createReport(
      userId,
      body.targetType,
      body.targetId,
      body.reason,
      body.details,
    );
    return { success: true, report };
  }
}
