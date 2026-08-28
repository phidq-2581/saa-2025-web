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
  proxy.ts      # Route guard (Next.js 16's replacement for middleware.ts)
  app/          # App Router routes; __tests__/ colocated per route
    layout.tsx        # Root layout: html/body shell only, no header/footer/FAB
    (site)/            # Route group: SiteHeader(guest) + children + SiteFooter + FabWidget
      page.tsx           # Homepage SAA (/)
      he-thong-giai/page.tsx  # Award System (/he-thong-giai, guarded by proxy.ts)
    (auth)/            # Route group: its own LoginHeader/LoginFooter, no shared shell
      login/page.tsx     # /login
    auth/callback/route.ts   # OAuth code-exchange route handler
    login/actions.ts   # signInWithGoogle Server Action
    not-found.tsx / forbidden.tsx  # Minimal 404/403 (design tokens only, no Figma frame)
  components/
    layout/     # SiteHeader, SiteFooter, FabWidget, LanguageDropdown, AccountMenu, ... (F002)
    login/      # LoginHeader, LoginHero, GoogleSignInButton, LoginErrorNotice, LoginFooter (F001)
    homepage/   # HeroSection, EventCountdown, EventInfo, RootFurtherBlock, AwardGrid, AwardCard, KudosPromo, IconLinkArrow (F003)
    awards/     # AwardHero, AwardSectionTitle, AwardCategoryNav, resolve-active-slug.ts, AwardInfoCard, AwardKudosBanner (F004)
  i18n/         # request.ts — next-intl locale resolution (cookie-based)
  lib/
    supabase/   # client.ts (browser), server.ts (RSC/route handlers)
    auth/       # safe-next.ts, email-verified.ts, sign-out.ts (Server Action)
    i18n/       # set-locale.ts (Server Action)
    countdown/  # compute-remaining.ts, parse-target.ts, use-countdown.ts
    awards/     # award-categories.ts — AWARD_CATEGORIES: { name, slug } (fixed 6 rows)
messages/       # vi/{login,home,awards,common}.json — content scaffolds (see below); en/ pending Phase 07
e2e/
  support/      # seed-session.ts, authenticated-fixture.ts (real local-Supabase sessions)
