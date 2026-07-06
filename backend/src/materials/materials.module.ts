import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { ClassMaterial } from './entities/class-material.entity';
import { Enrollment } from '../academics/entities/enrollment.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ClassMaterial, Enrollment])],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
