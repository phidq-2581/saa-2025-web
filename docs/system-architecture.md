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
    (site)/            # Route group: SiteHeaderContainer + children + SiteFooter + FabWidgetContainer
      page.tsx           # Homepage SAA (/) — generateMetadata + Home
      he-thong-giai/page.tsx  # Award System (/he-thong-giai, guarded by proxy.ts) — generateMetadata + page
    (auth)/            # Route group: its own LoginHeader/LoginFooter, no shared shell
      login/page.tsx     # /login — generateMetadata + LoginPage
    auth/callback/route.ts   # OAuth code-exchange route handler
    auth/sign-out/route.ts   # Logout Route Handler (POST, Phase 07 — see § Sign-out below)
    login/actions.ts   # signInWithGoogle Server Action
    not-found.tsx / forbidden.tsx  # Minimal 404/403 (design tokens only, no Figma frame)
  components/
    layout/     # SiteHeader(Container), SiteFooter, FabWidget(Container), LanguageDropdown, AccountMenu, ... (F002)
    login/      # LoginHeader, LoginHero, GoogleSignInButton, LoginErrorNotice, LoginFooter (F001)
    homepage/   # HeroSection, EventCountdown(Live), EventInfo, RootFurtherBlock, AwardGrid, AwardCard, KudosPromo, IconLinkArrow (F003)
    awards/     # AwardHero, AwardSectionTitle, AwardCategoryNav, resolve-active-slug.ts, AwardInfoCard, AwardKudosBanner (F004)
  i18n/         # request.ts — next-intl locale resolution (cookie-based, 4 namespaces)
  lib/
    supabase/   # client.ts (browser), server.ts (RSC/route handlers)
    auth/       # safe-next.ts, email-verified.ts, allowed-email.ts (sign-out moved to a Route Handler, see below)
    profile/    # get-current-profile.ts — server-only session + `profile.role` lookup (F002 DISC-001)
    i18n/       # set-locale.ts (Server Action), select-locale-action.ts (Server Action reference wrapper, Phase 07)
    countdown/  # compute-remaining.ts, parse-target.ts, use-countdown.ts
    awards/     # award-categories.ts — AWARD_CATEGORIES: { name, slug } (fixed 6 rows)
messages/       # vi/{login,home,awards,common}.json + en/{login,home,awards,common}.json (Phase 07) — see § Content scaffolds
e2e/
  support/      # seed-session.ts, authenticated-fixture.ts (real local-Supabase sessions)
