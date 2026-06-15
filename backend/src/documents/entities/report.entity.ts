import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  report_type: string; // Incident, Academic, Disciplinary

  @Column({ default: 'Draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  file_url: string;

  @CreateDateColumn()
  created_at: Date;
}
