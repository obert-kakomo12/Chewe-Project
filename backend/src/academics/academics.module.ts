import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Assignment } from './entities/assignment.entity';
import { Subject } from './entities/subject.entity';
import { ClassRoom } from './entities/class-room.entity';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Enrollment, Assignment, Subject, ClassRoom, User, Grade]),
    JwtModule.register({
      secret: 'super-secret-key-replace-in-prod',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}
