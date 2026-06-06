# Frontend upgrade plan

A phased, industry-standard plan to upgrade RecruitBot's frontend UI. Each phase includes goals, actions, and deliverables to incrementally improve design, accessibility, performance, and developer experience.

---

## Overview

This plan is organized into 15 practical phases from core infrastructure to post-launch iteration. Implement in small, testable increments; prioritize quick wins (listed at the end).

---

## Phase 1 — Core Infrastructure & DX

- Goal: Reproducible, consistent developer environment and CI.
- Actions:
  - Pin Node version (`.nvmrc`) and add `.env.example`.
  - Add ESLint + Prettier, Husky + lint-staged pre-commit hooks.
  - Add CI pipeline skeleton (run tests/build/lint).
- Deliverable: Clean `npm install` → `npm run dev` experience and pre-commit checks.

---

## Phase 2 — Design System & Theming

- Goal: Single source of truth for tokens, spacing, and typography.
- Actions:
  - Extract design tokens into `tailwind.config.js` and CSS variables.
  - Create `src/ui/primitives` for Buttons, Inputs, Cards, etc.
  - Publish a minimal style guide (README or Storybook showcase).
- Deliverable: Theme module and token documentation.

---

## Phase 3 — Component Architecture

- Goal: Component-driven, testable, composable UI.
- Actions:
  - Adopt an atomic folder structure: `primitives/`, `components/`, `features/`.
  - Add Storybook and author stories for core components.
  - Ensure all components are strongly typed with PropTypes/TS types.
- Deliverable: Storybook with core primitives and example pages.

---

## Phase 4 — Ingestion UX & Reliability

- Goal: Robust, transparent resume ingestion flow with clear feedback.
- Actions:
  - Client-side validation (React Hook Form + Zod) for uploads.
  - Add chunked uploads or graceful aborts (AbortController) for large files.
  - Surface server processing progress (SSE / WebSocket or polling) for long-running steps.
  - Show parsed preview and allow user confirmation before final ingestion.
- Deliverable: Reliable upload flow with progress, retry/backoff, and parsed preview.

---

## Phase 5 — Search & Chat Experience

- Goal: Fast, predictable search and conversational UX.
- Actions:
  - Debounce input + cancel previous request (AbortController).
  - Stream or progressively display results when backend supports it.
  - Keyboard UX: Enter submits, Shift+Enter newline, accessible shortcuts.
  - Provide clear loading skeletons and progressive enhancement.
- Deliverable: Responsive chat input and streaming/progressive results UI.

---

## Phase 6 — Results UI & Explainability

- Goal: Make ranking and relevance understandable to users.
- Actions:
  - Color-coded `ScorePill` per mode and human-friendly labels.
  - Show explanation snippets (“matched terms”, contribution of BM25/vector).
  - Add filters/facets and sorting; highlight matched keywords in snippets.
- Deliverable: Result cards with explainable scoring and filters.

---

## Phase 7 — Candidate Profile & Accessibility

- Goal: Fully accessible, keyboard-first candidate modal.
- Actions:
  - Add focus-trap, role=`dialog`, `aria-modal`, and `aria-label`.
  - Announce new results via `aria-live` regions for screen readers.
  - Sanitize HTML server-sent content with DOMPurify before rendering.
  - Add printable/export view and lazy load heavy sections.
- Deliverable: Accessible modal with sanitization and export options.

---

## Phase 8 — State & Network Strategy

- Goal: Clear separation of UI state and server state.
- Actions:
  - Use Zustand for ephemeral UI state; use React Query / SWR for server data.
  - Normalize API responses and cache rules for search results.
  - Centralize error handling and retries in an API client wrapper.
- Deliverable: Predictable fetching and caching behavior.

---

## Phase 9 — Performance & Optimization

- Goal: Fast initial paint and low runtime cost.
- Actions:
  - Code-split heavy components (Candidate modal, Results list).
  - Tree-shake and remove unused libraries; lazy-load non-critical code.
  - Compress assets and use preconnect/preload for API and fonts.
  - Measure and iterate with Lighthouse and Performance traces.
- Deliverable: Targeted perf improvements and a Lighthouse baseline.

---

## Phase 10 — Testing & QA

- Goal: Confidence in critical flows and regressions.
- Actions:
  - Unit tests (Vitest + React Testing Library) for stores and components.
  - Accessibility tests (axe) and jest-axe assertions.
  - E2E tests (Playwright) covering ingestion → search → modal flows.
  - Visual regression for key screens (Chromatic or Percy).
- Deliverable: CI-enforced test suites and baseline E2E tests.

---

## Phase 11 — Observability & Error Handling

- Goal: Detect, triage, and fix runtime issues quickly.
- Actions:
  - Integrate Sentry or similar for client errors and performance monitoring.
  - Add structured client-side logs for failed network requests.
  - Make toast messages actionable and consistent.
- Deliverable: Instrumentation and runbook for common failures.

---

## Phase 12 — Security & Privacy

- Goal: Protect PII and prevent XSS/CSRF.
- Actions:
  - Sanitize any HTML before rendering; add CSP headers at deploy time.
  - Limit upload sizes and validate on the server as well.
  - Ensure candidate PII access is authorized where required.
- Deliverable: Security checklist and implemented mitigations.

---

## Phase 13 — Deployment & Release

- Goal: Reliable CI/CD with preview environments.
- Actions:
  - Add GitHub Actions to run tests/build and create preview deployments.
  - Configure Vercel (or target hosting) with environment variables and health checks.
  - Add feature flags for gradual rollouts.
- Deliverable: Reproducible deploy pipeline with preview URLs.

---

## Phase 14 — Developer Experience & Docs

- Goal: Reduce onboarding time and increase contributor velocity.
- Actions:
  - Provide Storybook + README + architecture.md.
  - Provide a seeded mock server or fixtures for local dev.
  - Create CONTRIBUTING.md and a short dev checklist.
- Deliverable: DX kit and onboarding documentation.

---

## Phase 15 — Post-launch Iteration

- Goal: Data-driven UX improvements.
- Actions:
  - Instrument analytics for key flows and error rates.
  - Run A/B tests for major UX changes (ranking explanations, layout).
  - Maintain a prioritized backlog informed by metrics.
- Deliverable: Prioritized roadmap with metrics-driven decisions.

---

## Quick wins (high priority)

1. Fix `ResultCard` to use the real `searchType` (color/label correctness).
2. Autosize chat textarea and improve keyboard handling (Enter/Shift+Enter).
3. Add focus-trap and `aria-live` for results and modal (accessibility).
4. Centralize API client with retries/AbortController and better error messages.

---

## How to use this file

- Use this document as the canonical upgrade checklist. Track progress by creating branches like `feature/phase-04-ingestion`.
- Implement one phase at a time and open PRs with Storybook demos and tests for each component.

---

*Created on: 2026-06-05*
