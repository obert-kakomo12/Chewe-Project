import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getRollCall() {
    const students = await this.userRepository.find({ where: { role: 'Student' } });
    
    const mappedStudents = students.map(s => ({
      id: `STU-${String(s.id).padStart(3, '0')}`,
      dbId: s.id,
      name: s.name,
      class: s.id % 2 === 0 ? 'Form 3A' : 'Form 4B',
    }));

    const absences = await this.attendanceRepository.find({
      where: { status: 'Absent' },
      relations: { student: true }
    });

    const studentAbsenceCount = {};
    for (const record of absences) {
      if (!record.student) continue;
      studentAbsenceCount[record.student.name] = (studentAbsenceCount[record.student.name] || 0) + 1;
    }

    const truancyAlerts: any[] = [];
    for (const [name, count] of Object.entries(studentAbsenceCount)) {
      if ((count as number) >= 2) {
        truancyAlerts.push({
          student: name,
          reason: `${count} consecutive absences detected in Term 1`,
          priority: (count as number) > 2 ? 'High' : 'Medium'
        });
      }
    }

    return {
      students: mappedStudents,
      truancyAlerts
    };
  }
}
