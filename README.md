# Analytical Hackathon - Fast Pass Platform

Production-ready Next.js workspace for AI-assisted report onboarding.

Fast Pass lets users upload spreadsheets, map columns to governed metrics, clarify uncertain mappings with LLM support, preview output, and save reports with scheduling.

## Setup Documentation

New to the project? Start here:

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete walkthrough with explanations
- **[Setup Checklist](./SETUP_CHECKLIST.md)** - Step-by-step checklist you can print
- **[Quick Commands](./QUICK_START.md)** - Just the commands, no explanations

GitHub: https://github.com/Shree-Raut/analytical-hackathon-share

## Architecture

- Frontend: Next.js App Router + React + Tailwind.
- Primary app data: SQLite via Prisma (`DATABASE_URL=file:./dev.db`) for local development.
- Semantic layer: Postgres-backed semantic metadata and orchestrator integration.
- Fast Pass flow:
  - Upload + header detection
  - Deterministic + memory-guided mapping
  - Optional LLM reranking and clarify-chat
  - Live preview + save/schedule
- Learning store: `FastPassMappingMemory`, `FastPassMappingSignal`, `FastPassUnmatchedQueue`.
- Testing: Vitest (unit + integration) with optional e2e smoke.

## Project Layout

```text
src/
  app/
    (analytics)/fast-pass/
      page.tsx
      loading.tsx
      error.tsx
      _components/
        step-*.tsx
        use-fast-pass.ts
  lib/
    fast-pass/
      agent/
      repositories/
      services/
      config.ts
      api-client.ts
    llm-client.ts
    logger.ts
    api-response.ts
```

## Quick Start (Clone or ZIP)

1) Use this folder as the project root.
   - If you downloaded a ZIP, extract it and `cd` into this exact folder before running commands.

2) Install dependencies:

```bash
npm install
```

3) Copy env template:

```bash
cp .env.example .env
```

4) Generate Prisma client and sync schema:

```bash
npx prisma generate
npx prisma db push
```

5) Start local server:

```bash
npm run dev
```

Open `http://localhost:3000/fast-pass`.

### Route sanity checks

After the server starts, these should respond:

- `GET /fast-pass` -> `200`
- `GET /api/metrics` -> `200` (or empty data set)
- `POST /api/fast-pass/map` -> route responds (expected `400` if body is missing)
- `POST /api/upload` -> route responds (expected `400` if file payload is missing)

## ZIP Notes

- `node_modules`, `.env`, local DB files, and uploads are intentionally excluded from source control.
- If AI features fail after extraction, confirm `.env` has at least one valid key (`OPENAI_API_KEY` or `LITELLM_API_KEY`).

## Environment Variables

See `.env.example` for full documentation. Key groups:

- Core: `DATABASE_URL`
- LLM: `LITELLM_API_KEY` or `OPENAI_API_KEY`, `MESH_MODEL_ID`
- Semantic: `SEMANTIC_DATABASE_URL`, `SDET_URL`
- Fast Pass tuning: `MAP_*`, `MEMORY_*`

## Fast Pass Data Operations

Seed canonical metric definitions from bundle:

```bash
npm run fastpass:bundle-seed
```

Ingest bundle knowledge into memory:

```bash
npm run fastpass:bundle-ingest
```

Ingest from custom sheet path:

```bash
npm run fastpass:memory-ingest
```

Resolve pending unmatched headers:

```bash
npm run fastpass:unmatched-refine
```

## Test Commands

Run unit and integration tests:

```bash
npm run test
```

Run coverage:

```bash
npm run test:coverage
```

Optional e2e smoke (requires running app):

```bash
RUN_E2E=true BASE_URL=http://localhost:3000 npx vitest run tests/e2e/fast-pass-agent-eval.test.ts
```

## CI/CD

`/.github/workflows/ci.yml` runs:

- `tsc --noEmit`
- `next lint`
- `vitest run`
- `next build`
- e2e smoke job with route-level check

## Docker

Build image:

```bash
docker build -t fast-pass-app .
```

Run app + semantic postgres:

```bash
docker compose up --build
```

## Deployment Notes

- Use managed Postgres for semantic layer in non-local environments.
- Configure all LLM/API keys via secure environment secrets.
- Run `npm run test && npm run build` before merging.
- Keep generated bundles and uploads out of git; `.gitignore` includes local patterns.
