import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Information } from './entities/information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Information])],
  controllers: [],
  providers: [],
})
export class CommunicationsModule {}
