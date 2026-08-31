<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Behavior Logic

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 2 — all entries in `_scout-bl-inventory.md` § Background Logic Source Inventory (4 JS/TS + 1 SQL/Postgres)

**Code Format**: All codes follow `BL###_NameSlug` format.

**Behavior Logic Types** (canonical 10 — language-neutral): `scheduled-job`, `queue-worker`, `event-listener`, `observer`, `mail`, `notification`, `middleware`, `custom-command`, `integration`, `webhook`.

**Note**: Auth/permission middleware is NOT included — `src/proxy.ts` is excluded here per `_scout-bl-inventory.md`'s own note (tracked as `permission` in the File Inventory / `docs/system/permissions.md` instead).

**Note**: Feature and UserStory mapping is managed in FeatureList.md and UserStories.md (both generated at W4/W5 — see feature-list.md § Cross-Reference Validation). This document lists behavior logic items; the F###/US### attributions live in those artifacts.

**[STACK_LIST_MISSING] advisory**: per `screen-list.md`'s note, the multi-stack union procedure could not run in full comma-list form; the JS/TS and SQL/Postgres subsections below were built directly from `_scout-bl-inventory.md`'s own explicit per-stack split, which already separates the two stacks correctly — the advisory has no practical effect here since the scout inventory already did the stack separation.

---

## Cardinality Contract

Rules enforced by Wave 2b researcher and Wave 7a reviewer. Violations are critical.

- **Rule C1 — 1 BL per inventory entry**: applied — 5 inventory entries in `_scout-bl-inventory.md` (4 JS/TS + 1 SQL) → exactly 5 BL items below, 1:1, no aggregation.
- **Rule C2 — Source fields mandatory, single-valued**: every BL item below carries exactly one `**Source File**` and one `**Source Symbol**`, matching the scout inventory entry verbatim.
- **Rule C3 — Unmatched BL warning**: N/A — every BL item's Source File appears in `_scout-bl-inventory.md`.

---

## Inclusion/Exclusion Matrix (scout-side filter)

