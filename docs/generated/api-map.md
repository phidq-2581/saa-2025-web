# API Map

**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Sources**: `route-list.md` (W1), `data-model.md` (W1), `behavior-logic.md` (W2), direct source
read (server actions / query layer / storage).
**Baseline**: `docs/generated/api-map.md` (round 1, 2026-08-31, 2 Auth rows + 3 Pages rows + 3
Server Action rows) — extended, not replaced verbatim; see **Scope note** for what changed shape.

> **BL### note (resolved)**: `behavior-logic.md` (Wave 2) is now complete and canonical. The three
> "Handler BL###" cells below are backfilled from it: `BL003_OAuthCallbackExchange` → `/auth/
> callback` (ROUTE001), `BL002_SignOutSession` → `/auth/sign-out` (ROUTE002),
> `BL001_GoogleOAuthSignIn` → `signInWithGoogle`. `scout-report.md`'s own (pre-BL###) Background
> Logic Source Inventory is cited inline where it bears on an item's classification.

> **Scope note**: round-1's api-map had a "Pages" table (GET `/`, `/login`, `/he-thong-giai`) that
> duplicated `route-list.md`'s Frontend Routes/Pages table under a different lens (BL### that
> happens to run on a page). That table is dropped here, not carried forward: `route-list.md` is
> the one place page routes are owned (DRY), and a page render is not itself a distinct
> server-callable interface — this document's job, confirmed by this round's brief, is the
> callable surface: HTTP route handlers, Server Actions, the RPC, the PostgREST/Storage calls the
> Kudos feature actually issues. The 2 Auth route handlers are carried forward (still genuine HTTP
> endpoints) and re-verified against current source, unchanged from round 1.

## 1. Route Handlers (Backend HTTP Routes) — 2

| Method | Path | File | Handler BL### | Auth Boundary |
|--------|------|------|----------------|------|
| GET | `/auth/callback` | `src/app/auth/callback/route.ts` | BL003_OAuthCallbackExchange | public — `proxy.ts` `/auth/` prefix carve-out |
| POST | `/auth/sign-out` | `src/app/auth/sign-out/route.ts` | BL002_SignOutSession | public — `proxy.ts` `/auth/` prefix carve-out; in-handler same-origin `Origin` check |

### GET `/auth/callback`

- **Caller**: browser, redirected here by Google/Supabase after the OAuth consent screen (never
  called by app code directly).
- **Transport**: plain HTTP GET, query-string params only.
- **Input shape**: `code` (string, required — missing → redirect `/login?error=missing_code`),
  `next` (string, optional — passed through `safeNext(next)`, never used raw).
- **Failure modes**: missing `code` → `/login?error=missing_code`; `exchangeCodeForSession` error
  or no user → `/login?error=exchange_failed`; non-`sun-asterisk.com` domain or unverified email →
  `signOut()` then `/login?error=domain`; success → redirect to `safeNext(next)`.
- **Cites**: `src/app/auth/callback/route.ts:21-45`.

### POST `/auth/sign-out`

- **Caller**: a plain `<form method="post">` in `account-menu.tsx` — **not** a Server Action
  (deliberate; see docblock: a Server Action's `redirect()` is a soft client nav that lost a
  cookie-clear race 0/3 in testing, a hard form POST is atomic).
- **Transport**: plain HTTP POST, no body.
- **Input shape**: none. Reads the `Origin` request header only.
- **Auth boundary detail**: Server Actions get Next.js's same-origin check for free; a Route
  Handler does not, so this handler re-implements it — cross-origin `Origin` → 403 JSON
  `{error:"invalid_origin"}`; a **missing** header is tolerated (sign-out is idempotent, exposes
  nothing on success).
- **Failure modes**: cross-origin `Origin` → 403 `{error:"invalid_origin"}`. Otherwise always
  succeeds: clears every `sb-`-prefixed cookie, calls `supabase.auth.signOut()`, 303-redirects to
  `/` (303, not the 307 default, so the browser follows with GET rather than re-POSTing).
- **Cites**: `src/app/auth/sign-out/route.ts:25-44`.

## 2. Server Actions — 6

Not HTTP routes — Next.js Server Actions run over the framework's internal `Next-Action` POST
protocol, invoked only from a Client Component holding a reference to the action (never called
directly from the browser as a URL).

