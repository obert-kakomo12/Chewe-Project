import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CounselingLog } from './entities/counseling-log.entity';
import { GuidanceResource } from './entities/guidance-resource.entity';

@Injectable()
export class WelfareService {
  constructor(
    @InjectRepository(CounselingLog)
    private logsRepository: Repository<CounselingLog>,
    @InjectRepository(GuidanceResource)
    private guidanceRepository: Repository<GuidanceResource>,
  ) {}

  async getDashboardData() {
    const dbLogs = await this.logsRepository.find({ relations: { student: true, counselor: true } });
    const logs = dbLogs.map(l => ({
      id: `WL-${String(l.id).padStart(4, '0')}`,
      student: l.student?.name || 'Anonymous',
      priority: l.severity_level, // High, Medium, Low
      date: l.date ? new Date(l.date).toLocaleDateString() : 'N/A',
      notes: l.session_notes,
      followUp: l.follow_up_required ? 'Yes' : 'No'
    }));

    const dbGuidance = await this.guidanceRepository.find();
    const guidance = dbGuidance.map(g => ({
      id: g.id,
      title: g.title,
      type: g.type,
      sharedWith: 'All Students',
      sharedDate: g.created_at ? new Date(g.created_at).toLocaleDateString() : 'N/A'
    }));

    const activeCases = dbLogs.filter(l => l.follow_up_required).length;
    const highPriority = dbLogs.filter(l => l.severity_level === 'High' && l.follow_up_required).length;
    const resolvedThisTerm = dbLogs.filter(l => !l.follow_up_required).length;

    return {
      logs,
      guidance,
      stats: {
        activeCases,
        highPriority,
        resolvedThisTerm,
        guidanceReportsSent: dbGuidance.length
      }
    };
  }
}
