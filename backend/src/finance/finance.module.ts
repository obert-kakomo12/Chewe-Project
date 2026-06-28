import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermFeeStatus } from './entities/term-fee-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TermFeeStatus])],
  controllers: [],
  providers: [],
})
export class FinanceModule {}