| Action | File | Invoked From | Handler BL### |
|--------|------|---------------|-------|
| `signInWithGoogle` | `src/app/login/actions.ts` | `GoogleSignInButton` on `/login` | BL001_GoogleOAuthSignIn |
| `selectLocaleAction` | `src/lib/i18n/select-locale-action.ts` | Language dropdown / mobile nav drawer; `(auth)/layout.tsx`'s `LoginHeader` | `[UNMAPPED]` — excluded from BL scope, see below |
| `setLocale` | `src/lib/i18n/set-locale.ts` | `selectLocaleAction` only | `[UNMAPPED]` — excluded from BL scope, see below |
| `createKudos` | `src/lib/kudos/write/create-kudos-action.ts` | `ComposeDialogContainer.handleSubmit` → `submitKudos` | `[UNMAPPED]` — excluded from BL scope, see below |
| `toggleHeart` | `src/lib/kudos/write/toggle-heart-action.ts` | `heart-button.tsx` → `use-heart-toggle.ts` | `[UNMAPPED]` — excluded from BL scope, see below |
| `loadMoreFeedAction` (inline) | `src/components/kudos/containers/kudos-board-container.tsx:104-117` | `KudosFeedContainer`'s "load more" (passed as prop) | `[UNMAPPED]` — excluded from BL scope, see below |

> `scout-report.md` § Background Logic Source Inventory explicitly **excludes**
> `selectLocaleAction`/`setLocale`/`createKudos`/`toggleHeart`/`loadMoreFeedAction` from BL
> candidacy — they write only to this app's own primary datastore, so they're core request-scoped
> business logic (Track B), not background/infra logic, and match none of the 10 canonical BL
> types. Only `signInWithGoogle` (crosses to Google via Supabase Auth) is a live BL candidate this
> round — resolved above as `BL001_GoogleOAuthSignIn` now that `behavior-logic.md` (Wave 2) exists.

### `signInWithGoogle(next?: string): Promise<never>`

- **Caller**: `GoogleSignInButton` on `/login`.
- **Transport**: Server Action; internally calls `supabase.auth.signInWithOAuth` (Supabase Auth
  API, one outbound hop to Google via `hd: sun-asterisk.com` hint).
- **Input shape**: `next?: string` — round-tripped verbatim into `/auth/callback?next=...`; not
  validated here (validated once, at the callback, by `safeNext`).
- **Auth boundary**: none required — this action starts the login flow.
- **Failure modes**: `signInWithOAuth` error or no returned URL → `redirect("/login?error=oauth_init_failed")`.
- **Cites**: `src/app/login/actions.ts:21-40`.

### `selectLocaleAction(locale: string): Promise<void>`

- **Caller**: language dropdown / mobile nav drawer (`site-header-container.tsx`); `LoginHeader` on
  `(auth)/layout.tsx`.
- **Transport**: Server Action — thin wrapper, Client Components can only be handed a Server
  Action reference, never an inline closure.
- **Input shape**: `locale: string` (untrusted — network boundary). Recovers the current pathname
  from the `Referer` header (falls back to `/` if absent/malformed), delegates to `setLocale`.
- **Auth boundary**: none — locale switching is available to guests and signed-in Sunners alike.
- **Failure modes**: none surfaced to the caller; a malformed `Referer` degrades to `pathname = "/"`
  rather than throwing.
- **Cites**: `src/lib/i18n/select-locale-action.ts:27-41`.

### `setLocale(locale: string, pathname: string): Promise<void>`

- **Caller**: `selectLocaleAction` only (not invoked directly from any Client Component).
- **Transport**: plain async function inside a `"use server"` module — reached only via
  `selectLocaleAction`'s Server Action call, not independently network-addressable.
- **Input shape**: `locale` validated against the next-intl allow-list (`isLocale`), falls back to
  `defaultLocale` on an invalid value; `pathname` used only for `revalidatePath`.
- **Auth boundary**: none.
- **Failure modes**: none — always succeeds; sets the `NEXT_LOCALE` cookie (`httpOnly: false`,
  1-year `maxAge`, `sameSite: lax`) and calls `revalidatePath(pathname)`.
- **Cites**: `src/lib/i18n/set-locale.ts:17-30`.

### `createKudos(input: CreateKudosInput): Promise<CreateKudosResult>`

- **Caller**: `ComposeDialogContainer.handleSubmit` (`compose-dialog-container.tsx:69-77`) via the
  client-side `submitKudos` orchestrator (`src/lib/kudos/write/submit-kudos.ts:59-67`), never
  called directly from the compose dialog.
