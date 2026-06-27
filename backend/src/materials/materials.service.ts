import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassMaterial } from './entities/class-material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(ClassMaterial)
    private materialsRepository: Repository<ClassMaterial>,
  ) {}

  async create(createDto: any) {
    const material = this.materialsRepository.create(createDto);
    return this.materialsRepository.save(material);
  }

  findAll() {
    return this.materialsRepository.find({ order: { posted_at: 'DESC' } });
  }

  findByClass(className: string) {
    return this.materialsRepository.find({
      where: { class: className },
      order: { posted_at: 'DESC' },
    });
  }
}
