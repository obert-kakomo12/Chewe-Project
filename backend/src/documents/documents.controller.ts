import { Controller, Get, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('reports')
  getReports() {
    return this.documentsService.getReports();
  }

  @Get('archives')
  getArchives() {
    return this.documentsService.getArchives();
  }
}
