# Phase 4 — Ingestion UX & Reliability (Plan)

Goal

- Improve resume ingestion UX and make the ingestion pipeline reliable, observable, and fault tolerant. Reduce failed uploads, provide clear feedback to users, and make background parsing resilient.

Why this phase

- Ingestion is the first user touchpoint; poor UX or brittle parsing causes lost data and support tickets.
- Make ingestion scalable and safe: support partial failures, retries, idempotency, and clear error messaging.

High-level approach

1. Improve frontend upload UX: drag-and-drop, progress/percent, resumable/chunked uploads, validation, previews, dedup detection, clear error and retry actions.
2. Move heavy parsing and indexing to background jobs (queue + worker) so uploads return quickly and processing can be retried and monitored.
3. Harden backend ingestion: validate files, sanitize text, robust parser fallbacks (LLM parser vs algorithmic parser), timeouts, circuit-breakers, and idempotency keys.
4. Add observability: ingestion metrics (success/fail/latency), tracing for pipeline steps, alerts for error rates.
5. Add tests and e2e flows to ensure reliability under common failure scenarios.

Tasks (detailed)

- Task A — Frontend UX improvements
  - Add `UploadWidget` component with drag-and-drop, file list, per-file progress, and thumbnail/preview for parsed resumes.
  - Implement `useUpload` hook to handle uploads, progress, cancellation, and retries.
  - Support resumable uploads (chunked) using a lightweight approach: simple chunking + server assembly, or integrate `tus-js-client` if acceptable.
  - Add client-side validation: file type, max size, basic content checks; show clear error messages and recover actions.
  - Provide optimistic UI: accept upload, show "Processing" state, and allow the user to continue; show notifications when processing completes or fails.
  - Files to add/update:
    - `recruitbot-web/src/features/ingestion/components/UploadWidget.tsx`
    - `recruitbot-web/src/features/ingestion/hooks/useUpload.ts`
    - Update `recruitbot-web/src/features/ingestion/pages/IngestionPage.tsx` to use new widget.

- Task B — Backend: job queue and worker
  - Introduce a job queue (recommended: BullMQ with Redis). Option: lightweight in-process queue for small scale.
  - Modify API to accept uploads and enqueue a processing job (return a job id). Keep the upload controller lightweight.
  - Create worker process that dequeues jobs and runs parsing, embeddings, indexing, and any downstream steps. Worker responsibilities:
    - Run parsing with timeouts and fallbacks (algorithmic parser → LLM parser)
    - Create embeddings via `EmbeddingService` and persist to index
    - Update ingestion status (DB) and emit events/notifications
  - Files to add/update:
    - `src/controllers/ingestionController.ts` (enqueue job)
    - `src/jobs/ingestionWorker.ts` (new worker)
    - `src/services/ResumeingestionService.ts` (split into enqueue + worker-run logic)
    - Add Redis config: `config/redis.ts` or in `config/index.ts`
  - Dev-mode: provide an in-process worker toggle for local development to avoid needing Redis immediately.

- Task C — Parser resilience and idempotency
  - Ensure each upload has an idempotency key (client-supplied or generated) to avoid duplicates.
  - Parser chain: attempt fast deterministic parser, if it fails or low-confidence, fallback to LLM parser with retries and rate-limiting.
  - Store parser diagnostics (errors, confidence, warnings) alongside the ingested resume for later debugging.
  - Files to update:
    - `src/services/ResumeParserService.ts` — add diagnostics and retries.
    - `src/services/LLMResumeParser.ts` and `AlgorithmResumeParser.ts` — add timeouts and safe failure modes.

- Task D — Observability & monitoring
  - Instrument server to emit metrics: ingestion.start, ingestion.success, ingestion.fail, parse.time, queue.wait, job.retries.
  - Add tracing (OpenTelemetry) hooks for pipeline steps (upload → enqueue → parse → embed → index).
  - Add a small dashboard (Grafana/Prometheus) or log-based alerts (e.g., DataDog, if available). For local development, log metrics to console or a local file.
  - Files/config:
    - `src/lib/metrics.ts` (abstract metrics client)
    - Integrate OpenTelemetry initialization in `app.ts`/`server.ts` (config guarded by env var)

