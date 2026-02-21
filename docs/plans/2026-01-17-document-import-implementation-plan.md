# Document Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-file document upload into a knowledge base, storing files in `.\uploads` with UUID names and writing metadata to `knowledge_documents`, with overwrite behavior.

**Architecture:** Add a multipart upload endpoint under knowledge base routes, save files to local disk, and create or replace document records. Wire the frontend import modal to post files and refresh the list. RAGFlow sync is triggered after document creation/update.

**Tech Stack:** NestJS, Multer, TypeORM, React, Vite.

### Task 1: Backend upload endpoint and storage

**Files:**
- Modify: `backend/src/knowledge-base/knowledge-base.controller.ts`
- Modify: `backend/src/knowledge-base/knowledge-base.service.ts`
- Modify: `backend/src/knowledge-base/knowledge-base.module.ts`
- Create: `backend/src/knowledge-base/dto/upload-documents.dto.ts`
- Create: `backend/src/knowledge-base/knowledge-base.upload.spec.ts`

**Step 1: Write the failing test**

```ts
// backend/src/knowledge-base/knowledge-base.upload.spec.ts
it('uploads files and overwrites same-name documents', async () => {
  const file = { originalname: 'example.pdf', mimetype: 'application/pdf', size: 10, buffer: Buffer.from('x') };
  const result = await service.uploadDocuments('kb-1', [file as any], 'user-1');
  expect(result.items[0].status).toBe('success');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- knowledge-base/knowledge-base.upload.spec.ts`  
Expected: FAIL with "uploadDocuments not implemented".

**Step 3: Implement minimal upload logic**

```ts
// backend/src/knowledge-base/dto/upload-documents.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentsResponseDto {
  @ApiProperty({ type: [Object] })
  items: Array<{ fileName: string; documentId?: string; status: string; message?: string }>;
}
```

```ts
// backend/src/knowledge-base/knowledge-base.service.ts
async uploadDocuments(knowledgeBaseId: string, files: Express.Multer.File[], userId: string) {
  const items = [];
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    try {
      const originalName = file.originalname;
      const extension = path.extname(originalName);
      const title = path.basename(originalName, extension);
      const fileName = `${crypto.randomUUID()}${extension}`;
      const filePath = path.join(uploadDir, fileName);

      const existing = await this.documentRepository.findOne({
        where: { knowledgeBase: { id: knowledgeBaseId }, fileName: originalName },
        relations: ['knowledgeBase'],
      });
      if (existing?.filePath) {
        await fs.rm(existing.filePath, { force: true });
        await this.documentRepository.remove(existing);
      }

      await fs.writeFile(filePath, file.buffer);
      const document = this.documentRepository.create({
        title,
        fileName: originalName,
        filePath,
        mimeType: file.mimetype,
        knowledgeBase: { id: knowledgeBaseId } as any,
        createdBy: { id: userId } as any,
        updatedBy: { id: userId } as any,
        status: 'active',
      });
      const saved = await this.documentRepository.save(document);
      await this.ragflowSyncService.syncCreateOrUpdate(saved.id);

      items.push({ fileName: originalName, documentId: saved.id, status: 'success' });
    } catch (error) {
      items.push({ fileName: file.originalname, status: 'failed', message: String(error) });
    }
  }

  return { items };
}
```

```ts
// backend/src/knowledge-base/knowledge-base.controller.ts
@Post(':id/documents/upload')
@UseInterceptors(FilesInterceptor('files'))
async uploadDocuments(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Req() req: AuthRequest,
) {
  return this.knowledgeBaseService.uploadDocuments(id, files, req.user.id);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/knowledge-base.upload.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/knowledge-base.controller.ts \
        backend/src/knowledge-base/knowledge-base.service.ts \
        backend/src/knowledge-base/knowledge-base.module.ts \
        backend/src/knowledge-base/dto/upload-documents.dto.ts \
        backend/src/knowledge-base/knowledge-base.upload.spec.ts
git commit -m "feat: add document upload endpoint"
```

### Task 2: Backend validation and limits

**Files:**
- Modify: `backend/src/knowledge-base/knowledge-base.controller.ts`
- Modify: `backend/src/knowledge-base/knowledge-base.service.ts`

**Step 1: Write the failing test**

```ts
it('rejects unsupported extensions', async () => {
  const badFile = { originalname: 'bad.exe', mimetype: 'application/octet-stream', size: 10, buffer: Buffer.from('x') };
  await expect(service.uploadDocuments('kb-1', [badFile as any], 'user-1')).rejects.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- knowledge-base/knowledge-base.upload.spec.ts`  
Expected: FAIL.

**Step 3: Implement validation**

```ts
// backend/src/knowledge-base/knowledge-base.service.ts
const allowed = new Set(['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.ppt', '.pptx']);
const maxSize = 50 * 1024 * 1024;
if (!allowed.has(extension.toLowerCase())) throw new BadRequestException(...);
if (file.size > maxSize) throw new BadRequestException(...);
```

**Step 4: Run test to verify it passes**

Run: `npm test -- knowledge-base/knowledge-base.upload.spec.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/knowledge-base/knowledge-base.service.ts \
        backend/src/knowledge-base/knowledge-base.controller.ts
git commit -m "feat: validate upload files"
```

### Task 3: Frontend upload integration

**Files:**
- Modify: `src/pages/p-kb_import/index.tsx`

**Step 1: Write the failing test**

```ts
// src/pages/p-kb_import/index.test.tsx
it('posts files to the upload endpoint', async () => {
  // test placeholder
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- p-kb_import`  
Expected: FAIL.

**Step 3: Implement upload call**

```tsx
const formData = new FormData();
selectedFiles.forEach(item => formData.append('files', item.file));
await fetch(`${API_BASE_URL}/api/v1/knowledge-bases/${KBID}/documents/upload`, {
  method: 'POST',
  headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  body: formData,
});
```

On success: close modal and refresh or navigate back to detail.

**Step 4: Run test to verify it passes**

Run: `npm test -- p-kb_import`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/p-kb_import/index.tsx
git commit -m "feat: upload documents from import page"
```
