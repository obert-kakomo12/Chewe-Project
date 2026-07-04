import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.materialsService.create(createDto);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.materialsService.findByCourse(Number(courseId));
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.materialsService.findByStudent(Number(studentId));
  }

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }
}