- **Transport**: Server Action; internally issues one `supabase.rpc("create_kudos", …)` call (§3
  below).
- **Input shape** (`CreateKudosInput`, runtime-validated at the network boundary — not just the TS
  type): `id: string` (client-generated UUID, `crypto.randomUUID()` in `submit-kudos.ts:36`),
  `receiverId: string`, `content: KudosContentNode` (TipTap doc), `isAnonymous: boolean`,
  `anonymousDisplayName: string | null`, `hashtagIds: string[]`, `images: {storagePath, position}[]`.
- **Auth boundary**: `getClaims()` (never `getSession()`/`getUser()`) resolves `sender_id` — a
  malformed/missing session → `unauthenticated`. Self-kudos blocked in-action
  (`isSelfKudos`, the only server-side enforcement point — no DB constraint backs it).
  Storage-path ownership re-verified per image (`verifyKudosImageStoragePath`) before trusting a
  client-supplied path. RLS backstop on the RPC's three inserts: `kudos_insert_own` /
  `kudos_hashtag_insert_own` / `kudos_image_insert_own` (all `sender_id = auth.uid()`, directly or
  via `exists` subquery).
- **Failure modes**: `invalid-input` (runtime shape check fails) → `unauthenticated` →
  `self-kudos-not-allowed` → `invalid-draft` (`reason`: `missing-receiver` / `invalid-content-shape`
  / `empty-content` / `invalid-hashtag-count` / `duplicate-hashtag` / `too-many-images` /
  `missing-anonymous-display-name`) → `invalid-image-path` → `insert-failed` (RPC error or no
  returned id, logged via `console.error`). Success → `revalidatePath("/kudos")`.
- **Cites**: `src/lib/kudos/write/create-kudos-action.ts:73-133`;
  `src/lib/kudos/write/validate-draft.ts:53-81`.

### `toggleHeart(kudosId: string): Promise<ToggleHeartResult>`

- **Caller**: `heart-button.tsx` → `use-heart-toggle.ts`.
- **Transport**: Server Action; issues 3-5 sequential PostgREST calls against `kudos`/`heart`/
  `special_days` inline (not through `src/lib/kudos/queries/**` — this action owns its own reads).
- **Input shape**: `kudosId: string` — empty/non-string → `invalid-input`.
- **Auth boundary**: `getClaims()` resolves `userId`; the kudos row's `sender_id` is read and
  compared (`self-heart` if equal — belt-and-suspenders ahead of the DB-enforced
  `heart_insert_not_self` RLS policy). Delete path relies on `heart_delete_own` RLS
  (`user_id = auth.uid()`). `granted_amount` is computed server-side only
  (`computeGrantAmount`, never client-writable).
- **Failure modes**: `invalid-input` → `unauthenticated` → `kudos-not-found` (kudos row read fails)
  → `self-heart` → `toggle-failed` (any of: existing-heart read, delete, special-days read, insert,
  or final count read fails — each logged separately via `console.error`). Un-heart is an atomic
  delete-and-return: the reported `revokedAmount` always comes from the row(s) *this* delete
  removed (0 if another request already removed it first), never from a stale prior read —
  race-safe for a double-toggle.
- **Cites**: `src/lib/kudos/write/toggle-heart-action.ts:31-140`;
  `src/lib/kudos/write/heart-rules.ts:12-30`.

### `loadMoreFeedAction` (inline, not a named export)

- **Caller**: `KudosFeedContainer`'s "load more" control, passed down as a prop (not imported
  directly — the server-only Supabase client cannot be imported into the `"use client"` feed
  container; passing it as a prop also avoids a circular import between the two container
  modules).
- **Transport**: Server Action declared inline inside the `/kudos` Server Component module
  (`kudos-board-container.tsx`) — not a route or a file of its own.
- **Input shape**: `{ offset: number; hashtagId: string | null; department: string | null }` →
  `Promise<SampleFeedPage>`.
- **Auth boundary**: none checked inline — relies on (a) `/kudos` page-level guard in `proxy.ts`
  (unauthenticated never reaches the page that can invoke this action) and (b) the blanket
  `authenticated`-role RLS on every table `getFeedPage`/`getReceivedKudosCounts` reads (§4).
- **Failure modes**: none of its own — delegates entirely to `getFeedPage` (§4, degrades to an
  empty page on error) and `getReceivedKudosCounts` (§4, degrades to an empty map on error); never
  throws.
