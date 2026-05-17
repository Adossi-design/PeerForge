import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { ReportsService, ReportTargetType } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Req() req: any,
    @Body() body: { targetType: ReportTargetType; targetId: string; reason: string; details?: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('User not authenticated');
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
