import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { User } from './entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.usersRepository.createQueryBuilder('user')
      .where("user.role != 'Student'")
      .andWhere(
        "(user.account_status != 'Transferred' OR user.status_updated_at > :sevenDaysAgo OR user.status_updated_at IS NULL)",
        { sevenDaysAgo }
      )
      .getMany();
  }

  async findStudents(): Promise<User[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.usersRepository.createQueryBuilder('user')
      .where("user.role = 'Student'")
      .andWhere(
        "(user.account_status != 'Transferred' OR user.status_updated_at > :sevenDaysAgo OR user.status_updated_at IS NULL)",
        { sevenDaysAgo }
      )
      .getMany();
  }

  async updateUser(userId: number, updateData: Partial<User>): Promise<void> {
    if (Object.keys(updateData).length > 0) {
      if (updateData.account_status === 'Transferred') {
        updateData.status_updated_at = new Date();
      }
      await this.usersRepository.update(userId, updateData);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Nullify references that might cause foreign key constraint errors
      await queryRunner.query(`UPDATE class_rooms SET class_teacher_id = NULL WHERE class_teacher_id = ?`, [userId]);
      await queryRunner.query(`UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?`, [userId]);

      // Soft delete: change status to Transferred and remove from class
      await queryRunner.manager.update(User, userId, {
        account_status: 'Transferred',
        status_updated_at: new Date(),
        class_room_id: null
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getArchivedPersonnel(): Promise<User[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.usersRepository.createQueryBuilder('user')
      .where("user.account_status = 'Transferred'")
      .andWhere("user.status_updated_at <= :sevenDaysAgo", { sevenDaysAgo })
      .getMany();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoDeleteTransferredUsers() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    this.logger.log(`Running cron job to permanently delete users transferred before ${threeYearsAgo.toISOString()}`);

    const usersToDelete = await this.usersRepository.createQueryBuilder('user')
      .where("user.account_status = 'Transferred'")
      .andWhere("user.status_updated_at <= :threeYearsAgo", { threeYearsAgo })
      .getMany();

    if (usersToDelete.length > 0) {
      const userIds = usersToDelete.map(u => u.id);
      await this.usersRepository.delete(userIds);
      this.logger.log(`Successfully deleted ${userIds.length} transferred users from the database.`);
    } else {
      this.logger.log(`No users found that require permanent deletion.`);
    }
  }
}
