import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async getMetrics() {
    // 1. Calculate actual attendance percentage
    const totalRecords = await this.attendanceRepository.count();
    const presentRecords = await this.attendanceRepository.count({ where: { status: 'Present' } });
    const attendancePct = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0.0';

    // 2. Fetch real alerts (Empty for now until alerts table is populated)
    const alerts = [];

    // 3. Fetch real heatmap data (Empty for now until grades are populated)
    const heatmapData = [];

    // 4. Fetch real performance data (Empty for now)
    const performanceData = [];

    return {
      kpis: {
        avgZScore: { value: '0.00', trend: 'steady', description: 'Need more assessment data' },
        attendance: { value: `${attendancePct}%`, trend: totalRecords > 0 ? 'up' : 'steady', description: totalRecords > 0 ? 'Calculated from DB' : 'No records yet' },
        welfareCases: { value: '0', trend: 'steady', description: 'No open cases' }
      },
      performanceData,
      alerts,
      heatmapData
    };
  }

  async getAnalytics() {
    return {
      topicData: [],
      correlationData: [],
      outliers: []
    };
  }
}