- **Cites**: `src/components/kudos/containers/kudos-board-container.tsx:104-117`.

## 3. RPC Contract — `create_kudos` — 1

Not a `MODEL###` entity or a Server Action of its own — a Postgres `plpgsql` function exposed over
Supabase's PostgREST RPC layer.

- **Caller**: `createKudos` Server Action only (§2) — never invoked directly from the browser.
- **Transport**: `supabase.rpc("create_kudos", { p_id, p_receiver, p_content, p_is_anonymous,
  p_display_name, p_hashtag_ids, p_image_paths })` → PostgREST issues `POST
  /rest/v1/rpc/create_kudos` under the hood, executed server-side inside the Server Action using
  the request-scoped Supabase client (JWT forwarded, not a service-role bypass).
- **Input shape**: `p_id uuid, p_receiver uuid, p_content jsonb, p_is_anonymous boolean,
  p_display_name text, p_hashtag_ids uuid[], p_image_paths text[]` → returns `uuid`.
- **Auth boundary**: `security invoker` (runs as the calling role, not the function owner) —
  each of its three inserts (`kudos`, `kudos_hashtag`, `kudos_image`) is still individually subject
  to that table's own RLS `..._insert_own` policy; the RPC bundles three writes into one
  transaction, it does **not** bypass row-level security.
- **Failure modes**: `raise exception` on hashtag count outside 1-5, or image count > 5 — an
  unhandled `plpgsql` exception rolls back the whole function, so a kudos row can never land with
  0 hashtags or with the images table left inconsistent. Any RLS denial on one of the three inserts
  also aborts the whole transaction the same way. The calling action surfaces any RPC error/absent
  return value as `insert-failed` (§2).
- **Cites**: `supabase/migrations/20260831000000_create_kudos_cluster.sql:281-325`;
  call site `src/lib/kudos/write/create-kudos-action.ts:115-123`.
- **Classification note**: `scout-report.md` flags this RPC `[LOW CONFIDENCE]` as a BL `integration`
  candidate — its only external party is the app's own database, not a true third party — advisory
  only, not resolved into a `BL###` code this wave (pending `behavior-logic.md`).

## 4. Data-Access Surface — Supabase PostgREST Reads (`src/lib/kudos/queries/**`) — 11 functions

