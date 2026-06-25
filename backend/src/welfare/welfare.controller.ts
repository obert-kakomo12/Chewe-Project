import { Controller, Get, Param } from '@nestjs/common';
import { WelfareService } from './welfare.service';

@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Get('dashboard')
  getDashboardData() {
    return this.welfareService.getDashboardData();
  }

  @Get('predictive-suggestions/:id')
  getPredictiveSuggestions(@Param('id') id: string) {
    return this.welfareService.getPredictiveSuggestions(+id);
  }
}
