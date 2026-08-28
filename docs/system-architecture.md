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
- `public.profile` mirrors `auth.users` 1:1 (`role` admin\|member, default `member`). RLS is enabled with exactly one policy, `profile_select_own` (`auth.uid() = id`), granted to `authenticated` only — a signed-in user reads exclusively their own row. Rows are written solely by `handle_new_user()`, a `security definer` trigger (`search_path` pinned to `public`) firing on `auth.users` insert; no app code writes `profile` directly.
- Design tokens live in `src/app/globals.css`'s `@theme inline` block, sourced from MoMorph `list_frame_styles` (colors, radii, shadow). Montserrat and Montserrat Alternates load via `next/font/google` in `src/lib/fonts.ts` and surface as the `--font-body` / `--font-heading` tokens.
- The persistent shell — `SiteHeader` (mounted `variant="guest"` at the root), `SiteFooter`, `FabWidget` — mounts once in `src/app/layout.tsx`'s root layout, so every route inherits the same header/footer/FAB without per-page wiring.

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-08-28 | Bootstrap Next.js at repo root (not subfolder) | MoMorph extension detects repo by git remote |
| 2026-08-28 | Vitest over Jest | Native ESM/TS, faster with Next 16 |
| 2026-08-28 | `profile` RLS has only a `select`-own policy, no insert/update policy | Inserts happen exclusively via the `handle_new_user()` definer trigger; no self-service profile edit yet (YAGNI) |
| 2026-08-28 | Header/Footer/FAB mount once in the root layout, not per-route | One shared shell component set, not duplicated per page |
