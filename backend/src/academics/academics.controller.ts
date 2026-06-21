import { Controller, Get, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';

@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('pathfinder')
  getPathfinderData() {
    return this.academicsService.getPathfinderData();
  }
}
