# Analytical Hackathon - Fast Pass Platform

Production-ready Next.js workspace for AI-assisted report onboarding.

Fast Pass lets users upload spreadsheets, map columns to governed metrics, clarify uncertain mappings with LLM support, preview output, and save reports with scheduling.

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

## Local Setup

1) Install dependencies:

```bash
npm install
```

2) Copy env template:

```bash
cp .env.example .env
```

3) Generate Prisma client and sync schema:

```bash
npx prisma generate
npx prisma db push
```

4) Start local server:

```bash
npm run dev
```

Open `http://localhost:3000`.

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
