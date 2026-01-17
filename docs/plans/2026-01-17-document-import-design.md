# Document Import Design

## Context
- Knowledge base documents are stored in PostgreSQL.
- Each document has a filesystem `filePath`.
- RAGFlow performs parsing/chunking, so the backend only stores metadata.
- Files should be saved under `.\uploads` with UUID filenames.

## Goals
- Upload multiple files into a knowledge base.
- Save files locally and persist metadata in `knowledge_documents`.
- Support overwrite: same KB + original filename replaces the old document.
- Trigger RAGFlow sync for created/updated documents.

## Non-Goals
- Parsing document content into the `content` column.
- External object storage integration.

## Architecture
- Backend adds `POST /api/v1/knowledge-bases/:id/documents/upload`.
- Uses NestJS multipart handling to accept multiple files.
- Stores files in `.\uploads`, preserving extension but naming by UUID.
- Creates or replaces `knowledge_documents` records with metadata.
- On overwrite, delete the old file and the old record.
- On errors, clean up any newly saved file to avoid orphans.

## Data Flow
1. Frontend selects files and sends `multipart/form-data` (field `files`).
2. Backend validates extension and size.
3. Backend creates upload folder if missing.
4. For each file:
   - Compute title from filename (without extension).
   - Check existing doc by `knowledge_base_id` + `file_name`.
   - If exists: delete old file and remove record.
   - Save new file with UUID name; write DB row.
   - Trigger RAGFlow sync (async).
5. Return results per file with success/failed reasons.

## Validation Rules
- Allowed extensions: pdf, doc, docx, txt, md, xlsx, ppt, pptx.
- Max file size: 50 MB.

## Error Handling
- Validation errors return 400 with file-level reasons.
- File system failures return 500; clean up partial saves.
- RAGFlow sync failures enqueue retry (no upload failure).

## Frontend Behavior
- Upload page submits files to the backend endpoint.
- Shows progress (simple status) and per-file errors.
- On success, redirects to knowledge base detail and refreshes list.

## Testing
- Unit tests for overwrite logic and validation.
- Integration test: upload file -> stored in `uploads` -> visible in KB detail list.
