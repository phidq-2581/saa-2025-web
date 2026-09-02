<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths -->
# Behavior Logic

**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Analysis Scope**: Wave 2b (round 2, post-Kudos) — all 6 entries in
`scout-report.md` § Background Logic Source Inventory (5 JS/TS + 1 SQL/Postgres).
Extends round-1 baseline `docs/generated/behavior-logic.md` (5 BLs) with 1 new
entry (BL006, the Kudos-cluster RPC introduced this round).

**Code Format**: All codes follow `BL###_NameSlug` format.

**Behavior Logic Types** (canonical 10 — language-neutral): `scheduled-job`,
`queue-worker`, `event-listener`, `observer`, `mail`, `notification`,
`middleware`, `custom-command`, `integration`, `webhook`.

**Note**: Auth/permission middleware is NOT included — `src/proxy.ts` is
excluded per `scout-report.md`'s own note (tracked as `permission` in
`docs/system/permissions.md` instead).

**Note**: Feature and UserStory mapping is managed in FeatureList.md and
UserStories.md (W4/W5). This document lists behavior logic items only.

**Note on candidates verified and excluded this wave**: the task brief listed
10 candidate behaviors. 4 were verified in code and confirmed **not** BL —
they write only to the app's own Supabase project (datastore or storage), not
a genuine third-party integration, so they are Track B core business logic,
not background/infra logic (matches none of the 10 canonical types):
- `toggleHeart` grant/revoke + `heart-rules.ts` (`src/lib/kudos/write/toggle-heart-action.ts`,
  `heart-rules.ts`) — pure rule functions + `.from("kudos"|"heart")` queries, no external call.
- `submit-kudos` upload orchestration (`src/lib/kudos/write/submit-kudos.ts:49`) — calls
  `supabase.storage.from(IMAGES_BUCKET).upload(...)`, the app's own Storage bucket.
- Load-more pagination action (`src/components/kudos/containers/kudos-board-container.tsx:104-114`,
  inline `"use server"`) — composes the app's own read queries (`getFeedPage`, `getReceivedKudosCounts`).
- Locale-set action (`src/lib/i18n/set-locale.ts`, `select-locale-action.ts`) — cookie write only,
  no external call.

Signed-URL resolution (`src/lib/kudos/queries/resolve-image-urls.ts:27`,
`supabase.storage...createSignedUrls`) was also checked: same reasoning
(own Storage bucket) — not BL. `create_kudos` (RPC, BL006 below) **is**
included because it crosses the PostgREST RPC network boundary the scout
report already flagged, carried at LOW CONFIDENCE per that entry's own note.

---

## Cardinality Contract

Rules enforced by Wave 2b researcher and Wave 7a reviewer. Violations are critical.

- **Rule C1 — 1 BL per inventory entry**: applied — 6 inventory entries in
  `scout-report.md` (5 JS/TS + 1 SQL) → exactly 6 BL items below, 1:1, no aggregation.
- **Rule C2 — Source fields mandatory, single-valued**: every BL item below
  carries exactly one `**Source File**` and one `**Source Symbol**`, matching
  the scout inventory entry verbatim.
- **Rule C3 — Unmatched BL warning**: N/A — every BL item's Source File
  appears in `scout-report.md` § Background Logic Source Inventory.

---

## Inclusion/Exclusion Matrix (scout-side filter)

Applied at Wave 0; not re-applied here. All 6 entries below come from
`scout-report.md` § Background Logic Source Inventory, all carrying
`[SIGNAL_INFERRED]` (no per-stack row in `bl-source-patterns.md` covers plain
Next.js App Router or a same-database RPC/trigger). BL006 additionally
carries `[LOW CONFIDENCE — flagged for reviewer]` per the scout's own entry.

---

## Anti-Patterns: Aggregation Forbidden

Not applicable — no candidate for aggregation existed in the 6-entry inventory
(each entry is already one distinct file+symbol).

---

## Behavior Logic Index

