import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, Notification, User])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
