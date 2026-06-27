import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('class_materials')
export class ClassMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'class_name' })
  class: string; // e.g., 'Form 3A'

  @Column()
  google_drive_link: string;

  @Column()
  posted_by: string; // Teacher name

  @CreateDateColumn()
  posted_at: Date;
}
