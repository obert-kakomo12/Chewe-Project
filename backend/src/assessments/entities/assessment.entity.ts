import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Course } from '../../academics/entities/course.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ nullable: true })
  title: string;

  @Column()
  subject: string;

  @Column({ name: 'class_name' })
  class: string;

  @Column({ default: 'Scheduled' })
  status: string;

  @Column({ default: '—' })
  avgScore: string;

  @Column()
  type: string; // Quiz, Midterm, Final

  @Column({ type: 'int', nullable: true })
  max_score: number;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;
}
