# Resume-AI-RAG — Scaffold

This repository contains a minimal TypeScript + Express scaffold for the Resume-AI-RAG project. It includes:

- Basic Express app and server
- `/v1/health` and `/v1/health/db` endpoints
- MongoDB connection helper
- Request ID + structured JSON logger middleware
- Jest + supertest test for the health endpoint

Getting started

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (see `.env.example`) and set `MONGODB_URI`.

3. Run in development mode

```bash
npm run dev
```

4. Build and run

```bash
npm run build
npm start
```

5. Run tests

```bash
npm test
```

Notes
- The health DB endpoint (`GET /v1/health/db`) will attempt to ping the configured MongoDB instance.
- Secrets should never be committed to source control. Use env vars or secure secrets in CI.
