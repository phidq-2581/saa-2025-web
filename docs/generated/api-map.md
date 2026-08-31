# API Map

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Sources**: `route-list.md` + `behavior-logic.md`

> PERM### codes do not exist at this wave (`feature-list.md`/`permissions.md`
> not yet generated). Auth column uses the textual requirement from
> `route-list.md`'s Auth column / `src/proxy.ts` guard verbatim.

## Auth (Backend Routes — `/auth/*`)

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| GET | /auth/callback | BL003_OAuthCallbackExchange | public (`proxy.ts`: prefix-match carve-out `/auth/`) |
| POST | /auth/sign-out | BL002_SignOutSession | public (`proxy.ts`: prefix-match carve-out `/auth/`); same-origin `Origin` header check in-handler (403 on mismatch) |

2 rows.

## Pages (Frontend Routes)

> Method is inferred as GET (standard Next.js App Router page render) — not
> stated explicitly in `route-list.md`'s Frontend Routes/Pages table, which
> lists Path/Component/File/Route Name/Auth only, no HTTP method column.

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| GET | / | BL004_EventCountdownTick | public (`proxy.ts`: exact-match `PUBLIC_ROUTES`) |
| GET | /login | BL001_GoogleOAuthSignIn | public (`proxy.ts`: exact-match `PUBLIC_ROUTES`); authed session redirected to `/` |
| GET | /he-thong-giai | [UNMAPPED] | guarded — `proxy.ts` redirects unauthed to `/login?next=/he-thong-giai` |

Notes:
- `/` — BL004_EventCountdownTick runs client-side on this page (trigger:
  "Client mount of `EventCountdownLive` on SCR001_Home"); BL004 itself has no
  HTTP route (client-only), mapped here because it genuinely runs on `/`.
- `/login` — BL001_GoogleOAuthSignIn's trigger is "User submits the Google
  sign-in form on SCR002_Login"; BL001 is a Server Action (not an HTTP route
  itself — see Server Actions section below) invoked from this page.
- `/he-thong-giai` — no BL entry references this route; genuinely unmapped
  (award-system screen is presentational only at this wave).

3 rows.

## Server Actions (not HTTP routes — informational, per `route-list.md`)

| Action | File | Invoked From | BL### |
|--------|------|---------------|-------|
| `signInWithGoogle` | `src/app/login/actions.ts` | `GoogleSignInButton` on `/login` | BL001_GoogleOAuthSignIn |
| `selectLocaleAction` | `src/lib/i18n/select-locale-action.ts` | Language dropdown / mobile nav drawer (`site-header-container.tsx`) | [UNMAPPED] |
| `setLocale` | `src/lib/i18n/set-locale.ts` | `selectLocaleAction` | [UNMAPPED] |

3 rows.

**Status:** DONE
**Row counts:** Auth 2, Pages 3, Server Actions 3 (total 8 rows across 3 tables)
**Line count:** 56
