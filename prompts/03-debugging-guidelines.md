# Debugging Guidelines & Bug Report Template

Purpose
- Provide a reproducible minimal report that enables fast fixes and unit-tested patches.

Bug report template (fill all)
- Title: short summary
- Endpoint / Test: e.g., `POST /v1/search` or `tests/search.service.test.ts`
- Reproduction steps: commands to run (e.g., `npm test -- tests/search.service.test.ts`)
- Input payload (trim to minimal repro)
- Exact error or stack trace (copy full)
- Recent logs (last 20 lines) with `requestId` if available
- Suspected files: list file paths
- Expected result vs actual result

How to create a minimal failing test
1. Isolate the smallest unit that fails (service function).
2. Write a Jest test that sets up only required dependencies; mock external HTTP + DB.
3. Assert one failing expectation that demonstrates the bug.

What to include when asking Copilot to fix
- Paste the failing test file (complete).
- Paste relevant implementation file(s).
- Provide recent logs and error stack.
- Ask: "Produce a failing test reproducer, then the minimal patch to make it pass, and a 1–2 sentence root-cause explanation."

Example failing test header to paste
```ts
// tests/llm.rerank.test.ts
import { LLMService } from '../src/services/LLMService';
test('rerank returns sorted candidates by score', async () => {
  // mock LLM HTTP call
  // assert output order
});
```

PR checklist for fixes
- Added/updated unit tests reproducing issue
- Updated or added minimal implementation/patch
- Linting passes
- Short root-cause description and risk note in PR description
- If the change affects ranking logic, include sample input / output pairs for reviewers

CI notes
- Run `npm run lint` and `npm test` in CI.
- For LLM-dependent integration tests, mock LLM and external APIs; keep integration tests for local runs only unless secrets are provided through secure CI variables.

How to use these guidelines
- When reporting a bug in Copilot Chat, paste this file as context, the failing test, logs, and ask for a failing test first, then the fix.
