import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Subject } from './subject.entity';
import { ClassRoom } from './class-room.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => Subject, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => ClassRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_room_id' })
  class_room: ClassRoom;

  @CreateDateColumn()
  created_at: Date;
}
