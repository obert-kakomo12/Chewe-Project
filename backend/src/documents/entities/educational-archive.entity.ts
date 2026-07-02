import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('educational_archives')
export class EducationalArchive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  subject: string;

  @Column()
  grade_level: string;

  @Column()
  file_url: string;

  @Column({ default: '1.2 MB' })
  size: string;

  @Column({ default: 'GZIP (High)' })
  compression: string;

  @Column({ default: 'AWS Glacier' })
  location: string;

  @Column({ default: 'Verified' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_by: User;

  @CreateDateColumn()
  created_at: Date;
}
