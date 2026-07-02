import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Course } from './academics/entities/course.entity';
import { Subject } from './academics/entities/subject.entity';
import { ClassRoom } from './academics/entities/class-room.entity';
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
    const courseRepo = this.dataSource.getRepository(Course);
    const enrollRepo = this.dataSource.getRepository(Enrollment);
    const assessRepo = this.dataSource.getRepository(Assessment);
    const gradeRepo = this.dataSource.getRepository(Grade);
    const attRepo = this.dataSource.getRepository(AttendanceRecord);
    const logRepo = this.dataSource.getRepository(CounselingLog);
    const guidRepo = this.dataSource.getRepository(GuidanceResource);
    const reportRepo = this.dataSource.getRepository(Report);
    const archRepo = this.dataSource.getRepository(EducationalArchive);
    const auditRepo = this.dataSource.getRepository(AuditLog);

    console.log('Running granular database seeder checks...');

    // 1. Seed Users (Admin, Teachers, Students)
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('password123', salt);

    let admin = await userRepo.findOne({ where: { role: 'Admin' } });
    if (!admin) {
      admin = userRepo.create({ name: 'Admin User', email: 'admin@chewetech.com', role: 'Admin', password_hash: hash });
      await userRepo.save(admin);
      console.log('Seeded Admin User.');
    }

    let teacher1 = await userRepo.findOne({ where: { email: 'constance@chewetech.com' } });
    if (!teacher1) {
      teacher1 = userRepo.create({ name: 'Constance Chimbi', email: 'constance@chewetech.com', role: 'Teacher', password_hash: hash });
      await userRepo.save(teacher1);
      console.log('Seeded Constance Chimbi (Teacher).');
    }

    let teacher2 = await userRepo.findOne({ where: { email: 'jefter@chewetech.com' } });
    if (!teacher2) {
      teacher2 = userRepo.create({ name: 'Jefter Tokomere', email: 'jefter@chewetech.com', role: 'Teacher', password_hash: hash });
      await userRepo.save(teacher2);
      console.log('Seeded Jefter Tokomere (Teacher).');
    }

    let students = await userRepo.find({ where: { role: 'Student' } });
    if (students.length === 0) {
      const studentNames = [
        'Nyasha Mandaza', 'Tendai Moyo', 'Rufaro Sibanda', 'Chipo Ndlovu', 
        'Tinashe Mutasa', 'Farai Gumbo', 'Tariro Hove', 'Kudzai Shumba'
      ];
      const newStudents = studentNames.map(name => userRepo.create({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@chewe.com`,
        role: 'Student',
        password_hash: hash
      }));
      students = await userRepo.save(newStudents);
      console.log(`Seeded ${students.length} students.`);
    }

    const subjectRepo = this.dataSource.getRepository(Subject);
    const classRoomRepo = this.dataSource.getRepository(ClassRoom);

    // Seed Subjects
    let subject1 = await subjectRepo.findOne({ where: { code: 'MATH' } });
    if (!subject1) {
      subject1 = subjectRepo.create({ name: 'Mathematics', code: 'MATH' });
      await subjectRepo.save(subject1);
    }
    let subject2 = await subjectRepo.findOne({ where: { code: 'ENG' } });
    if (!subject2) {
      subject2 = subjectRepo.create({ name: 'English Language', code: 'ENG' });
      await subjectRepo.save(subject2);
    }
    let subject3 = await subjectRepo.findOne({ where: { code: 'SCI' } });
    if (!subject3) {
      subject3 = subjectRepo.create({ name: 'Integrated Science', code: 'SCI' });
      await subjectRepo.save(subject3);
    }

    // Seed ClassRooms
    let class1 = await classRoomRepo.findOne({ where: { name: 'Form 3A' } });
    if (!class1) {
      class1 = classRoomRepo.create({ name: 'Form 3A', grade_level: 'Form 3' });
      await classRoomRepo.save(class1);
    }
    let class2 = await classRoomRepo.findOne({ where: { name: 'Form 4B' } });
    if (!class2) {
      class2 = classRoomRepo.create({ name: 'Form 4B', grade_level: 'Form 4' });
      await classRoomRepo.save(class2);
    }

    // 2. Seed Courses
    let courses = await courseRepo.find({ relations: { subject: true, class_room: true } });
    if (courses.length === 0) {
      const course1 = courseRepo.create({ subject: subject1, class_room: class1, teacher: teacher1 });
      const course2 = courseRepo.create({ subject: subject2, class_room: class2, teacher: teacher2 });
      const course3 = courseRepo.create({ subject: subject3, class_room: class1, teacher: teacher1 });
      courses = await courseRepo.save([course1, course2, course3]);
      console.log('Seeded courses.');
    }

    const course1 = courses.find(c => c.subject?.code === 'MATH') || courses[0];
    const course2 = courses.find(c => c.subject?.code === 'ENG') || courses[1];
    const course3 = courses.find(c => c.subject?.code === 'SCI') || courses[2];

    // 3. Seed Enrollments
    const enrollmentsCount = await enrollRepo.count();
    if (enrollmentsCount === 0 && students.length > 0 && courses.length > 0) {
      const enrollments: Enrollment[] = [];
      students.forEach((s, idx) => {
        if (idx % 2 === 0) {
          if (course1) enrollments.push(enrollRepo.create({ student: s, course: course1 }));
          if (course3) enrollments.push(enrollRepo.create({ student: s, course: course3 }));
        } else {
          if (course2) enrollments.push(enrollRepo.create({ student: s, course: course2 }));
        }
      });
      await enrollRepo.save(enrollments);
      console.log('Seeded enrollments.');
    }

    // 4. Seed Assessments
    let assessments = await assessRepo.find();
    if (assessments.length === 0 && courses.length > 0) {
      const ast1 = assessRepo.create({ subject: 'Mathematics', class: 'Form 3A', type: 'Continuous Assessment', date: new Date('2026-06-20'), status: 'Graded', avgScore: '78%', course: course1, title: 'Term 1 Algebra Test' });
      const ast2 = assessRepo.create({ subject: 'English Language', class: 'Form 4B', type: 'Final Exam', date: new Date('2026-06-22'), status: 'Pending Marking', avgScore: '—', course: course2, title: 'Shakespeare Essay' });
      const ast3 = assessRepo.create({ subject: 'Integrated Science', class: 'Form 3A', type: 'Quiz', date: new Date('2026-06-23'), status: 'Scheduled', avgScore: '—', course: course3, title: 'Cell Structure Quiz' });
      assessments = await assessRepo.save([ast1, ast2, ast3]);
      console.log('Seeded assessments.');
    }

    const ast1 = assessments.find(a => a.subject === 'Mathematics') || assessments[0];
    const ast2 = assessments.find(a => a.subject === 'English Language') || assessments[1];
    const ast3 = assessments.find(a => a.subject === 'Integrated Science') || assessments[2];

    // 5. Seed Grades
    const gradesCount = await gradeRepo.count();
    if (gradesCount === 0 && students.length > 0 && assessments.length > 0) {
      const grades: Grade[] = [];
      students.forEach((s, i) => {
        if (i % 2 === 0 && ast1) {
          grades.push(gradeRepo.create({
            student: s,
            assessment: ast1,
            score: 70 + (i * 8) % 30,
            teacher_feedback: 'Well done'
          }));
        }
        if (i % 2 === 0 && ast3) {
          grades.push(gradeRepo.create({
            student: s,
            assessment: ast3,
            score: 65 + (i * 7) % 35,
            teacher_feedback: 'Good effort'
          }));
        }
        if (i % 2 !== 0 && ast2) {
          grades.push(gradeRepo.create({
            student: s,
            assessment: ast2,
            score: 55 + (i * 9) % 40,
            teacher_feedback: 'Fair performance'
          }));
        }
      });
      await gradeRepo.save(grades);
      console.log('Seeded grades.');
    }

    // 6. Seed Attendance Records
    const attendanceCount = await attRepo.count();
    if (attendanceCount === 0 && students.length > 0 && courses.length > 0) {
      const attRecords: AttendanceRecord[] = [];
      const dateToday = new Date();
      const dateYesterday = new Date();
      dateYesterday.setDate(dateYesterday.getDate() - 1);

      students.forEach((s, idx) => {
        const targetCourse = idx % 2 === 0 ? course1 : course2;
        if (targetCourse) {
          const statusToday = idx === 0 ? 'Absent' : (idx === 2 ? 'Late' : 'Present');
          const statusYesterday = idx === 0 ? 'Absent' : 'Present';

          attRecords.push(attRepo.create({ student: s, course: targetCourse, date: dateToday, status: statusToday, notes: statusToday === 'Absent' ? 'No excuse' : '' }));
          attRecords.push(attRepo.create({ student: s, course: targetCourse, date: dateYesterday, status: statusYesterday }));
        }
      });
      await attRepo.save(attRecords);
      console.log('Seeded attendance records.');
    }

    // 7. Seed Counseling Logs
    const logCount = await logRepo.count();
    if (logCount === 0 && students.length > 0) {
      const wlog1 = logRepo.create({ student: students[0], counselor: teacher1, date: new Date(), severity_level: 'High', session_notes: 'Discussed consecutive unexplained absences. Student reports transport difficulties.', follow_up_required: true });
      const wlog2 = logRepo.create({ student: students[1], counselor: teacher2, date: new Date(), severity_level: 'Medium', session_notes: 'Academic anxiety session. Discussed study plans.', follow_up_required: false });
      await logRepo.save([wlog1, wlog2]);
      console.log('Seeded counseling logs.');
    }

    // 8. Seed Guidance Resources
    const guidCount = await guidRepo.count();
    if (guidCount === 0) {
      const gr1 = guidRepo.create({ title: 'Study tips for Zimsec Exams', type: 'Study Tips', url: 'https://example.com/zimsec-tips' });
      const gr2 = guidRepo.create({ title: 'Anxiety management techniques', type: 'Mental Health', url: 'https://example.com/anxiety-management' });
      await guidRepo.save([gr1, gr2]);
      console.log('Seeded guidance resources.');
    }

    // 9. Seed Reports
    const reportCount = await reportRepo.count();
    if (reportCount === 0) {
      const rep1 = reportRepo.create({ author: teacher1, report_type: 'Academic', status: 'Generated', content: 'Term 1 Mid-Term academic report summary for Form 3A.', file_url: 'https://example.com/reports/form3a-midterm.pdf' });
      const rep2 = reportRepo.create({ author: teacher2, report_type: 'Disciplinary', status: 'Draft', content: 'Disciplinary review register draft.', file_url: '' });
      await reportRepo.save([rep1, rep2]);
      console.log('Seeded reports.');
    }

    // 10. Seed Educational Archives
    const archCount = await archRepo.count();
    if (archCount === 0) {
      const arch1 = archRepo.create({ title: 'Zimsec 2025 Syllabus Archive', subject: 'Mathematics', grade_level: 'Form 3A', file_url: 'https://example.com/syllabus/math-2025.zip', uploaded_by: admin });
      const arch2 = archRepo.create({ title: 'Shakespeare Literature Guide', subject: 'English Language', grade_level: 'Form 4B', file_url: 'https://example.com/guides/shakespeare.zip', uploaded_by: admin });
      await archRepo.save([arch1, arch2]);
      console.log('Seeded educational archives.');
    }

    // 11. Seed Audit Logs
    const auditCount = await auditRepo.count();
    if (auditCount === 0) {
      const al1 = auditRepo.create({ user: admin, action: 'SEEDED_DATABASE', details: 'Initialized database with default sample data.' });
      await auditRepo.save(al1);
      console.log('Seeded audit logs.');
    }

    console.log('Database seeding finished successfully!');
  }

  async search(query: string) {
    const userRepo = this.dataSource.getRepository(User);
    const subjectRepo = this.dataSource.getRepository(Subject);
    const assessRepo = this.dataSource.getRepository(Assessment);
    
    const users = await userRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { role: Like(`%${query}%`) }
      ],
      take: 5
    });

    const subjects = await subjectRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { code: Like(`%${query}%`) }
      ],
      take: 5
    });

    const assessments = await assessRepo.find({
      where: [
        { title: Like(`%${query}%`) },
        { subject: Like(`%${query}%`) }
      ],
      take: 5
    });

    const results: any[] = [];
    users.forEach(u => results.push({ type: 'User', id: u.id, title: u.name, subtitle: `${u.role} - ${u.email}`, link: '/users' }));
    subjects.forEach(s => results.push({ type: 'Subject', id: s.id, title: s.name, subtitle: s.code, link: '/academics' }));
    assessments.forEach(a => results.push({ type: 'Assessment', id: a.id, title: a.title, subtitle: a.subject, link: '/assessments' }));
    
    return results;
  }
}
