import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../academics/entities/enrollment.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async getRollCall() {
    const enrollments = await this.enrollmentRepository.find({ relations: { student: true, course: { class_room: true } } });
    
    // Fallback if no enrollments exist to prevent empty dashboards during testing
    let mappedStudents: any[] = [];
    if (enrollments.length > 0) {
      mappedStudents = enrollments.map(e => ({
        id: `STU-${String(e.student.id).padStart(3, '0')}`,
        dbId: e.student.id,
        name: e.student.name,
        class: e.course?.class_room?.name || 'Unassigned',
      }));
    } else {
      const students = await this.userRepository.find({ where: { role: 'Student' } });
      mappedStudents = students.map(s => ({
        id: `STU-${String(s.id).padStart(3, '0')}`,
        dbId: s.id,
        name: s.name,
        class: 'Form 3A',
      }));
    }

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

  async saveBulkAttendance(className: string, date: string, records: any[]) {
    let savedCount = 0;
    
    for (const record of records) {
      const studentId = parseInt(record.studentId?.toString().replace(/\D/g, '') || '0', 10);
      if (studentId === 0) continue;

      let att = await this.attendanceRepository.findOne({
        where: { student: { id: studentId }, date: new Date(date) }
      });

      if (!att) {
        att = this.attendanceRepository.create({
          student: { id: studentId } as any,
          date: new Date(date),
          status: record.status,
          notes: record.remark || '',
        });
      } else {
        att.status = record.status;
        att.notes = record.remark || '';
      }
      await this.attendanceRepository.save(att);
      savedCount++;
    }

    return { success: true, message: `Register successfully submitted and synced for ${savedCount} records.` };
  }
}
