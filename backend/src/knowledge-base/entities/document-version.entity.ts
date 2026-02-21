import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity';
import { User } from '../../users/entities/user.entity';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid', { name: 'version_id' })
  id: string;

  @Column()
  version: number;

  @Column('text', { nullable: true })
  content?: string;

  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary?: string;

  @ManyToOne(
    () => KnowledgeDocument,
    (document) => document.versions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'doc_id' })
  document: KnowledgeDocument;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
