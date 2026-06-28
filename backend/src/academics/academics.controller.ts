import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';

@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('pathfinder')
  getPathfinderData() {
    return this.academicsService.getPathfinderData();
  }

  @Post('subjects')
  createSubject(@Body() data: any) {
    return this.academicsService.createSubject(data);
  }

  @Get('subjects')
  getSubjects() {
    return this.academicsService.findAllSubjects();
  }

  @Post('classrooms')
  createClassRoom(@Body() data: any) {
    return this.academicsService.createClassRoom(data);
  }

  @Get('classrooms')
  getClassRooms() {
    return this.academicsService.findAllClassRooms();
  }
}
