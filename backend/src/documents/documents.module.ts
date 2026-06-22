import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { EducationalArchive } from './entities/educational-archive.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, EducationalArchive])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
