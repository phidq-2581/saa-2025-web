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
| `/auth/callback` | public (system route) | OAuth code-exchange endpoint, not a user-facing page |
| everything else (e.g. `/he-thong-giai`) | session required | any signed-in Sunner (member or admin); no route this round is admin-only |

Codes: `PERM###` — TBD (draft), not allocated yet (machine-allocated at reconcile, per `spec-authoring-contract.md`).

## Domain rule

Only `@sun-asterisk.com` Google accounts may hold a session. Enforced server-side at the OAuth callback (email-domain check immediately after code exchange) and re-checked on every request by the route guard — never enforced client-side, and never relying on Google's `hd` sign-in hint alone (that parameter only pre-fills Google's own account picker; it does not block other domains).

The predicate itself (`isAllowedEmail`, `src/lib/auth/allowed-email.ts:24-37`) is strict by design: it requires exactly one `@` and a non-empty local part before comparing the domain case-insensitively — a malformed value like `a@b@sun-asterisk.com` or `@sun-asterisk.com` is rejected outright rather than evaluated on a trailing segment.

## Session refresh

Every request outside the public routes above is re-validated in `proxy.ts` (Next.js 16's replacement for `middleware.ts`) via Supabase's `getClaims()` check, not a one-time check at first load. `supabase/config.toml` currently sets `jwt_expiry = 3600` (1 hour) with refresh-token rotation enabled, so a session self-renews as long as the Sunner keeps using the site.

## Unresolved

- Whether `role = admin` is ever assigned through the product itself, or only by direct database access, is undecided — no admin-management UI is in scope this round.
