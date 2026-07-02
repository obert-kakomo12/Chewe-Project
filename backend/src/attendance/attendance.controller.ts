import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('rollcall')
  getRollCall() {
    return this.attendanceService.getRollCall();
  }

  @Post('bulk')
  saveBulkAttendance(@Body() body: { className: string, date: string, records: any[] }) {
    return this.attendanceService.saveBulkAttendance(body.className, body.date, body.records);
  }
}
