import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SecurityLog } from './entities/security-log.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, SecurityLog])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
