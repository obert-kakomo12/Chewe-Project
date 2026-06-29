import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermFeeStatus } from './entities/term-fee-status.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(TermFeeStatus)
    private feeStatusRepository: Repository<TermFeeStatus>,
  ) {}

  async updateFeeStatus(studentId: number, term: string, year: number, status: string): Promise<TermFeeStatus> {
    let feeStatus = await this.feeStatusRepository.findOne({
      where: { student: { id: studentId }, term, year },
      relations: { student: true },
    });

    if (feeStatus) {
      feeStatus.status = status;
    } else {
      feeStatus = this.feeStatusRepository.create({ student: { id: studentId }, term, year, status });
    }

    return this.feeStatusRepository.save(feeStatus);
  }

  async getFeeStatusForStudent(studentId: number, term: string, year: number): Promise<TermFeeStatus | null> {
    return this.feeStatusRepository.findOne({
      where: { student: { id: studentId }, term, year },
    });
  }
}
