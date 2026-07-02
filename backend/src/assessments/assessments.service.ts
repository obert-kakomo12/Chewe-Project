import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './entities/assessment.entity';
import { Grade } from './entities/grade.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    private readonly aiService: AiService,
  ) {}

  async findMarksByStudentId(studentId: number) {
    return this.gradeRepository.find({
      where: { student: { id: studentId } },
      relations: { assessment: { course: true } },
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
    const data = {
      studentName,
      score,
      additionalInstructions: userPrompt || 'None'
    };
    
    try {
      const systemPrompt = "You are a professional administrative assistant for a school. Given a report's details, write a concise, professional, 1-2 sentence summary comment about the report status or contents. Be encouraging but formal.";
      const aiResponse = await this.aiService.generateReportComment(data);
      return { comment: aiResponse };
    } catch (error) {
      // Fallback in case OpenRouter fails
      return { comment: `Report generated for ${studentName}. Score: ${score}%. (AI Service unavailable)` };
    }
  }

  async saveBulkMarks(className: string, marks: any[]) {
    // Check if an overall assessment exists for this class
    let assessment = await this.assessmentRepository.findOne({
      where: { class: className, subject: 'Term Report', type: 'End Term' },
    });

    if (!assessment) {
      assessment = this.assessmentRepository.create({
        subject: 'Term Report',
        class: className,
        type: 'End Term',
        date: new Date().toISOString().split('T')[0],
        status: 'Graded',
        avgScore: '0',
      });
      await this.assessmentRepository.save(assessment);
    }

    let sum = 0;
    let count = 0;

    for (const mark of marks) {
      const studentId = parseInt(mark.studentId?.toString().replace(/\D/g, '') || '0', 10);
      if (studentId === 0) continue;

      let grade = await this.gradeRepository.findOne({
        where: { assessment: { id: assessment.id }, student: { id: studentId } },
      });

      if (!grade) {
        grade = this.gradeRepository.create({
          student: { id: studentId } as any,
          assessment: { id: assessment.id } as any,
          score: mark.total,
          teacher_feedback: `In-Class: ${mark.inClass}, Monthly: ${mark.monthly}, End Term: ${mark.endTerm}`,
        });
      } else {
        grade.score = mark.total;
        grade.teacher_feedback = `In-Class: ${mark.inClass}, Monthly: ${mark.monthly}, End Term: ${mark.endTerm}`;
      }

      await this.gradeRepository.save(grade);
      sum += mark.total;
      count++;
    }

    if (count > 0) {
      assessment.avgScore = Math.round(sum / count).toString() + '%';
      await this.assessmentRepository.save(assessment);
    }

    return { success: true, message: 'Marks successfully saved to database.' };
  }
}
