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
      kudos/page.tsx       # /kudos board (F006, round 2) + kudos/[id]/page.tsx detail
      profile/page.tsx     # /profile?id={uuid} stub (F006, round 2 — round 3 replaces this)
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
    kudos/      # compose/, board/, card/, detail/, content/, containers/ (F005/F006, round 2 — see § Kudos domain)
    profile/    # ProfileStub (F006 round 2)
  i18n/         # request.ts — next-intl locale resolution (cookie-based, 7 namespaces since round 2)
  lib/
    supabase/   # client.ts (browser), server.ts (RSC/route handlers)
    auth/       # safe-next.ts, email-verified.ts, allowed-email.ts (sign-out moved to a Route Handler, see below)
    profile/    # get-current-profile.ts — server-only session + `profile.role` lookup (F002 DISC-001)
    i18n/       # set-locale.ts (Server Action), select-locale-action.ts (Server Action reference wrapper, Phase 07)
    countdown/  # compute-remaining.ts, parse-target.ts, use-countdown.ts
    awards/     # award-categories.ts — AWARD_CATEGORIES: { name, slug } (fixed 6 rows)
    kudos/      # content-schema.ts, types.ts, queries/, derive/, write/ (F005/F006, round 2 — see § Kudos domain)
  test-utils/   # render-with-intl.tsx — renderWithIntl(), real NextIntlClientProvider + catalogues (Phase 07b)
messages/       # vi/{login,home,awards,common,compose,kudos,profile}.json + en/{same} (Phase 07 + round 2) — see § Content scaffolds
e2e/
  support/      # seed-session.ts, authenticated-fixture.ts (real local-Supabase sessions); seed-kudos.ts (round 2)
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

Body copy inside the Group 3 screen components — `homepage/{hero-section,event-info,event-countdown,root-further-block,award-grid,award-card,kudos-promo}.tsx`, `awards/{award-hero,award-section-title,award-category-nav,award-info-card,award-kudos-banner}.tsx`, `login/login-error-notice.tsx` — reads copy via `useTranslations` since **Phase 07b** (2026-08-30, `plans/clarifications.md`). They stay non-async Server Components (only `award-category-nav.tsx` is a Client Component, for its scroll-spy hash read); next-intl resolves `useTranslations` server-side under Next.js's own `react-server` build condition, so no `NextIntlClientProvider` is needed at runtime. Vitest runs under Vite instead (no `react-server` condition), where `useTranslations` always falls back to next-intl's context-based Client implementation — so component tests render through `src/test-utils/render-with-intl.tsx`'s `renderWithIntl(ui, { locale })`, which wraps `NextIntlClientProvider` with the real `messages/{locale}/*.json` catalogues (never a hand-rolled stub). `e2e/locale-body-copy.spec.ts` asserts the EN body copy end to end on `/` and `/he-thong-giai`, plus the VN-fallback and no-`NEXT_LOCALE`-cookie guard cases.

### Deferred / inert affordances

