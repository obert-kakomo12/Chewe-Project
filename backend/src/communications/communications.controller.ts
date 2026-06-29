import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Post()
  async createInformation(@Body() data: any) {
    // In a real app, verify user is an Executive or Class Teacher
    return this.commsService.create(data);
  }

  @Post('student-feed')
  async getStudentFeed(@Body() body: { classRoomId: number | null, courseIds: number[] }) {
    // Ideally user id is extracted from JWT to get their class and enrollments
    return this.commsService.getInformationForStudent(body.classRoomId, body.courseIds || []);
  }
}
