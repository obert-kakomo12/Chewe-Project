import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { CounselingLog } from '../welfare/entities/counseling-log.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, AttendanceRecord, Grade, CounselingLog]),
    AiModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
