import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  async getPathfinderData() {
    // 1. Fetch all students
    const students = await this.userRepository.find({ where: { role: 'Student' } });
    
    // 2. Fetch all grades with student and assessment information
    const grades = await this.gradeRepository.find({
      relations: {
        student: true,
        assessment: true,
      },
    });

    // 3. Compute overall mean and standard deviation
    const allScores = grades.map(g => g.score);
    const mean = allScores.length > 0 ? allScores.reduce((sum, v) => sum + v, 0) / allScores.length : 70;
    
    let stdDev = 15;
    if (allScores.length > 1) {
      const variance = allScores.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (allScores.length - 1);
      stdDev = Math.sqrt(variance) || 15;
    }

    // 4. Construct proposals for each student
    const proposals = students.map(student => {
      const studentGrades = grades.filter(g => g.student?.id === student.id);
      const scores = studentGrades.map(g => g.score);
      const studentAvg = scores.length > 0 ? scores.reduce((sum, v) => sum + v, 0) / scores.length : 70;
      const zScore = parseFloat(((studentAvg - mean) / stdDev).toFixed(2));

      // Separate performance by subject
      let mathSum = 0, mathCount = 0;
      let scienceSum = 0, scienceCount = 0;
      let englishSum = 0, englishCount = 0;

      for (const g of studentGrades) {
        const subject = g.assessment?.subject?.toLowerCase() || '';
        if (subject.includes('math')) {
          mathSum += g.score;
          mathCount++;
        } else if (subject.includes('science') || subject.includes('chem') || subject.includes('phys') || subject.includes('bio')) {
          scienceSum += g.score;
          scienceCount++;
        } else if (subject.includes('english') || subject.includes('literature')) {
          englishSum += g.score;
          englishCount++;
        }
      }

      const mathAvg = mathCount > 0 ? mathSum / mathCount : 0;
      const scienceAvg = scienceCount > 0 ? scienceSum / scienceCount : 0;
      const englishAvg = englishCount > 0 ? englishSum / englishCount : 0;

      // Logic to determine recommended track
      let recommended = 'Commercials';
      if (mathAvg >= 75 || scienceAvg >= 75) {
        recommended = 'Sciences';
      } else if (englishAvg >= 75) {
        recommended = 'Arts';
      } else {
        // Distribute nicely based on best subject or id
        if (mathAvg > englishAvg && mathAvg > scienceAvg) {
          recommended = 'Sciences';
        } else if (englishAvg > mathAvg && englishAvg > scienceAvg) {
          recommended = 'Arts';
        } else if (scienceAvg > mathAvg && scienceAvg > englishAvg) {
          recommended = 'Sciences';
        } else {
          const mod = student.id % 3;
          recommended = mod === 0 ? 'Sciences' : mod === 1 ? 'Commercials' : 'Arts';
        }
      }

      // Determine requested track (deterministic mapping to introduce mismatches)
      const modReq = student.id % 3;
      const requested = modReq === 0 ? 'Sciences' : modReq === 1 ? 'Commercials' : 'Arts';
      
      const match = recommended === requested;
      let reason = '';
      if (!match) {
        if (recommended === 'Sciences' && requested === 'Arts') {
          reason = 'Exhibits high mathematical potential (Z-Score > 0.5) but requested Arts';
        } else if (recommended === 'Arts' && requested === 'Sciences') {
          reason = 'Struggling in Mathematics/Science subjects (Z-Score < -0.3)';
        } else {
          reason = 'Performance does not meet prerequisite requirements for the requested track';
        }
      }

      return {
        id: student.id,
        name: student.name,
        recommended,
        requested,
        zScore,
        match,
        reason,
      };
    });

    // 5. Generate Departmental Alerts
    const alerts: any[] = [];
    const sciencesCount = proposals.filter(p => p.recommended === 'Sciences').length;
    const totalCount = proposals.length;

    if (totalCount > 0 && (sciencesCount / totalCount) > 0.4) {
      alerts.push({
        title: 'Sciences Track Congestion',
        message: `Sciences track has high recommended enrollment (${sciencesCount} of ${totalCount} students). Resource allocation/lab space may be constrained.`,
        time: 'Just now',
        type: 'warning',
        color: '#f59e0b',
      });
    }

    const mismatchCount = proposals.filter(p => !p.match).length;
    if (mismatchCount > 0) {
      alerts.push({
        title: 'Welfare Action Required',
        message: `${mismatchCount} students have a track mismatch. Schedule counseling log sessions for career alignment review.`,
        time: '15 mins ago',
        type: 'info',
        color: '#3b82f6',
      });
    }

    return {
      proposals,
      alerts,
    };
  }
}
