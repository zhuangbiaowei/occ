import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KnowledgeBase } from './knowledge-base.entity';
import { DocumentVersion } from './document-version.entity';
import { DocumentTag } from './document-tag.entity';

@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn('uuid', { name: 'doc_id' })
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text', { nullable: true })
  content?: string;

  @Column({ name: 'file_name', length: 100, nullable: true })
  fileName?: string;

  @Column({ name: 'file_path', length: 200, nullable: true })
  filePath?: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @Column({ name: 'ragflow_document_id', length: 64, nullable: true })
  ragflowDocumentId?: string;

  @Column({ name: 'file_hash', length: 64, nullable: true })
  fileHash?: string;

  @Column({ default: 1 })
  version: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'read_count', default: 0 })
  readCount: number;

  @ManyToOne(() => KnowledgeBase, (kb) => kb.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase: KnowledgeBase;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  @ManyToMany(() => DocumentTag, (tag) => tag.documents)
  @JoinTable({
    name: 'document_tag_relations',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: DocumentTag[];
}
