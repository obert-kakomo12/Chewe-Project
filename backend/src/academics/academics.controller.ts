import { Controller, Get, Post, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('academics')
export class AcademicsController {
  constructor(
    private readonly academicsService: AcademicsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private extractUserId(authHeader?: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('pathfinder')
  getPathfinderData() {
    return this.academicsService.getPathfinderData();
  }

  @Post('subjects')
  createSubject(@Body() data: any) {
    return this.academicsService.createSubject(data);
  }

  @Get('subjects')
  getSubjects() {
    return this.academicsService.findAllSubjects();
  }

  @Delete('subjects/:id')
  deleteSubject(@Param('id') id: string) {
    return this.academicsService.deleteSubject(Number(id));
  }

  @Post('classrooms')
  createClassRoom(@Body() data: any) {
    return this.academicsService.createClassRoom(data);
  }

  @Get('classrooms')
  getClassRooms() {
    return this.academicsService.findAllClassRooms();
  }

  @Delete('classrooms/:id')
  deleteClassRoom(@Param('id') id: string) {
    return this.academicsService.deleteClassRoom(Number(id));
  }

  @Post('classrooms/:id/teacher')
  assignClassTeacher(@Param('id') id: string, @Body() data: { teacherId: number }) {
    return this.academicsService.assignClassTeacher(Number(id), data.teacherId);
  }

  // --- Courses ---

  @Post('courses')
  createCourse(@Body() data: { teacherId: number, subjectId: number, classRoomId: number }) {
    return this.academicsService.createCourse(data.teacherId, data.subjectId, data.classRoomId);
  }

  @Get('courses')
  getCourses() {
    return this.academicsService.findAllCourses();
  }

  @Get('courses/teacher/:teacherId')
  getTeacherCourses(@Param('teacherId') teacherId: string) {
    return this.academicsService.findTeacherCourses(Number(teacherId));
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.academicsService.deleteCourse(Number(id));
  }

  @Get('classes/:classRoomId/students')
  getClassStudents(@Param('classRoomId') classRoomId: string) {
    return this.academicsService.findStudentsByClass(classRoomId);
  }

  @Post('classes/:classRoomId/students')
  async createAndEnrollStudent(
    @Headers('authorization') authHeader: string,
    @Param('classRoomId') classRoomId: string,
    @Body() body: { name: string, email: string }
  ) {
    const userId = this.extractUserId(authHeader);
    const user = await this.usersService.findById(userId);
    if (!user || (user.role !== 'Admin' && user.role !== 'Executive')) {
      throw new UnauthorizedException('Only Admins/Executives can add students to the system');
    }
    return this.academicsService.createAndEnrollStudent(classRoomId, body.name, body.email);
  }

  @Post('classrooms/:classRoomId/students')
  assignStudentToClassRoom(@Param('classRoomId') classRoomId: string, @Body() data: { studentId: number }) {
    return this.academicsService.assignStudentToClassRoom(data.studentId, Number(classRoomId));
  }
}

