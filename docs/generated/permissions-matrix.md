# Permissions Matrix

**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Analysis Scope**: Wave 3 — extends round-1's `docs/generated/permissions-matrix.md`
(PERM001–009, 2026-08-31) with the Kudos-round authorization surface: `public.profile`
select widened to all-authenticated, full Kudos-cluster RLS (`kudos`, `kudos_image`,
`kudos_hashtag`, `heart`), read-only reference-data RLS (`department`, `hashtag`,
`special_days`, `secret_box_gift`), `kudos_card_view` security-invoker visibility,
`storage.objects` `images`-bucket policies (incl. the 2026-09-02 path-scoping
hardening), route-guard coverage for `/kudos`, `/kudos/[id]`, `/profile`, and the two
Kudos Server Actions' identity/self-action/amount-integrity gates
(`create-kudos-action.ts`, `toggle-heart-action.ts`).

> **Raw PERM### matrix.** Machine-generated inventory of every permission item with
> full per-permission detail, staged in `artifacts/` for this rebuild-spec session.
> A plain-language curated view derives from this file at promotion time (destination:
> `docs/system/permissions.md`, per `permissions-template.md`). Write this file first.

**Code Format**: All codes follow `PERM###_NameSlug`.

**Actors in this system**: `guest` (no session), `member` (authenticated,
`profile.role = 'member'`, DISC-001 `data-model.md:127-129`), `admin` (authenticated,
`profile.role = 'admin'`), `system` (the `security definer` `handle_new_user()` DB
trigger only — PERM005; **not** the `create_kudos` RPC, which runs `security invoker`
as the calling authenticated user, so it introduces no second elevated-rights actor).
DISC-001 `role` remains unenforced beyond PERM007's UI-only Dashboard gate — no new
admin-only surface shipped this round either; every Kudos read/write gate below applies
identically to `member` and `admin`.

---

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_PrivateRouteAuthGuard | PrivateRouteAuthGuard | route-guard | `src/proxy.ts:64-70` |
| PERM002_AuthedLoginRouteRedirect | AuthedLoginRouteRedirect | route-guard | `src/proxy.ts:72-77` |
| PERM003_SunAsteriskDomainSignInGate | SunAsteriskDomainSignInGate | route-guard | `src/app/auth/callback/route.ts:39-42` |
| PERM004_ProfileSelectAllAuthenticatedRLS | ProfileSelectAllAuthenticatedRLS | data-permission | `supabase/migrations/20260831000100_widen_profile_select.sql:10-16` |
| PERM005_ProfileWriteRestrictedToSystemTrigger | ProfileWriteRestrictedToSystemTrigger | data-permission | `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:17-21,34-52` |
| PERM006_SignOutOriginCheck | SignOutOriginCheck | route-guard | `src/app/auth/sign-out/route.ts:26-31` |
| PERM007_AccountMenuDashboardVisibility | AccountMenuDashboardVisibility | screen-permission | `src/components/layout/account-menu.tsx:82-90` |
| PERM008_FabWidgetAuthenticatedVisibility | FabWidgetAuthenticatedVisibility | screen-permission | `src/components/layout/fab-widget-container.tsx:10-13` |
| PERM009_HeaderAuthedVariant | HeaderAuthedVariant | screen-permission | `src/components/layout/site-header-container.tsx:24-36` |
| PERM010_KudosSelectAllInsertOwnRLS | KudosSelectAllInsertOwnRLS | resource-ownership | `supabase/migrations/20260831000000_create_kudos_cluster.sql:64-76` |
| PERM011_KudosImageAndHashtagInsertOwnRLS | KudosImageAndHashtagInsertOwnRLS | resource-ownership | `supabase/migrations/20260831000000_create_kudos_cluster.sql:93-110,124-141` |
| PERM012_HeartSelectInsertNotSelfDeleteOwnRLS | HeartSelectInsertNotSelfDeleteOwnRLS | resource-ownership | `supabase/migrations/20260831000000_create_kudos_cluster.sql:159-182` |
| PERM013_SeedReferenceDataReadOnlyRLS | SeedReferenceDataReadOnlyRLS | data-permission | `supabase/migrations/20260831000000_create_kudos_cluster.sql:18-24,39-45,194-200,217-223` |
| PERM014_KudosCardViewSecurityInvokerVisibility | KudosCardViewSecurityInvokerVisibility | data-permission | `supabase/migrations/20260831000000_create_kudos_cluster.sql:226-272` |
| PERM015_StorageImagesBucketScopedInsertRLS | StorageImagesBucketScopedInsertRLS | resource-ownership | `supabase/migrations/20260902000000_scope_images_insert_policy.sql:22-32` |
| PERM016_CreateKudosIdentityAndSelfBlockGuard | CreateKudosIdentityAndSelfBlockGuard | action-permission | `src/lib/kudos/write/create-kudos-action.ts:78-92` |
| PERM017_ToggleHeartIdentitySelfBlockAmountIntegrityGuard | ToggleHeartIdentitySelfBlockAmountIntegrityGuard | action-permission | `src/lib/kudos/write/toggle-heart-action.ts:36-58,100-111` |

