# RAGFlow Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add backend support to sync knowledge base documents to RAGFlow with dataset mapping and a retryable sync job table.

**Architecture:** Introduce a `RagflowSyncService` that owns API calls and sync logic, persist dataset IDs on `knowledge_bases`, and record failed syncs in a `ragflow_sync_jobs` table for retry. Wire document create/update/delete to the sync service.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Node 18+ `fetch`, Jest.

### Task 1: Extend data model for dataset mapping and sync jobs

**Files:**
- Modify: `backend/src/knowledge-base/entities/knowledge-base.entity.ts`
- Create: `backend/src/knowledge-base/entities/ragflow-sync-job.entity.ts`
- Modify: `backend/src/knowledge-base/knowledge-base.module.ts`
- Create: `backend/src/knowledge-base/ragflow-sync.service.spec.ts`
- Modify: `backend/src/knowledge-base/dto/create-document.dto.ts`
- Modify: `backend/src/knowledge-base/dto/update-document.dto.ts`

**Step 1: Write the failing test**

```ts
// backend/src/knowledge-base/ragflow-sync.service.spec.ts
import { RagflowSyncService } from './ragflow-sync.service';

describe('RagflowSyncService', () => {
  const fetchMock = jest.fn();
  const knowledgeBaseRepository = { save: jest.fn(), merge: jest.fn() };
  const documentRepository = { findOne: jest.fn() };
  const syncJobRepository = { create: jest.fn(), save: jest.fn() };

  beforeEach(() => {
    fetchMock.mockReset();
    (global as any).fetch = fetchMock;
  });

  it('persists ragflow dataset id on knowledge base when created', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'ds-1' }),
      text: async () => '',
    });
    knowledgeBaseRepository.merge.mockImplementation((kb: any, patch: any) => ({
      ...kb,
      ...patch,
    }));
    knowledgeBaseRepository.save.mockResolvedValue({
      id: 'kb-1',
      name: 'KB',
      ragflowDatasetId: 'ds-1',
    });

    const service = new RagflowSyncService(
      { get: (k: string) => (k === 'RAGFLOW_BASE_URL' ? 'http://rag' : 'key') } as any,
      knowledgeBaseRepository as any,
      documentRepository as any,
      syncJobRepository as any,
    );

    const kb = await service.ensureDatasetForKb({
      id: 'kb-1',
      name: 'KB',
      ragflowDatasetId: undefined,
    } as any);

    expect(knowledgeBaseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ ragflowDatasetId: 'ds-1' }),
    );
    expect(kb.ragflowDatasetId).toBe('ds-1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- knowledge-base/ragflow-sync.service.spec.ts`  
Expected: FAIL with "property ragflowDatasetId does not exist" or missing service.

**Step 3: Update entity and DTOs**

```ts
// backend/src/knowledge-base/entities/knowledge-base.entity.ts
  @Column({ name: 'ragflow_dataset_id', length: 64, nullable: true })
  ragflowDatasetId?: string;
```

```ts
// backend/src/knowledge-base/dto/create-document.dto.ts
  @ApiProperty({ description: '文件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  filePath?: string;
```

```ts
// backend/src/knowledge-base/dto/update-document.dto.ts
  @ApiProperty({ description: '文件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  filePath?: string;
```

```ts
// backend/src/knowledge-base/entities/ragflow-sync-job.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
  nextRetryAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

```ts
// backend/src/knowledge-base/knowledge-base.module.ts
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeBase,
      KnowledgeDocument,
      DocumentVersion,
      DocumentTag,
      RagflowSyncJob,
    ]),
    UsersModule,
  ],
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/ragflow-sync.service.spec.ts`  
Expected: FAIL (service not implemented) — proceed to Task 2.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/entities/knowledge-base.entity.ts \
        backend/src/knowledge-base/entities/ragflow-sync-job.entity.ts \
        backend/src/knowledge-base/knowledge-base.module.ts \
        backend/src/knowledge-base/dto/create-document.dto.ts \
        backend/src/knowledge-base/dto/update-document.dto.ts
git commit -m "feat: add ragflow dataset mapping and sync job entity"
```

### Task 2: Implement RagflowSyncService with tests

**Files:**
- Create: `backend/src/knowledge-base/ragflow-sync.service.ts`
- Modify: `backend/.env` (local config only; do not commit secrets)

**Step 1: Run test to verify it fails**

