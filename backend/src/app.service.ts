import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Course } from './academics/entities/course.entity';
import { Enrollment } from './academics/entities/enrollment.entity';
import { Assessment } from './assessments/entities/assessment.entity';
import { Grade } from './assessments/entities/grade.entity';
import { AttendanceRecord } from './attendance/entities/attendance-record.entity';
import { CounselingLog } from './welfare/entities/counseling-log.entity';
import { GuidanceResource } from './welfare/entities/guidance-resource.entity';
import { Report } from './documents/entities/report.entity';
import { EducationalArchive } from './documents/entities/educational-archive.entity';
import { AuditLog } from './settings/entities/audit-log.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userRepo = this.dataSource.getRepository(User);
    const count = await userRepo.count();
    if (count > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Database is empty. Seeding realistic sample data...');

    // 1. Create Users
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('password123', salt);

    const admin = userRepo.create({ name: 'Admin User', email: 'admin@chewetech.com', role: 'Admin', password_hash: hash });
    const teacher1 = userRepo.create({ name: 'Constance Chimbi', email: 'constance@chewetech.com', role: 'Teacher', password_hash: hash });
    const teacher2 = userRepo.create({ name: 'Jefter Tokomere', email: 'jefter@chewetech.com', role: 'Teacher', password_hash: hash });

    const studentNames = [
      'Nyasha Mandaza', 'Tendai Moyo', 'Rufaro Sibanda', 'Chipo Ndlovu', 
      'Tinashe Mutasa', 'Farai Gumbo', 'Tariro Hove', 'Kudzai Shumba'
    ];
    const students = studentNames.map((name, i) => userRepo.create({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@chewe.com`,
      role: 'Student',
      password_hash: hash
    }));

    await userRepo.save([admin, teacher1, teacher2, ...students]);

    // 2. Create Courses
    const courseRepo = this.dataSource.getRepository(Course);
    const course1 = courseRepo.create({ subject_name: 'Mathematics', grade_level: 'Form 3A', schedule: 'Mon/Wed 08:00 AM', teacher: teacher1 });
    const course2 = courseRepo.create({ subject_name: 'English Language', grade_level: 'Form 4B', schedule: 'Tue/Thu 10:00 AM', teacher: teacher2 });
    const course3 = courseRepo.create({ subject_name: 'Integrated Science', grade_level: 'Form 3A', schedule: 'Fri 09:30 AM', teacher: teacher1 });
    await courseRepo.save([course1, course2, course3]);

    // 3. Create Enrollments
    const enrollRepo = this.dataSource.getRepository(Enrollment);
    const enrollments: Enrollment[] = [];
    students.forEach((s, idx) => {
      if (idx % 2 === 0) {
        enrollments.push(enrollRepo.create({ student: s, course: course1 }));
        enrollments.push(enrollRepo.create({ student: s, course: course3 }));
      } else {
        enrollments.push(enrollRepo.create({ student: s, course: course2 }));
      }
    });
    await enrollRepo.save(enrollments);

    // 4. Create Assessments
    const assessRepo = this.dataSource.getRepository(Assessment);
    const ast1 = assessRepo.create({ subject: 'Mathematics', class: 'Form 3A', type: 'Continuous Assessment', date: new Date('2026-06-20'), status: 'Graded', avgScore: '78%', course: course1, title: 'Term 1 Algebra Test' });
    const ast2 = assessRepo.create({ subject: 'English Language', class: 'Form 4B', type: 'Final Exam', date: new Date('2026-06-22'), status: 'Pending Marking', avgScore: '—', course: course2, title: 'Shakespeare Essay' });
    const ast3 = assessRepo.create({ subject: 'Integrated Science', class: 'Form 3A', type: 'Quiz', date: new Date('2026-06-23'), status: 'Scheduled', avgScore: '—', course: course3, title: 'Cell Structure Quiz' });
    await assessRepo.save([ast1, ast2, ast3]);

    // 5. Create Grades
    const gradeRepo = this.dataSource.getRepository(Grade);
    const grades: Grade[] = [];
    students.filter((_, idx) => idx % 2 === 0).forEach((s, i) => {
      grades.push(gradeRepo.create({
        student: s,
        assessment: ast1,
        score: 70 + (i * 8) % 30,
        teacher_feedback: 'Well done'
      }));
    });
    await gradeRepo.save(grades);

    // 6. Create Attendance Records
    const attRepo = this.dataSource.getRepository(AttendanceRecord);
    const attRecords: AttendanceRecord[] = [];
    const dateToday = new Date();
    const dateYesterday = new Date();
    dateYesterday.setDate(dateYesterday.getDate() - 1);

    students.forEach((s, idx) => {
      const statusToday = idx === 0 ? 'Absent' : (idx === 2 ? 'Late' : 'Present');
      const statusYesterday = idx === 0 ? 'Absent' : 'Present';

      attRecords.push(attRepo.create({ student: s, course: idx % 2 === 0 ? course1 : course2, date: dateToday, status: statusToday, notes: statusToday === 'Absent' ? 'No excuse' : '' }));
      attRecords.push(attRepo.create({ student: s, course: idx % 2 === 0 ? course1 : course2, date: dateYesterday, status: statusYesterday }));
    });
    await attRepo.save(attRecords);

    // 7. Create Counseling Logs
    const logRepo = this.dataSource.getRepository(CounselingLog);
    const wlog1 = logRepo.create({ student: students[0], counselor: teacher1, date: new Date(), severity_level: 'High', session_notes: 'Discussed consecutive unexplained absences. Student reports transport difficulties.', follow_up_required: true });
    const wlog2 = logRepo.create({ student: students[1], counselor: teacher2, date: new Date(), severity_level: 'Medium', session_notes: 'Academic anxiety session. Discussed study plans.', follow_up_required: false });
    await logRepo.save([wlog1, wlog2]);

    // 8. Create Guidance Resources
    const guidRepo = this.dataSource.getRepository(GuidanceResource);
    const gr1 = guidRepo.create({ title: 'Study tips for Zimsec Exams', type: 'Study Tips', url: 'https://example.com/zimsec-tips' });
    const gr2 = guidRepo.create({ title: 'Anxiety management techniques', type: 'Mental Health', url: 'https://example.com/anxiety-management' });
    await guidRepo.save([gr1, gr2]);

    // 9. Create Reports
    const reportRepo = this.dataSource.getRepository(Report);
    const rep1 = reportRepo.create({ author: teacher1, report_type: 'Academic', status: 'Generated', content: 'Term 1 Mid-Term academic report summary for Form 3A.', file_url: 'https://example.com/reports/form3a-midterm.pdf' });
    const rep2 = reportRepo.create({ author: teacher2, report_type: 'Disciplinary', status: 'Draft', content: 'Disciplinary review register draft.', file_url: '' });
    await reportRepo.save([rep1, rep2]);

    // 10. Create Educational Archives
    const archRepo = this.dataSource.getRepository(EducationalArchive);
    const arch1 = archRepo.create({ title: 'Zimsec 2025 Syllabus Archive', subject: 'Mathematics', grade_level: 'Form 3A', file_url: 'https://example.com/syllabus/math-2025.zip', uploaded_by: admin });
    const arch2 = archRepo.create({ title: 'Shakespeare Literature Guide', subject: 'English Language', grade_level: 'Form 4B', file_url: 'https://example.com/guides/shakespeare.zip', uploaded_by: admin });
    await archRepo.save([arch1, arch2]);

    // 11. Create Audit Logs
    const auditRepo = this.dataSource.getRepository(AuditLog);
    const al1 = auditRepo.create({ user: admin, action: 'SEEDED_DATABASE', details: 'Initialized database with default sample data.' });
    await auditRepo.save(al1);

    console.log('Database seeding finished successfully!');
  }
}
