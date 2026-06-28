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
import { FinanceModule } from './finance/finance.module';
import { CommunicationsModule } from './communications/communications.module';

// Entities are auto-loaded by DatabaseModule

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
    FinanceModule,
    CommunicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
