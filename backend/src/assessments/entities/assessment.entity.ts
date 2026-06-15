import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Course } from '../../academics/entities/course.entity';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  title: string;

  @Column()
  type: string; // Quiz, Midterm, Final

  @Column({ type: 'int' })
  max_score: number;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  created_at: Date;
}