supabase/       # Local Supabase config, migrations, seeds
docs/           # This documentation
plans/          # Takumi plans, clarifications, reports (gitignored)
```

`proxy.ts` sits at `src/proxy.ts`, not the repo root — this project's App Router lives under `src/`, and Next.js 16 resolves the route guard relative to that directory; a root-level `proxy.ts` is ignored.

### Route groups

`src/app/layout.tsx` (the root layout) is an html/body shell only — no header, footer, or FAB. Each route group supplies its own chrome instead:

- **`(site)`** (`src/app/(site)/layout.tsx`) mounts `SiteHeaderContainer`, `{children}`, `SiteFooter`, and `FabWidgetContainer`. Covers Homepage SAA and Award System.
- **`(auth)`** (`src/app/(auth)/layout.tsx`) mounts `LoginHeader`/`LoginFooter` instead of the shared shell — a standalone component pair under `src/components/login/`, not a trimmed-down `SiteHeader`/`SiteFooter`. `LoginHeader` does reuse F002's `LanguageDropdown`, just not the rest of `SiteHeader`'s markup; the Login screen's own spec calls for logo + language only, no nav links/bell/account menu.

Route groups don't affect the URL — `/` still resolves through `(site)/page.tsx`, `/login` through `(auth)/login/page.tsx`.

### Session-aware shell (Phase 07)

`SiteHeaderContainer` (`src/components/layout/site-header-container.tsx`) and `FabWidgetContainer` (`src/components/layout/fab-widget-container.tsx`) are the server containers `(site)/layout.tsx` mounts in place of the plain, prop-driven `SiteHeader`/`FabWidget` Phase 02 shipped:

- Both call `getCurrentProfile()` (`src/lib/profile/get-current-profile.ts`) — server-only, `supabase.auth.getClaims()` then `select full_name, avatar_url, role from profile`, returning `{ fullName, avatarUrl, role } | null`. `email` is never selected (`docs/data-model.md` marks it withheld). A missing session **or** a failed profile-row read both degrade to `null` — the guest variant — rather than throwing and breaking the page.
- `SiteHeaderContainer` passes `variant={profile ? "authed" : "guest"}`, `user={profile ?? undefined}`, a fixed `unreadCount={0}` (the notification data source is still deferred), and `onSelectLocale={selectLocaleAction}` — a Server Action *reference*, never an inline closure, into `SiteHeader`.
- `FabWidgetContainer` renders `FabWidget` only when `getCurrentProfile()` resolves non-null (SCR004_Fab hidden-for-guest state); it reads the session independently so the header and FAB never disagree about sign-in state.

### Sign-out (Phase 07)

Logout submits a plain `<form method="post" action="/auth/sign-out">` from `account-menu.tsx` to `src/app/auth/sign-out/route.ts` — a Route Handler, not the Phase 03 Server Action it replaces. Verified against the real dev server: the Server Action's `redirect()` is a *soft*, client-side navigation, so the URL flips to `/` before the browser has necessarily applied the response's `Set-Cookie` headers — an E2E check reading cookies right after `waitForURL` lost that race reproducibly (0/3), passing 3/3 only with an artificial settle delay no real request should need. A `<form method="post">` triggers a hard, full-page navigation instead, atomic from the browser's perspective (3/3). The route: rejects a cross-origin `Origin` header with a 403 JSON body (Route Handlers get no automatic same-origin check the way Server Actions do); calls `supabase.auth.signOut()`; deletes every `sb-*`-prefixed cookie explicitly; and responds `303 See Other` to `/` — 303 rather than the default 307, so the browser follows with a `GET /` instead of re-POSTing the form body to the homepage.

### Content scaffolds (next-intl)

`src/i18n/request.ts` loads four namespaces per request — `common`, `login`, `home`, `awards` — from `messages/{locale}/{namespace}.json`. Phase 07 authored the `messages/en/*` catalogs (31 keys sourced from MoMorph `list_file_localizations`; 15 keys with no confirmed Figma EN source fall back to the Vietnamese text at runtime rather than a `[VN]`-prefixed placeholder, which would otherwise leak to English-locale visitors — full gap list in `docs/test-traceability.md`) and wired the shared chrome (`site-footer.tsx`, `login-footer.tsx`, `login-hero.tsx`, `(auth)/login/page.tsx`) plus all three routes' `generateMetadata` exports through `getTranslations`/`useTranslations`.

Body copy inside the Group 3 screen components — `homepage/{hero-section,event-info,root-further-block,award-grid,award-card,kudos-promo,event-countdown}.tsx`, `awards/{award-hero,award-section-title,award-category-nav,award-info-card,award-kudos-banner}.tsx`, `login/login-error-notice.tsx` — still imports `messages/vi/*.json` directly (e.g. `import homeCopy from "../../../messages/vi/home.json"`) and renders Vietnamese regardless of the selected locale: converting them to `useTranslations` breaks their existing synchronous `@testing-library/react` render tests (an `async` Server Component renders as an unresolved Promise under plain RTL). **Phase 07b** (approved at the 2026-08-30 checkpoint, `plans/clarifications.md`) converts these before Phase 08, adding a `NextIntlClientProvider` test helper and an EN-body-copy E2E assertion per screen.

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
- The persistent shell — `SiteHeaderContainer`, `SiteFooter`, `FabWidgetContainer` — mounts once in `(site)/layout.tsx` (see § Route groups and § Session-aware shell above), so every `(site)` route inherits the same session-aware header/footer/FAB without per-page wiring.

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

next-intl runs in **cookie mode, no URL prefix** — locale is read from the `NEXT_LOCALE` cookie (`src/i18n/request.ts`, default `vi`), never from the URL path. `next.config.ts` wires the plugin via `createNextIntlPlugin("./src/i18n/request.ts")`. Message catalogs load four namespaces per request — `common`, `login`, `home`, `awards` (`src/i18n/request.ts`) — see § Content scaffolds above for what each namespace covers and the EN fallback rule.

Switching locale is `setLocale()` (`src/lib/i18n/set-locale.ts`), which validates against the same `vi`/`en` allow-list before writing the cookie (1-year `maxAge`, `httpOnly: false` — required for next-intl's client-side hydration) and calling `revalidatePath`. Client Components (`language-dropdown.tsx`, `mobile-nav-drawer.tsx`) never call `setLocale` directly: they can only be handed a Server Action *reference*, not an inline closure defined inside a Server Component, so `selectLocaleAction` (`src/lib/i18n/select-locale-action.ts`, Phase 07) exists purely as that reference-shaped wrapper. It recovers the current pathname (needed for `revalidatePath`) from the `Referer` header of the action's own fetch-based invocation — falling back to `/` if that header is absent — since a Server Action invoked from a Client Component has no route param of its own.

## Countdown

`src/lib/countdown/` computes the event countdown shown on the Homepage: `parse-target.ts` parses `NEXT_PUBLIC_EVENT_START_AT` into epoch-ms and never throws (invalid/missing → `null`, rendered as already-reached); `compute-remaining.ts` derives zero-padded days/hours/minutes from the diff; `use-countdown.ts` is a client hook built on `useSyncExternalStore` with a fixed `00/00/00` server snapshot, so SSR and first client paint never disagree, ticking every 30s. `EventCountdownLive` (`src/components/homepage/event-countdown-live.tsx`, Phase 07) is the thin Client Component wrapper `hero-section.tsx` renders directly: it calls `parseTarget`/`useCountdown` itself and feeds the result into the presentational `EventCountdown`'s `remaining` prop, so `EventCountdown`'s own prop-driven unit tests keep asserting a pure render contract without a timer/env fixture. With the repo's sample `.env.example` date already in the past, the homepage renders the reached state (`coming-soon-label` hidden, tiles clamped to `00`) against the current wall clock.

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
| 2026-08-30 | Logout submits to a Route Handler (`src/app/auth/sign-out/route.ts`) via `<form method="post">`, not the Phase 03 Server Action | The Server Action's `redirect()` is a soft client-side navigation that races the response's `Set-Cookie` headers (0/3 reproducible); a hard, full-page form POST is atomic for the browser (3/3) |
| 2026-08-30 | EN catalog keys with no confirmed Figma EN source fall back to the Vietnamese design text at runtime, not a `[VN]`-prefixed marker | The `[VN]` marker would leak to English-locale visitors; the gap is logged in `docs/test-traceability.md` instead |
| 2026-08-30 | Phase 07b (approved at the Group 4a checkpoint) converts the remaining Group 3 body-copy components to `useTranslations` before Phase 08 | Chrome + metadata are locale-aware since Phase 07, but those components' synchronous RTL tests would break under `async` `getTranslations`; needs a `NextIntlClientProvider` test helper first |
