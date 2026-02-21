import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity';

@Entity('document_tags')
export class DocumentTag {
  @PrimaryGeneratedColumn('uuid', { name: 'tag_id' })
  id: string;

  @Column({ name: 'tag_name', length: 100 })
  name: string;

  @Column({ name: 'kb_id', nullable: true })
  knowledgeBaseId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToMany(() => KnowledgeDocument, (document) => document.tags)
  documents: KnowledgeDocument[];
}
