import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounselingLog } from './entities/counseling-log.entity';
import { GuidanceResource } from './entities/guidance-resource.entity';
import { WelfareProfile } from './entities/welfare-profile.entity';
import { WelfareController } from './welfare.controller';
import { WelfareService } from './welfare.service';

@Module({
  imports: [TypeOrmModule.forFeature([CounselingLog, GuidanceResource, WelfareProfile])],
  controllers: [WelfareController],
  providers: [WelfareService],
})
export class WelfareModule {}