A control whose destination is out of scope this round (e.g. the Kudos promo's "Chi tiết" button, the hero's "ABOUT KUDOS" CTA, the Award page's Kudos banner CTA) renders as `<button type="button" aria-disabled="true" tabIndex={-1} className="cursor-default ...">` — visibly styled, removed from the tab order, no click handler. Never a `<span role="button">` or an `<a>` with no `href`.

### Award category scroll-spy

`AwardCategoryNav` (`src/components/awards/award-category-nav.tsx`) reads `window.location.hash` through `useSyncExternalStore`, whose server snapshot and first client (hydration) snapshot are both the empty string — the real hash read happens in the store's post-mount resync, the same hydration-safety pattern `src/lib/countdown/use-countdown.ts` already uses for its `00/00/00` placeholder. `resolveActiveSlug()` (`resolve-active-slug.ts`) is the pure hash-to-slug decision, isolated from the component so it's unit-testable without mounting or touching `window`. A click (`clickedSlug` local state) overrides the hash-derived slug as the single `activeSlug` source of truth. There is no default-active item on load without a matching hash — confirmed by the RED test and `clarifications.md` § Group 3 checkpoint.

## Data flow

- Server Components read data through `src/lib/supabase/server.ts` (cookie-bound client).
- Client Components use `src/lib/supabase/client.ts` (browser client).
- Schema changes go through `supabase/migrations/*.sql` — never mutate the DB by hand.
- `public.profile` mirrors `auth.users` 1:1 (`role` admin\|member, default `member`). RLS is enabled with exactly one `select` policy, `profile_select_all_authenticated` (`using (true)`), granted to `authenticated` — **any signed-in Sunner reads every profile row**, not just their own (widened round 2, migration `20260831000100_widen_profile_select.sql`, replacing the round-1 `profile_select_own` policy outright rather than stacking a second permissive one). The widening makes F005/F006's recipient autocomplete, `@mention` search, sender/receiver display, and the `/profile` stub possible without a separate read API; `profile` still carries no sensitive column (`email` stays withheld from every payload) and no insert/update policy exists for `authenticated` at all. Rows are written solely by `handle_new_user()`, a `security definer` trigger (`search_path` pinned to `public`) firing on `auth.users` insert; no app code writes `profile` directly.
- Design tokens live in `src/app/globals.css`'s `@theme inline` block, sourced from MoMorph `list_frame_styles` (colors, radii, shadow). Montserrat and Montserrat Alternates load via `next/font/google` in `src/lib/fonts.ts` and surface as the `--font-body` / `--font-heading` tokens; the countdown digits' 7-segment face ("Digital Numbers" in Figma, unavailable) is the OFL-1.1 DSEG7 Classic from the `dseg` package, loaded with `next/font/local` as `--font-digital` (clarifications.md 2026-09-03).
- The persistent shell — `SiteHeaderContainer`, `SiteFooter`, `FabWidgetContainer` — mounts once in `(site)/layout.tsx` (see § Route groups and § Session-aware shell above), so every `(site)` route inherits the same session-aware header/footer/FAB without per-page wiring.

## Kudos domain (round 2)

F005 (compose) and F006 (live board) add eight new tables, one aggregate view, one atomic
insert RPC, and a private storage bucket, consumed through the same "no API layer, Supabase as
BaaS" shape as the rest of the app — no new Route Handler or service layer.

```
Modal (F005, client, TipTap editor) ──insert──> create_kudos() RPC ──> kudos, kudos_hashtag, kudos_image
                                      ──upload─> Storage bucket `images` (private)
Board (F006, /kudos)                 ──select──> kudos_card_view (aggregate view)
                                      ──insert/delete──> heart
Detail (/kudos/[id]), Profile stub (/profile) ──select by id──> kudos_card_view / profile
```

- **Containers → queries/derive → write.** `src/components/kudos/containers/**` are the Server
  Component data-fetching roots (`KudosBoardContainer`, `KudosDetailContainer`,
  `ProfileContainer`, `ComposeDialogContainer`); they call `src/lib/kudos/queries/**` (one
  function per read: `getHighlightTop5`, `getFeedPage`, `getSpotlight`, `getSidebarStats`,
  `getLeaderboards`, `getRecipients`, `getKudosById`, `getProfileById`,
  `resolveDepartmentReceiverIds`, `resolveImageUrls`) and `src/lib/kudos/derive/**` (pure
  functions with no I/O: `highlight-order`, `feed-filter`, `pagination`, `asterisk-tier`,
  `rank-promotion`, `spotlight-nodes`). Mutations go through `src/lib/kudos/write/**`
  (`createKudos`, `toggleHeart`, plus their validators) — Server Actions, never called from a
  query module.
- **`kudos_card_view`** (`security_invoker = true`) joins `kudos` with a live heart-count
  aggregate, sender/receiver `profile`, hashtag names/ids, and image storage paths in one
  query — `security_invoker` is required, or the view would run as its owner and silently
  bypass the RLS on every table it joins.
- **`create_kudos(...)`** is one atomic `plpgsql` function (`security invoker`): guards the
  1–5 hashtag and ≤5 image ceilings so a partial write can never land at rest, then inserts
  `kudos` + `kudos_hashtag` + `kudos_image` together. `sender_id` is resolved from `auth.uid()`
  inside the function, never taken as a parameter.
- **Storage.** Bucket `images` (declared in `supabase/config.toml`, unused before this round) —
  private (`public = false`), path convention `kudos/{sender_id}/{kudos_id}/{position}-{filename}`.
  `allowed_mime_types` gained `image/webp` (previously png/jpeg only); the app enforces ≤5MB per
  image on top of the bucket's 50MiB ceiling. Reads use `createSignedUrls()`
  (`resolve-image-urls.ts`, 1h TTL) since a plain public URL 403s against a private bucket. The
  insert policy started scoped only to `bucket_id = 'images'` and was tightened to the caller's
  own `kudos/{auth.uid()}/...` folder segment in a follow-up migration — see § Decisions log.
- **Special-day heart rule.** A heart normally credits the kudos's **sender** (not the
  receiver) +1; +2 if the current date, cast to `Asia/Ho_Chi_Minh` (never a naive UTC compare),
  is present in `special_days` (empty-seeded, admin-managed via SQL/Studio — no admin UI this
  round). The check runs server-side inside `toggleHeart`, before the `heart` row is written;
  the client never supplies `granted_amount`. A revoke reads the exact amount back off the row
  it actually deletes, in one atomic `delete().select()` round trip.
