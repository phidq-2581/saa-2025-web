# System Architecture — SAA 2025 Web

> Living document. Update after every phase that changes structure.

## Overview

Web app for SAA 2025, generated from Figma design + MoMorph screen specs.

```
Browser ──> Next.js 16 (App Router, React 19)
                │
                ├── Server Components / Route Handlers
                │        │
                │        └──> Supabase (local: Docker, port 54321)
                │                ├── Postgres 17 (port 54322)
                │                └── Auth
                └── Client Components (Tailwind CSS v4)
```

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.3 (App Router, `src/` dir, `@/*` alias) | Turbopack dev |
| UI | React 19 + Tailwind CSS v4 | Visual values sourced from MoMorph MCP only |
| Backend | Supabase local (BaaS) | DB + Auth; client via `@supabase/ssr` |
| Unit/component tests | Vitest + Testing Library (jsdom) | `npm run test` |
| E2E tests | Playwright (`@playwright/test`, chromium) | `npm run test:e2e`, webServer auto-start |

## Directory layout

```
src/
  app/          # App Router routes; __tests__/ colocated per route
  components/   # Shared UI components (created as screens land)
  lib/
    supabase/   # client.ts (browser), server.ts (RSC/route handlers)
e2e/            # Playwright specs
supabase/       # Local Supabase config, migrations, seeds
docs/           # This documentation
plans/          # Takumi plans, clarifications, reports (gitignored)
```

## Data flow

- Server Components read data through `src/lib/supabase/server.ts` (cookie-bound client).
- Client Components use `src/lib/supabase/client.ts` (browser client).
- Schema changes go through `supabase/migrations/*.sql` — never mutate the DB by hand.

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-08-28 | Bootstrap Next.js at repo root (not subfolder) | MoMorph extension detects repo by git remote |
| 2026-08-28 | Vitest over Jest | Native ESM/TS, faster with Next 16 |
