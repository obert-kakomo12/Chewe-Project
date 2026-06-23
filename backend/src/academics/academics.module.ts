import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Assignment } from './entities/assignment.entity';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Assignment, User, Grade])],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}
