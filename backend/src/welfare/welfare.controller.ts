import { Controller, Get, UseGuards } from '@nestjs/common';
import { WelfareService } from './welfare.service';

@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Get('dashboard')
  getDashboardData() {
    return this.welfareService.getDashboardData();
  }
}