supabase/       # Local Supabase config, migrations, seeds
docs/           # This documentation
plans/          # Takumi plans, clarifications, reports (gitignored)
```

`proxy.ts` sits at `src/proxy.ts`, not the repo root — this project's App Router lives under `src/`, and Next.js 16 resolves the route guard relative to that directory; a root-level `proxy.ts` is ignored.

### Route groups

`src/app/layout.tsx` (the root layout) is an html/body shell only — no header, footer, or FAB. Each route group supplies its own chrome instead:

- **`(site)`** (`src/app/(site)/layout.tsx`) mounts `SiteHeader` (currently hardcoded `variant="guest"` — wiring the real session/role into `variant`/`user` is Phase 07 integration work, not part of this presentational round), `{children}`, `SiteFooter`, and `FabWidget`. Covers Homepage SAA and Award System.
- **`(auth)`** (`src/app/(auth)/layout.tsx`) mounts `LoginHeader`/`LoginFooter` instead of the shared shell — a standalone component pair under `src/components/login/`, not a trimmed-down `SiteHeader`/`SiteFooter`. `LoginHeader` does reuse F002's `LanguageDropdown`, just not the rest of `SiteHeader`'s markup; the Login screen's own spec calls for logo + language only, no nav links/bell/account menu.

Route groups don't affect the URL — `/` still resolves through `(site)/page.tsx`, `/login` through `(auth)/login/page.tsx`.

### Content scaffolds (next-intl)

`messages/vi/{home,awards}.json` hold literal Vietnamese strings, imported directly by each screen's components (e.g. `import homeCopy from "../../../messages/vi/home.json"`) — a static content scaffold, not next-intl's `useTranslations()` catalog API yet. `messages/vi/login.json` exists with the same shape but is **not yet imported anywhere** — the Login components (`login-hero.tsx`, `login-header.tsx`, `login-footer.tsx`) still hard-code their Vietnamese copy inline; wiring it up is unresolved (see `docs/features/F001_GoogleOAuthLogin/technical-spec.md` § Unresolved Questions). Wiring all three through next-intl (plus the `messages/en/*` counterparts) is Phase 07 integration work.

### Deferred / inert affordances

A control whose destination is out of scope this round (e.g. the Kudos promo's "Chi tiết" button, the hero's "ABOUT KUDOS" CTA, the Award page's Kudos banner CTA) renders as `<button type="button" aria-disabled="true" tabIndex={-1} className="cursor-default ...">` — visibly styled, removed from the tab order, no click handler. Never a `<span role="button">` or an `<a>` with no `href`.

### Award category scroll-spy

`AwardCategoryNav` (`src/components/awards/award-category-nav.tsx`) reads `window.location.hash` through `useSyncExternalStore`, whose server snapshot and first client (hydration) snapshot are both the empty string — the real hash read happens in the store's post-mount resync, the same hydration-safety pattern `src/lib/countdown/use-countdown.ts` already uses for its `00/00/00` placeholder. `resolveActiveSlug()` (`resolve-active-slug.ts`) is the pure hash-to-slug decision, isolated from the component so it's unit-testable without mounting or touching `window`. A click (`clickedSlug` local state) overrides the hash-derived slug as the single `activeSlug` source of truth. There is no default-active item on load without a matching hash — confirmed by the RED test and `clarifications.md` § Group 3 checkpoint.

## Data flow

- Server Components read data through `src/lib/supabase/server.ts` (cookie-bound client).
- Client Components use `src/lib/supabase/client.ts` (browser client).
- Schema changes go through `supabase/migrations/*.sql` — never mutate the DB by hand.
- `public.profile` mirrors `auth.users` 1:1 (`role` admin\|member, default `member`). RLS is enabled with exactly one policy, `profile_select_own` (`auth.uid() = id`), granted to `authenticated` only — a signed-in user reads exclusively their own row. Rows are written solely by `handle_new_user()`, a `security definer` trigger (`search_path` pinned to `public`) firing on `auth.users` insert; no app code writes `profile` directly.
- Design tokens live in `src/app/globals.css`'s `@theme inline` block, sourced from MoMorph `list_frame_styles` (colors, radii, shadow). Montserrat and Montserrat Alternates load via `next/font/google` in `src/lib/fonts.ts` and surface as the `--font-body` / `--font-heading` tokens.
- The persistent shell — `SiteHeader` (mounted `variant="guest"` at the root), `SiteFooter`, `FabWidget` — mounts once in `src/app/layout.tsx`'s root layout, so every route inherits the same header/footer/FAB without per-page wiring.

## Auth request flow

```
Request ──> proxy.ts (route guard)
              │  getClaims() re-validated every request, never getSession()
              │  PUBLIC_ROUTES exact-match ("/", "/login") + "/auth/" prefix
              ├── unauthenticated + private route ──> redirect /login?next=<path>
              ├── authenticated + "/login" ──> redirect /
              └── otherwise ──> pass through (rotated cookies relayed via redirectWithCookies)

Login CTA ──> signInWithGoogle() Server Action (src/app/login/actions.ts)
              │  Supabase OAuth, hd: sun-asterisk.com hint (pre-fill only)
              ▼
/auth/callback (route.ts) ──> exchangeCodeForSession(code)
              ├── !isAllowedEmail(email) OR !emailVerified(user)
              │     └──> signOut() + redirect /login?error=domain
              └── else ──> redirect safeNext(next)   # open-redirect gate
```

`safeNext()` (`src/lib/auth/safe-next.ts`) is the single choke point every post-login redirect passes through: it accepts only a same-origin, single-`/`-leading path and rejects protocol-relative URLs, `://`, backslashes, and raw or percent-encoded CR/LF/NUL, falling back to `/`. Session lifetime follows Supabase's own defaults — no custom expiry policy is configured beyond `supabase/config.toml`'s `jwt_expiry`.

## Internationalization (i18n)

next-intl runs in **cookie mode, no URL prefix** — locale is read from the `NEXT_LOCALE` cookie (`src/i18n/request.ts`, default `vi`), never from the URL path. `next.config.ts` wires the plugin via `createNextIntlPlugin("./src/i18n/request.ts")`. Switching locale is a Server Action (`src/lib/i18n/set-locale.ts`) that validates against the same `vi`/`en` allow-list before writing the cookie (1-year `maxAge`, `httpOnly: false` — required for next-intl's client-side hydration) and calling `revalidatePath`. Message catalogs live at `messages/{locale}/common.json`.

## Countdown

`src/lib/countdown/` computes the event countdown shown on the Homepage: `parse-target.ts` parses `NEXT_PUBLIC_EVENT_START_AT` into epoch-ms and never throws (invalid/missing → `null`, rendered as already-reached); `compute-remaining.ts` derives zero-padded days/hours/minutes from the diff; `use-countdown.ts` is a client hook built on `useSyncExternalStore` with a fixed `00/00/00` server snapshot, so SSR and first client paint never disagree, ticking every 30s.

## E2E session fixture

`e2e/support/seed-session.ts` seeds a real local-Supabase session (`admin.createUser` → `generateLink` → `verifyOtp`, then derives `@supabase/ssr` cookies via a real `setSession()` call) rather than faking cookies; `e2e/support/authenticated-fixture.ts` exposes it as the `authenticatedPage`/`adminPage` Playwright fixtures, each on its own browser context with a throwaway user cleaned up after the test. The Supabase service-role key this needs is read only under `e2e/support/**`, never from `src/`. `playwright.config.ts` loads it (and other local env) from `.env.local` via `dotenv`, since Playwright's Node process doesn't inherit Next's own env loading.

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-08-28 | Bootstrap Next.js at repo root (not subfolder) | MoMorph extension detects repo by git remote |
| 2026-08-28 | Vitest over Jest | Native ESM/TS, faster with Next 16 |
| 2026-08-28 | `profile` RLS has only a `select`-own policy, no insert/update policy | Inserts happen exclusively via the `handle_new_user()` definer trigger; no self-service profile edit yet (YAGNI) |
| 2026-08-28 | Header/Footer/FAB mount once in the root layout, not per-route | One shared shell component set, not duplicated per page |
| 2026-08-28 | `PUBLIC_ROUTES` matched by exact equality only, `/auth/` as the sole prefix exception | A `startsWith` check on the allow-list would make every route public |
| 2026-08-28 | next-intl locale in a cookie, no URL prefix | Matches `clarifications.md` § i18n; avoids `/vi`/`/en` route duplication |
| 2026-08-28 | E2E auth fixture seeds a real Supabase session, not faked cookies | Exercises the actual `@supabase/ssr` cookie serialization the app relies on |
| 2026-08-28 | `/login` gets its own `(auth)` route group + `LoginHeader`/`LoginFooter`, not a `SiteHeader`/`SiteFooter` variant | Login's header/footer spec (logo+language only, no nav/bell/account menu) diverges enough from the full shell that a standalone pair was simpler than parametrizing `SiteHeader` further |
| 2026-08-28 | Award category nav has no default-active item on load | Matches the RED test; activates only via click or a URL hash matching one of the six known slugs (`clarifications.md` § Group 3 checkpoint) |
| 2026-08-28 | `AWARD_CATEGORIES` trimmed to `{ name, slug }` | Its Phase 02 `quantity`/`prize` fields were wrong/paraphrased against the verified Figma `character` values; per-card copy now lives in `messages/vi/awards.json` → `cardContent[slug]` |
