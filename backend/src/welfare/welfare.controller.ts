import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WelfareService } from './welfare.service';

@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Get('dashboard')
  getDashboardData() {
    return this.welfareService.getDashboardData();
  }

  @Get('predictive/:logId')
  getPredictiveSuggestions(@Param('logId') logId: string) {
    return this.welfareService.getPredictiveSuggestions(+logId);
  }

  @Get('sponsorship-pipeline')
  getSponsorshipPipeline() {
    return this.welfareService.getSponsorshipPipeline();
  }
}
