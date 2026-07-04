import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassMaterial } from './entities/class-material.entity';
import { Enrollment } from '../academics/entities/enrollment.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(ClassMaterial)
    private materialsRepository: Repository<ClassMaterial>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createDto: any) {
    const material = this.materialsRepository.create(createDto);
    return this.materialsRepository.save(material);
  }

  findAll() {
    return this.materialsRepository.find({ 
      order: { posted_at: 'DESC' },
      relations: { course: { subject: true, class_room: true, teacher: true } }
    });
  }

  findByCourse(courseId: number) {
    return this.materialsRepository.find({
      where: { course: { id: courseId } },
      order: { posted_at: 'DESC' },
      relations: { course: { subject: true, class_room: true, teacher: true } }
    });
  }

  async findByStudent(studentId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: { course: true }
    });
    
    if (enrollments.length === 0) return [];
    const courseIds = enrollments.map(e => e.course.id);
    
    return this.materialsRepository.find({
      where: { course: { id: In(courseIds) } },
      order: { posted_at: 'DESC' },
      relations: { course: { subject: true, class_room: true, teacher: true } }
    });
  }
}
