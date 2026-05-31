# Create POST /v1/embeddings

Goal: Implement an endpoint that returns embeddings for a provided text input using `EmbeddingService`.

Request schema
- JSON body: `{ "model"?: string, "input": string }`
- Validation: `model` optional string, `input` required non-empty string

Success response
- `200` `{ "embedding": number[], "model": "<model-used>" }`

Errors
- `400` for invalid payload (missing/empty `input`) — return validation details
- `413` if payload too large (handled by `express.json` size limit)
- `500` for upstream or internal errors

Implementation checklist
1. Validate body with `zod`.
2. Call `EmbeddingService.embed(input, model)`.
3. Return `{ embedding, model: usedModel }`.
4. Expose `embeddingMs` via `res.locals.componentTimings` so the global logger records it.
5. Register the route at `/v1/embeddings`.

Tests
- Integration test using `supertest` that POSTs `{ input: "text" }`.
- Mock `EmbeddingService.embed` to return deterministic vector: `new Array(config.mistralEmbedDimension).fill(0.1)`.
- Assert `200`, `Array.isArray(res.body.embedding) === true`, and `res.body.embedding.length === config.mistralEmbedDimension`.

Notes
- Do not commit real API keys. Use `.env.example` for variable names and keep `.env` ignored.
- Confirm Mistral API response shape before calling production keys.
