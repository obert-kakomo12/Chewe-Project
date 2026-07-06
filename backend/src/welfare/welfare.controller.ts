import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
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

  @Patch('profile/:id')
  updateProfile(@Param('id') id: string, @Body() data: any) {
    return this.welfareService.updateProfile(+id, data);
  }
}
