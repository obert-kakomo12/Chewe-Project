import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  findAll() {
    return this.assessmentsService.findAll();
  }

  @Post()
  create(@Body() createDto: any) {
    return this.assessmentsService.create(createDto);
  }

  @Put(':id/grade')
  updateGrade(@Param('id') id: string, @Body('avgScore') avgScore: string) {
    return this.assessmentsService.updateGrade(+id, avgScore);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentsService.remove(+id);
  }

  @Post('ai-comment')
  generateAIComment(
    @Body('studentName') studentName: string,
    @Body('score') score: number,
    @Body('userPrompt') userPrompt?: string,
  ) {
    return this.assessmentsService.generateAIComment(studentName, score, userPrompt);
  }
}
