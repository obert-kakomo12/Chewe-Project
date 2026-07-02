import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async saveResetToken(userId: number, token: string, expires: Date): Promise<void> {
    await this.usersRepository.update(userId, {
      reset_token: token,
      reset_token_expires: expires.getTime().toString(),
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { reset_token: token },
    });
  }

  async clearResetToken(userId: number): Promise<void> {
    // Cannot pass null directly to TypeORM update in strict mode without assertion, using any or undefined is safer, or save()
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (user) {
      user.reset_token = null;
      user.reset_token_expires = null;
      await this.usersRepository.save(user);
    }
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.usersRepository.update(userId, { password_hash: passwordHash });
  }

  async findById(userId: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async updateProfile(userId: number, name?: string, profilePicture?: string): Promise<void> {
    const updateData: Partial<User> = {};
    if (name !== undefined) updateData.name = name;
    if (profilePicture !== undefined) updateData.profile_picture = profilePicture;
    
    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(userId, updateData);
    }
  }

  async findStaff(): Promise<User[]> {
    return this.usersRepository.createQueryBuilder('user')
      .where("user.role != 'Student'")
      .getMany();
  }

  async deleteUser(userId: number): Promise<void> {
    await this.usersRepository.delete(userId);
  }
}
