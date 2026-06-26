import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('report-comment')
  async getReportComment(@Body() body: any) {
    try {
      const response = await this.aiService.generateReportComment(body);
      return { response };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('executive-analysis')
  async getExecutiveAnalysis(@Body() body: any) {
    try {
      const response = await this.aiService.generateExecutiveAnalysis(body);
      return { response };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('counseling-suggestion')
  async getCounselingSuggestion(@Body() body: any) {
    try {
      const response = await this.aiService.generateCounselingSuggestion(body);
      return { response };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