| Code | Name | Type | Trigger |
|------|------|------|---------|
| BL001_GoogleOAuthSignIn | GoogleOAuthSignIn | integration | User submits the Google sign-in form on SCR005_Login |
| BL002_SignOutSession | SignOutSession | integration | POST `/auth/sign-out` (Logout button form submit) |
| BL003_OAuthCallbackExchange | OAuthCallbackExchange | webhook | GET `/auth/callback` (Google OAuth redirect) |
| BL004_EventCountdownTick | EventCountdownTick | scheduled-job | Client mount of `EventCountdownLive` on SCR001_Home; recurring 30s tick |
| BL005_ProfileProvisioningTrigger | ProfileProvisioningTrigger | observer | `after insert on auth.users` (Postgres trigger) |
| BL006_CreateKudosTransaction | CreateKudosTransaction | integration | `createKudos` Server Action calls `supabase.rpc("create_kudos", ...)` on Kudos Compose submit (SCR008_KudosCompose) |

---

## BL001_GoogleOAuthSignIn

**Type**: integration
**Trigger**: User submits the Google sign-in form on SCR005_Login (`GoogleSignInButton`'s bound Server Action)
**Payload**: N/A — not a notification/event/webhook type
**File Schema**: N/A — not a file-exchange type
**Source File**: `src/app/login/actions.ts`
**Source Symbol**: `signInWithGoogle`

### Description

`[SIGNAL_INFERRED]` — Intent matched: integration, external OAuth provider call
via the Supabase Auth SDK. No-row reason: stack = Next.js Server Action; no row
in `bl-source-patterns.md` covers this convention (closest row, NestJS, is
decorator-based and does not apply to a plain `"use server"` function).
Observed pattern: the `"use server"` action calls `supabase.auth.signInWithOAuth({
provider: "google", options: { redirectTo, queryParams: { hd: "sun-asterisk.com" } } })`,
then redirects to the returned OAuth URL, or to `/login?error=oauth_init_failed`
on failure (`src/app/login/actions.ts:34-39`).

Starts the Google OAuth handshake with an `hd` domain hint — pre-fill only,
**not** the enforcement point (see BL003 for the real domain/email gate). Must
run as a Server Action rather than inside a Server Component render:
`signInWithOAuth` persists a `code_verifier` cookie through
`src/lib/supabase/server.ts`'s write path, which silently no-ops outside an
action/route-handler context.

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

`[SIGNAL_INFERRED]` — Intent matched: integration, terminates the session via
the external Supabase Auth API. No-row reason: stack = Next.js Route Handler;
no row in the table for this convention. Observed pattern: the `POST` handler
rejects a cross-origin `Origin` header with `403` (`src/app/auth/sign-out/route.ts:29-31`),
calls `supabase.auth.signOut()`, deletes every `sb-`-prefixed cookie, then
303-redirects to `/` (`:33-43`).

Deliberately a plain Route Handler reached via a native form POST rather than
a Server Action: a Server-Action-triggered redirect is a *soft* client-side
navigation that can race the response's `Set-Cookie` header (verified
empirically — reproducibly 0/3 with the Server-Action path, restored to 3/3
only with an artificial settle delay). A `<form method="post">` triggers a
hard, full-page navigation, atomic from the browser's perspective.

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

`[SIGNAL_INFERRED]` — Intent matched: webhook, incoming callback from an
external OAuth provider redirect. No-row reason: stack = Next.js Route
Handler; no row in the table for this convention (closest row, Laravel
"controllers with webhook in name/route", is PHP/folder-convention only).
Observed pattern: the `GET` handler reads `?code=`, calls
`supabase.auth.exchangeCodeForSession(code)` (`:32`), rejects on exchange
failure (`:35-37`), then rejects again — `signOut()` + redirect
`/login?error=domain` — unless **both** `isAllowedEmail(user.email)` and
`emailVerified(user)` pass (`:39-42`); on success, redirects to
`safeNext(next)` (`:44`).

This is the actual enforcement point for the `@sun-asterisk.com`-only access
policy — the `hd` hint set by BL001 is a UI pre-fill convenience only, not a
security boundary; every account is re-checked here regardless of how the
OAuth flow was entered.

### Related Modules

- `src/lib/auth/allowed-email.ts` (`isAllowedEmail`)
- `src/lib/auth/email-verified.ts` (`emailVerified`)
- `src/lib/auth/safe-next.ts` (`safeNext`)
- `src/lib/supabase/server.ts`

### Related Routes

- (GET) /auth/callback — ROUTE001

### Related Data Models

N/A — reads `auth.users` (Supabase-managed, not an app `MODEL###` entity)

