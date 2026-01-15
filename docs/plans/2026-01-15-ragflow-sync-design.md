# RAGFlow Sync Design

## Context
- The system manages knowledge bases and documents in the backend.
- Each document has a `filePath` on the backend host.
- RAGFlow runs at `RAGFLOW_BASE_URL` and should own parsing/chunking/indexing.
- Each knowledge base maps to one RAGFlow dataset.

## Goals
- Sync document create/update/delete events to RAGFlow.
- Auto-create dataset on first use and persist the mapping.
- Keep the main document workflow reliable; failures should be retried.

## Non-Goals
- Replacing the document store or moving files into RAGFlow.
- Building a full async queue (can be added later).

## Architecture
- Add `RagflowSyncService` in the backend as the single integration point.
- Store dataset mapping in the knowledge base table (new column
  `ragflow_dataset_id`) or a dedicated `ragflow_datasets` table.
- All document lifecycle actions call `RagflowSyncService`.

## RAGFlow API Abstractions
- `createDataset(kb)` -> dataset id
- `listDatasets()` -> used for idempotency if needed
- `uploadFile(datasetId, filePath, externalId, metadata)` -> multipart upload
- `deleteFile(datasetId, externalId)` -> remove by external id
- `listFiles(datasetId)` -> optional for existence checks

`externalId` is the local `document.id`. `metadata` should include
`knowledgeBaseId`, `title`, `fileName`, `updatedAt`.

## Sync Flow
1. On document create/update/delete, enqueue a sync job (or attempt direct sync).
2. Ensure dataset exists:
   - If `ragflow_dataset_id` missing, call `createDataset` and persist.
3. Create/Update:
   - Prefer delete-by-`externalId` then upload (idempotent).
   - Upload from `filePath`; reject if file missing/unreadable.
4. Delete:
   - Call delete by `externalId` (no-op if already absent).

## Error Handling & Retry
- On failure, create/update a `ragflow_sync_jobs` record:
  `document_id`, `op`, `retry_count`, `last_error`, `next_retry_at`.
- A periodic worker (cron) retries jobs with backoff.
- If auth fails (401/403), mark as configuration error and stop retries.

## Configuration & Security
- Env vars:
  - `RAGFLOW_BASE_URL`
  - `RAGFLOW_API_KEY`
- API key stored server-side only; never sent to clients.
- Log only the last 4 chars of the key if needed.

## Observability
- Log sync attempts with `document_id`, `op`, `dataset_id`, and duration.
- Track failure counts and last error per document (optional columns).

## Testing
- Unit tests for mapping creation and API call paths (mock HTTP).
- Integration test against a staging RAGFlow instance.
- Regression test for delete flow and idempotent re-upload.
