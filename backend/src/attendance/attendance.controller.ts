import { Controller, Get, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('rollcall')
  getRollCall() {
    return this.attendanceService.getRollCall();
  }
}
