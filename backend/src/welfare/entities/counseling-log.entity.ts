import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('counseling_logs')
export class CounselingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'counselor_id' })
  counselor: User;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  severity_level: string;

  @Column({ type: 'text' })
  session_notes: string;

  @Column({ default: false })
  follow_up_required: boolean;

  @CreateDateColumn()
  recorded_at: Date;
}
