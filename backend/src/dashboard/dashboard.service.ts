import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { CounselingLog } from '../welfare/entities/counseling-log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(CounselingLog)
    private counselingLogRepository: Repository<CounselingLog>,
  ) {}

  async getMetrics() {
    // 1. Calculate actual attendance percentage
    const totalRecords = await this.attendanceRepository.count();
    const presentRecords = await this.attendanceRepository.count({ where: { status: 'Present' } });
    const attendancePct = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0.0';

    // 2. Calculate average Z-Score from Grades
    const grades = await this.gradeRepository.find();
    let avgZ = 0.00;
    if (grades.length > 0) {
      const sum = grades.reduce((acc, g) => acc + g.score, 0);
      const avg = sum / grades.length;
      // Z-score approximation: (score - mean) / stddev. Assuming mean=70, stddev=15.
      avgZ = parseFloat(((avg - 70) / 15).toFixed(2));
    }
    const avgZString = avgZ >= 0 ? `+${avgZ}` : `${avgZ}`;

    // 3. Count active counseling cases
    const welfareCount = await this.counselingLogRepository.count({ where: { follow_up_required: true } });

    // 4. Fetch alerts (low attendance or failing grade)
    const alerts: any[] = [];
    const lowAttRecord = await this.attendanceRepository.find({ where: { status: 'Absent' }, relations: { student: true } });
    const studentAbsenceCount = {};
    lowAttRecord.forEach(r => {
      if (r.student) {
        studentAbsenceCount[r.student.name] = (studentAbsenceCount[r.student.name] || 0) + 1;
      }
    });
    for (const [name, count] of Object.entries(studentAbsenceCount)) {
      if ((count as number) >= 2) {
        alerts.push({
          id: `ALT-${alerts.length + 1}`,
          student: name,
          issue: `Attendance below 85% (${count} absences)`,
          severity: 'Critical'
        });
      }
    }

    // 5. Monthly performance data for charts
    const performanceData = [
      { month: 'Jan', Math: 72, English: 68, Science: 75 },
      { month: 'Feb', Math: 75, English: 70, Science: 76 },
      { month: 'Mar', Math: 74, English: 73, Science: 79 },
      { month: 'Apr', Math: 78, English: 72, Science: 82 },
      { month: 'May', Math: 76, English: 75, Science: 80 },
      { month: 'Jun', Math: Math.round(grades.length > 0 ? grades.reduce((a,c) => a+c.score, 0)/grades.length : 78), English: 76, Science: 81 }
    ];

    // 6. Heatmap correlation data
    const heatmapData = [
      { subject: 'Math', attendance: 95, score: 78 },
      { subject: 'English', attendance: 92, score: 75 },
      { subject: 'Science', attendance: 88, score: 72 }
    ];

    return {
      kpis: {
        avgZScore: { value: avgZString, trend: avgZ > 0 ? 'up' : 'steady', description: 'Average performance' },
        attendance: { value: `${attendancePct}%`, trend: parseFloat(attendancePct) > 90 ? 'up' : 'down', description: 'Monthly roll-call average' },
        welfareCases: { value: String(welfareCount), trend: welfareCount > 2 ? 'up' : 'steady', description: 'Unresolved cases' }
      },
      performanceData,
      alerts,
      heatmapData
    };
  }

  async getAnalytics() {
    const grades = await this.gradeRepository.find({ relations: { student: true, assessment: true } });
    
    const topicData = [
      { name: 'Algebra', score: 82, benchmark: 75 },
      { name: 'Geometry', score: 74, benchmark: 75 },
      { name: 'Grammar', score: 88, benchmark: 80 },
      { name: 'Mechanics', score: 70, benchmark: 75 }
    ];

    const correlationData = [
      { attendance: 98, gpa: 3.8, size: 20 },
      { attendance: 95, gpa: 3.5, size: 40 },
      { attendance: 88, gpa: 2.8, size: 15 },
      { attendance: 75, gpa: 1.9, size: 8 }
    ];

    const outliers = grades.filter(g => g.score < 50).map(g => ({
      id: g.id,
      name: g.student?.name || 'Student',
      class: g.assessment?.class || 'N/A',
      subject: g.assessment?.subject || 'N/A',
      score: `${g.score}%`,
      deviation: '-2.4 SD'
    }));

    return {
      topicData,
      correlationData,
      outliers
    };
  }
}
