import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AcademicsModule,
    AssessmentsModule,
    AttendanceModule,
    WelfareModule,
    DocumentsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
