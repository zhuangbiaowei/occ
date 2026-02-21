import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RagflowSyncOp = 'create' | 'update' | 'delete';
export type RagflowSyncStatus = 'pending' | 'failed' | 'completed';

@Entity('ragflow_sync_jobs')
export class RagflowSyncJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id', length: 36 })
  documentId: string;

  @Column({ name: 'knowledge_base_id', length: 36 })
  knowledgeBaseId: string;

  @Column({ length: 16 })
  operation: RagflowSyncOp;

  @Column({ length: 16, default: 'pending' })
  status: RagflowSyncStatus;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
