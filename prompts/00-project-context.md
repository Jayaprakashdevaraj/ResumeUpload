# Resume-AI-RAG — Project Context (Concise)

Purpose
- Enterprise-grade RAG-based resume search API prioritizing quality over raw speed.
- Monolithic Node.js + Express TypeScript service; MongoDB Atlas for storage + BM25 + Vector Search; Mistral for embeddings; groq LLM for re-ranking/summarization.

High-level architecture (short)
- API Layer: Express routes under `/v1/*`
- Services: `SearchService`, `EmbeddingService`, `LLMService`
- Repo: `ResumeRepository` (MongoDB)
- Middleware: requestId, structured JSON logger, request size limiter
- Types: central `src/types/*`

Key tech
- Node 18+, TypeScript, Express
- MongoDB Atlas (BM25 via Atlas Search, Vector Search via Atlas vector index)
- Embeddings: Mistral (`mistral-embed`, 1024 dims) — configurable via env
- LLM: groq LLM (`meta-llama/llama-4-scout-17b-16e-instruct`) — configurable via env
- Validation: `zod` recommended
- HTTP client: `undici` or `axios` for external API calls
- Tests: Jest + ts-jest, supertest for route tests

Data model (example document)
{
  "_id": "691db80aa895776f97b6eca6",
  "text": "ASHWIN P is an experienced Automation QA Engineer ...",
  "embedding": [ /* number[] */ ],
  "name": "ASHWIN P",
  "email": "ashwinp@gmail.com",
  "location": "Chennai, India",
  "company": "Tcs",
  "role": "QA Engineer",
  "education": "B.E COMPUTER SCIENCE ENGINEERING",
  "total_Experience": 1.3,
  "relevant_Experience": 1.3,
  "skills": ["Selenium WebDriver","TestNG","Cucumber","Maven","Jenkins","Java","SQL","Postman","Git","GitHub","JIRA","Agile"]
}

Key endpoints (summary)
- GET /v1/health
- GET /v1/health/db
- POST /v1/embeddings
- POST /v1/search/bm25
- POST /v1/search/vector
- POST /v1/search/hybrid
- POST /v1/search/rerank
- POST /v1/search/summarize
- POST /v1/search  (end-to-end pipeline)

Search flow (short)
- On `/v1/search`: validate → generate query embedding (on-demand) → BM25 → vector → dedupe/merge → LLM rerank (top N, default 8–10) → optional summarize → return.

Operational constraints & defaults
- P95 latency target: ~3–5s (low traffic)
- Default rerank topK: 8-10 (configurable via env)
- Request payload size limit: default 100 KB (configurable)
- Structured JSON logging: include `requestId`, timings (embeddingMs, bm25Ms, vectorMs, rerankMs, summarizeMs)
- Fallback order: re-rank failure → BM25 priority → vector; vector failure → BM25 only; BM25 failure → vector only.

Env variables (example)
NODE_ENV=development
PORT=3000
MONGODB_URI=...
MISTRAL_API_KEY=...
MISTRAL_EMBED_MODEL=mistral-embed
GROQ_API_KEY=...
GROQ_LLM_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
LOG_LEVEL=info
REQUEST_SIZE_LIMIT=100kb
TOPK_RERANK=10

Security & compliance notes
- Never commit API keys or .env to source.
- Enforce input validation and request-size limits.
- Rate-limit sensitive endpoints.
- Audit logs for re-ranking decisions for traceability.

How to use this file
- Paste as the "project context" into Copilot Chat or include it as workspace `prompts/00-project-context.md`.
- Use with `prompts/01-system-instructions.md` as the system message for deterministic code generation.
