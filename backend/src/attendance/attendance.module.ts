import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Notification } from './entities/notification.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, Notification])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
