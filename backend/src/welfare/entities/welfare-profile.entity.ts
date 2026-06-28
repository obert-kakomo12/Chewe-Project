import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('welfare_profiles')
export class WelfareProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'varchar', nullable: true })
  beam_status: string; // 'Applied', 'Approved', 'Eligible'

  @Column({ type: 'float', default: 0 })
  confidence_index: number;

  @Column({ type: 'boolean', default: false })
  financial_need_flag: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
