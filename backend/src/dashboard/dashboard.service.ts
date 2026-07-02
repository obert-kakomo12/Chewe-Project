import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from '../assessments/entities/assessment.entity';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { CounselingLog } from '../welfare/entities/counseling-log.entity';
import { AiService } from '../ai/ai.service';

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
    private readonly aiService: AiService,
  ) {}

  async getMetrics() {
    // 1. Calculate actual attendance percentage
    const totalRecords = await this.attendanceRepository.count();
    const presentRecords = await this.attendanceRepository.count({ where: { status: 'Present' } });
    const attendancePct = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0.0';

    // 2. Calculate average Z-Score from Grades
    const grades = await this.gradeRepository.find();
    let avgZ = 0.00;
    let stdDev = 15;
    if (grades.length > 0) {
      const sum = grades.reduce((acc, g) => acc + g.score, 0);
      const avg = sum / grades.length;
      avgZ = parseFloat(((avg - 70) / 15).toFixed(2));
      
      if (grades.length > 1) {
        const variance = grades.reduce((acc, g) => acc + Math.pow(g.score - avg, 2), 0) / (grades.length - 1);
        stdDev = Math.sqrt(variance) || 15;
      }
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
    
    let alertId = 1;
    for (const [name, count] of Object.entries(studentAbsenceCount)) {
      if ((count as number) >= 2) {
        alerts.push({
          id: `ALT-${alertId++}`,
          type: (count as number) >= 3 ? 'critical' : 'warning',
          title: (count as number) >= 3 ? 'Trauma/Truancy Alert' : 'Slow Drift Alert',
          message: `${name} has been absent for ${count} sessions this term. Academic outline protection flagged.`,
          time: 'Just now'
        });
      }
    }

    if (alerts.length === 0) {
      // No dummy alerts
    }

    // 5. Longitudinal Z-Score Cohort F3 for dashboard chart
    // For a dynamic longitudinal graph, we will group grades by assessment date/month.
    const performanceDataMap = {};
    for (const g of grades) {
      if (g.assessment && g.assessment.date) {
        const monthYear = new Date(g.assessment.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!performanceDataMap[monthYear]) {
          performanceDataMap[monthYear] = { sumZ: 0, count: 0 };
        }
        const z = parseFloat(((g.score - 70) / 15).toFixed(2));
        performanceDataMap[monthYear].sumZ += z;
        performanceDataMap[monthYear].count++;
      }
    }
    const performanceData = Object.keys(performanceDataMap).map(k => ({
      term: k,
      zScore: parseFloat((performanceDataMap[k].sumZ / performanceDataMap[k].count).toFixed(2))
    }));

    if (performanceData.length === 0) {
      performanceData.push({ term: 'No Data Yet', zScore: 0 });
    }

    // 6. Color-Coded Institutional Heatmap (Columns = Subjects, Rows = Classes)
    const heatmapMap = {};
    for (const g of grades) {
      if (g.assessment && g.assessment.class && g.assessment.subject) {
        const key = `${g.assessment.class}_${g.assessment.subject}`;
        if (!heatmapMap[key]) {
          heatmapMap[key] = { class: g.assessment.class, subject: g.assessment.subject, sum: 0, count: 0 };
        }
        heatmapMap[key].sum += g.score;
        heatmapMap[key].count++;
      }
    }
    
    const heatmapData = Object.values(heatmapMap).map((h: any) => ({
      class: h.class,
      subject: h.subject,
      avg: Math.round(h.sum / h.count)
    }));

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
    
    // Topic bottlenecks
    const topics = {};
    grades.forEach(g => {
      if (g.assessment) {
        let name = g.assessment.title || 'General';
        if (name.includes('Algebra')) name = 'Algebra';
        else if (name.includes('Shakespeare') || name.includes('Essay')) name = 'Literature';
        else if (name.includes('Cell') || name.includes('Structure')) name = 'Biology';
        else name = g.assessment.subject || 'General';

        if (!topics[name]) {
          topics[name] = { sum: 0, count: 0 };
        }
        topics[name].sum += g.score;
        topics[name].count++;
      }
    });

    const topicData = Object.entries(topics).map(([name, val]: [string, any]) => {
      const avg = Math.round(val.sum / val.count);
      const target = 75;
      let status = 'ok';
      if (avg < 60) status = 'bottleneck';
      else if (avg < target) status = 'warning';
      else if (avg >= target + 10) status = 'excellent';
      return { topic: name, avg, target, status };
    });

    if (topicData.length === 0) {
      // No dummy data
    }

    // Correlation
    const studentMap = {};
    const allAttendance = await this.attendanceRepository.find({ relations: { student: true } });

    allAttendance.forEach(a => {
      if (a.student) {
        if (!studentMap[a.student.id]) {
          studentMap[a.student.id] = { name: a.student.name, present: 0, total: 0, gradeSum: 0, gradeCount: 0 };
        }
        studentMap[a.student.id].total++;
        if (a.status === 'Present' || a.status === 'Late') {
          studentMap[a.student.id].present++;
        }
      }
    });

    grades.forEach(g => {
      if (g.student) {
        if (!studentMap[g.student.id]) {
          studentMap[g.student.id] = { name: g.student.name, present: 0, total: 0, gradeSum: 0, gradeCount: 0 };
        }
        studentMap[g.student.id].gradeSum += g.score;
        studentMap[g.student.id].gradeCount++;
      }
    });

    // Calculate mean and stddev for average Z-Score
    const allScores = grades.map(g => g.score);
    const mean = allScores.length > 0 ? allScores.reduce((sum, v) => sum + v, 0) / allScores.length : 70;
    let stdDev = 15;
    if (allScores.length > 1) {
      const variance = allScores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (allScores.length - 1);
      stdDev = Math.sqrt(variance) || 15;
    }

    const correlationData = Object.values(studentMap).map((s: any) => {
      const attRate = s.total > 0 ? Math.round((s.present / s.total) * 100) : 90;
      const avgGrade = s.gradeCount > 0 ? (s.gradeSum / s.gradeCount) : 75;
      const avgZ = parseFloat(((avgGrade - mean) / stdDev).toFixed(2));
      return {
        attendance: attRate,
        avgZ
      };
    });

    if (correlationData.length === 0) {
      // No dummy data
    }

    // Outliers deviating significantly
    const outliers = grades.map(g => {
      const zScore = parseFloat(((g.score - mean) / stdDev).toFixed(2));
      return {
        name: g.student?.name || 'Student',
        subject: g.assessment?.subject || 'N/A',
        status: zScore > 1.2 ? 'high' : zScore < -1.2 ? 'low' : 'normal',
        zScore
      };
    }).filter(o => o.status === 'high' || o.status === 'low');

    if (outliers.length === 0) {
      // No dummy data
    }

    return {
      topicData,
      correlationData,
      outliers
    };
  }

  async getExecutiveAIInsight(query: string) {
    const q = query.toLowerCase();
    
    // Fetch live database records for context
    const grades = await this.gradeRepository.find({ relations: { student: true, assessment: true } });
    const attendance = await this.attendanceRepository.find({ relations: { student: true } });
    const activeWelfareCount = await this.counselingLogRepository.count({ where: { follow_up_required: true } });

    // 1. Calculate overall mean and standard deviation for Z-scores
    const allScores = grades.map(g => g.score);
    const mean = allScores.length > 0 ? allScores.reduce((sum, v) => sum + v, 0) / allScores.length : 0;
    
    // Pass real data to AI Service
    const aiContextData = {
      query,
      schoolAverage: mean,
      totalGradesRecorded: grades.length,
      activeWelfareCases: activeWelfareCount,
      totalAttendanceRecords: attendance.length
    };

    try {
      const aiResponseText = await this.aiService.generateExecutiveAnalysis(aiContextData);
      
      // Attempt to split AI response into analysis and decision if it formatted it that way
      // If not, we just put everything in analysis.
      let analysis = aiResponseText;
      let decision = 'Review AI Analysis for recommendations.';
      
      if (aiResponseText.includes('Decision:')) {
        const parts = aiResponseText.split('Decision:');
        analysis = parts[0].trim();
        decision = parts[1].trim();
      } else if (aiResponseText.includes('Recommendation:')) {
        const parts = aiResponseText.split('Recommendation:');
        analysis = parts[0].trim();
        decision = parts[1].trim();
      }

      return {
        query,
        analysis,
        decision,
        timestamp: new Date().toLocaleTimeString()
      };
    } catch (error) {
      return {
        query,
        analysis: "The AI strategic engine is currently unavailable or misconfigured.",
        decision: "Please verify OpenRouter API keys in the system environment.",
        timestamp: new Date().toLocaleTimeString()
      };
    }
  }
}
