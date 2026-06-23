import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { EducationalArchive } from './entities/educational-archive.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(EducationalArchive)
    private educationalArchiveRepository: Repository<EducationalArchive>,
  ) {}

  async getReports() {
    const reports = await this.reportRepository.find({ relations: { author: true } });
    return reports.map(r => ({
      id: `REP-${String(r.id).padStart(4, '0')}`,
      name: `${r.report_type} Report - ${r.author?.name || 'System'}`,
      type: r.report_type,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
      status: r.status,
      file_url: r.file_url,
    }));
  }

  async getArchives() {
    const archives = await this.educationalArchiveRepository.find({ relations: { uploaded_by: true } });
    return archives.map(a => ({
      cohort: `${a.grade_level} - ${a.subject}`,
      size: '1.2 MB',
      compression: 'GZIP (High)',
      location: 'AWS Glacier',
      status: 'Verified',
      file_url: a.file_url,
    }));
  }
}
