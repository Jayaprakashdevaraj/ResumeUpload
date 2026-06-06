# Phase 5 — Search & Chat Experience (Plan)

Goal

- Deliver a fast, accurate, and explainable search experience and a conversational chat interface backed by retrieval-augmented generation (RAG). Improve relevance, provide transparent scoring, and enable a productive chat workflow for recruiters.

High-level approach

- Implement a hybrid retrieval pipeline: fast BM25 (MongoDB text index) + vector search (Milvus/Atlas Vector/FAISS) with tunable hybrid weights and reranking.
- Add a reranker service (cross-encoder or LLM-based) for final ranking and explanations.
- Build a streaming chat API and UI with short-term conversation memory, retrieval augmentation, and safe LLM usage (rate-limits, timeouts, content filters).
- Surface explainability: show score breakdown, matched snippets, and rerank justification.

Core tasks

- Task A — Retrieval & Reranking (backend)
  - Implement `SearchService` that:
    - Accepts a query and filter parameters (skills, location, experience, date ranges).
    - Runs BM25 retrieval (MongoDB text search) and vector retrieval (vector index) in parallel.
    - Merges and scores results using tunable hybrid weight (server-side default, overridable by client).
    - Optionally performs a fast async rerank: return initial results quickly, submit rerank in background and surface updated ordering when available.
  - Add a `RerankService` that can call a cross-encoder model or an LLM-based re-ranking prompt. Include caching and rate limiting.
  - Expose endpoints:
    - `POST /v1/search/query` — hybrid retrieval, returns top-K results + explanation metadata.
    - `POST /v1/search/rerank` — accept results + query, return reranked list with scores and rationales.
    - `GET /v1/search/autocomplete?q=...` — lightweight completion using n-grams or a small suggestions index.

- Task B — Chat API & Server (backend)
  - Add `ChatService` with endpoints:
    - `POST /v1/chat/message` — accept user message + conversation id; returns streamed assistant response (SSE or streaming fetch).
    - `POST /v1/chat/create` — create new conversation (returns id).
    - `GET /v1/chat/:id` — conversation history and metadata.
  - Integrate RAG pipeline for chat turns:
    - For each user message, retrieve top-K documents (hybrid), produce a context window with snippets, call LLM with system prompt + context + user message.
    - Support streaming tokens to the client and incremental partial answers.
  - Add safety: content filter, max token limits, and fallback response when model errors.

- Task C — Frontend: Search UI
  - Components to implement or update:
    - `SearchBar` with suggestions, recent queries, and debounced submit.
    - `SearchFilters` (facets) with counts and multi-select filters.
    - `SearchResults` with `ResultCard` using `ScorePill` and showing explainability details when toggled.
    - `HybridWeightSlider` UI for quick tuning of BM25 vs Vector influence.
    - `RerankButton` or auto-rerank switch.
  - Interactions:
    - Show streaming progress while reranking.
    - Show matched snippets and highlight query terms.
    - Allow saving queries and pinning a candidate.

- Task D — Frontend: Chat UI
  - Components:
    - `ChatPanel`, `MessageList`, `ChatInputBar` (streaming), `ConversationList`.
    - `SourcesPanel` to show retrieved documents used for the current answer with confidence scores and links to source resumes.
  - Behavior:
    - Show streaming tokens from server, allow user to stop generation, and show source citations inline.
    - Add `Regenerate` and `Rerank` actions.

- Task E — Metrics, Tests, and Observability
  - Add metrics for query latency, retrieval accuracy (CTR), rerank latency, chat token usage, and model errors.
  - Add automated tests:
    - Unit tests for `SearchService` scoring and merging logic.
    - Integration tests that run hybrid retrieval against a small seeded dataset to validate expected ordering.
    - E2E smoke tests for search and chat flows.

- Task F — Performance & UX optimizations
  - Implement caching layers (per-query TTL) and result de-duplication.
  - Pagination and cursor-based infinite scroll for large result sets.
  - SSE/WebSocket optimization for live streaming chat and rerank updates.

Files to create / update (recommended)

- Backend
  - `src/services/SearchService.ts` — core hybrid retrieval + merging logic
  - `src/services/RerankService.ts` — reranking logic + LLM wrapper
  - `src/services/ChatService.ts` — chat orchestration + RAG pipeline
  - `src/routes/search.ts` — new search endpoints
  - `src/routes/chat.ts` — chat endpoints (streaming)
  - `src/lib/searchIndex.ts` — vector index client wrapper (milvus/atlas/faiss)
  - Update `src/config/index.ts` with new search/chat settings (default weights, topK)

- Frontend (`recruitbot-web`)
  - `src/features/search/components/SearchBar.tsx`
  - `src/features/search/components/SearchResults.tsx`
  - `src/features/search/hooks/useSearch.tsx` (handles hybrid weights, progress, streaming)
  - `src/features/chat/components/ChatPanel.tsx`, `MessageList.tsx`, `ChatInputBar.tsx`
  - `src/features/search/pages/SearchPage.tsx` (route)
  - `src/features/chat/pages/ChatPage.tsx` (improve existing)
  - Update `src/lib/api` to include new endpoints (`search.api.ts`, `chat.api.ts`)

Validation steps (manual)

1) Backend

```powershell
cd "c:\Gen AI\Resume-AI-RAG"
# start server (dev)
npm run dev:server
```

2) Frontend

```powershell
cd "c:\Gen AI\Resume-AI-RAG\recruitbot-web"
npm run dev
# open http://localhost:5175/search and /chat
```

3) Smoke tests
- Run unit tests: `npm run test` on both backend and frontend (or configured scripts).
- Seed DB with a small set of resumes (use `tmp/resume_staging.json`) and run `POST /v1/search/query` to verify hybrid results.
- Send a chat message to `/v1/chat/message` and confirm streaming tokens + cited sources in response.

Acceptance criteria

- `POST /v1/search/query` returns stable top-K with combined BM25+vector scoring; hybrid weight influences results.
- Reranker improves ranking for at least the seeded test queries (demonstrable in tests).
- Chat endpoint streams tokens and includes cited source snippets with links to resume documents.
- Frontend `SearchPage` and `ChatPage` expose hybrid weight control, rerank action, and source panels.

Estimate & phasing

- Backend retrieval + basic hybrid merge + API endpoints: 1–2 days
- Reranker service + caching + async rerank: 1–2 days
- Chat service + streaming API + RAG integration: 2–3 days
- Frontend components + hooks + UI polish: 1–2 days
- Tests & e2e: 1–2 days

Dependencies & risks

- Vector index choice: depends on infra (Atlas Vector, Milvus, or local FAISS). Provide abstraction in `src/lib/searchIndex.ts` so implementations can be swapped.
- LLM costs and latency: prefer async rerank or partial streaming to keep UI responsive.
- Relevance tuning requires iterative QA and user feedback; include telemetry to drive tuning.

What I'll do next after you approve

- Implement Task A and Task C first: backend `SearchService` and a frontend `SearchPage` + `SearchBar` with `useSearch` hook. Provide PR and validation steps.

Reply with **"Approve Phase 5"** to begin implementation, or tell me which tasks to prioritize (e.g., chat streaming first, or reranker first).