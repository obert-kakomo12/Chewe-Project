import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async getPathfinderData() {
    // In a fully built system, this would query the DB for Z-Scores and streaming logic.
    // For now, we return empty arrays so no dummy data is displayed.
    return {
      proposals: [],
      alerts: []
    };
  }
}
