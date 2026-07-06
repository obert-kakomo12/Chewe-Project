import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../academics/entities/enrollment.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, Notification, User, Enrollment]),
    JwtModule.register({
      secret: 'super-secret-key-replace-in-prod',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
