import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AcademicsModule } from './academics/academics.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { WelfareModule } from './welfare/welfare.module';
import { DocumentsModule } from './documents/documents.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { MaterialsModule } from './materials/materials.module';

import { DashboardModule } from './dashboard/dashboard.module';

import { User } from './users/entities/user.entity';
import { Document } from './documents/entities/document.entity';
import { AcademicRecord } from './academics/entities/academic-record.entity';
import { Course } from './academics/entities/course.entity';
import { Assessment } from './assessments/entities/assessment.entity';
import { Grade } from './assessments/entities/grade.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import { WelfareCase } from './welfare/entities/welfare-case.entity';
import { ActivityLog } from './settings/entities/activity-log.entity';
import { ClassMaterial } from './materials/entities/class-material.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AcademicsModule,
    AssessmentsModule,
    AttendanceModule,
    WelfareModule,
    DocumentsModule,
    SettingsModule,
    DashboardModule,
    AiModule,
    MaterialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