**Transport** (uniform across every row below): supabase-js's PostgREST query builder
(`.from(table_or_view).select()/.order()/.range()/.contains()/.in()`), called from the **server**
Supabase client (`src/lib/supabase/server.ts`, forwards the caller's own cookie-borne JWT) — i.e.
`GET /rest/v1/{table_or_view}?...` under the hood. None of these functions are called directly
from the browser.

| Function | File:Lines | Table / View Read | Caller | Failure Mode |
|---|---|---|---|---|
| `getFeedPage` | `queries/get-feed-page.ts:26-62` | `kudos_card_view` | `KudosBoardContainer` (initial page), `loadMoreFeedAction` (pagination) | degrades to `{items:[], nextOffset:null}` |
| `getFilterOptions` | `queries/get-filter-options.ts:24-47` | `hashtag`, `department` | `KudosBoardContainer` | degrades to `{hashtags:[], departments:[]}` |
| `getHighlightTop5` | `queries/get-highlight-top5.ts:22-56` | `kudos_card_view` | `KudosBoardContainer` | degrades to `[]` |
| `getSpotlight` | `queries/get-spotlight.ts:33-77` | `kudos_card_view`, `kudos` (count) | `KudosBoardContainer` | degrades to `{nodes:[], totalKudosCount:0}` (or partial: node list can still resolve if only the count read fails) |
| `getSidebarStats` | `queries/get-sidebar-stats.ts:13-78` | `kudos` (×2 head-counts), `heart` (joined `kudos!inner`), `secret_box_gift` (head-count) | `KudosBoardContainer` | returns `null` only on no session; a single aggregate's own read failure degrades that field to `0`, logged, rest of the stats block still returned |
| `getLeaderboards` | `queries/get-leaderboards.ts:29-53` | `kudos_card_view` | `KudosBoardContainer` | degrades to `{rankPromotions:[], giftRecipients:[]}` (`giftRecipients` is unconditionally `[]` this round — no redemption flow yet, not a failure) |
| `getRecipients` | `queries/get-recipients.ts:15-33` | `profile` | `KudosBoardContainer` (compose recipient-autocomplete pool) | degrades to `[]` |
| `getReceivedKudosCounts` | `queries/get-received-kudos-counts.ts:17-30` | `kudos` (full `receiver_id` scan) | `KudosBoardContainer`, `loadMoreFeedAction`, `KudosDetailContainer` | degrades to an empty `Map` |
| `getKudosById` | `queries/get-kudos-by-id.ts:13-24` | `kudos_card_view` (`.single()` by `id`) | `KudosDetailContainer` (`/kudos/[id]`) | degrades to `null` (covers both a real error and PostgREST's `PGRST116` "no such row") |
| `getProfileById` | `queries/get-profile-by-id.ts:12-31` | `profile` (`.single()` by `id`) | `ProfileContainer` (`/profile?id=`) | degrades to `null` |
| `resolveDepartmentReceiverIds` | `queries/resolve-department-receivers.ts:14-26` | `profile` (`id` where `department = :name`) | internal helper — called by `getFeedPage`/`getHighlightTop5`/`getSpotlight` only when a department filter is active | degrades to `[]` (callers then short-circuit to their own empty result) |

**Params** (rows not covered above take no arguments): `getFeedPage({offset, hashtagId?,
departmentName?})`; `getHighlightTop5`/`getSpotlight({hashtagId?, departmentName?})`;
`getKudosById(id)` / `getProfileById(id)`; `resolveDepartmentReceiverIds(supabase, departmentName)`.

**Auth boundary** (shared across all 11 — see `data-model.md` for the source RLS text): every
table/view above grants `select` to role `authenticated` unconditionally
(`for select to authenticated using (true)`), including `kudos_card_view` itself
(`security_invoker = true` — inherits `kudos`+`profile`+`heart`+`kudos_hashtag`+`hashtag`+
`kudos_image`'s own grants rather than running as the view owner). None of these 11 functions add
an ownership/row-level check of their own beyond that blanket policy — the effective rule is "any
signed-in Sunner may read every row." The one function that *does* check identity is
`getSidebarStats` (`getClaims()`, scopes its own counts to the caller's `userId`). Page-level
reachability is gated upstream, not here: `/kudos`, `/kudos/[id]`, `/profile` are all absent from
`proxy.ts`'s `PUBLIC_ROUTES` (`route-list.md`), so an unauthenticated request never reaches any of
these functions in the first place.

**Failure convention** (shared): every function above catches a PostgREST error or a `null`/missing
`data` result, logs it via `console.error(...)`, and returns a typed empty/neutral value — `[]`,
`null`, `0`, or an `EMPTY_*` constant — never a thrown exception. A transient read failure blanks
one card/stat/list rather than 500ing the whole page (explicit doc-comment rationale repeated in
every file above).

> **Adjacent, out-of-scope note**: `src/lib/profile/get-current-profile.ts` (`getCurrentProfile`)
> is the same shape of PostgREST read against `profile` (round-1 / F002, unchanged this round),
> invoked by `SiteHeaderContainer`/`FabWidgetContainer` on every page. It sits outside
> `src/lib/kudos/queries/**`, the scope this section's brief names, and is only noted here for the
> "every server-callable interface" completeness bar — not counted in the 11 above, not
> re-verified beyond the read already done for `data-model.md` MODEL002.

## 5. Storage — `images` bucket (Supabase Storage, `storage.objects`) — 2 calls

| Call | File:Lines | Direction | Issued From | Bucket Policy Boundary | Failure Mode |
|---|---|---|---|---|---|
| `.storage.from("images").upload(storagePath, file)` | `write/submit-kudos.ts:36-68` (call at line 49) | outgoing upload | **browser**, via `@/lib/supabase/client` (the one call in this surface issued client-side, not proxied through a Server Action) | `images_insert_authenticated` — insert only under `kudos/{auth.uid()}/...` (`(storage.foldername(name))[2] = auth.uid()::text`) | any upload error aborts the loop immediately, returns `{ok:false, code:"upload-failed", failedIndex}` — images already uploaded before the failing one are **not** rolled back (orphaned objects; no cleanup path this round) |
| `.storage.from("images").createSignedUrls(paths, 3600)` | `queries/resolve-image-urls.ts:22-35` (call at line 27) | outgoing read (URL mint) | server, via `KudosBoardContainer`/`KudosDetailContainer` (`toCardSample`) | `images_select_authenticated` — bucket-wide, any authenticated Sunner | degrades to `[]` on error or empty input — an image that never resolves disappears from the card rather than breaking the render |

- **Input shape**: upload takes a sanitized `storagePath` (`kudos/{sender_id}/{kudos_id}/
  {position}-{filename}`, built by `buildKudosImageStoragePath`, `write/storage-path.ts:24-27`) plus
  the raw `File`. `createSignedUrls` takes the array of already-persisted `image_paths` off a
  `kudos_card_view` row and a fixed 3600s TTL (`resolve-image-urls.ts:8`).
- **Auth boundary detail**: the bucket is private (`public = false`, `supabase/config.toml:109-110`)
  — a plain `getPublicUrl()` would hand `<img>` a URL Storage rejects, hence the signed-URL path.
  Insert-path scoping was hardened mid-round: `images_insert_authenticated` originally allowed any
  authenticated Sunner to write to **any** path in the bucket (`20260831000200`, dropped); the
  current policy (`20260902000000_scope_images_insert_policy.sql:22-32`) restricts inserts to the
  caller's own `kudos/{auth.uid()}/` prefix. `createKudos` (§2) independently re-verifies the
  storage-path ownership app-side (`verifyKudosImageStoragePath`, `write/storage-path.ts:43-57`)
  before trusting a client-supplied path — belt-and-suspenders on top of the RLS scoping.
- **Cites**: `supabase/migrations/20260831000200_storage_images_policies.sql:10-20`;
  `supabase/migrations/20260902000000_scope_images_insert_policy.sql:22-32`;
  `supabase/config.toml:109-110`.

> **Validation gate confirmed active**: `write/validate-image.ts:36-54`'s `validateImages` (MIME ∈
> {jpeg,png,webp}, size ≤5MB, count ≤5) is unit-tested (`__tests__/validate-image.test.ts`) **and**
> is the sole production pre-upload gate — called unconditionally as the first line of
> `submitKudos()` (`submit-kudos.ts:56`: `const imageValidation = validateImages(input.images);`),
> which returns early on failure (lines 57-62), before the Storage upload loop starts (line 68).
> `submit-kudos.ts`'s own docblock (lines 7-18) states this is the ONLY production call site — the
> compose UI's own inline file filtering (`compose-dialog-container.tsx`) is first-line UX only, not
> a trust boundary. Matches `data-model.md`'s `kudos_image_mime_size` row, which already had this
> right ("checked client-side before any Storage upload starts").

## Background Jobs

None. `scout-report.md`'s Background Logic Source Inventory carries no `scheduled-job` or
`queue-worker` entry for the Kudos surface this round — the one `scheduled-job` candidate in the
whole codebase (`useCountdown`, client-side `setInterval` tick on `/`) is round-1 territory, has no
server-callable interface of its own, and is out of this round's Kudos scope.

## Webhooks / External Calls

- **Incoming**: `GET /auth/callback` (§1) is the one incoming-webhook-shaped surface in this
  codebase — an external redirect from Google via Supabase Auth — already fully documented there;
  not duplicated here.
- **Outgoing**: none beyond that same OAuth round trip (`signInWithGoogle`, §2) — no other
  third-party API client exists in the Kudos feature; `create_kudos` (§3) is same-database, not an
  external call (see its classification note).

## Summary

| Category | Count |
|---|---|
| Route Handlers (HTTP) | 2 |
| Server Actions | 6 |
| RPC Contracts | 1 |
| Data-Access Surface functions (PostgREST reads, `kudos/queries/**`) | 11 |
| Storage calls | 2 |
| Background Jobs | 0 |
| Webhooks / External Calls | 0 (1 cross-referenced to §1) |
| **Total server-callable interfaces surfaced** | **22** |

**Status:** DONE
**Summary:** Surfaced all 22 server-callable interfaces named in the brief (2 route handlers, 6
Server Actions, 1 RPC, 11 PostgREST-read query functions, 2 Storage calls), each with caller,
transport, input shape, auth boundary, failure modes and file:line cites; dropped round-1's
redundant Pages table (owned by `route-list.md`) with reasoning recorded; the 3 Handler `BL###`
cells are backfilled from `behavior-logic.md` (Wave 2, now complete) — see the BL### note above.
**Concerns**: none open — `validateImages` (§5) is confirmed as the active, wired pre-upload
MIME/size gate (`submit-kudos.ts:56`), not dead code; the earlier "no production call site" reading
was incorrect and has been corrected in place.
**Line count:** 334 (well under the 800-line cap; no sharding needed at this endpoint count).
