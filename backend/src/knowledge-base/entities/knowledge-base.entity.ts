import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KnowledgeDocument } from './knowledge-document.entity';

@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid', { name: 'kb_id' })
  id: string;

  @Column({ name: 'kb_name', length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ name: 'type', length: 20 })
  status: string;

  @Column({ name: 'ragflow_dataset_id', length: 64, nullable: true })
  ragflowDatasetId?: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => KnowledgeDocument,
    (document) => document.knowledgeBase,
  )
  documents: KnowledgeDocument[];
}
