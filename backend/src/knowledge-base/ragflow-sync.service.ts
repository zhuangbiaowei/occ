import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import {
  RagflowSyncJob,
  RagflowSyncOp,
  RagflowSyncStatus,
} from './entities/ragflow-sync-job.entity';
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

    const data = (await response.json()) as { id?: string; data?: { id?: string } };
    const datasetId = data.data?.id ?? data.id;
    if (!datasetId) {
      throw new InternalServerErrorException('RAGFlow dataset create missing id');
    }
    return datasetId;
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

  async syncCreateOrUpdate(documentId: string) {
    try {
      await this.executeCreateOrUpdate(documentId);
    } catch (error) {
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['knowledgeBase'],
      });
      if (!document) {
        return;
      }
      await this.enqueueJob(document, 'update', this.formatError(error), documentId);
    }
  }

  async syncDelete(document: KnowledgeDocument) {
    if (!document.knowledgeBase?.ragflowDatasetId) {
      return;
    }

    try {
      const datasetId = document.knowledgeBase.ragflowDatasetId;
      let targetId: string | undefined = document.ragflowDocumentId;
      if (!targetId) {
        targetId = await this.resolveRagflowDocumentId(datasetId, document);
        if (targetId) {
          document.ragflowDocumentId = targetId;
        }
      }
      await this.executeDelete(datasetId, targetId || document.id);
    } catch (error) {
      await this.enqueueJob(
        document,
        'delete',
        this.formatError(error),
        document.ragflowDocumentId || document.id,
      );
    }
  }

  async processJob(job: RagflowSyncJob) {
    try {
      if (job.operation === 'delete') {
        const kb = await this.knowledgeBaseRepository.findOne({
          where: { id: job.knowledgeBaseId },
        });
        if (!kb?.ragflowDatasetId) {
          await this.completeJob(job, 'Missing dataset id');
          return;
        }
        await this.executeDelete(kb.ragflowDatasetId, job.documentId);
        await this.completeJob(job);
        return;
      }

      const document = await this.documentRepository.findOne({
        where: { id: job.documentId },
        relations: ['knowledgeBase'],
      });

      if (!document || !document.knowledgeBase) {
        await this.completeJob(job, 'Document missing');
        return;
      }

      const kb = await this.ensureDatasetForKb(document.knowledgeBase);
      if (!kb.ragflowDatasetId) {
        await this.completeJob(job, 'Missing dataset id');
        return;
      }

      await this.executeDelete(kb.ragflowDatasetId, document.id);
      await this.uploadFile(kb.ragflowDatasetId, document);
      await this.completeJob(job);
    } catch (error) {
      await this.scheduleRetry(job, this.formatError(error));
    }
  }

  async retryJobs(options: {
    status?: RagflowSyncStatus;
    limit?: number;
    knowledgeBaseId?: string;
    documentId?: string;
  }) {
    const status = options.status || 'failed';
    const take = options.limit && options.limit > 0 ? options.limit : 20;
    const where: Record<string, unknown> = { status };

    if (options.knowledgeBaseId) {
      where.knowledgeBaseId = options.knowledgeBaseId;
    }
    if (options.documentId) {
      where.documentId = options.documentId;
    }

    const jobs = await this.syncJobRepository.find({
      where,
      order: { updatedAt: 'ASC' },
      take,
    });

    for (const job of jobs) {
      await this.processJob(job);
    }

    return { retried: jobs.length };
  }

  async enqueueJob(
    document: KnowledgeDocument,
    operation: RagflowSyncOp,
    error?: string,
    documentIdOverride?: string,
  ) {
    const jobDocumentId =
      documentIdOverride ||
      (operation === 'delete' ? document.ragflowDocumentId || document.id : document.id);
    if (!jobDocumentId) {
      throw new InternalServerErrorException('Missing document id for sync job');
    }
    const job = this.syncJobRepository.create({
      documentId: jobDocumentId,
      knowledgeBaseId: document.knowledgeBase?.id || '',
      operation,
      status: 'pending',
      lastError: error,
    });
    return this.syncJobRepository.save(job);
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

    const response = await fetch(`${this.baseUrl}/api/v1/datasets/${datasetId}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(`RAGFlow upload failed: ${text}`);
    }

    const raw = await response.text();
    const payload = raw ? (JSON.parse(raw) as any) : null;
    const documentIds = this.extractDocumentIds(payload, document.id);
    if (documentIds.length > 0 && documentIds[0] !== document.ragflowDocumentId) {
      await this.documentRepository.update(document.id, {
        ragflowDocumentId: documentIds[0],
      });
    }
    await this.parseDocuments(datasetId, documentIds);
  }

  async deleteFile(datasetId: string, externalId: string) {
    await this.executeDelete(datasetId, externalId);
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private async executeCreateOrUpdate(documentId: string) {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['knowledgeBase'],
    });

    if (!document || !document.knowledgeBase) {
      throw new InternalServerErrorException('Document not found for sync');
    }

    const kb = await this.ensureDatasetForKb(document.knowledgeBase);
    if (kb.ragflowDatasetId) {
      await this.executeDelete(kb.ragflowDatasetId, document.id);
      await this.uploadFile(kb.ragflowDatasetId, document);
    }
  }

  private async executeDelete(datasetId: string, externalId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/datasets/${datasetId}/documents`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [externalId] }),
      },
    );

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as { code?: number; message?: string }) : null;
    const message = payload?.message || text;
    const notFound = typeof message === 'string' && message.toLowerCase().includes('not found');
    if ((!response.ok || (payload && payload.code !== 0)) && !notFound) {
      throw new InternalServerErrorException(`RAGFlow delete failed: ${message}`);
    }
  }

  private async resolveRagflowDocumentId(
    datasetId: string,
    document: KnowledgeDocument,
  ): Promise<string | undefined> {
    if (!document.fileName) {
      return undefined;
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/datasets/${datasetId}/documents`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(`RAGFlow list documents failed: ${text}`);
    }

    const payload = (await response.json()) as {
      data?: { docs?: Array<{ id?: string; name?: string; location?: string }> };
    };
    const docs = payload.data?.docs || [];
    const match = docs.find(
      (item) => item?.name === document.fileName || item?.location === document.fileName,
    );
    return match?.id;
  }

  private extractDocumentIds(payload: any, fallbackId: string): string[] {
    const candidates: Array<string | undefined> = [
      payload?.data?.id,
      payload?.id,
    ];

    if (Array.isArray(payload?.data)) {
      for (const item of payload.data) {
        if (item?.id) {
          candidates.push(item.id);
        }
      }
    }

    if (Array.isArray(payload?.data?.ids)) {
      candidates.push(...payload.data.ids);
    }

    const ids = candidates.filter((id): id is string => typeof id === 'string' && id.length > 0);
    return ids.length > 0 ? ids : [fallbackId];
  }

  private async parseDocuments(datasetId: string, documentIds: string[]) {
    const response = await fetch(`${this.baseUrl}/api/v1/datasets/${datasetId}/chunks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ document_ids: documentIds }),
    });

    const raw = await response.text();
    const payload = raw ? (JSON.parse(raw) as any) : null;
    if (!response.ok || (payload && payload.code !== 0)) {
      const message = raw || 'RAGFlow parse failed';
      throw new InternalServerErrorException(`RAGFlow parse failed: ${message}`);
    }
  }

  private async completeJob(job: RagflowSyncJob, note?: string) {
    const updated = this.syncJobRepository.merge(job, {
      status: 'completed',
      lastError: note,
      nextRetryAt: null,
    });
    await this.syncJobRepository.save(updated);
  }

  private async scheduleRetry(job: RagflowSyncJob, error: string) {
    const maxRetries = this.config.get<number>('RAGFLOW_SYNC_MAX_RETRIES', 5);
    const baseDelay = this.config.get<number>('RAGFLOW_SYNC_RETRY_BASE_SEC', 60);
    const retryCount = job.retryCount + 1;
    const nextRetryAt =
      retryCount > maxRetries
        ? null
        : new Date(Date.now() + baseDelay * Math.pow(2, retryCount - 1) * 1000);

    const updated = this.syncJobRepository.merge(job, {
      status: retryCount > maxRetries ? 'failed' : 'pending',
      retryCount,
      lastError: error,
      nextRetryAt,
    });

    await this.syncJobRepository.save(updated);
  }
}