- **New client libraries, both client-side only:** `@tiptap/{core,pm,react,starter-kit,
  extension-mention,suggestion}` (pinned exactly at `3.30.6` — TipTap v3 peers pin exact
  versions, a deliberate deviation from the repo's caret convention) for the compose editor;
  `d3-cloud` + `d3-zoom` + `d3-selection` for the Spotlight word cloud.
- **8 new tables** (not 7 — see § Decisions log): `department`, `hashtag`, `kudos`,
  `kudos_image`, `kudos_hashtag`, `heart`, `special_days`, `secret_box_gift`. Full column/RLS
  detail: `docs/data-model.md` § Kudos Cluster.

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

next-intl runs in **cookie mode, no URL prefix** — locale is read from the `NEXT_LOCALE` cookie (`src/i18n/request.ts`, default `vi`), never from the URL path. `next.config.ts` wires the plugin via `createNextIntlPlugin("./src/i18n/request.ts")`. Message catalogs load seven namespaces per request — `common`, `login`, `home`, `awards`, `compose`, `kudos`, `profile` (`src/i18n/request.ts`) — see § Content scaffolds above for what each round-1 namespace covers and the EN fallback rule. The three round-2 namespaces (`compose`, `kudos`, `profile`) follow the same rule: every EN value is either a MoMorph-confirmed translation or a verbatim mirror of the Vietnamese string, never hand-translated — the mirrored-key list lives in `docs/test-traceability.md` § Copy gaps (round 2).

Switching locale is `setLocale()` (`src/lib/i18n/set-locale.ts`), which validates against the same `vi`/`en` allow-list before writing the cookie (1-year `maxAge`, `httpOnly: false` — required for next-intl's client-side hydration) and calling `revalidatePath`. Client Components (`language-dropdown.tsx`, `mobile-nav-drawer.tsx`) never call `setLocale` directly: they can only be handed a Server Action *reference*, not an inline closure defined inside a Server Component, so `selectLocaleAction` (`src/lib/i18n/select-locale-action.ts`, Phase 07) exists purely as that reference-shaped wrapper. It recovers the current pathname (needed for `revalidatePath`) from the `Referer` header of the action's own fetch-based invocation — falling back to `/` if that header is absent — since a Server Action invoked from a Client Component has no route param of its own.

## Countdown

`src/lib/countdown/` computes the event countdown shown on the Homepage: `parse-target.ts` parses `NEXT_PUBLIC_EVENT_START_AT` into epoch-ms and never throws (invalid/missing → `null`, rendered as already-reached); `compute-remaining.ts` derives zero-padded days/hours/minutes from the diff; `use-countdown.ts` is a client hook built on `useSyncExternalStore` with a fixed `00/00/00` server snapshot, so SSR and first client paint never disagree, ticking every 30s. `EventCountdownLive` (`src/components/homepage/event-countdown-live.tsx`, Phase 07) is the thin Client Component wrapper `hero-section.tsx` renders directly: it calls `parseTarget`/`useCountdown` itself and feeds the result into the presentational `EventCountdown`'s `remaining` prop, so `EventCountdown`'s own prop-driven unit tests keep asserting a pure render contract without a timer/env fixture. With the repo's sample `.env.example` date already in the past, the homepage renders the reached state (`coming-soon-label` hidden, tiles clamped to `00`) against the current wall clock.

## E2E session fixture

`e2e/support/seed-session.ts` seeds a real local-Supabase session (`admin.createUser` → `generateLink` → `verifyOtp`, then derives `@supabase/ssr` cookies via a real `setSession()` call) rather than faking cookies; `e2e/support/authenticated-fixture.ts` exposes it as the `authenticatedPage`/`adminPage` Playwright fixtures, each on its own browser context with a throwaway user cleaned up after the test. The Supabase service-role key this needs is read only under `e2e/support/**`, never from `src/`. `playwright.config.ts` loads it (and other local env) from `.env.local` via `dotenv`, since Playwright's Node process doesn't inherit Next's own env loading.

## Documentation layers

Two documentation layers coexist under `docs/` (v5.0.0+ layered spec model):

- **SDD-authored** (human/takumi-authored, component granularity — the project's own deliverable):
  `docs/features/` (6 features: F001–F004 round 1, F005–F006 round 2), `docs/screens/` (8 SCR:
  SCR001–SCR006 round 1, SCR007–SCR008 round 2), this file (`docs/system-architecture.md`),
  `docs/data-model.md`, `docs/code-standards.md`, `docs/development-roadmap.md`,
  `docs/project-changelog.md`, `docs/test-traceability.md`, `docs/visual-qa/`.
- **Code-derived** (rebuild-spec, route granularity, free regen): `docs/generated/*` and
  `docs/system/{overview,architecture,permissions,business-rules}.md`. Note that
  `docs/system/architecture.md` is now the code-derived diagrams-and-tech-stack doc produced by the
  Core promote — a separate file from this hand-maintained `docs/system-architecture.md`; the two
  coexist intentionally and are never merged. `docs/README.md`'s reading-order navigation is also
  generated by rebuild-spec.

**Final-checkpoint decision (2026-08-31, user-approved):** `docs/features/` and `docs/screens/` stay
SDD-authored at component granularity — that decomposition is the project deliverable. The promoted
`docs/generated/screen-list.md` counts 3 screens at route granularity instead of 6; this is an
intentional divergence between two different units of decomposition, not a defect, and is documented
in `screen-list.md`'s own preamble. `docs/features/.stale` was removed deliberately as part of this
checkpoint. That marker has since reappeared (2026-09-02): the code-derived layer (`docs/generated/*`,
`docs/system/{overview,architecture,business-rules}.md`) was re-baselined once already this same day,
then two small post-baseline product fixes landed (`site-header.tsx`/`site-footer.tsx`'s "Sun* Kudos"
link now points at `/kudos`; `submitKudos` wires `validateImages` as its first gate) — a
`/tkm:rebuild-spec --feature-specs` pass is pending for the code-derived layer, but the affected
SDD-authored specs (`docs/features/F002_NavigationShell/`, `docs/features/F005_KudosCompose/`) were
hand-reconciled to the shipped code in this same pass, so no SDD-layer content is currently stale.

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
| 2026-08-30 | Phase 07b converts the remaining Group 3 body-copy components (13) to `useTranslations`, adding `src/test-utils/render-with-intl.tsx` and `e2e/locale-body-copy.spec.ts` | Chrome + metadata were already locale-aware since Phase 07; these components' synchronous RTL tests needed a real-catalogue `NextIntlClientProvider` helper rather than converting to `async` `getTranslations`, which would have broken them |
| 2026-08-31 | `profile` RLS's `select` policy widened to `using (true)` for every `authenticated` row, replacing `profile_select_own` outright | Recipient autocomplete, `@mention` search, sender/receiver display, and the `/profile` stub all need to read any Sunner's profile; `profile` carries no sensitive column, so the widening is the whole fix (`clarifications.md` Round 2) |
| 2026-08-31 | Kudos editor content stored as `kudos.content jsonb` (TipTap document JSON), never as sanitised HTML | Supersedes the 2026-08-28 "sanitised HTML" placeholder — the Round 2 clarifications session is authoritative and ruled JSON; render-time allow-listing (`kudos-content-renderer.tsx`) does the same job an HTML sanitiser would, without an HTML intermediate |
| 2026-08-31 | Rank-promotion leaderboard is derived at read time from each Sunner's 10th/20th/50th received-kudos milestone, no new table | The Stage-1.5 spec draft assumed it would render permanently empty; `clarifications.md`'s "Suy từ mốc hoa thị" ruling predates that draft and is authoritative — implemented in `src/lib/kudos/derive/rank-promotion.ts` |
| 2026-09-02 | Self-kudos (`receiverId === senderId`) is blocked in `createKudos`, with no RLS/DB constraint backing it | Group-3 code review flagged the silent gap (hoa-thị-milestone farming risk); the checkpoint decision made blocking explicit — the Server Action is the sole enforcement point by design |
| 2026-09-02 | `storage.objects` insert policy for bucket `images` re-scoped to the caller's own `kudos/{auth.uid()}/...` folder segment | Group-3 review (High/Security): the original policy checked only `bucket_id = 'images'`, so any authenticated Sunner could upload into another Sunner's folder, defeating the app-level path convention with no RLS defense-in-depth |
