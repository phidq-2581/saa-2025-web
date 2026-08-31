# Route List

**Project**: SAA 2025 Web
**Generated**: 2026-08-31

> **Method**: Tier2 static parse (no probe manifest). Routes inferred from
> `src/app/**` file-system convention (Next.js 16 App Router). No dynamic
> segments, no route groups produce distinct URLs (`(auth)`, `(site)` are
> organizational only). Full listing of `src/app/**`: `src/app/(auth)/layout.tsx`,
> `src/app/(auth)/login/page.tsx`, `src/app/(site)/layout.tsx`,
> `src/app/(site)/page.tsx`, `src/app/(site)/he-thong-giai/page.tsx`,
> `src/app/auth/callback/route.ts`, `src/app/auth/sign-out/route.ts`,
> `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/forbidden.tsx`,
> `src/app/providers.tsx`, `src/app/login/actions.ts`.

## Backend Routes

> **Completeness Contract:** one row per leaf route (HTTP method + concrete
> path). No dynamic-segment or resource macros exist in this codebase — every
> route handler found is a single named export in a fixed-path `route.ts`.
> Owner F### is `F001` for both rows below, per `feature-list.md:78-79`
> (F001_GoogleOAuthLogin's Related APIs/Routes).

### File: `src/app/auth/callback/route.ts`

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /auth/callback | ROUTE001 | F001 | `GET` (default export) | proxy.ts: public (prefix `/auth/`) |

### File: `src/app/auth/sign-out/route.ts`

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| POST | /auth/sign-out | ROUTE002 | F001 | `POST` (default export) | proxy.ts: public (prefix `/auth/`); same-origin `Origin` header check in-handler (403 on mismatch) |

## Frontend Routes/Pages

> Auth column reflects `src/proxy.ts` guard: `PUBLIC_ROUTES = ["/", "/login"]`
> matched by **exact equality only** (never `startsWith` — see proxy.ts
> docblock, FR-003/BR-002_PublicRouteAllowList/S1), plus a separate
> prefix-match carve-out for `/auth/`. Any other path with no authenticated
> session redirects to `/login?next=<path>`. An authenticated session hitting
> `/login` redirects to `/`.

| Path | Component | File | Route Name | Auth |
|------|-----------|------|------------|------|
| / | `Home` | `src/app/(site)/page.tsx` | home | Public (exact match) |
| /login | `LoginPage` | `src/app/(auth)/login/page.tsx` | login | Public (exact match); authed users redirected away to `/` |
| /he-thong-giai | `AwardSystemPage` | `src/app/(site)/he-thong-giai/page.tsx` | award-system | Guarded — unauthed redirects to `/login?next=/he-thong-giai` |

## Middleware

| File | Scope | Behavior |
|------|-------|----------|
| `src/proxy.ts` | matcher: all paths except `_next/static`, `_next/image`, `favicon.ico`, static image extensions (`.svg`/`.png`/`.jpg`/`.jpeg`/`.webp`/`.gif`) | Next.js 16 route guard (replaces `middleware.ts`). Re-validates session via Supabase `getClaims()` per request (never `getSession()`/`getUser()`). Unauthed + non-public path → redirect `/login?next=<pathname>`. Authed + `/login` → redirect `/`. Copies rotated/cleared session cookies onto the redirect response (`redirectWithCookies`), since `NextResponse.redirect()` builds a fresh response that does not inherit them. |

## Special Files (Error Surfaces, Not Routes)

| File | Renders For | Notes |
|------|-------------|-------|
| `src/app/not-found.tsx` | Next.js 404 boundary | Provisional — no Figma frame; design tokens only (`clarifications.md § Error state`). |
| `src/app/forbidden.tsx` | Next.js 403 boundary (`forbidden()`) | Provisional — no Figma frame. Docblock states no route in this round is admin-gated, so nothing currently calls `forbidden()`; file exists ready for the first admin-gated route. |

## Server Actions

> Not backend routes — Next.js Server Actions are POST endpoints under Next's
> internal action-invocation protocol (`Next-Action` header), not
> file-system-routed HTTP paths. Listed for completeness per Owner scope.

| Action | File | Signature | Invoked From | Notes |
|--------|------|-----------|---------------|-------|
| `signInWithGoogle` | `src/app/login/actions.ts` | `(next?: string) => Promise<never>` | `GoogleSignInButton` on `/login` (`src/app/(auth)/login/page.tsx`) | Starts Supabase Google OAuth; redirects to `/auth/callback?next=...` on success, `/login?error=oauth_init_failed` on failure. |
| `selectLocaleAction` | `src/lib/i18n/select-locale-action.ts` | `(locale: string) => Promise<void>` | Language dropdown / mobile nav drawer, wired via `site-header-container.tsx` | Thin module-level wrapper required because Client Components can only be handed a Server Action reference, not an inline closure; recovers current pathname from the `Referer` header (falls back to `/`) and delegates to `setLocale`. |
| `setLocale` | `src/lib/i18n/set-locale.ts` | `(locale: string, pathname: string) => Promise<void>` | `selectLocaleAction` (not called directly by components) | Validates `locale` against the `next-intl` allow-list (falls back to `defaultLocale`), sets the `NEXT_LOCALE` cookie (`httpOnly: false`, 1yr), then `revalidatePath(pathname)`. |

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 2 |
| Frontend Pages | 3 |
| Middleware Guards | 1 |
| Special Files (error surfaces) | 2 |
| Server Actions (non-route, informational) | 3 |
| Total (backend + frontend) | 5 |
