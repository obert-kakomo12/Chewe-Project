import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { EducationalArchive } from './entities/educational-archive.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, EducationalArchive])],
  providers: [],
})
export class DocumentsModule {}
