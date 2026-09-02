# Data model — SAA 2025 Web (derived from MoMorph specs)

Derived **only** from the 252 spec rows and 292 test cases of the 18 in-scope screens.
Anything the specs do not state is in [Cần làm rõ](#cần-làm-rõ) — nothing here is invented.

> **How thin the source is.** Of 252 spec rows, exactly one carries a `databaseTable` value:
> `kudos` (Live board B, B.2.3), with **no column named**. Every table, column, type and relation
> below is therefore inferred from displayed fields, validation notes and test-case assertions —
> not read off a schema. Treat it as a proposal to confirm, not a specification.

## Entities

### profile
The Sunner. Test cases call it "a roster profile row" and distinguish it from the auth user.

| Field | Type | Source |
|---|---|---|
| id | uuid | `/profile?id={uuid}`; malformed id "sent to a uuid column raises Postgres 22P02" (TC_..._FUN_004) |
| full_name | text | rendered in hero, cards, leaderboards |
| avatar_url | text, nullable | "lấy theo ảnh đại diện gmail" (B.3.1); sparse profile has null avatar (TC_..._GUI_009) |
| department | text, nullable | hero line; sparse profile omits it |
| email | text | **withheld from every payload** (TC_..._SEC_004) |

**Verified in code (Phase 07).** `src/lib/profile/get-current-profile.ts` is the one read path backing the session-aware header/FAB: it selects exactly `full_name, avatar_url, role` — `email` is never in the `select()` list. A missing session or a failed row read both resolve to `null` (the guest variant), not a thrown error.

Derived, not stored (both computed from kudos, deliberately different denominators — TC_..._GUI_001):
- **hoa-thi stars** — from TOTAL kudos received: 10 → 1★, 20 → 2★, 50 → 3★ (B.3.2)
- **Hero tier badge** — from DISTINCT SENDERS. Thresholds never stated.

### kudos
| Field | Type | Source |
|---|---|---|
| id | uuid | Copy Link produces a per-kudo URL |
| sender_id | fk → profile | card shows sender |
| recipient_id | fk → profile | card shows recipient |
| content | rich text | editor with bold/italic/stroke/number/link/quote; `@` mentions |
| created_at | timestamptz | displayed `HH:mm - MM/DD/YYYY` (C.3.4) |
| is_anonymous | boolean | "Gửi ẩn danh" toggle (G) |
| anonymous_name | text, nullable | field appears only when the toggle is on (G, TC ID-43) |
| heart_count | integer | shown on every card |

Constraints stated: recipient required; content required; 1–5 hashtags required; 0–5 images;
no self-kudo (`kudos_no_self`, TC_..._FUN_008).
Display rules: content truncates at 3 lines in the carousel, 5 lines in the feed; hashtags
truncate past one line; feed pages 10 at a time by keyset cursor.

### hashtag
`name` text. "Danh sách hashtag được truy vấn từ cơ sở dữ liệu" (B.1.1) — dynamic, not an enum.
Two different lists appear in the design and they do not match:
- Dropdown Hashtag filter (13): Toàn diện · Giỏi chuyên môn · Hiệu suất cao · Truyền cảm hứng · Cống hiến · Aim High · Be Agile · Wasshoi · Hướng mục tiêu · Hướng khách hàng · Chuẩn quy trình · Giải pháp sáng tạo · Quản lý xuất sắc
- Dropdown list hashtag: #High-perorming · #BE PROFESSIONAL · #BE OPTIMISTIC · #Be A Team · #THINK OUTSIDE THE BOX · #GET RISKY · #GO FAST · #WASSHOI

`kudos_hashtag` join table implied (max 5 per kudo).

### department
`name` text, queried from DB (B.1.2). ~50 values listed verbatim in Dropdown Phòng ban spec
(CTO, SPD, FCOV, CEVC1–4, OPD, Infra, STVC - R&D, GEU - HUST, …).

### heart
Join of (profile, kudos) — the rules are the most precisely specified logic in the whole set (C.4.1):
- one heart per user per kudos; withdrawable
- the kudo's **sender** cannot heart their own kudo (button disabled)
- each heart credits **the sender's account** +1
- on an admin-configured **special day**, the same heart credits **+2**
- withdrawing must revoke the exact amount granted — hence `databaseNote`: the normal and
  special-day heart must be distinguishable at row level

### secret_box
Per-profile counters: `opened_count`, `unopened_count`. Client-side tampering must be ignored —
the count always re-reads from backend (TC_..._SEC_004 on the modal).

### badge
6 fixed badges with draw probabilities (Open secret box, spec C):
Stay Gold 30% · Flow to Horizon 25% · Touch of Light 20% · Beyond the Boundary 10% ·
Revival 10% · Root Further 5%. One random badge per box opening.
`profile_badge` join implied ("Bộ sưu tập icon"; locked slots render desaturated).

### award_category
Static content, 6 rows, no DB implied — values fixed in the Hệ thống giải spec.

> **Superseded by verified code (2026-08-28, Group 3).** The table below is this document's
> original spec-derived read. `src/lib/awards/award-categories.ts` once mirrored it verbatim
> (Phase 02) and was found wrong/paraphrased against the real Figma `character` fields — e.g.
> Top Talent's unit is "Cá nhân", not "Đơn vị" as the row below states. `award-categories.ts`
> is now trimmed to `{ name, slug }` only; the verified quantity/prize/description copy per
> category lives in `messages/vi/awards.json` → `cardContent[slug]`, read from each card's own
> `character` field (never the component instance's `itemName`) at implement time. Treat that
> JSON file as the current source of truth for these values — the table below is kept for
> spec-derivation history, not as a live reference.

| Award | Quantity | Prize |
|---|---|---|
| Top Talent | 10 Đơn vị | 7.000.000 VNĐ each |
| Top Project | 02 Tập thể | 15.000.000 VNĐ each |
| Top Project Leader | 03 Cá nhân | 7.000.000 VNĐ |
| Best Manager | 01 Cá nhân | 10.000.000 VNĐ |
| Signature 2025 - Creator | 01 | 5.000.000 (cá nhân) / 8.000.000 (tập thể) |
| MVP | 01 | 15.000.000 VNĐ |

### event config
Target datetime for the countdown. Homepage B1 says "cấu hình thông qua biến môi trường,
ISO-8601"; the Countdown page's own `databaseNote` says "TODO: thiết kế API endpoint".
**The two specs disagree** — see Cần làm rõ.
Fixed display strings: `18h30`, `Nhà hát nghệ thuật quân đội`, timezone `Asia/Ho_Chi_Minh`.

### notification
Referenced only as a bell with an unread badge (A1.6). No fields, no panel spec in scope.

## Relations

```
profile 1─┬─* kudos (sender_id)
          └─* kudos (recipient_id)
kudos   *─── hashtag        via kudos_hashtag   (1..5)
kudos   1─── image          0..5
kudos   1─* heart *─1 profile                   (unique per pair; sender excluded)
profile 1─* profile_badge *─1 badge
profile 1─1 secret_box counters
profile *─1 department
```

## Cần làm rõ

Spec is silent or self-contradictory on each of these. **Do not guess these in code.**

**Contradictions in the source**
1. Login spec 2.2.1 redirects to **`/todo`** after OAuth. No other screen mentions `/todo`;
   everything else implies `/` or `/kudos`. Almost certainly leftover placeholder text.
2. Countdown target datetime: **env var** (Homepage B1) vs **API endpoint** (Countdown TODO).
3. The two hashtag lists above share no values.
4. Login 2.2.1 says "tất cả tài khoản Google được phép" — no `@sun-asterisk.com` restriction,
   which contradicts an internal-only award programme.

**Undefined identity / auth**
5. Auth provider rows: Google OAuth only. No mapping stated between the auth user and `profile.id`.
6. `role` — admin vs regular is asserted by Homepage TC ID-5/ID-6 and the Admin dropdown, but no
   role field, no source, no admin route exists in any spec.
7. Hero tier thresholds (distinct senders) are never given, unlike the hoa-thi thresholds.

**Undefined storage / limits**
8. Image upload: allowed types are .jpg/.png (TC ID-21/22/23/55) but **no max file size, no
   dimensions, no storage bucket, no endpoint**. The repo has a Supabase `images` bucket declared
   (50MiB, image/png + image/jpeg) — not referenced by any spec.
9. Rich-text content: no storage format stated (HTML? Markdown? JSON?), no length limit, no
   sanitisation rule — despite `@` mentions and inserted links.
10. `@` mention: no persistence of who was mentioned, no notification behaviour.
11. Special-day configuration: admin-configured, but no table, no shape, no admin screen in scope.

**Undefined content**
12. Rules text of "Thể lệ" panel — spec lists structure only, never the copy.
13. Award card descriptions on Homepage C2.2–C2.6 are **empty** in the spec (only Top Talent has one).
14. Spotlight `388 KUDOS` — the figure is a design placeholder; real source is a DB count.
15. Every one of Profile's 28 spec rows has an empty description.

**Undefined behaviour**
16. Kudos **detail page** is the click target of at least 8 spec items and has no spec at all.
17. Countdown "khóa điều hướng đến các trang khác" — mechanism, scope and bypass for admins unstated.
18. Anonymous name: no validation, no uniqueness, no length; and whether it displaces the masked
    alias on the public feed is not stated.

## Kudos Cluster (Round 2 — verified in code)

Everything above this section was derived from spec rows before any Kudos code existed, and
several of its open items (8, 9, 10, 11, 14, 16, 18) are now resolved. This section documents
the **shipped** schema (`supabase/migrations/20260831*.sql`, `20260902000000*.sql`), not another
spec-derived guess — it supersedes the `kudos`/`hashtag`/`department`/`heart`/`secret_box`/
`badge`/`event config` entries above wherever they disagree; those entries are kept for their
spec-derivation history, per the same convention `award_category` already uses.

### Tables (8 new — the Stage-1.5 spec draft counted 7; `secret_box_gift` was added during
implementation per a clarifications ruling not yet recorded when that draft was written)

| Table | Key columns | RLS (`authenticated`) | Notes |
|---|---|---|---|
| `department` | `name text primary key` | select: `using (true)`, no write | Seed-only, 50 rows |
| `hashtag` | `id uuid pk`, `name text unique` | select: `using (true)`, no write | Seed-only, 13 rows (verbatim VN names) |
| `kudos` | `id uuid pk`, `sender_id`/`receiver_id → auth.users`, `content jsonb`, `is_anonymous`, `anonymous_display_name`, `created_at` | select: all; insert: `with check (sender_id = auth.uid())` | No `update`/`delete`. `sender_id`/`receiver_id` deliberately unconstrained at the schema level — self-kudos is blocked in application code only (see `docs/features/F005_KudosCompose/technical-spec.md` BR-009) |
| `kudos_image` | `id uuid pk`, `kudos_id → kudos`, `storage_path text`, `position smallint` (0–4) | select: all; insert: caller must own the parent `kudos` row | No `update`/`delete` — immutable once submitted |
| `kudos_hashtag` | `pk (kudos_id, hashtag_id)` | select: all; insert: caller must own the parent `kudos` row | PK doubles as the no-duplicate-tag rule |
| `heart` | `pk (kudos_id, user_id)`, `granted_amount smallint check in (1,2)`, `created_at` | select: all; insert: `with check (user_id = auth.uid() and user_id <> (select sender_id from kudos where id = kudos_id))`; delete: `using (user_id = auth.uid())` | PK doubles as the one-heart-per-user-per-kudos rule; insert `with check` is the DB-level half of "sender cannot heart own kudo" |
| `special_days` | `day date primary key` | select: `using (true)`, no write | Seed empty; admin edits via SQL/Studio |
| `secret_box_gift` | `id uuid pk`, `recipient_id → auth.users`, `granted_at` | select: `using (true)`, no write | Seed empty; drives the sidebar's "opened" counter honestly (real query, real 0) instead of a hardcoded value; no redemption flow this round |

### `kudos_card_view` (aggregate view, `security_invoker = true`)

One row per kudos: `kudos.*` joined with sender/receiver `profile` (name, avatar), a live
`heart_count` (`count(*)` over `heart`), and aggregated `hashtag_ids`/`hashtag_names`/
`image_paths` arrays via lateral subqueries (no N+1, no row fan-out). `security_invoker` is
load-bearing — without it the view runs as its owner and silently bypasses the RLS on every
table it joins. Every board query (Highlight, feed, Spotlight, leaderboards) reads from this
view, never the base `kudos` table directly.

### `create_kudos(...)` RPC

One atomic `plpgsql` function (`security invoker`), called by the compose Server Action after
client + server validation both pass. Guards 1–5 hashtags and ≤5 images so a partial write can
never land at rest; an unhandled `raise exception` rolls back the whole `kudos` +
`kudos_hashtag` + `kudos_image` insert. `sender_id` is `auth.uid()` inside the function body,
never a parameter — a client cannot claim to be someone else's sender even by calling the RPC
directly.

### `public.profile` — RLS widening (resolves open item 5's identity-mapping ambiguity, partially)

Round 2 drops `profile_select_own` and replaces it with `profile_select_all_authenticated`
(`using (true)`) — see `docs/system-architecture.md` § Data flow for the full rationale. No
column changes; `email` still stays out of every payload this table's readers select.

### Storage — bucket `images`

Declared in `supabase/config.toml` since round 1 but unused before this round (resolves open
item 8). `allowed_mime_types` gained `image/webp` (was png/jpeg only); `file_size_limit` stays
the bucket-wide 50MiB ceiling, with a ≤5MB-per-image check enforced app-side (Storage has no
per-request override). Path convention: `kudos/{sender_id}/{kudos_id}/{position}-{filename}`.

Two `storage.objects` policies exist for this bucket, one of them corrected mid-round:

- `images_select_authenticated` — `using (bucket_id = 'images')`, unchanged since it was first
  written: every signed-in Sunner must see every kudos's images in the feed, not just their own.
- `images_insert_authenticated` — **originally** `with check (bucket_id = 'images')` only (no
  path-ownership check at all: any authenticated Sunner could upload into another Sunner's
  `kudos/{their_id}/...` folder). A Group-3 review flagged it High/Security; migration
  `20260902000000_scope_images_insert_policy.sql` drops and recreates it scoped to
  `(storage.foldername(name))[1] = 'kudos' and (storage.foldername(name))[2] = auth.uid()::text`.

### Content storage format (resolves open item 9)

`kudos.content` is `jsonb` holding TipTap's document JSON — not HTML, not Markdown. Both the
write path (`validate-content.ts`, depth-capped at 20, node-count-capped at 2000) and the
render path (`kudos-content-renderer.tsx`) independently allow-list node types (`doc`,
`paragraph`, `text`, `blockquote`, `orderedList`, `listItem`, `mention`) and mark types (`bold`,
`italic`, `strike`, `link` — `http`/`https` schemes only); no raw `html` mark is ever accepted
or rendered. This decision (2026-08-31) supersedes the 2026-08-28 "sanitised HTML" placeholder
recorded in `plans/clarifications.md` § Session 2026-08-28 — the later, Round 2 session is
authoritative.

### Special-day heart rule (resolves open item 11)

`special_days` (seeded empty, admin-managed via SQL/Studio — no admin UI this round) is read
server-side inside the same write path that inserts a `heart` row. A heart normally credits the
kudos's **sender** +1; +2 if the current date, cast to `Asia/Ho_Chi_Minh` (Postgres/JS
`current_date`/`Date` default to UTC, ~7h out of phase around VN midnight), is present in
`special_days`. This is an app-level invariant, not a DB-level one — RLS cannot itself compute
"was today special". A revoke reads the exact `granted_amount` back off the row it deletes, in
one atomic round trip, never a hardcoded 1.

