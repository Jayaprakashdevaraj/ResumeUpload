# Task Templates — copy into Copilot Chat as the user message (fill placeholders)

Template 1 — Scaffold TypeScript Express project
-----------------------------------------------
Goal: produce a minimal, enterprise-ready scaffold.

User prompt:
"Create a TypeScript Node/Express scaffold for Resume-AI-RAG with:
- `package.json` (scripts `dev`, `build`, `start`, `test`)
- `tsconfig.json`
- `src/app.ts`, `src/server.ts`
- `src/routes/health.ts`
- `src/config/index.ts` (env typed)
- `src/middleware/requestId.ts`, `src/middleware/logger.ts`
- `src/types/index.ts`
- Jest config + initial test for GET /v1/health
- README with run/test instructions
Constraints: Use `zod` for request validation, `undici` or `axios` for HTTP clients. Return each file as `FILE: <path>` with full content."

Acceptance tests:
- `npm test` should run the sample health test.
- `npm run dev` starts server on configured PORT.

Template 2 — EmbeddingService
-----------------------------
Goal: implement `src/services/EmbeddingService.ts`.

User prompt:
"Implement `EmbeddingService`:
- class EmbeddingService { constructor(opts?:{apiKeyEnv?:string, defaultModel?:string}); async embed(text:string, model?:string): Promise<number[]> }
- Use env `MISTRAL_API_KEY` and default `mistral-embed`.
- HTTP POST to Mistral embed endpoint; make request injectable/mocked.
- Validate `text` (non-empty, max length).
- Throw typed errors.
- Include unit tests that mock external call and verify vector length and model used.
Return `FILE:` blocks for service, types, and tests."

Template 3 — LLMService.rerankCandidates
---------------------------------------
Goal: implement `LLMService.rerankCandidates(query, candidates, topK)`.

User prompt:
"Implement `LLMService` with method `rerankCandidates`:
- Input: `query: string`, `candidates: Candidate[]`, `topK?: number`
- Candidate: { resumeId: string, snippet: string, metadata?: Record<string,any> }
- Output: Promise<RerankResult[]> where each result = { resumeId, score (0..1), rationale }
- Call groq LLM using `GROQ_API_KEY`/`GROQ_LLM_MODEL`.
- Build deterministic prompt: system: JSON-only, temperature=0, include rerank JSON Schema (provided).
- Provide unit tests mocking LLM HTTP response and asserting parsing/ordering.
Return code + tests as `FILE:` blocks."

Template 4 — Route implementation (POST /v1/embeddings)
------------------------------------------------------
Goal: implement the route handler and test.

User prompt:
"Implement POST /v1/embeddings route:
- Validate body { model?: string, input: string } with `zod`
- Enforce max input length from config
- Call `EmbeddingService.embed`
- Return { embedding: number[], model: string }
- Include supertest integration test for route with mocked EmbeddingService
Return full files as `FILE:` blocks."

Template 5 — End-to-end SearchService (outline)
-----------------------------------------------
Goal: implement `SearchService.endToEndSearch(query, filters, options)`.

User prompt:
"Implement `SearchService` with:
- bm25Search(query, filters, topK)
- vectorSearch(query, filters, topK) (uses EmbeddingService)
- hybridSearch parallel BM25+vector
- endToEndSearch orchestrating embed→bm25→vector→merge→dedupe→LLM.rerankCandidates(topN)→optional summarize
- Fallbacks: if rerank fails use BM25-priority ordering; if vector/bm25 fails mark fallback flags in response
Include unit tests mocking repository and LLM calls. Return `FILE:` blocks."

Helper templates
- Ask for "failing test first, then minimal patch" when debugging.
- For complex LLM prompts, include an example candidate list trimmed to token limits and explicit "Return only JSON matching schema".

Quick usage note
- Paste the appropriate template here after loading `prompts/00-project-context.md` and `prompts/01-system-instructions.md` into Copilot Chat. Ask the assistant to return files using `FILE:` headers and include tests.
