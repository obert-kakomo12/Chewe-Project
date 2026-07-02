import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ default: 'O-Level' })
  level: string;

  @Column({ default: 'General' })
  stream: string;

  @CreateDateColumn()
  created_at: Date;
}
