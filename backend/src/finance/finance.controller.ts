import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('fee-status')
  async updateFeeStatus(@Body() body: { studentId: number; term: string; year: number; status: string }) {
    // In a real scenario, we'd add an @UseGuards() to check for Executive/Accounts role here
    return this.financeService.updateFeeStatus(body.studentId, body.term, body.year, body.status);
  }

  @Get('fee-status/:studentId')
  async getFeeStatus(@Param('studentId') studentId: number, @Query('term') term: string, @Query('year') year: number) {
    return this.financeService.getFeeStatusForStudent(studentId, term, year);
  }
}
