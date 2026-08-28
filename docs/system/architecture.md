---
status: implemented
authored_by: takumi
created: 2026-08-28
lang: en
---

# Architecture (draft) — SAA 2025 Web

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, styled with Tailwind CSS v4 design tokens pulled from MoMorph. Supabase (`@supabase/ssr`) provides auth and Postgres; a browser client lives in `src/lib/supabase/client.ts` and a server client in `src/lib/supabase/server.ts` (both already exist and are reused, not rebuilt). UI text is localized with `next-intl`, driven by a `NEXT_LOCALE` cookie (no locale prefix in the URL).

## Request flow — sign-in

1. A visitor on the Login screen clicks "LOGIN With Google"; a Server Action calls Supabase's `signInWithOAuth`, which returns Google's own consent URL, and the action redirects the browser there.
2. Google redirects back to Supabase's own GoTrue callback (`http://127.0.0.1:54321/auth/v1/callback` locally, fixed by the local Supabase config, not app code), which in turn redirects to the app's own callback route.
3. The app's callback route exchanges the OAuth code for a session, checks the signed-in account's email domain, and either signs the session back out (wrong domain) or lets it stand (correct domain) before redirecting onward.
4. `proxy.ts` (Next.js 16's replacement for the deprecated `middleware.ts`) re-validates every subsequent request's session via `getClaims()`, redirecting unauthenticated requests to `/login` and authenticated requests away from `/login`.

## Where the profile row is created

A Postgres trigger on `auth.users` (Supabase's own managed table) fires on every new sign-in and inserts one row into a project-owned `profile` table (`id`, `full_name`, `avatar_url`, `role` defaulted to `member`) — the callback route itself never writes to `profile` directly. This keeps profile provisioning consistent no matter which auth path (currently only Google) creates the `auth.users` row.

## ADR-style rationale

- **Why `proxy.ts` and not `middleware.ts`**: Next.js 16 renamed and deprecated `middleware.ts`; building the route guard on the deprecated file would need a rewrite before the next major version.
- **Why `getClaims()` and not `getSession()`/`getUser()`**: current Supabase guidance is to verify the JWT locally (`getClaims()`) rather than trust an unverified session object (`getSession()`) or pay a network round-trip on every guarded request (`getUser()`) — pending confirmation the method exists on the pinned `@supabase/auth-js` version (see `technical-spec.md § Unresolved Questions` for F001_GoogleOAuthLogin).
- **Why a DB trigger and not application code** for profile creation: keeps provisioning atomic with the `auth.users` insert itself and independent of which server code path handled the sign-in.

## Known repo issues to fix before this ships

- `supabase/config.toml:149` — `additional_redirect_urls` includes `https://127.0.0.1:3000`, scheme-mismatched against the actual dev server `http://localhost:3000`.
- `supabase/config.toml:309` — `skip_nonce_check = false` contradicts its own comment ("Required for local sign in with Google auth").
- `[auth.external.google]` reads `env(GOOGLE_CLIENT_ID)` / `env(GOOGLE_CLIENT_SECRET)` — real Google OAuth client credentials are an external prerequisite not yet present in this environment.
