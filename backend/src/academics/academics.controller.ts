import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Delete('subjects/:id')
  deleteSubject(@Param('id') id: string) {
    return this.academicsService.deleteSubject(Number(id));
  }

  @Post('classrooms')
  createClassRoom(@Body() data: any) {
    return this.academicsService.createClassRoom(data);
  }

  @Get('classrooms')
  getClassRooms() {
    return this.academicsService.findAllClassRooms();
  }

  @Delete('classrooms/:id')
  deleteClassRoom(@Param('id') id: string) {
    return this.academicsService.deleteClassRoom(Number(id));
  }

  @Get('classes/:className/students')
  getClassStudents(@Param('className') className: string) {
    return this.academicsService.findStudentsByClass(className);
  }

  @Post('classes/:className/students')
  enrollStudent(@Param('className') className: string, @Body() data: { name: string, email: string }) {
    return this.academicsService.enrollNewStudent(className, data.name, data.email);
  }
}
