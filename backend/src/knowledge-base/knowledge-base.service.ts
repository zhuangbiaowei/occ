import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { RagflowSyncService } from './ragflow-sync.service';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private knowledgeBaseRepository: Repository<KnowledgeBase>,
    @InjectRepository(KnowledgeDocument)
    private documentRepository: Repository<KnowledgeDocument>,
    private readonly ragflowSyncService: RagflowSyncService,
  ) {}

  async create(createDto: CreateKnowledgeBaseDto, userId: string) {
    const knowledgeBase = this.knowledgeBaseRepository.create({
      ...createDto,
      status: createDto.type || 'internal',
      createdBy: { id: userId } as any,
    });
    return this.knowledgeBaseRepository.save(knowledgeBase);
  }

  async findAll(query?: { keyword?: string; type?: string }, page: number = 1, pageSize: number = 10) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const baseQb = this.knowledgeBaseRepository
      .createQueryBuilder('kb')
      .leftJoinAndSelect('kb.createdBy', 'createdBy');

    if (query?.keyword) {
      baseQb.andWhere('kb.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }
    if (query?.type) {
      baseQb.andWhere('kb.status = :status', { status: query.type });
    }

    const total = await baseQb.getCount();
    const dataQb = baseQb
      .clone()
      .addSelect((subQb) =>
        subQb
          .select('COUNT(1)', 'cnt')
          .from(KnowledgeDocument, 'doc')
          .where('doc.knowledge_base_id = kb.kb_id'),
      'document_count')
      .addSelect((subQb) =>
        subQb
          .select('COUNT(1)', 'cnt')
          .from(KnowledgeDocument, 'doc')
          .where('doc.knowledge_base_id = kb.kb_id')
          .andWhere('doc.created_at >= :startOfMonth'),
      'document_new_this_month')
      .setParameter('startOfMonth', startOfMonth)
      .orderBy('kb.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const { entities, raw } = await dataQb.getRawAndEntities();
    const items = entities.map((kb, index) => ({
      ...kb,
      documentCount: Number(raw[index]?.document_count ?? 0),
      documentNewThisMonth: Number(raw[index]?.document_new_this_month ?? 0),
    }));

    const totalDocument = await this.documentRepository.count();
    const newDocumentsThisMonth = await this.documentRepository.count({
      where: { createdAt: MoreThanOrEqual(startOfMonth) },
    });

    return {
      items,
      total,
      totalKnowledge: total,
      totalDocument,
      newDocumentsThisMonth,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge base not found');
    }

    return knowledgeBase;
  }

  async update(id: string, updateDto: UpdateKnowledgeBaseDto, userId: string) {
    const knowledgeBase = await this.findOne(id);

    const updated = this.knowledgeBaseRepository.merge(knowledgeBase, {
      ...updateDto,
    });

    return this.knowledgeBaseRepository.save(updated);
  }

  async remove(id: string) {
    const knowledgeBase = await this.findOne(id);
    await this.knowledgeBaseRepository.remove(knowledgeBase);
    return { message: 'Knowledge base deleted successfully' };
  }

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

  async uploadDocuments(knowledgeBaseId: string, files: Express.Multer.File[], userId: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const allowed = new Set(['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.ppt', '.pptx']);
    const maxSize = 50 * 1024 * 1024;
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const knowledgeBase = await this.findOne(knowledgeBaseId);
    const items: Array<{ fileName: string; documentId?: string; status: string; message?: string }> = [];
    const hasCjk = (value: string) => /[\u4e00-\u9fff]/.test(value);
    const decodeFileName = (value: string) => {
      const decoded = Buffer.from(value, 'latin1').toString('utf8');
      return !hasCjk(value) && hasCjk(decoded) ? decoded : value;
    };

    for (const file of files) {
      const originalName = decodeFileName(file.originalname);
      const extension = path.extname(originalName).toLowerCase();
      if (!allowed.has(extension)) {
        items.push({ fileName: originalName, status: 'failed', message: 'Unsupported file type' });
        continue;
      }
      if (file.size > maxSize) {
        items.push({ fileName: originalName, status: 'failed', message: 'File too large' });
        continue;
      }

      try {
        const existing = await this.documentRepository.findOne({
          where: { knowledgeBase: { id: knowledgeBaseId }, fileName: originalName },
          relations: ['knowledgeBase'],
        });
        if (existing?.filePath) {
          await fs.rm(existing.filePath, { force: true });
          await this.documentRepository.remove(existing);
        }

        const uuidName = `${crypto.randomUUID()}${extension}`;
        const filePath = path.join(uploadDir, uuidName);
        await fs.writeFile(filePath, file.buffer);

        const title = path.basename(originalName, extension);
        const document = this.documentRepository.create({
          title,
          fileName: originalName,
          filePath,
          mimeType: file.mimetype,
          knowledgeBase,
          createdBy: { id: userId } as any,
          updatedBy: { id: userId } as any,
          status: 'active',
        });
        const saved = await this.documentRepository.save(document);
        await this.ragflowSyncService.syncCreateOrUpdate(saved.id);

        items.push({ fileName: originalName, documentId: saved.id, status: 'success' });
      } catch (error) {
        items.push({ fileName: originalName, status: 'failed', message: String(error) });
      }
    }

    return { items };
  }

  async findDocuments(query: any = {}, page: number = 1, pageSize: number = 10) {
    const where: any = {};

    if (query.keyword) {
      where.title = Like(`%${query.keyword}%`);
    }
    if (query.knowledgeBaseId) {
      where.knowledgeBase = { id: query.knowledgeBaseId };
    }
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await this.documentRepository.findAndCount({
      where,
      relations: ['knowledgeBase', 'createdBy', 'updatedBy', 'tags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findDocument(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['knowledgeBase', 'createdBy', 'updatedBy', 'tags', 'versions'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
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

  async incrementReadCount(id: string) {
    const document = await this.findDocument(id);
    document.readCount = (document.readCount || 0) + 1;
    return this.documentRepository.save(document);
  }
}