Run: `npm test -- knowledge-base/ragflow-sync.service.spec.ts`  
Expected: FAIL with "Cannot find module './ragflow-sync.service'".

**Step 2: Write minimal implementation**

```ts
// backend/src/knowledge-base/ragflow-sync.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { RagflowSyncJob, RagflowSyncOp } from './entities/ragflow-sync-job.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class RagflowSyncService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(KnowledgeBase)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBase>,
    @InjectRepository(KnowledgeDocument)
    private readonly documentRepository: Repository<KnowledgeDocument>,
    @InjectRepository(RagflowSyncJob)
    private readonly syncJobRepository: Repository<RagflowSyncJob>,
  ) {}

  private get baseUrl() {
    return this.config.get<string>('RAGFLOW_BASE_URL', '');
  }

  private get apiKey() {
    return this.config.get<string>('RAGFLOW_API_KEY', '');
  }

  async createDataset(name: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/v1/datasets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(`RAGFlow dataset create failed: ${text}`);
    }

    const data = (await response.json()) as { id: string };
    return data.id;
  }

  async ensureDatasetForKb(kb: KnowledgeBase): Promise<KnowledgeBase> {
    if (kb.ragflowDatasetId) {
      return kb;
    }

    const datasetId = await this.createDataset(kb.name);
    const updated = this.knowledgeBaseRepository.merge(kb, {
      ragflowDatasetId: datasetId,
    });
    return this.knowledgeBaseRepository.save(updated);
  }

  async enqueueJob(document: KnowledgeDocument, operation: RagflowSyncOp, error?: string) {
    const job = this.syncJobRepository.create({
      documentId: document.id,
      knowledgeBaseId: document.knowledgeBase?.id || '',
      operation,
      status: 'pending',
      lastError: error,
    });
    return this.syncJobRepository.save(job);
  }

  async syncCreateOrUpdate(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['knowledgeBase'],
    });
    if (!document || !document.knowledgeBase) {
      return;
    }

    try {
      const kb = await this.ensureDatasetForKb(document.knowledgeBase);
      if (kb.ragflowDatasetId) {
        await this.deleteFile(kb.ragflowDatasetId, document.id);
        await this.uploadFile(kb.ragflowDatasetId, document);
      }
    } catch (error) {
      await this.enqueueJob(document, 'update', this.formatError(error));
    }
  }

  async syncDelete(document: KnowledgeDocument) {
    if (!document.knowledgeBase?.ragflowDatasetId) {
      return;
    }

    try {
      await this.deleteFile(document.knowledgeBase.ragflowDatasetId, document.id);
    } catch (error) {
      await this.enqueueJob(document, 'delete', this.formatError(error));
    }
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  async uploadFile(datasetId: string, document: KnowledgeDocument) {
    if (!document.filePath) {
      throw new InternalServerErrorException('Missing filePath for document');
    }
    await fs.stat(document.filePath);
    const form = new FormData();
    const fileName = document.fileName || path.basename(document.filePath);
    const buffer = await fs.readFile(document.filePath);
    form.append('file', new Blob([buffer]), fileName);
    form.append('external_id', document.id);
    form.append(
      'metadata',
      JSON.stringify({
        knowledgeBaseId: document.knowledgeBase?.id,
        title: document.title,
        fileName,
        updatedAt: document.updatedAt,
      }),
    );

    const response = await fetch(`${this.baseUrl}/api/v1/datasets/${datasetId}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(`RAGFlow upload failed: ${text}`);
    }
  }

  async deleteFile(datasetId: string, externalId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/datasets/${datasetId}/files/${externalId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );
    if (!response.ok && response.status !== 404) {
      const text = await response.text();
      throw new InternalServerErrorException(`RAGFlow delete failed: ${text}`);
    }
  }
}
```

**Step 3: Update local config (do not commit secrets)**

```ini
# backend/.env
RAGFLOW_BASE_URL=http://192.168.1.48
RAGFLOW_API_KEY=ragflow-************************
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/ragflow-sync.service.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/ragflow-sync.service.ts \
        backend/src/knowledge-base/ragflow-sync.service.spec.ts \
        backend/src/knowledge-base/knowledge-base.module.ts
