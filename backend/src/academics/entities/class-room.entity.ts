import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('class_rooms')
export class ClassRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  grade_level: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'class_teacher_id' })
  class_teacher: User;

  @CreateDateColumn()
  created_at: Date;
}
