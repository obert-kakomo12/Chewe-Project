import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounselingLog } from './entities/counseling-log.entity';
import { GuidanceResource } from './entities/guidance-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CounselingLog, GuidanceResource])],
  providers: [],
})
export class WelfareModule {}