Applied at Wave 0; not re-applied here. All 5 entries below come from `_scout-bl-inventory.md` § Background Logic Source Inventory, all carrying `[SIGNAL_INFERRED]` (no per-stack row in `bl-source-patterns.md` covers plain Next.js App Router or a raw Postgres trigger — see each item's justification).

---

## Anti-Patterns: Aggregation Forbidden

Not applicable — no candidate for aggregation existed in the 5-entry inventory (each entry is already one distinct file+symbol).

---

## Behavior Logic Index

| Code | Name | Type | Trigger |
|------|------|------|---------|
| BL001_GoogleOAuthSignIn | GoogleOAuthSignIn | integration | User submits the Google sign-in form on SCR002_Login |
| BL002_SignOutSession | SignOutSession | integration | POST `/auth/sign-out` (Logout button form submit) |
| BL003_OAuthCallbackExchange | OAuthCallbackExchange | webhook | GET `/auth/callback` (Google OAuth redirect) |
| BL004_EventCountdownTick | EventCountdownTick | scheduled-job | Client mount of `EventCountdownLive` on SCR001_Home; recurring 30s tick |
| BL005_ProfileProvisioningTrigger | ProfileProvisioningTrigger | observer | `after insert on auth.users` (Postgres trigger) |

---

## BL001_GoogleOAuthSignIn

**Type**: integration
**Trigger**: User submits the Google sign-in form on SCR002_Login (`GoogleSignInButton`'s bound Server Action)
**Payload**: N/A — not a notification/event/webhook type
**File Schema**: N/A — not a file-exchange type
**Source File**: `src/app/login/actions.ts`
**Source Symbol**: `signInWithGoogle`

### Description

`[SIGNAL_INFERRED]` — Intent matched: integration, external OAuth provider call via the Supabase Auth SDK. No-row reason: stack = Next.js Server Action; no row in `bl-source-patterns.md` covers this convention (the closest row, NestJS, is decorator-based and does not apply to a plain `"use server"` function). Observed pattern: the `"use server"` action calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, queryParams: { hd: "sun-asterisk.com" } } })`, then redirects to the returned OAuth URL (or to `/login?error=oauth_init_failed` on failure, `src/app/login/actions.ts:34-39`).

Starts the Google OAuth handshake with an `hd` domain hint — pre-fill only, **not** the enforcement point (see BL003 for the real domain/email gate). Must run as a Server Action rather than inside a Server Component render: `signInWithOAuth` persists a `code_verifier` cookie through `src/lib/supabase/server.ts`'s write path, which silently no-ops outside an action/route-handler context.

### Related Modules

- `src/lib/supabase/server.ts` (`createClient`)
- `src/components/login/google-sign-in-button.tsx` (caller — binds `next` via `action.bind(null, next)`)

### Related Routes

N/A — Server Action, not a file-system-routed HTTP path (see `route-list.md` § Server Actions)

### Related Data Models

N/A

---

## BL002_SignOutSession

**Type**: integration
**Trigger**: POST `/auth/sign-out` (plain `<form method="post">` submit from `AccountMenu`'s Logout button)
**Payload**: N/A
**File Schema**: N/A
**Source File**: `src/app/auth/sign-out/route.ts`
**Source Symbol**: `POST`

### Description

`[SIGNAL_INFERRED]` — Intent matched: integration, terminates the session via the external Supabase Auth API. No-row reason: stack = Next.js Route Handler; no row in the table for this convention. Observed pattern: the `POST` handler rejects a cross-origin `Origin` header with `403` (`src/app/auth/sign-out/route.ts:29-31`), calls `supabase.auth.signOut()`, deletes every `sb-`-prefixed cookie, then 303-redirects to `/` (`:33-43`).

Deliberately a plain Route Handler reached via a native form POST rather than a Server Action: a Server-Action-triggered redirect is a *soft* client-side navigation that can race the response's `Set-Cookie` header (verified empirically — reproducibly 0/3 with the Server-Action path, restored to 3/3 only with an artificial settle delay). A `<form method="post">` triggers a hard, full-page navigation, atomic from the browser's perspective.

### Related Modules

- `src/lib/supabase/server.ts`
- `src/components/layout/account-menu.tsx` (caller)

### Related Routes

- (POST) /auth/sign-out — ROUTE002

### Related Data Models

N/A

---

## BL003_OAuthCallbackExchange

**Type**: webhook
**Trigger**: GET `/auth/callback?code=...&next=...` (incoming redirect from Google via Supabase Auth after OAuth consent)
**Payload**: query params — `code` (OAuth authorization code, required), `next` (post-login redirect target, optional, re-validated by `safeNext()` before use)
**File Schema**: N/A
**Source File**: `src/app/auth/callback/route.ts`
**Source Symbol**: `GET`

### Description

`[SIGNAL_INFERRED]` — Intent matched: webhook, incoming callback from an external OAuth provider redirect. No-row reason: stack = Next.js Route Handler; no row in the table for this convention (the closest row, Laravel "controllers with webhook in name/route", is PHP/folder-convention only). Observed pattern: the `GET` handler reads `?code=`, calls `supabase.auth.exchangeCodeForSession(code)` (`:31-32`), then rejects — `signOut()` + redirect `/login?error=domain` — unless **both** `isAllowedEmail(user.email)` and `emailVerified(user)` pass (`:39-42`); on success, redirects to `safeNext(next)` (`:44`).

This is the actual enforcement point for the `@sun-asterisk.com`-only access policy — the `hd` hint set by BL001 is a UI pre-fill convenience only, not a security boundary; every account is re-checked here regardless of how the OAuth flow was entered.

### Related Modules

- `src/lib/auth/allowed-email.ts` (`isAllowedEmail`)
- `src/lib/auth/email-verified.ts` (`emailVerified`)
- `src/lib/auth/safe-next.ts` (`safeNext`)
- `src/lib/supabase/server.ts`

### Related Routes

- (GET) /auth/callback — ROUTE001

### Related Data Models

N/A — reads `auth.users` (Supabase-managed, not an app `MODEL###` entity; see `data-model.md` § External reference: auth.users)

---

## BL004_EventCountdownTick

**Type**: scheduled-job
**Trigger**: Client mount of `EventCountdownLive` on SCR001_Home; recurring 30-second interval tick thereafter
**Payload**: N/A
**File Schema**: N/A
**Source File**: `src/lib/countdown/use-countdown.ts`
**Source Symbol**: `useCountdown`

### Description

`[SIGNAL_INFERRED]` — Intent matched: scheduled-job, recurring interval-based execution pattern. No-row reason: stack = Next.js client-side React hook; no row covers a client `setInterval` tick loop (every table row is a server-side scheduler/cron integration). Observed pattern: `useSyncExternalStore` subscribes via `setInterval(callback, 30_000)` (`:26-29`), recomputing `computeRemaining()` each tick against `NEXT_PUBLIC_EVENT_START_AT` (via `parseTarget`).

