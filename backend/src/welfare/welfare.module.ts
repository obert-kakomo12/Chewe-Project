import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounselingLog } from './entities/counseling-log.entity';
import { GuidanceResource } from './entities/guidance-resource.entity';
import { WelfareController } from './welfare.controller';
import { WelfareService } from './welfare.service';

@Module({
  imports: [TypeOrmModule.forFeature([CounselingLog, GuidanceResource])],
  controllers: [WelfareController],
  providers: [WelfareService],
})
export class WelfareModule {}
