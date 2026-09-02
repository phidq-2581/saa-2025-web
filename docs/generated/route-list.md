# Route List

**Project**: SAA 2025 Web
**Generated**: 2026-09-02

> **Method**: Wave 1 static-source synthesis. No Wave-0.4 bootability-probe
> sidecar this run — probe skipped, reason: "all routes exercised live by the
> 92-test Playwright suite this same day (guard redirects, dynamic params,
> route handlers)." Every row below is derived by reading the route file
> itself (`page.tsx` / `route.ts` / `layout.tsx`) plus `src/proxy.ts`, not
> from the probe manifest or scout-report's summary table alone. Baseline:
> `docs/generated/route-list.md` (round 1, 2026-08-31, 5 routes) — extended
> here with the 3 Kudos-round routes (`/kudos`, `/kudos/[id]`, `/profile`)
> and re-verified against current source for the 5 carried-over rows.

## Backend Routes

> **Completeness Contract:** one row per leaf route (HTTP method + concrete
> path). No dynamic segments or resource macros exist in this codebase —
> both handlers below are single named exports in a fixed-path `route.ts`.
>
> **Owner F### note (resolved):** `feature-list.md` (Wave 5) now exists and is
> canonical. `F001_GoogleOAuthLogin`'s "Related APIs/Routes" lists both
> backend routes explicitly (`feature-list.md:104-105`, `(GET) /auth/callback`
> and `(POST) /auth/sign-out`), confirming round-1's `F001` tagging still
> holds after the full re-baseline. Owner F### is backfilled in each row
> below from that mapping, not guessed.

### File: `src/app/auth/callback/route.ts`

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | `/auth/callback` | ROUTE001 | F001 | `GET` (named export) | `proxy.ts`: public (`/auth/` prefix match) |

Query params (URL search params, not path segments): `code` (required — missing → redirect `/login?error=missing_code`), `next` (optional — passed through `safeNext(next)` before use as the post-login redirect target, never used raw). Exchanges the OAuth `code` for a session via `supabase.auth.exchangeCodeForSession`; rejects on non-`sun-asterisk.com` domain or unverified email (`signOut()` + redirect `/login?error=domain`); any exchange failure redirects `/login?error=exchange_failed`.

### File: `src/app/auth/sign-out/route.ts`

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| POST | `/auth/sign-out` | ROUTE002 | F001 | `POST` (named export) | `proxy.ts`: public (`/auth/` prefix match); in-handler same-origin `Origin` header check (403 JSON `{error:"invalid_origin"}` on cross-origin mismatch, missing header tolerated) |

No query params. Clears `sb-`-prefixed cookies, calls `supabase.auth.signOut()`, then 303-redirects to `/` (303, not the 307 default, so the browser follows with GET rather than re-POSTing the form body). Invoked via a plain `<form method="post">` in `account-menu.tsx`, not a Server Action — see file docblock for the race-condition rationale (a Server Action's `redirect()` is a soft client nav that lost a cookie-timing race 0/3 in testing).

## Frontend Routes/Pages

> Auth column reflects `src/proxy.ts`'s guard (re-read this session,
> unchanged from round 1): `PUBLIC_ROUTES = ["/", "/login"]` matched by
> **exact equality only**, plus a separate `pathname.startsWith("/auth/")`
> prefix-match carve-out. Any other path with no authenticated session
> (`getClaims()` fails) redirects to `/login?next=<path>`; an authenticated
> session hitting `/login` redirects to `/`. Route groups `(auth)`/`(site)`
> are organizational only — neither appears in the URL.

