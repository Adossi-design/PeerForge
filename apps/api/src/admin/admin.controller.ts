import { Controller, Post, Get, Put, Delete, Body, Param, Query, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { ReportsService } from '@/reports/reports.service';
import { ReportStatus } from '@/types';

function extractAdminToken(req: Request): string {
  const auth = req.headers['authorization'] ?? '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  throw new UnauthorizedException('Admin token required');
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reportsService: ReportsService,
  ) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) throw new BadRequestException('Email and password required');
    return this.adminService.login(body.email, body.password);
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(
    @Req() req: Request,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
    @Query('search') search = '',
  ) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.adminService.getUsers(+skip, +take, search);
  }

  @Delete('users/:id')
  deleteUser(@Req() req: Request, @Param('id') id: string) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.adminService.deleteUser(id);
  }

  @Get('posts')
  getPosts(
    @Req() req: Request,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
    @Query('search') search = '',
  ) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.adminService.getPosts(+skip, +take, search);
  }

  @Delete('posts/:id')
  deletePost(@Req() req: Request, @Param('id') id: string) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.adminService.deletePost(id);
  }

  @Get('reports')
  getReports(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    const allowed = Object.values(ReportStatus) as string[];
    const filterStatus = status && allowed.includes(status) ? (status as ReportStatus) : undefined;
    return this.reportsService.getReports(filterStatus, +skip, +take);
  }

  @Get('reports/count')
  getReportCount(@Req() req: Request) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.reportsService.getPendingCount();
  }

  @Put('reports/:id')
  updateReport(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { status: ReportStatus.REVIEWED | ReportStatus.DISMISSED },
  ) {
    const token = extractAdminToken(req);
    this.adminService.verifyToken(token);
    return this.reportsService.updateStatus(id, body.status);
  }
}