Per BR-005 (`CountdownClientOnlyHydration`), `getServerSnapshot` always returns the fixed `00/00/00` placeholder so SSR output and the client's first hydration render never disagree — the live value only appears after the client subscribes post-mount.

### Related Modules

- `src/lib/countdown/compute-remaining.ts`
- `src/lib/countdown/parse-target.ts`
- `src/components/homepage/event-countdown-live.tsx`
- `src/components/homepage/event-countdown.tsx`

### Related Routes

N/A — client-side only, no HTTP route

### Related Data Models

N/A

---

## BL005_ProfileProvisioningTrigger

**Type**: observer
**Trigger**: `after insert on auth.users` (Postgres trigger, fires on every new Supabase Auth account regardless of which auth path created it)
**Payload**: N/A
**File Schema**: N/A
**Source File**: `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql`
**Source Symbol**: `handle_new_user`

### Description

`[SIGNAL_INFERRED]` — Intent matched: observer, model lifecycle hook (row created). No-row reason: stack = SQL/Postgres; no row in `bl-source-patterns.md` covers a raw DB trigger (the table only covers application-framework stacks). Observed pattern: `create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user()` (migration:50-52); the `security definer` function (migration:34-48) inserts the matching `public.profile` row (`id`, `full_name`, `avatar_url`) directly from `raw_user_meta_data`.

Runs entirely inside Postgres, independent of which application code path produced the `auth.users` insert (currently only Google OAuth, BL001 → BL003) — no application code writes to `profile` directly; `security definer` is required because the calling role has no insert grant on `public.profile` itself.

### Related Modules

N/A — pure SQL trigger + function, no application module

### Related Routes

N/A

### Related Data Models

- MODEL001_Profile

---

## Summary

- **Total Behavior Logic Items**: 5
- **By Type**: custom-command: 0, event-listener: 0, integration: 2, mail: 0, middleware: 0, notification: 0, observer: 1, queue-worker: 0, scheduled-job: 1, webhook: 1

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md — no `system`-typed US exist, but all 5 BL### are cited as Background Logic under `ui`-typed US (`user-stories.md` § Cross-Reference Validation: BL001/BL003/BL005→US001; BL002→US002; BL004→US008)
- [x] All BL### codes are referenced in FeatureList.md — confirmed no orphans (`feature-list.md` § Cross-Reference Validation: BL001,BL002,BL003,BL005→F001; BL004→F003)
- [x] All related route references are valid (ROUTE001, ROUTE002 confirmed in `route-list.md`)
- [x] All related data model references are valid (MODEL001_Profile confirmed in `data-model.md`)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields (Rule C2)
- [x] All Source File paths match scout Background Logic Source Inventory entries (Rule C2/C3)

**Cardinality Cross-Check** (against `_scout-bl-inventory.md`):
- Inventory total: 5 (4 JS/TS + 1 SQL/Postgres)
- Artifact BL count: 5
- Gap: 0% (PASS)
- Missing categories: none — JS/TS {integration: 2, webhook: 1, scheduled-job: 1} and SQL/Postgres {observer: 1} each have ≥1 matching BL
- Orphan files: none
- Inferred ratio: 5/5 = 100% per stack, but both JS/TS-App-Router and SQL/Postgres-trigger are **exempt** from Rule 5 (neither has a row in `bl-source-patterns.md`'s per-stack table) — 100% inferred is expected, not a violation

---

## Client-Side Logic

### Debounce / Throttle

`N/A — no debounce or throttle patterns detected.` (No `setTimeout`/`debounce`/`throttle` wrapper found around any handler in `src/components/**`.)

### Optimistic UI

`N/A — no optimistic UI patterns detected.`

### Polling

`N/A — no polling patterns detected.` (`useCountdown`'s 30s tick, documented as BL004_EventCountdownTick above, recomputes a local `Date` diff — it makes no network/API call, so it does not match the Polling extraction signature of "recurring API call".)

### Upload Progress

`N/A — no upload progress patterns detected.`

### Realtime (WebSocket / SSE / EventSource)

`N/A — no realtime patterns detected.` (No `WebSocket`/`EventSource`/subscribe-channel usage found anywhere in `src/**`.)