---

## PERM001_PrivateRouteAuthGuard

**Type**: route-guard
**Enforced At**: `src/proxy.ts:64-70`

### Description

Next.js 16's route guard (`proxy.ts`) calls `supabase.auth.getClaims()` on every
matched request. `isPublicRoute()` (`:14-16`) allows exactly `/` and `/login`
(equality only — the file's own docblock `:4-11` forbids reintroducing a `startsWith`
match) plus any `/auth/`-prefixed path. Unauthenticated + non-public → redirect to
`/login?next=<pathname>`, with `redirectWithCookies()` (`:26-30`) carrying any
rotated/cleared session cookie onto the redirect. **Default-deny allow-list — applies
to any future non-public path**, which is what covers the three Kudos-round routes
below without any code change to this gate (`route-list.md`: "3 new frontend pages
this round … all guarded (absent from `PUBLIC_ROUTES`)").

### Related Routes

- (GET) `/he-thong-giai` — round-1
- (GET) `/kudos` — round-2, `route-list.md:65`
- (GET) `/kudos/[id]` — round-2, `route-list.md:66`
- (GET) `/profile` — round-2, `route-list.md:67`

### Related Screens

- SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | redirected to `/login?next=<original pathname>` |
| member | ✓ | - |
| admin | ✓ | - |

### Related Modules

- `src/proxy.ts`

---

## PERM002_AuthedLoginRouteRedirect

**Type**: route-guard
**Enforced At**: `src/proxy.ts:72-77`

### Description

Unchanged this round (re-verified). When `getClaims()` resolves a session and
pathname is exactly `/login`, redirect to `/` before `SCR005_Login` renders.

### Related Routes

- (GET) `/login`

### Related Screens

- SCR005_Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✓ | - |
| member | ✗ | redirected to `/` |
| admin | ✗ | redirected to `/` |

### Related Modules

- `src/proxy.ts`

---

## PERM003_SunAsteriskDomainSignInGate

**Type**: route-guard
**Enforced At**: `src/app/auth/callback/route.ts:39-42`

### Description

Unchanged this round (re-verified). After `exchangeCodeForSession`, rejects unless
`isAllowedEmail()` (`sun-asterisk.com` domain) **and** `emailVerified()` both hold; on
failure calls `signOut()` then redirects `/login?error=domain`. Sole enforcement point,
independent of the OAuth entry path's `hd` UI hint. `role` does not exist yet at this
point — assigned only once `BL005_ProfileProvisioningTrigger` provisions the profile
row after this gate passes.

### Related Routes

- (GET) `/auth/callback` — ROUTE001

### Related Screens

- SCR005_Login (rejection returns here with `?error=domain`)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest (any Google account) | ✓/✗ (conditional) | ✓ only `@sun-asterisk.com` + verified; else session revoked, `/login?error=domain` |
| member / admin | n/a | role assigned only after this gate passes |

### Related Modules

- `src/lib/auth/allowed-email.ts`, `src/lib/auth/email-verified.ts`, `src/lib/supabase/server.ts`

---

## PERM004_ProfileSelectAllAuthenticatedRLS

**Type**: data-permission
**Enforced At**: `supabase/migrations/20260831000100_widen_profile_select.sql:10-16`

### Description

**Supersedes round-1 `PERM004_ProfileSelectOwnRLS`** (`profile_select_own`, `using
(auth.uid() = id)`) — that policy is dropped, not merely shadowed, by this migration's
`drop policy` + `create policy` (comment `:1-9`: replace-not-add, since Postgres ORs
multiple permissive select policies together; stacking a second would leave the first
as dead weight). The replacement, `profile_select_all_authenticated`
(`for select to authenticated using (true)`), lets any signed-in Sunner read **any**
profile row — required for recipient autocomplete, `@mention` search, and
sender/receiver display on Kudos cards (`data-model.md` MODEL002 § Row-level
security). No column was dropped to enable this (clarifications.md 2026-08-31: "khong
co cot nhay cam trong bang" — no sensitive column exists on `profile`).
`grant select on public.profile to authenticated` (round-1 migration, unchanged) is
still what lets the `authenticated` role query the table at all.

### Related Routes

N/A — DB layer, invoked via `get-current-profile.ts`, `get-recipients.ts`,
`get-profile-by-id.ts` wherever the app reads a profile.

### Related Screens

- SCR001_Home, SCR003_AwardSystem (shared shell) — SCR004_KudosBoard (recipient
  autocomplete, author blocks) — SCR006_KudosDetail, SCR007_Profile (author display)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` Postgres role bound |
| member | ✓ | any row, not only own |
| admin | ✓ | any row, not only own — no admin exception needed, ceiling already is "all" |

### Related Modules

- `src/lib/profile/get-current-profile.ts`, `src/lib/kudos/queries/get-recipients.ts`, `src/lib/kudos/queries/get-profile-by-id.ts`

---

## PERM005_ProfileWriteRestrictedToSystemTrigger

**Type**: data-permission
**Enforced At**: `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:17-21,34-52`

### Description

Unchanged this round (re-verified — the widen migration touched only the select
policy). RLS enabled, no write policy declared: no client role, including the row's own
owner, can `INSERT`/`UPDATE`/`DELETE` `public.profile` through the API. Sole write path:
`handle_new_user()`, `security definer set search_path = public`, fired
`after insert on auth.users`. Same mechanism as `BL005_ProfileProvisioningTrigger`.

### Related Routes

N/A — fires on `auth.users` insert regardless of route (reachable via `BL001`→`BL003`).

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest / member / admin | ✗ | no self-service write access, not even to own row |
| system (`handle_new_user()`, security definer) | ✓ | sole writer |

### Related Modules

N/A — pure SQL trigger. Role promotion is out-of-band (`supabase/seeds/dev/promote-admin.sql`, opt-in dev seed, no in-app UI).

---

## PERM006_SignOutOriginCheck

**Type**: route-guard
**Enforced At**: `src/app/auth/sign-out/route.ts:26-31`

### Description

Unchanged this round (re-verified). `POST /auth/sign-out` rejects a cross-origin
`Origin` header with `403 {"error":"invalid_origin"}` before calling `signOut()`. Plain
`<form method="post">` target (not a Server Action) to avoid a Set-Cookie/redirect race.

### Related Routes

- (POST) `/auth/sign-out` — ROUTE002

### Related Screens

- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile (wherever `AccountMenu`'s Logout form renders)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| member / admin | ✓ | same-origin POST only; cross-origin rejected (403) regardless of role |

### Related Modules

- `src/lib/supabase/server.ts`, `src/components/layout/account-menu.tsx`

---

## PERM007_AccountMenuDashboardVisibility

**Type**: screen-permission
**Enforced At**: `src/components/layout/account-menu.tsx:82-90`

### Description

Unchanged this round (re-verified). Inside `AccountMenu`, "Dashboard" renders only when
`user.role === "admin"` (client `&&` short-circuit, sourced from DISC-001
`data-model.md:127-129`) — no `/dashboard` route exists, render-only, no navigation
wired. **No server-side enforcement backs this** — UI-hiding only, and remains the
**only** place `role` drives any behavioral branch anywhere in the app this round; every
Kudos RLS gate (PERM010–015) and Server Action gate (PERM016–017) applies identically
to `member` and `admin`.

### Related Screens

- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | `AccountMenu` not rendered (see PERM009) |
| member | ✗ | Dashboard row not rendered |
| admin | ✓ | rendered; render-only, no navigation wired |

### Related Modules

- `src/lib/profile/get-current-profile.ts`

---

## PERM008_FabWidgetAuthenticatedVisibility

**Type**: screen-permission
**Enforced At**: `src/components/layout/fab-widget-container.tsx:10-13`

### Description

Unchanged this round (re-verified). `visible={!!profile}`; `FabWidget` unmounts
(`null`) when no profile resolves, including on a transient profile-read error. The FAB
is also the entry point for `SCR008_KudosCompose` ("Viết KUDOS") on every `(site)` page.

### Related Screens

- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | FAB unmounted |
| member / admin | ✓ | FAB rendered, opens SCR008_KudosCompose |

### Related Modules

- `src/lib/profile/get-current-profile.ts`, `src/components/layout/fab-widget.tsx`

---

## PERM009_HeaderAuthedVariant

**Type**: screen-permission
**Enforced At**: `src/components/layout/site-header-container.tsx:24-36`

### Description

Unchanged this round (re-verified). `variant={profile ? "authed" : "guest"}`;
`NotificationBell` and `AccountMenu` render only in the authed variant. Nav links and
language dropdown render regardless of variant.

### Related Screens

- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | bell + account trigger hidden |
| member / admin | ✓ | bell + account trigger shown |

### Related Modules

- `src/lib/profile/get-current-profile.ts`, `src/components/layout/account-menu.tsx`, `src/components/layout/notification-bell.tsx`

---

## PERM010_KudosSelectAllInsertOwnRLS

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:64-76`

### Description

`kudos_select_authenticated` (`:64-68`): `for select to authenticated using (true)` —
any signed-in Sunner reads every kudos row. `kudos_insert_own` (`:70-74`):
`for insert to authenticated with check (sender_id = auth.uid())` — a caller may only
insert a row naming themself as `sender_id`; the RPC never lets the client set this
column to another user's id (`data-model.md` § RPC Contracts: `security invoker`, so
this policy is not bypassed even when called through `create_kudos`). No update/delete
policy — kudos are immutable once submitted. `grant select, insert … to authenticated`
(`:76`).

### Related Routes

N/A — DB layer, reached via `/kudos`, `/kudos/[id]`, and the `createKudos` Server
Action (PERM016).

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail (select) — SCR008_KudosCompose (insert)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ | select: any row. insert: only with `sender_id = auth.uid()` |

### Related Modules

- `src/lib/kudos/write/create-kudos-action.ts`, `src/lib/kudos/queries/*`

---

## PERM011_KudosImageAndHashtagInsertOwnRLS

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:93-110,124-141`

### Description

Both join/child tables share one pattern: unconditional select for any authenticated
role, insert gated by an `exists` subquery proving the caller owns the parent kudos
(`sender_id = auth.uid()` on `kudos`) rather than a direct column check, since neither
table carries its own `sender_id`. `kudos_image_select_authenticated`/`kudos_image_insert_own`
(`:93-108`); `kudos_hashtag_select_authenticated`/`kudos_hashtag_insert_own`
(`:124-139`). Both grant `select, insert` only (`:110,141`) — no update/delete, rows are
immutable once submitted. Both inserts happen only inside `create_kudos` (`security
invoker`), so the ownership check runs as the calling Sunner every time.

### Related Routes

N/A — DB layer, reached via `createKudos` (PERM016).

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail (select — hashtag chips, image gallery) — SCR008_KudosCompose (insert)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ | select: any row. insert: only for a kudos they own as sender |

### Related Modules

- `src/lib/kudos/write/create-kudos-action.ts`

---

## PERM012_HeartSelectInsertNotSelfDeleteOwnRLS

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:159-182`

### Description

`heart_select_authenticated` (`:159-163`): unconditional select. `heart_insert_not_self`
(`:167-174`), the DB-enforced half of `BR-005_SenderCannotHeartOwnKudo`:
`for insert to authenticated with check (user_id = auth.uid() and user_id <> (select
sender_id from public.kudos where id = kudos_id))`. `heart_delete_own` (`:176-180`):
`for delete to authenticated using (user_id = auth.uid())`. `grant select, insert,
delete … to authenticated` (`:182`). This DB layer is the **second** of two enforcement
layers for the self-heart block — `toggleHeart` (PERM017) checks
`kudos.sender_id === userId` first, app-side, and this RLS policy is the belt-and-suspenders
backstop the code's own comment names explicitly (`toggle-heart-action.ts:54-55`).

### Related Routes

N/A — DB layer, reached via the `toggleHeart` Server Action (PERM017).

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail (HeartButton on both)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ | select: any row. insert: only `user_id = auth.uid()` AND not the kudos's own sender. delete: only own row |

### Related Modules

- `src/lib/kudos/write/toggle-heart-action.ts`

---

## PERM013_SeedReferenceDataReadOnlyRLS

**Type**: data-permission
**Enforced At**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:18-24,39-45,194-200,217-223`

### Description

Four reference/log tables share the identical shape — `for select to authenticated
using (true)`, `grant select … to authenticated`, and **no insert/update/delete policy
at all** — grouped here rather than as four near-duplicate items (DRY):
`department_select_authenticated` (`:18-22`, 50 seed rows via
`20260831000300_seed_hashtag_and_department.sql:24-75`); `hashtag_select_authenticated`
(`:39-43`, 13 seed rows, same seed migration `:8-22`); `special_days_select_authenticated`
(`:194-198`, seeded empty — admin populates via SQL/Studio, feeds PERM017's
`computeGrantAmount`); `secret_box_gift_select_authenticated` (`:217-221`, seeded empty
— the redemption flow that would write here ships in a later round). None has any
`authenticated` write path this round — every row-changing operation on these four
tables is admin/SQL/Studio only, out of band from the application.

### Related Routes

N/A — DB layer.

### Related Screens

- SCR004_KudosBoard (department/hashtag filter dropdowns, sidebar secret-box counters) — SCR008_KudosCompose (hashtag picker)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ (select only) | no insert/update/delete for any role — admin included, no exception exists at the RLS layer |

### Related Modules

- `src/lib/kudos/queries/get-filter-options.ts`, `src/lib/kudos/write/heart-rules.ts` (special_days read)

---

## PERM014_KudosCardViewSecurityInvokerVisibility

**Type**: data-permission
**Enforced At**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:226-272`

### Description

`kudos_card_view` (the aggregate feed/highlight/spotlight source) declares no RLS
policy of its own — `with (security_invoker = true)` (`:233`) is the actual
enforcement: a querying role is subject to the RLS of every table it joins
(`kudos`/`profile`/`heart`/`kudos_hashtag`/`hashtag`/`kudos_image`) as if it queried
them directly, rather than running as the view owner and silently bypassing their RLS.
Since PERM004/PERM010–012 each grant `select` to `authenticated` unconditionally, the
view's effective visibility is "any authenticated Sunner, every row" — same ceiling as
the tables it composes, never wider. `grant select on public.kudos_card_view to
authenticated` (`:272`).

### Related Routes

N/A — DB layer, the primary read path for `/kudos` and `/kudos/[id]`.

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ | every row, mirroring the underlying tables' own RLS |

### Related Modules

- `src/lib/kudos/queries/get-feed-page.ts`, `get-highlight-top5.ts`, `get-spotlight.ts`, `get-kudos-by-id.ts`

---

## PERM015_StorageImagesBucketScopedInsertRLS

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20260902000000_scope_images_insert_policy.sql:22-32`

### Description

`storage.objects` policies for the `images` bucket (no policy existed before this round
— bucket was unused). `images_select_authenticated` (`20260831000200:16-20`):
`bucket_id = 'images'` — bucket-wide, every signed-in Sunner may view every kudos's
images. **Hardening history**: the original insert policy
(`images_insert_authenticated`, `20260831000200:10-14`) checked only
`bucket_id = 'images'` — any authenticated Sunner could upload into *any* path,
including another Sunner's `kudos/{their_id}/…` prefix, defeating the app-level path
convention. Migration `20260902000000` (Group-3 review fix, HIGH/SECURITY) drops and
recreates it scoped: `bucket_id = 'images' and (storage.foldername(name))[1] = 'kudos'
and (storage.foldername(name))[2] = auth.uid()::text` (`:22-32`) — a caller may only
insert under their own sender segment of `kudos/{sender_id}/{kudos_id}/{position}-{filename}`.
No update/delete policy — images are immutable once a kudos is submitted. App-side,
`verifyKudosImageStoragePath()` (`storage-path.ts:43-57`) independently re-checks this
same prefix inside `createKudos` (PERM016) before the RPC ever runs — belt-and-suspenders,
same pattern as PERM012's self-heart check.

### Related Routes

N/A — Supabase Storage API, invoked from `submit-kudos.ts` (upload) and rendered from
`image_paths` on `kudos_card_view` (PERM014).

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail (thumbnails/gallery — select) — SCR008_KudosCompose (upload — insert)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no `authenticated` role bound |
| member / admin | ✓ | select: any object in the bucket. insert: only under `kudos/{own auth.uid()}/…` |

### Related Modules

- `src/lib/kudos/write/storage-path.ts`, `src/lib/kudos/write/submit-kudos.ts`

---

## PERM016_CreateKudosIdentityAndSelfBlockGuard

**Type**: action-permission
**Enforced At**: `src/lib/kudos/write/create-kudos-action.ts:78-92`

### Description

`createKudos` Server Action, invoked from `SCR008_KudosCompose`. Identity resolution is
**getClaims-only**: `supabase.auth.getClaims()` (`:79`) is the sole source of
`userId` (`claimsData?.claims?.sub`) — the RPC's `sender_id` is never taken from the
request body, and a missing/errored claim short-circuits to
`{ ok: false, code: "unauthenticated" }` (`:82-84`) before any other check runs.
**Self-kudos block**: `isSelfKudos(userId, input.receiverId)` (`validate-draft.ts:37-39`,
plain `senderId === receiverId`) rejects with `self-kudos-not-allowed` (`:90-92`) — the
code's own comment (`:86-89`) states this is the **sole enforcement point**: no RLS or
DB constraint backs it, `data-model.md` deliberately leaves `sender_id`/`receiver_id`
unconstrained against each other at the schema level (MODEL007_Kudos has no CHECK
`sender_id <> receiver_id`). Runtime input-shape validation (`isCreateKudosInput`,
`:55-71`) and storage-path ownership re-verification (PERM015) both run after this
gate, before the `create_kudos` RPC call.

### Related Routes

N/A — Server Action, not a file-system-routed HTTP path.

### Related Screens

- SCR008_KudosCompose

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | `unauthenticated`, `getClaims()` yields no `sub` |
| member / admin | ✓/✗ (conditional) | ✓ if `receiverId !== own userId`; ✗ `self-kudos-not-allowed` if attempting to send to self — applies identically regardless of role |

### Related Modules

- `src/lib/kudos/write/validate-draft.ts` (`isSelfKudos`), `src/lib/kudos/write/storage-path.ts`, `src/lib/supabase/server.ts`

---

## PERM017_ToggleHeartIdentitySelfBlockAmountIntegrityGuard

**Type**: action-permission
**Enforced At**: `src/lib/kudos/write/toggle-heart-action.ts:36-58,100-111`

### Description

`toggleHeart` Server Action, invoked from `HeartButton` on `SCR004_KudosBoard` and
`SCR006_KudosDetail`. Same **getClaims-only** identity pattern as PERM016
(`:37-38`, unauthenticated short-circuit `:40-42`). **Self-heart block**: after
resolving the target kudos's `sender_id` (`:44-48`), `kudosRow.sender_id === userId`
rejects with `self-heart` (`:56-58`) — the code's own comment (`:54-55`) names this the
**app-level first layer**, with `heart_insert_not_self` RLS (PERM012) as the
DB-enforced second layer (belt-and-suspenders, same two-layer shape as PERM016/PERM015).
**Amount integrity**: `grantedAmount` has no client-writable path — on grant, the action
reads `special_days` itself (`:101-103`) and computes the value via
`computeGrantAmount(new Date(), specialDays)` (`heart-rules.ts:21-24`, Ho Chi Minh
calendar date, 1 normal / 2 on a special day); on revoke, the returned amount is read
back from the row the delete actually removed (`:82-98`, `resolveRevokedAmount`), never
assumed from a possibly-stale prior read — closing a double-toggle race where a losing
request could otherwise report an amount for a delete it did not perform.

### Related Routes

N/A — Server Action.

### Related Screens

- SCR004_KudosBoard, SCR006_KudosDetail

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | `unauthenticated`, `getClaims()` yields no `sub` |
| member / admin | ✓/✗ (conditional) | ✓ toggle on any kudos not their own; ✗ `self-heart` if `kudos.sender_id === own userId` — applies identically regardless of role. `grantedAmount`/`revokedAmount` always server-computed, never client-supplied |

### Related Modules

- `src/lib/kudos/write/heart-rules.ts` (`computeGrantAmount`, `resolveRevokedAmount`), `src/lib/supabase/server.ts`

---

## Summary

- **Total Permission Items**: 17
- **By Type**: route-guard: 4, screen-permission: 3, action-permission: 2,
  data-permission: 4, role-based: 0, resource-ownership: 4, field-permission: 0,
  api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 0, locale-gate: 0
- **Round-1 carried, unchanged**: PERM002, PERM003, PERM005, PERM006, PERM007,
  PERM008, PERM009 (each re-verified against current source this session)
- **Round-1 carried, content updated**: PERM001 (Related Routes extended to the 3
  new guarded pages), PERM004 (superseded rule, renamed from
  `ProfileSelectOwnRLS` → `ProfileSelectAllAuthenticatedRLS`)
- **New this round**: PERM010–PERM017 (8 items) — the Kudos-cluster RLS surface,
  reference-data RLS, view visibility, storage policy, and the two Server Actions'
  identity/self-block/amount-integrity gates

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [x] All PERM### codes are referenced in FeatureList.md — **resolved**:
  `feature-list.md` (Wave 5) is now complete; all 17 PERM### are referenced
  (PERM001–PERM006→F001; PERM007–PERM009→F002; PERM016→F005 only; PERM012,PERM014,
  PERM017→F006 only; PERM010,PERM011,PERM013,PERM015→F005+F006 dual — `feature-list.md`
  § Cross-Reference Validation).
- [x] All related route references are valid — `ROUTE001`/`ROUTE002` confirmed
  against `route-list.md`; `/kudos`, `/kudos/[id]`, `/profile` confirmed as guarded
  frontend pages in `route-list.md:65-67`
- [x] All related screen references are valid (SCR001, SCR003–SCR008 confirmed in
  `screen-list.md`; SCR002_AddLink has no permission gate of its own — inherits
  SCR008's, not separately listed)
- [x] All related module references are valid (file paths re-read this session)
- [x] No orphaned permission references

---

## Client-Side Gate Types

None of the four client-side gate types (`feature-flag`, `experiment`, `env-gate`,
`locale-gate`) were found gating access/authorization anywhere in this codebase,
including the round-2 Kudos surface. Verified by targeted search, not by omission:

- **feature-flag / experiment**: `grep -rnE "useFlag|useFeature|isEnabled|featureFlag\(|checkFlag|useExperiment|getVariant|abTest\(|experiment\.variant|useAbTest" src` — zero matches (re-run this session across `src/lib/kudos/**` and `src/components/kudos/**` too).
- **env-gate**: every `process.env.*` reference in `src/**` (excluding tests) remains
  either Supabase/site-URL config, `NEXT_PUBLIC_EVENT_START_AT` (countdown target — a
  business-logic value, not an access gate), or `set-locale.ts:25`'s
  `NODE_ENV === "production"` (toggles the locale cookie's `secure` flag only). No new
  `process.env` reference in the Kudos write path (`create-kudos-action.ts`,
  `toggle-heart-action.ts`, `heart-rules.ts`) branches route/screen/action access on an
  env var.
- **locale-gate**: the only `locale ===` comparisons remain in
  `language-dropdown.tsx:33,51,66` (tab styling, cosmetic). No Kudos component compares
  locale to gate access.

No `PERM###` item of these four types is emitted in this matrix.
