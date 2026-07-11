import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('analytics')
  getAnalytics(@Query('className') className?: string) {
    return this.dashboardService.getAnalytics(className);
  }

  @Post('executive-ai-advisor')
  getExecutiveAIInsight(@Body('query') query: string) {
    return this.dashboardService.getExecutiveAIInsight(query);
  }
}