### Spotlight word cloud (partially resolves open item 14)

The word cloud is a **recipient** cloud — one node per kudos, labeled by its receiver's name
(`deriveSpotlightNodes()`), not a hashtag cloud. The "N KUDOS" header total is always a live
`count(*) from kudos`, never the design's `388` placeholder.

### Rank-promotion leaderboard (new — not in the original 18 open items)

No new table. A Sunner's 10th, 20th, and 50th received kudos each count as a promotion event,
timestamped by that kudos's `created_at` (`plans/clarifications.md` "Suy từ mốc hoa thị"). All
events across all Sunners are pooled and the 10 most recent shown. The sibling gift-recipient
leaderboard stays legitimately empty — `secret_box_gift` has no redemption/write flow yet.

### Still open after Round 2

- **Anonymous display name** (open item 18): required when `is_anonymous = true`, no max length
  or uniqueness rule in spec or code.
- **`profile.department` vs. the new `department` table are not FK-linked** — the department
  filter reads `profile.department` (free text); the reference table is the dropdown's option
  set, not a foreign-key target. Values could drift (casing, spelling) with no constraint to
  catch it.
- Every other open item from Round 1 not named above (12, 13, 15, 17, and items 1–7) remains
  open — this round did not touch Login/Homepage/Award System/Profile/Countdown.
