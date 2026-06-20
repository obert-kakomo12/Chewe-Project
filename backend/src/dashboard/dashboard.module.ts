import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AttendanceRecord])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