git commit -m "feat: add ragflow sync service"
```

### Task 3: Wire sync into KnowledgeBaseService

**Files:**
- Modify: `backend/src/knowledge-base/knowledge-base.service.ts`
- Modify: `backend/src/knowledge-base/knowledge-base.module.ts`
- Create: `backend/src/knowledge-base/knowledge-base.service.spec.ts`

**Step 1: Write the failing test**

```ts
// backend/src/knowledge-base/knowledge-base.service.spec.ts
import { KnowledgeBaseService } from './knowledge-base.service';

describe('KnowledgeBaseService ragflow sync', () => {
  it('calls ragflow sync on document create', async () => {
    const documentRepository = {
      create: jest.fn(() => ({ id: 'doc-1' })),
      save: jest.fn(async () => ({ id: 'doc-1' })),
    };
    const knowledgeBaseRepository = { findOne: jest.fn(async () => ({ id: 'kb-1' })) };
    const ragflowSyncService = { syncCreateOrUpdate: jest.fn() };

    const service = new KnowledgeBaseService(
      knowledgeBaseRepository as any,
      documentRepository as any,
      ragflowSyncService as any,
    );

    await service.createDocument({ knowledgeBaseId: 'kb-1', title: 't' } as any, 'u-1');
    expect(ragflowSyncService.syncCreateOrUpdate).toHaveBeenCalledWith('doc-1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- knowledge-base/knowledge-base.service.spec.ts`  
Expected: FAIL with missing constructor params or method.

**Step 3: Implement minimal wiring**

```ts
// backend/src/knowledge-base/knowledge-base.service.ts
  constructor(
    @InjectRepository(KnowledgeBase)
    private knowledgeBaseRepository: Repository<KnowledgeBase>,
    @InjectRepository(KnowledgeDocument)
    private documentRepository: Repository<KnowledgeDocument>,
    private readonly ragflowSyncService: RagflowSyncService,
  ) {}

  async createDocument(createDto: CreateDocumentDto, userId: string) {
    const knowledgeBase = await this.findOne(createDto.knowledgeBaseId);
    const document = this.documentRepository.create({
      ...createDto,
      knowledgeBase,
      createdBy: { id: userId } as any,
      updatedBy: { id: userId } as any,
    });
    const saved = await this.documentRepository.save(document);
    await this.ragflowSyncService.syncCreateOrUpdate(saved.id);
    return saved;
  }

  async updateDocument(id: string, updateDto: UpdateDocumentDto, userId: string) {
    const document = await this.findDocument(id);
    const updated = this.documentRepository.merge(document, {
      ...updateDto,
      updatedBy: { id: userId } as any,
    });
    const saved = await this.documentRepository.save(updated);
    await this.ragflowSyncService.syncCreateOrUpdate(saved.id);
    return saved;
  }

  async removeDocument(id: string) {
    const document = await this.findDocument(id);
    await this.documentRepository.remove(document);
    await this.ragflowSyncService.syncDelete(document);
    return { message: 'Document deleted successfully' };
  }
```

```ts
// backend/src/knowledge-base/knowledge-base.module.ts
  providers: [KnowledgeBaseService, TagService, RagflowSyncService],
  exports: [KnowledgeBaseService, TagService, RagflowSyncService],
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/knowledge-base.service.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/knowledge-base.service.ts \
        backend/src/knowledge-base/knowledge-base.service.spec.ts \
        backend/src/knowledge-base/knowledge-base.module.ts
git commit -m "feat: wire ragflow sync into document lifecycle"
```

### Task 4: Add manual retry endpoint (optional, but supports ops)

**Files:**
- Modify: `backend/src/knowledge-base/knowledge-base.controller.ts`

**Step 1: Write the failing test**

```ts
// backend/src/knowledge-base/knowledge-base.controller.spec.ts
it('exposes a retry endpoint', async () => {
  const controller = new KnowledgeBaseController({} as any, {} as any);
  expect(controller.retryRagflowSync).toBeDefined();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- knowledge-base/knowledge-base.controller.spec.ts`  
Expected: FAIL with missing method.

**Step 3: Implement minimal endpoint**

```ts
// backend/src/knowledge-base/knowledge-base.controller.ts
  @Post('ragflow-sync/retry')
  async retryRagflowSync() {
    return this.knowledgeBaseService.retryRagflowSyncJobs();
  }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/knowledge-base.controller.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/knowledge-base.controller.ts \
        backend/src/knowledge-base/knowledge-base.controller.spec.ts
git commit -m "feat: add ragflow sync retry endpoint"
```
