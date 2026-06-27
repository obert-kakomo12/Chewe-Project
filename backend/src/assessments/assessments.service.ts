import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './entities/assessment.entity';
import { Grade } from './entities/grade.entity';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  async findMarksByStudentId(studentId: number) {
    return this.gradeRepository.find({
      where: { student: { id: studentId } },
      relations: ['assessment', 'assessment.course'],
      order: { recorded_at: 'DESC' }
    });
  }

  async findAll() {
    const assessments = await this.assessmentRepository.find({
      order: { created_at: 'DESC' }
    });
    
    return assessments.map(a => ({
      id: `AST-${String(a.id).padStart(3, '0')}`,
      dbId: a.id,
      subject: a.subject,
      class: a.class,
      type: a.type,
      date: a.date,
      avgScore: a.avgScore,
      status: a.status
    }));
  }

  async create(data: any) {
    const newAssessment = this.assessmentRepository.create({
      subject: data.subject,
      class: data.class,
      type: data.type,
      date: data.date,
      status: data.status,
      avgScore: data.avgScore || '—'
    });
    const saved = await this.assessmentRepository.save(newAssessment);
    
    return {
      id: `AST-${String(saved.id).padStart(3, '0')}`,
      dbId: saved.id,
      subject: saved.subject,
      class: saved.class,
      type: saved.type,
      date: saved.date,
      avgScore: saved.avgScore,
      status: saved.status
    };
  }

  async updateGrade(id: number, avgScore: string) {
    const assessment = await this.assessmentRepository.findOne({ where: { id } });
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }
    
    assessment.status = 'Graded';
    assessment.avgScore = avgScore;
    
    return this.assessmentRepository.save(assessment);
  }

  async remove(id: number) {
    const result = await this.assessmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Assessment not found');
    }
    return { deleted: true };
  }

  async generateAIComment(studentName: string, score: number, userPrompt?: string) {
    let comment = '';
    const p = userPrompt?.toLowerCase() || '';

    if (score >= 75) {
      if (p.includes('encourage') || p.includes('warm') || p.includes('positive')) {
        comment = `Excellent work, ${studentName}! Your outstanding score of ${score}% shows high dedication and brilliant problem solving. Keep setting this wonderful standard for your classmates!`;
      } else if (p.includes('exam') || p.includes('final') || p.includes('focus')) {
        comment = `Superb result of ${score}% by ${studentName}. Highly prepared for the final exams. Focus on solving high-complexity problems to secure the top tier A grade.`;
      } else {
        comment = `Demonstrates exceptional aptitude and consistent mastery across all assessment tiers. ${studentName} continues to set the benchmark for the class.`;
      }
    } else if (score >= 50) {
      if (p.includes('encourage') || p.includes('warm') || p.includes('positive')) {
        comment = `Good job, ${studentName}! With a score of ${score}%, you demonstrate a solid understanding. With a little more revision and confidence, you can definitely achieve an excellent grade next term!`;
      } else if (p.includes('exam') || p.includes('final') || p.includes('focus')) {
        comment = `${studentName} scored a solid ${score}%. Recommend targeted revision and practice papers ahead of the end-of-term examinations to strengthen topic accuracy.`;
      } else {
        comment = `Shows solid understanding of the subject material. A focused revision strategy heading into the next term will consolidate this progress for ${studentName}.`;
      }
    } else {
      if (p.includes('encourage') || p.includes('warm') || p.includes('positive')) {
        comment = `Keep trying, ${studentName}. Although your score of ${score}% is below the pass threshold, your efforts are appreciated. Let's work together through remedial sessions to lift this up next term!`;
      } else if (p.includes('exam') || p.includes('final') || p.includes('focus')) {
        comment = `Urgent: ${studentName}'s average of ${score}% is below threshold. Focused intervention and exam prep support are mandatory to safeguard the transition pass rate.`;
      } else {
        comment = `Performance of ${studentName} is currently below the required threshold. Immediate intervention is recommended — a structured study plan and support sessions should be arranged.`;
      }
    }

    return { comment };
  }
}
