import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException, Query } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { FinanceService } from '../finance/finance.service';
import { JwtService } from '@nestjs/jwt';

@Controller('assessments')
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly financeService: FinanceService,
    private readonly jwtService: JwtService
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

  @Get('my-marks')
  async getMyMarks(@Headers('authorization') authHeader?: string, @Query('term') term?: string, @Query('year') year?: number) {
    const userId = this.extractUserId(authHeader);
    const feeStatus = await this.financeService.getFeeStatusForStudent(userId, term || 'Term 1', year || new Date().getFullYear());
    if (feeStatus && feeStatus.status === 'ARREARS') {
      throw new UnauthorizedException('Your results have been withheld. Please contact the administration regarding your fee balance.');
    }
    return this.assessmentsService.findMarksByStudentId(userId);
  }

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