---

## BL004_EventCountdownTick

**Type**: scheduled-job
**Trigger**: Client mount of `EventCountdownLive` on SCR001_Home; recurring 30-second interval tick thereafter
**Payload**: N/A
**File Schema**: N/A
**Source File**: `src/lib/countdown/use-countdown.ts`
**Source Symbol**: `useCountdown`

### Description

`[SIGNAL_INFERRED]` — Intent matched: scheduled-job, recurring interval-based
execution pattern. No-row reason: stack = Next.js client-side React hook; no
row covers a client `setInterval` tick loop (every table row is a server-side
scheduler/cron integration). Observed pattern: `useSyncExternalStore`
subscribes via `setInterval(callback, 30_000)` (`:26-29`), recomputing
`computeRemaining()` each tick against `NEXT_PUBLIC_EVENT_START_AT` (via `parseTarget`).

Per BR-005 (`CountdownClientOnlyHydration`), `getServerSnapshot` always
returns the fixed `00/00/00` placeholder so SSR output and the client's first
hydration render never disagree — the live value only appears after the
client subscribes post-mount.

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

`[SIGNAL_INFERRED]` — Intent matched: observer, model lifecycle hook (row
created). No-row reason: stack = SQL/Postgres; no row in `bl-source-patterns.md`
covers a raw DB trigger (table only covers application-framework stacks).
Observed pattern: `create trigger on_auth_user_created after insert on
auth.users for each row execute function public.handle_new_user()`
(migration:50-52); the `security definer` function (migration:34-48) inserts
the matching `public.profile` row (`id`, `full_name`, `avatar_url`) directly
from `raw_user_meta_data`.

Runs entirely inside Postgres, independent of which application code path
produced the `auth.users` insert (currently only Google OAuth, BL001 → BL003)
— no application code writes to `profile` directly; `security definer` is
required because the calling role has no insert grant on `public.profile`
itself. Unaffected by this round's Kudos work — re-verified against the
current migration file, no drift from round-1.

### Related Modules

N/A — pure SQL trigger + function, no application module

### Related Routes

N/A

### Related Data Models

- MODEL002_Profile

---

## BL006_CreateKudosTransaction

**Type**: integration
**Trigger**: `createKudos` Server Action (`src/lib/kudos/write/create-kudos-action.ts:115`) calls `supabase.rpc("create_kudos", {...})` when a Sunner submits the Kudos Compose form (SCR008_KudosCompose)
**Payload**: N/A — not a notification/event/webhook type
**File Schema**: N/A — not a file-exchange type
**Source File**: `supabase/migrations/20260831000000_create_kudos_cluster.sql`
**Source Symbol**: `create_kudos`

### Description

`[SIGNAL_INFERRED]` `[LOW CONFIDENCE — flagged for reviewer]` — Intent
matched: integration, the closest of the 10 canonical types; the function is
exposed as a callable endpoint over Supabase's PostgREST RPC layer
(`supabase.rpc("create_kudos", ...)` from `create-kudos-action.ts:115`),
crossing the same network/API boundary a true external integration would.
No-row reason: stack = SQL/Postgres plpgsql function; no row in
`bl-source-patterns.md` covers a same-database stored procedure exposed via
REST RPC — this is a genuinely ambiguous case, not a clean fit for any of the
10 canonical types.

Observed pattern: `create function public.create_kudos(p_id, p_receiver,
p_content, p_is_anonymous, p_display_name, p_hashtag_ids, p_image_paths)
returns uuid language plpgsql security invoker` (migration:281-323) — one
transaction: insert `kudos` (migration:309-310), loop-insert `kudos_hashtag`
1-5 required (migration:301-303, 312-314), loop-insert `kudos_image` ≤5
(migration:305-307, 316-319). An unhandled `raise exception` on either bound
rolls back the whole function (all-or-nothing write) — see `data-model.md`
§ RPC Contracts for the full guard/RLS analysis; not re-derived here (DRY).
`security invoker` means the three inserts stay subject to each table's own
RLS (`kudos_insert_own`/`kudos_hashtag_insert_own`/`kudos_image_insert_own`),
so the RPC bundles the writes atomically without bypassing row-level
security. Granted `execute` to `authenticated` (migration:325).

