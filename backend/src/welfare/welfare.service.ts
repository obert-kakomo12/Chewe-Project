import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CounselingLog } from './entities/counseling-log.entity';
import { GuidanceResource } from './entities/guidance-resource.entity';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { WelfareProfile } from './entities/welfare-profile.entity';
import { TermFeeStatus } from '../finance/entities/term-fee-status.entity';

@Injectable()
export class WelfareService {
  constructor(
    @InjectRepository(CounselingLog)
    private logsRepository: Repository<CounselingLog>,
    @InjectRepository(GuidanceResource)
    private guidanceRepository: Repository<GuidanceResource>,
    private dataSource: DataSource,
  ) {}

  async getDashboardData() {
    const dbLogs = await this.logsRepository.find({ relations: { student: true, counselor: true } });
    const logs = dbLogs.map(l => ({
      id: `WL-${String(l.id).padStart(4, '0')}`,
      dbId: l.id,
      student: l.student?.name || 'Anonymous',
      trigger: l.severity_level === 'High' ? 'Trauma Triage' : 'Teacher Referral',
      priority: l.severity_level, // High, Medium, Low
      type: l.severity_level === 'High' ? 'Academic Triage' : 'Behavioral Support',
      encrypted: true,
      notes: l.session_notes,
      date: l.date ? new Date(l.date).toLocaleDateString() : 'N/A',
      followUp: l.follow_up_required ? 'Yes' : 'No'
    }));

    const userRepo = this.dataSource.getRepository(User);
    const gradeRepo = this.dataSource.getRepository(Grade);
    const attRepo = this.dataSource.getRepository(AttendanceRecord);

    const students = await userRepo.find({ where: { role: 'Student' } });
    const allGrades = await gradeRepo.find({ relations: { student: true } });
    const allAtt = await attRepo.find({ relations: { student: true } });

    // Calculate mean and stddev of all grades
    const scores = allGrades.map(g => g.score);
    const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const variance = scores.length > 1 ? scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (scores.length - 1) : 0;
    const stdDev = Math.sqrt(variance) || 0;

    // Student performance details
    const studentStats = students.map(student => {
      const studentGrades = allGrades.filter(g => g.student?.id === student.id);
      const studentAvg = studentGrades.length > 0 ? studentGrades.reduce((a, b) => a + b.score, 0) / studentGrades.length : 0;
      const zScore = stdDev === 0 ? 0 : parseFloat(((studentAvg - mean) / stdDev).toFixed(2));
      
      const studentAtt = allAtt.filter(a => a.student?.id === student.id);
      const presentCount = studentAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const attendancePct = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 0;

      return {
        student,
        avg: studentAvg,
        zScore,
        attendancePct
      };
    });

    // Sort by avg descending to assign ranks
    studentStats.sort((a, b) => b.avg - a.avg);
    const guidance = studentStats.map((stat, idx) => {
      const rank = idx + 1;
      const zScoreVal = stat.zScore;
      const attVal = stat.attendancePct;
      
      // consistency score
      const consistency = attVal >= 90 ? 'Excellent' : attVal >= 80 ? 'Good' : 'Poor';
      
      // vocational fit recommendation based on performance
      let fit = 'Business Development / Operations';
      if (stat.avg >= 85) {
        fit = 'Biomedical Sciences / Research';
      } else if (stat.avg >= 75) {
        fit = 'Software Engineering / Computer Systems';
      } else if (stat.avg >= 60) {
        fit = 'Financial Analysis / Economics';
      } else {
        fit = 'Creative Arts / Communications';
      }

      return {
        student: stat.student.name,
        summary: `Exhibits ${stat.avg >= 75 ? 'outstanding academic diligence' : 'steady progress'} across Term 2.`,
        rank,
        zScore: zScoreVal >= 0 ? `+${zScoreVal}` : `${zScoreVal}`,
        consistency,
        attendance: `${attVal}%`,
        fit
      };
    });

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
        guidanceReportsSent: guidance.length
      }
    };
  }

  async getPredictiveSuggestions(logId: number) {
    const log = await this.logsRepository.findOne({ where: { id: logId }, relations: { student: true } });
    if (!log) {
      return {
        stressor: 'General Academic Anxiety',
        recommendation: 'Scheduled counseling intervals and study routine adjustments.',
        successRate: '80%'
      };
    }

    const gradeRepo = this.dataSource.getRepository(Grade);
    const studentGrades = await gradeRepo.find({ where: { student: { id: log.student.id } } });
    const avgScore = studentGrades.length > 0 
      ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length 
      : 0;

    let stressor = 'Transition Adjustment';
    let recommendation = 'Provide cognitive guidance and routine progress monitoring.';
    let successRate = '85%';

    if (log.severity_level === 'High') {
      if (avgScore < 60) {
        stressor = 'Severe Academic Backslide & Testing Anxiety';
        recommendation = 'Deploy academic counseling, reduce immediate testing pressure, and coordinate with peer support. Avoid direct parental warning alerts temporarily to minimize anxiety.';
        successRate = '72%';
      } else {
        stressor = 'Social Integration Overload';
        recommendation = 'Provide standard relaxation coaching and stress management, combined with structured extracurricular integration.';
        successRate = '89%';
      }
    } else {
      if (avgScore < 60) {
        stressor = 'Study Deficit & Low Velocity';
        recommendation = 'Encourage active recall study methods and target core subject tutorials twice weekly.';
        successRate = '82%';
      } else {
        stressor = 'General Career Direction Uncertainty';
        recommendation = 'Integrate with Pathfinder Level 3 Streaming assessment to align vocational interest with academic trends.';
        successRate = '94%';
      }
    }

    return {
      studentName: log.student.name,
      stressor,
      recommendation,
      successRate
    };
  }

  async getSponsorshipPipeline() {
    const welfareProfileRepo = this.dataSource.getRepository(WelfareProfile);
    const feeStatusRepo = this.dataSource.getRepository(TermFeeStatus);

    const profiles = await welfareProfileRepo.find({
      relations: { student: true }
    });

    const pipeline: WelfareProfile[] = [];
    for (const p of profiles) {
      if (p.confidence_index >= 75) {
        if (p.financial_need_flag || p.beam_status === 'Eligible' || p.beam_status === 'Applied') {
          pipeline.push(p);
        } else {
          const feeStatus = await feeStatusRepo.findOne({
            where: { student: { id: p.student.id }, status: 'ARREARS' }
          });
          if (feeStatus) {
            pipeline.push(p);
          }
        }
      }
    }
    return pipeline;
  }
}
