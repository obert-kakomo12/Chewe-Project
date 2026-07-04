import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from '../../academics/entities/course.entity';

@Entity('class_materials')
export class ClassMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  google_drive_link: string;

  @Column()
  posted_by: string; // Teacher name

  @CreateDateColumn()
  posted_at: Date;
}
