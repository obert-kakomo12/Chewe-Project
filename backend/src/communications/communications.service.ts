import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Information } from './entities/information.entity';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectRepository(Information)
    private infoRepository: Repository<Information>,
  ) {}

  async create(data: Partial<Information>): Promise<Information> {
    const info = this.infoRepository.create(data);
    return this.infoRepository.save(info);
  }

  async getInformationForStudent(classRoomId: number | null, courseIds: number[]): Promise<Information[]> {
    const qb = this.infoRepository.createQueryBuilder('info');
    
    qb.where('info.target_level = :global', { global: 'GLOBAL' });
    
    if (classRoomId) {
      qb.orWhere('(info.target_level = :classLvl AND info.target_id = :classRoomId)', { classLvl: 'CLASS', classRoomId });
    }
    
    if (courseIds && courseIds.length > 0) {
      qb.orWhere('(info.target_level = :subjectLvl AND info.target_id IN (:...courseIds))', { subjectLvl: 'SUBJECT', courseIds });
    }
    
    return qb.orderBy('info.created_at', 'DESC').getMany();
  }
}
