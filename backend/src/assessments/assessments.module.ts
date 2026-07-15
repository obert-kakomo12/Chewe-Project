import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { Grade } from './entities/grade.entity';
import { JwtModule } from '@nestjs/jwt';
import { FinanceModule } from '../finance/finance.module';
import { AiModule } from '../ai/ai.module';
import { MaterialsModule } from '../materials/materials.module';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, Grade, AttendanceRecord]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'secretKey' }),
    FinanceModule,
    AiModule,
    MaterialsModule
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
})
export class AssessmentsModule {}
