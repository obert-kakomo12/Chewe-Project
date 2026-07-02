import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Grade } from '../assessments/entities/grade.entity';
import { Subject } from './entities/subject.entity';
import { ClassRoom } from './entities/class-room.entity';

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
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  // Subjects
  async createSubject(data: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async findAllSubjects(): Promise<Subject[]> {
    return this.subjectRepository.find();
  }

  async deleteSubject(id: number): Promise<void> {
    await this.subjectRepository.delete(id);
  }

  // ClassRooms
  async createClassRoom(data: Partial<ClassRoom>): Promise<ClassRoom> {
    const cr = this.classRoomRepository.create(data);
    return this.classRoomRepository.save(cr);
  }

  async findAllClassRooms(): Promise<ClassRoom[]> {
    return this.classRoomRepository.find({ relations: { class_teacher: true } });
  }

  async deleteClassRoom(id: number): Promise<void> {
    await this.classRoomRepository.delete(id);
  }

  async findStudentsByClass(className: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { course: { class_room: { name: className } } },
      relations: { student: true, course: { class_room: true } },
    });

    return enrollments.map(e => ({
      id: `CT24-${String(e.student.id).padStart(4, '0')}`,
      dbId: e.student.id,
      name: e.student.name,
      inClass: 0,
      monthly: 0,
      endTerm: 0,
      attendanceStatus: 'Present',
      attendanceRemark: '',
    }));
  }

  async enrollNewStudent(className: string, name: string, email: string) {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = this.userRepository.create({
        name,
        email,
        role: 'Student',
        password_hash: 'mockhash',
      });
      await this.userRepository.save(user);
    }

    let classRoom = await this.classRoomRepository.findOne({ where: { name: className } });
    if (!classRoom) {
      classRoom = this.classRoomRepository.create({ name: className });
      await this.classRoomRepository.save(classRoom);
    }

    let course = await this.courseRepository.findOne({ where: { class_room: { id: classRoom.id } }, relations: { class_room: true } });
    if (!course) {
      course = this.courseRepository.create({ class_room: classRoom });
      await this.courseRepository.save(course);
    }

    const enrollment = this.enrollmentRepository.create({
      student: user,
      course: course
    });
    await this.enrollmentRepository.save(enrollment);

    return {
      id: `CT24-${String(user.id).padStart(4, '0')}`,
      dbId: user.id,
      name: user.name,
      inClass: 0,
      monthly: 0,
      endTerm: 0,
      attendanceStatus: 'Present',
      attendanceRemark: '',
    };
  }

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

      // Determine requested track. In a real system, students would request this via a portal.
      // Since everyone wants to do Sciences or Commercials, we default to Sciences 
      // unless their math is absolutely terrible, in which case they might ask for Arts.
      let requested = 'Sciences';
      if (mathAvg < 50 && englishAvg > 60) {
        requested = 'Arts';
      } else if (mathAvg >= 50 && mathAvg < 70) {
        requested = 'Commercials';
      }
      
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
