import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Assignment } from './entities/assignment.entity';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Assignment])],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}
