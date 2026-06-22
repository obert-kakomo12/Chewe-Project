import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting, AuditLog])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
