import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SecurityLog } from './entities/security-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SecurityLog])],
  providers: [],
})
export class UsersModule {}
