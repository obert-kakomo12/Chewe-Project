import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Assignment } from './entities/assignment.entity';
import { Subject } from './entities/subject.entity';
import { ClassRoom } from './entities/class-room.entity';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Assignment, Subject, ClassRoom, User, Grade])],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}
