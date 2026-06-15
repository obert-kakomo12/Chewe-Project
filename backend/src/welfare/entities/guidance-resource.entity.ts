import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('guidance_resources')
export class GuidanceResource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string; // Mental Health, Study Tips, Career

  @Column()
  url: string;

  @CreateDateColumn()
  created_at: Date;
}
