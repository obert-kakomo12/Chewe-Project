import { Controller, Get, Post, Body, Headers, UnauthorizedException, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private extractUserId(authHeader?: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('rollcall')
  async getRollCall(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Pass teacher's ID to filter students if the role is a Teacher
    const teacherId = user.role === 'Teacher' ? user.id : undefined;
    return this.attendanceService.getRollCall(teacherId);
  }

  @Post('bulk')
  async saveBulk(@Body() body: { className: string, date: string, records: any[], courseId?: number }) {
    return this.attendanceService.saveBulkAttendance(body.className, body.date, body.records, body.courseId);
  }

  @Get('records')
  async getRecords(@Query('date') date: string, @Query('className') className: string, @Query('courseId') courseId?: string) {
    return this.attendanceService.getRecordsByDateAndClass(date, className, courseId ? parseInt(courseId, 10) : undefined);
  }

  @Get('history')
  async getHistory(@Query('className') className?: string, @Query('courseId') courseId?: string) {
    return this.attendanceService.getAttendanceHistory(className, courseId ? parseInt(courseId, 10) : undefined);
  }
}