Reviewer note (carried from scout report): unlike the JS/TS `integration`
entries (external Google identity provider), this function's only external
party is the app's own database — treat this entry as advisory/borderline
rather than a confirmed cardinality match against a genuine third-party
integration.

### Related Modules

- `src/lib/kudos/write/create-kudos-action.ts` (`createKudos` — caller, Server Action)
- `src/lib/kudos/write/validate-content.ts`, `validate-draft.ts`, `validate-image.ts` (pre-RPC validation, Track B)

### Related Routes

N/A — Server Action + RPC, not a file-system-routed HTTP path

### Related Data Models

- MODEL007_Kudos
- MODEL006_KudosHashtag
- MODEL008_KudosImage

---

## Summary

- **Total Behavior Logic Items**: 6
- **By Type**: custom-command: 0, event-listener: 0, integration: 3, mail: 0, middleware: 0, notification: 0, observer: 1, queue-worker: 0, scheduled-job: 1, webhook: 1

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md — **resolved**: `user-stories.md` (Wave 4)
  is now complete; all 6 BL### are referenced (BL001/BL003/BL005→US001, BL002→US006, BL004→US016,
  BL006→US005 — `user-stories.md` § Cross-Reference Validation).
- [x] All BL### codes are referenced in FeatureList.md — **resolved**: `feature-list.md` (Wave 5)
  is now complete; all 6 BL### are referenced (BL001,BL002,BL003,BL005→F001; BL004→F003; BL006→F005
  — `feature-list.md` § Cross-Reference Validation).
- [x] All related route references are valid (ROUTE001, ROUTE002 confirmed in `route-list.md`)
- [x] All related data model references are valid (MODEL002_Profile, MODEL007_Kudos,
  MODEL006_KudosHashtag, MODEL008_KudosImage confirmed in `data-model.md`)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields (Rule C2)
- [x] All Source File paths match scout Background Logic Source Inventory entries (Rule C2/C3)

**Cardinality Cross-Check** (against `scout-report.md`):
- Inventory total: 6 (5 JS/TS + 1 SQL/Postgres)
- Artifact BL count: 6
- Gap: 0% (PASS)
- Missing categories: none — JS/TS {integration: 2, webhook: 1, scheduled-job: 1} and
  SQL/Postgres {observer: 1, integration: 1} each have ≥1 matching BL
- Orphan files: none
- Inferred ratio: 6/6 = 100% per stack, exempt from Rule 5 (no per-stack row exists in
  `bl-source-patterns.md` for Next.js App Router or raw Postgres triggers/RPCs) — expected, not a violation
- New this round: BL006 (create_kudos RPC), carried at LOW CONFIDENCE per scout's own flag —
  reviewer should confirm the "crosses PostgREST RPC boundary" reading is accepted, or reclassify
  as Track B and drop to 5 BLs if rejected.

---

## Client-Side Logic

### Debounce / Throttle

`N/A — no debounce or throttle patterns detected.` (No `setTimeout`/`debounce`/`throttle`
wrapper found around any handler in `src/components/**`; the Kudos hashtag/recipient
autocompletes were checked and use direct filtering over already-fetched arrays, no timer.)

### Optimistic UI

`N/A — no optimistic UI patterns detected.` `src/components/kudos/containers/use-heart-toggle.ts`
was checked: it calls `toggleHeart` and awaits the result before updating local state — no
pre-response state mutation, no rollback path, so it does not match the extraction signature.

### Polling

`N/A — no polling patterns detected.` (`useCountdown`'s 30s tick, documented as
BL004_EventCountdownTick above, recomputes a local `Date` diff — it makes no network/API call, so
it does not match the Polling extraction signature of "recurring API call".)

### Upload Progress

`N/A — no upload progress patterns detected.` `src/lib/kudos/write/submit-kudos.ts` was checked:
it calls `supabase.storage.from(IMAGES_BUCKET).upload(storagePath, file)` and awaits completion —
no `onUploadProgress`/`onprogress` callback, no `uploadPercent` field surfaced to the UI.

### Realtime (WebSocket / SSE / EventSource)

`N/A — no realtime patterns detected.` (No `WebSocket`/`EventSource`/subscribe-channel usage found
anywhere in `src/**`.)

<!-- Researcher must also draft docs/system/business-rules.md (plain-language) from this artifact. See templates/business-rules-template.md. -->
