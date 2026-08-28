---
status: implemented
authored_by: takumi
created: 2026-08-28
lang: en
---

# Permissions (draft) — SAA 2025 Web

## Roles

- **anonymous** — no session; can only reach public routes.
- **member** — default role for any Sunner (`@sun-asterisk.com` Google account) on first sign-in.
- **admin** — a Sunner whose `profile.role` column is set to `admin`; how that column gets set for any specific person is undecided (out of scope this round — no admin-management screen exists yet).

`profile` is protected at the database layer, not just the app: RLS is enabled on `public.profile` with exactly one policy, `profile_select_own` (`auth.uid() = id`), granted to the `authenticated` role only — a signed-in Sunner can read exclusively their own row, never another's (`supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:17-28`). There is no insert/update/delete policy, so `role` cannot be self-promoted through the app.

**Local dev admin promotion:** `supabase/seeds/dev/promote-admin.sql` sets one developer's `profile.role` to `admin`, targeting their `@sun-asterisk.com` address. It is never auto-applied — `supabase/config.toml`'s `[db.seed].sql_paths` only globs `./seeds/common/*.sql` plus `env(SUPABASE_EXTRA_SEEDS)`, so a plain `supabase db reset` skips it; run it explicitly with `SUPABASE_EXTRA_SEEDS=./seeds/dev/promote-admin.sql supabase db reset`. Caveat discovered locally: `supabase db reset` wipes `auth.users` before seeds run, and the seed's `UPDATE` only matches an existing `auth.users` row, so a fresh reset has no admin yet to promote. Working order: reset, sign in once for real with Google (provisions `auth.users` + `profile`), then run the seed's `UPDATE` via `psql` against the now-provisioned row.

## Route Access Matrix

| Route | Access | Notes |
|-------|--------|-------|
| `/` (Homepage) | public | anonymous and signed-in visitors both see it |
| `/login` | public | redirects away if already signed in |
| `/auth/callback` | public (system route) | OAuth code-exchange endpoint, not a user-facing page; matched by the `/auth/` prefix in `proxy.ts` (`src/proxy.ts:15`), not exact equality |
| everything else (e.g. `/he-thong-giai`) | session required | any signed-in Sunner (member or admin); no route this round is admin-only |

`/` and `/login` are matched by **exact equality only** in `proxy.ts`'s `PUBLIC_ROUTES` (`src/proxy.ts:12-16`) — a `startsWith` check there would make every route public, so it must never be reintroduced. An unauthenticated visitor to a private route is redirected to `/login?next=<original-path>`; a signed-in Sunner who reaches `/login` is redirected to `/`. Both redirects carry forward any rotated session cookie via `redirectWithCookies` (`src/proxy.ts:26-30`), so a cookie rotated/cleared mid-request is never dropped by the bounce.

Codes: `PERM###` — TBD (draft), not allocated yet (machine-allocated at reconcile, per `spec-authoring-contract.md`).

## Domain rule

Only `@sun-asterisk.com` Google accounts may hold a session. Enforced server-side at the OAuth callback (email-domain check immediately after code exchange) and re-checked on every request by the route guard — never enforced client-side, and never relying on Google's `hd` sign-in hint alone (that parameter only pre-fills Google's own account picker; it does not block other domains).

The predicate itself (`isAllowedEmail`, `src/lib/auth/allowed-email.ts:24-37`) is strict by design: it requires exactly one `@` and a non-empty local part before comparing the domain case-insensitively — a malformed value like `a@b@sun-asterisk.com` or `@sun-asterisk.com` is rejected outright rather than evaluated on a trailing segment.

`isAllowedEmail` alone only proves the domain, not the identity: the OAuth callback (`src/app/auth/callback/route.ts:39-42`) rejects on **either** a non-matching domain **or** an unverified Google identity (`emailVerified()`, `src/lib/auth/email-verified.ts` — requires `user.email_confirmed_at` set AND the first identity's `identity_data.email_verified === true`), both cases ending in `signOut()` + redirect to `/login?error=domain`. The post-login `next` redirect target is never trusted as-is — it passes through `safeNext()` (`src/lib/auth/safe-next.ts`), which accepts only a single-`/`-leading same-origin path and falls back to `/` on anything protocol-relative, absolute, backslash-bearing, or carrying a raw/percent-encoded CR/LF/NUL.

## Session refresh

Every request outside the public routes above is re-validated in `proxy.ts` (Next.js 16's replacement for `middleware.ts`) via Supabase's `getClaims()` check — never `getSession()`/`getUser()` server-side (Supabase's current guidance) — not a one-time check at first load. `supabase/config.toml` currently sets `jwt_expiry = 3600` (1 hour) with refresh-token rotation enabled, so a session self-renews as long as the Sunner keeps using the site; session lifetime otherwise follows Supabase's defaults (no custom expiry policy in this round).

## Unresolved

- Whether `role = admin` is ever assigned through the product itself, or only by direct database access, is undecided — no admin-management UI is in scope this round.
