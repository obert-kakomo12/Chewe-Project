import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async getAuditLogs() {
    const logs = await this.auditLogRepository.find({ relations: { user: true }, order: { timestamp: 'DESC' } });
    return logs.map(l => ({
      id: l.id,
      user: l.user?.name || 'System',
      action: l.action,
      details: l.details,
      timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'
    }));
  }
}
