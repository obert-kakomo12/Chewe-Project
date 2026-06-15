import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Assessment } from './assessment.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Assessment)
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  teacher_feedback: string;

  @CreateDateColumn()
  recorded_at: Date;
}