- Task E — Testing & E2E
  - Add unit tests for `useUpload` and the upload flow using Vitest + Testing Library + MSW (mock server).
  - Add integration tests for enqueueing and worker processing (run worker in-process in test environment or use test Redis instance).
  - Add end-to-end smoke test: upload a sample resume, poll job status, assert parsed record exists in DB/index.

- Task F — UX refinements & access control
  - Add progress notifications and retry CTA in the UI.
  - Add server-side rate limiting and quotas per user to avoid abuse.
  - Provide admin tooling: re-run failed ingestions, view diagnostics, and re-index entries.

Validation steps (manual)

1. Frontend dev server

```powershell
cd "c:\Gen AI\Resume-AI-RAG\recruitbot-web"
npm install
npm run dev
```

2. Backend (local)

- Start backend in dev mode (example):

```powershell
cd "c:\Gen AI\Resume-AI-RAG"
# If backend has a script to start server, run it (example)
npm run dev:server
```

- For queue-backed processing, start Redis locally (or use Docker):

```powershell
docker run -p 6379:6379 --name resume-redis -d redis:7
```

- Start worker (if separate):

```powershell
node dist/jobs/ingestionWorker.js
# or a dev script: npm run worker
```

3. Test a sample upload
- Use the UI `UploadWidget` to upload a sample resume. Expect immediate upload progress, then a "Processing" state.
- Confirm a job id is returned and visible in the UI (or via API).
- After processing, confirm the candidate record exists in DB and index and the UI displays processed status.

4. Failure scenarios to test
- Parser failure fallback (simulate algorithmic parser failure and ensure LLM parser is invoked).
- Worker restart mid-processing (ensure job is retried or re-queued).
- Duplicate upload (same idempotency key) doesn't create duplicate entries.
- Network interruption during upload (resumable chunk test).

Acceptance criteria

- Users see an upload widget with drag/drop, progress, and clear errors.
- Backend processes uploads via a queue worker; processing is retryable and observable.
- Parser chain logs diagnostics; failed ingestions can be retried from admin UI or CLI.
- Tests exist for upload flow and worker processing, and e2e smoke passes locally.

Dependencies & risks

- Queue introduces Redis (or other queue) dependency. Provide in-process fallback for local dev to reduce friction.
- LLM parsing increases cost and latency; ensure fallbacks and rate-limits.
- Resumable uploads require extra server assembly logic — pick a simple chunking approach if `tus` integration is too heavy.

Files to create (implementation candidates)

- Frontend
  - `recruitbot-web/src/features/ingestion/components/UploadWidget.tsx`
  - `recruitbot-web/src/features/ingestion/hooks/useUpload.ts`
  - small components: `recruitbot-web/src/ui/primitives/ProgressBar.tsx` (optional)

- Backend
  - `src/jobs/ingestionWorker.ts`
  - `src/controllers/ingestionController.ts` (update to enqueue)
  - `src/services/ResumeingestionService.ts` (split logic)
  - `src/lib/queue.ts` (queue client wrapper)
  - `src/lib/metrics.ts` (metrics wrapper)

- Tests
  - `tests/ingestion.upload.test.ts` (e2e-ish with MSW)
  - `tests/ingestion.worker.test.ts`

Estimated effort

- Frontend widget + hook + basic validation: 0.5–1 day
- Queue + worker + integration with existing services: 1–2 days
- Parser resilience, diagnostics, observability: 1 day
- Tests + e2e smoke: 0.5–1 day

What I'll do next after your approval

- Implement Task A and Task B first: build `UploadWidget`, `useUpload`, add backend enqueue endpoint and a simple in-process worker for local dev. Provide PR with changes and run validation steps.

Reply with **"Approve Phase 4"** to begin implementation, or ask for adjustments to the plan.
