import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column()
  subject_name: string;

  @Column()
  grade_level: string;

  @Column({ nullable: true })
  schedule: string;

  @CreateDateColumn()
  created_at: Date;
}
