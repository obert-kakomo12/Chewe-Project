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

  async getRollCall(teacherId?: number) {
    const whereClause = teacherId ? { course: { teacher: { id: teacherId } } } : {};
    const enrollments = await this.enrollmentRepository.find({ 
      where: whereClause,
      relations: { student: true, course: { class_room: true } } 
    });
    
    const mappedStudents: any[] = enrollments.map(e => ({
      id: `STU-${String(e.student.id).padStart(3, '0')}`,
      dbId: e.student.id,
      name: e.student.name,
      class: e.course?.class_room?.name || 'Unassigned',
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
        if (teacherId && !mappedStudents.some(s => s.name === name)) {
          continue;
        }
        truancyAlerts.push({
          student: name,
          reason: `${count} recent absences detected`,
          priority: (count as number) > 2 ? 'High' : 'Medium'
        });
      }
    }

    return {
      students: mappedStudents,
      truancyAlerts
    };
  }

  async saveBulkAttendance(className: string, date: string, records: any[], courseId?: number) {
    // Strip time to ensure clean YYYY-MM-DD
    const cleanDate = date.split('T')[0];
    let savedCount = 0;
    
    for (const record of records) {
      const studentId = parseInt(record.studentId?.toString().replace(/\D/g, '') || '0', 10);
      if (studentId === 0 || !record.status) continue; // Skip unmarked students

      const whereClause: any = { student: { id: studentId }, date: new Date(cleanDate) };
      if (courseId) {
        whereClause.course = { id: courseId };
      }

      let att = await this.attendanceRepository.findOne({
        where: whereClause
      });

      if (!att) {
        const createPayload: any = {
          student: { id: studentId } as any,
          date: new Date(cleanDate),
          status: record.status,
          notes: record.remark || '',
        };
        if (courseId) {
          createPayload.course = { id: courseId };
        }
        att = this.attendanceRepository.create(createPayload) as any;
      } else {
        att.status = record.status;
        att.notes = record.remark || '';
      }
      await this.attendanceRepository.save(att as any);
      savedCount++;
    }

    return { success: true, message: `Register successfully submitted and synced for ${savedCount} records.` };
  }

  async getRecordsByDateAndClass(date: string, className: string, courseId?: number) {
    const cleanDate = date.split('T')[0];
    const whereClause: any = { date: new Date(cleanDate) };
    if (courseId) {
      whereClause.course = { id: courseId };
    }
    
    return this.attendanceRepository.find({
      where: whereClause,
      relations: { student: true }
    });
  }

  async getAttendanceHistory(className?: string, courseId?: number) {
    const whereClause: any = {};
    if (courseId) {
      whereClause.course = { id: courseId };
    }

    const records = await this.attendanceRepository.find({
      where: whereClause,
      relations: { student: true, course: { class_room: true, subject: true } },
      order: { recorded_at: 'DESC' }
    });

    const groupedMap = new Map<string, any>();

    for (const record of records) {
      const dateStr = record.date ? (typeof record.date === 'string' ? record.date : new Date(record.date).toISOString().split('T')[0]) : 'Unknown';
      const cId = record.course?.id || 'nocourse';
      const key = `${dateStr}_${cId}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          key,
          registerDate: dateStr,
          courseId: record.course?.id || null,
          courseName: record.course ? `${record.course.subject?.name || ''} - ${record.course.class_room?.name || ''}` : className || 'General',
          recordedAt: record.recorded_at,
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          records: []
        });
      }

      const group = groupedMap.get(key);
      group.totalStudents++;
      if (record.status === 'Present') group.presentCount++;
      else if (record.status === 'Absent') group.absentCount++;
      else if (record.status === 'Late') group.lateCount++;
      else if (record.status === 'Excused') group.excusedCount++;

      if (record.recorded_at && new Date(record.recorded_at) > new Date(group.recordedAt)) {
        group.recordedAt = record.recorded_at;
      }

      group.records.push({
        id: record.id,
        studentId: record.student ? `STU-${String(record.student.id).padStart(3, '0')}` : 'N/A',
        studentDbId: record.student?.id,
        studentName: record.student?.name || 'Unknown Student',
        status: record.status,
        notes: record.notes || '',
        recordedAt: record.recorded_at
      });
    }

    return Array.from(groupedMap.values()).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  async getAbsentChildrenRecord(className?: string, courseId?: number) {
    const whereClause: any = { status: 'Absent' };
    if (courseId) {
      whereClause.course = { id: courseId };
    }

    const records = await this.attendanceRepository.find({
      where: whereClause,
      relations: { student: true, course: { class_room: true, subject: true } },
      order: { date: 'DESC', recorded_at: 'DESC' }
    });

    return records.map(r => ({
      id: r.id,
      studentId: r.student ? `STU-${String(r.student.id).padStart(3, '0')}` : 'N/A',
      studentDbId: r.student?.id,
      studentName: r.student?.name || 'Unknown Student',
      date: r.date ? (typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().split('T')[0]) : 'Unknown',
      recordedAt: r.recorded_at,
      courseName: r.course ? `${r.course.subject?.name || ''} - ${r.course.class_room?.name || ''}` : className || 'General',
      notes: r.notes || 'No reason provided'
    }));
  }
}
