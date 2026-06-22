import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './entities/assessment.entity';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
  ) {}

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
}
