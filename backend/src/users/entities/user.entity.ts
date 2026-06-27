import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'Student' })
  role: string; // Admin, Teacher, Student, Parent

  @Column({ type: 'varchar', nullable: true })
  reset_token: string | null;

  @Column({ type: 'varchar', nullable: true })
  reset_token_expires: string | null;

  @Column({ type: 'longtext', nullable: true })
  profile_picture: string | null;

  @CreateDateColumn()
  created_at: Date;
}
