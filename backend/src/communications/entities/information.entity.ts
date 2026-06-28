import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('information')
export class Information {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'RULE' or 'ANNOUNCEMENT'

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  target_level: string; // 'GLOBAL', 'CLASS', 'SUBJECT'

  @Column({ type: 'int', nullable: true })
  target_id: number | null; // ID of ClassRoom or Course

  @CreateDateColumn()
  created_at: Date;
}