> **Owner F### column (added, resolved against `feature-list.md`):** frontend pages have no `Code`
> column (round-1 convention — pages aren't backend-callable interfaces), but `feature-list.md`'s
> Cross-Reference Validation maps every one to a feature: "`/login`→F001; `/`→F003;
> `/he-thong-giai`→F004; `/kudos`,`/kudos/[id]`,`/profile`→F006" (`feature-list.md:416-417`).

| Path | Component | File | Route Name | Method | Params | SearchParams | Auth | Owner F### |
|------|-----------|------|------------|--------|--------|--------------|------|------------|
| `/` | `Home` | `src/app/(site)/page.tsx` | home | GET | — | — | Public (exact match) | F003 |
| `/login` | `LoginPage` | `src/app/(auth)/login/page.tsx` | login | GET | — | `error?` (OAuth-failure banner code), `next?` (post-login redirect target, threaded into `signInWithGoogle`) | Public (exact match); authenticated session → redirected to `/` | F001 |
| `/he-thong-giai` | `AwardSystemPage` | `src/app/(site)/he-thong-giai/page.tsx` | award-system | GET | — | — | Guarded — unauthenticated → `/login?next=/he-thong-giai` | F004 |
| `/kudos` | `KudosBoardPage` | `src/app/(site)/kudos/page.tsx` | kudos-board | GET | — | `hashtag?` (hashtag id filter), `department?` (department name filter) — first array value only if repeated; both feed one shared feed+highlight re-fetch | Guarded — unauthenticated → `/login?next=/kudos` | F006 |
| `/kudos/[id]` | `KudosDetailPage` | `src/app/(site)/kudos/[id]/page.tsx` | kudos-detail | GET | `id` (dynamic segment, string; kudos row id) | — | Guarded — unauthenticated → `/login?next=/kudos/{id}` | F006 |
| `/profile` | `ProfilePage` | `src/app/(site)/profile/page.tsx` | profile | GET | — | `id?` (viewed profile's uuid; missing/unresolved → stub renders with `profile: null`, no own-profile fallback this round) | Guarded — unauthenticated → `/login?next=/profile` | F006 |

## Layouts / Route Groups

| File | Scope | Renders |
|------|-------|---------|
| `src/app/layout.tsx` | root, both groups | `<html>`/`<body>` shell only, `AppProviders` (next-intl); no header/footer/FAB |
| `src/app/(site)/layout.tsx` | `(site)` group — `/`, `/he-thong-giai`, `/kudos`, `/kudos/[id]`, `/profile` | `SiteHeaderContainer`, `{children}`, `SiteFooter`, `FabWidgetContainer` |
| `src/app/(auth)/layout.tsx` | `(auth)` group — `/login` | `LoginHeader` (own locale dropdown, wired to `selectLocaleAction`), `{children}`, `LoginFooter` — no site header/footer/FAB |

Route groups do not appear in the URL; `/` still resolves through `(site)/page.tsx`.

## Middleware

| File | Scope | Behavior |
|------|-------|----------|
| `src/proxy.ts` | matcher: all paths except `_next/static`, `_next/image`, `favicon.ico`, static image extensions (`.svg`/`.png`/`.jpg`/`.jpeg`/`.webp`/`.gif`) | Next.js 16 route guard (`middleware.ts` replacement). Re-validates every request via Supabase `getClaims()` (never `getSession()`/`getUser()`). Unauthenticated + non-public path → redirect `/login?next=<pathname>`. Authenticated + `/login` → redirect `/`. Rotated/cleared session cookies are copied onto the redirect response (`redirectWithCookies`) since `NextResponse.redirect()` builds a fresh response that doesn't inherit them. |

## Special Files (Error Surfaces, Not Routes)

| File | Renders For | Notes |
|------|-------------|-------|
| `src/app/not-found.tsx` | Next.js 404 boundary | Provisional — no Figma frame, design tokens only. Localized (`common.notFound.*`). |
| `src/app/forbidden.tsx` | Next.js 403 boundary (`forbidden()`) | Provisional — no Figma frame. Still unwired this round: no route calls `forbidden()` (`profile.role` exists at schema level but no route guard or RLS policy reads it yet — scout-report flags this as an open reviewer gap). |

## Server Actions

> Not backend routes — Next.js Server Actions are POST endpoints under
> Next's internal action-invocation protocol (`Next-Action` header), not
> file-system-routed HTTP paths. Listed for completeness.

| Action | File | Signature | Invoked From | Notes |
|--------|------|-----------|---------------|-------|
| `signInWithGoogle` | `src/app/login/actions.ts` | `(next?: string) => Promise<never>` | `GoogleSignInButton` on `/login` | Starts Supabase Google OAuth (`hd: sun-asterisk.com` hint); redirects to `/auth/callback?next=...` on success, `/login?error=oauth_init_failed` on failure. |
| `selectLocaleAction` | `src/lib/i18n/select-locale-action.ts` | `(locale: string) => Promise<void>` | Language dropdown / mobile nav drawer (`site-header-container.tsx`); also `(auth)/layout.tsx`'s `LoginHeader` (Phase 08 fix) | Thin wrapper — Client Components can only be handed a Server Action reference, not an inline closure. Recovers current pathname from the `Referer` header (falls back to `/`), delegates to `setLocale`. |
| `setLocale` | `src/lib/i18n/set-locale.ts` | `(locale: string, pathname: string) => Promise<void>` | `selectLocaleAction` only | Validates `locale` against the next-intl allow-list, sets `NEXT_LOCALE` cookie (`httpOnly: false`, 1yr), `revalidatePath(pathname)`. |
| `createKudos` | `src/lib/kudos/write/create-kudos-action.ts` | `(input: CreateKudosInput) => Promise<CreateKudosResult>` | Kudos Compose dialog submit (`kudos-compose-dialog.tsx` → `compose-dialog-container.tsx`) | Runtime-validates the full input shape (network boundary, not just the TS type), blocks self-kudos, re-validates draft content + storage-path ownership server-side, calls the `create_kudos` RPC (one transaction: `kudos`+`kudos_hashtag`+`kudos_image`), `revalidatePath("/kudos")`. |
| `toggleHeart` | `src/lib/kudos/write/toggle-heart-action.ts` | `(kudosId: string) => Promise<ToggleHeartResult>` | Heart button (`heart-button.tsx` → `use-heart-toggle.ts`) | Blocks self-heart (sender check + RLS backstop), atomic delete-and-return on un-heart (race-safe), computes `grantedAmount` server-side via `heart-rules.ts` (special-day bonus), `revalidatePath("/kudos")`. |
| `loadMoreFeedAction` (inline) | `src/components/kudos/containers/kudos-board-container.tsx:104-117` | `(params: { offset: number; hashtagId: string \| null; department: string \| null }) => Promise<SampleFeedPage>` | `KudosFeedContainer`'s "load more" (passed down as a prop, not imported — avoids a circular import; the server-only Supabase client can't be imported into the "use client" feed container) | Inline `"use server"` function declared inside the `/kudos` Server Component module — not a named-export route or file of its own. |

## Notes

- No new backend Route Handlers this round — `/auth/callback` and
  `/auth/sign-out` are unchanged from round 1 (re-verified against current
  source, not carried over blind).
- 3 new frontend pages this round: `/kudos`, `/kudos/[id]`, `/profile` — all
  in the `(site)` route group, all guarded (absent from `PUBLIC_ROUTES`), per
  `scout-report.md` § Routing.
- Owner F### backfilled from `feature-list.md` (Wave 5, now complete) — see
  the Backend Routes and Frontend Routes/Pages section notes above.
- `src/app/forbidden.tsx` remains unwired: no route in this round is
  admin-gated (`profile.role` has no enforcing RLS policy or route guard
  yet) — carried forward from round 1 as an open reviewer flag, not resolved
  this wave.
- Kudos Compose has no route of its own — it's a modal
  (`kudos-compose-dialog.tsx`) opened via the FAB/compose-pill on `/kudos`,
  not a `page.tsx`. Belongs in `screen-list.md` (sibling artifact), not here.

## Summary

| Category | Count |
|----------|-------|
| Backend Routes (Route Handlers) | 2 |
| Frontend Pages | 6 |
| Layouts / Route Groups | 3 |
| Middleware Guards | 1 |
| Special Files (error surfaces, not routes) | 2 |
| Server Actions (non-route, informational) | 6 |
| **Total addressable routes (backend + frontend)** | **8** |
