---
status: implemented
authored_by: takumi
created: 2026-08-31
promoted: 2026-09-02
lang: en
---

| Scenario | What Happens | User-Facing Message | Source |
|---|---|---|---|
| No kudos exist at all | Highlight and All Kudos both show the empty message | "Hiện tại chưa có Kudos nào." | TC `926d92a5`; unit test on `KudosFeed` (pages=[]) |
| A leaderboard has no data | Leaderboard shows empty state | "Chưa có dữ liệu" | TC `d035e3b8`/`d662780b` |
| Sender views their own kudos card | Heart button rendered disabled | — | TC `63645b03` |
| User clicks heart on a kudos they already hearted | Second click un-hearts (toggle), not blocked | — | TC `7a7ec63e` |
| Heart clicked on a kudos sent during a `special_days` date | Sender's account gains 2 hearts instead of 1 for this like, decided server-side | — | TC `31936b72` |
| Heart revoked (unlike) | Sender's account loses exactly what that like granted (1 or 2), read back from the deleted row, never a hardcoded 1 | — | `clarifications.md` Round 2 |
| Content exceeds 3 lines (Highlight card) | Truncated with "…" (`line-clamp-3`) | — | `sun-kudos-live-board` B.3 |
| Content exceeds 5 lines (All Kudos card / detail page with `truncate=true`) | Truncated with "…" (`line-clamp-5`) | — | `sun-kudos-live-board` C.3.5 |
| Hashtag list exceeds 1 line on a feed/highlight card | Truncated with "…" (`line-clamp-1`) — the detail page wraps instead, since it never truncates | — | `sun-kudos-live-board` B.4.3/C.3.7 |
| Spotlight search: 101 characters | Rejected on Enter | "Tối đa 100 ký tự" | TC `9e689933` |
| Spotlight search: empty then triggered (Enter) | Rejected on Enter | "Vui lòng nhập từ khóa" | TC `9e689933` |
| Spotlight: no data | Word cloud renders with 0 nodes; header still reads a live "0 KUDOS" total if the whole board is empty | — | `sun-kudos-live-board` B.7 |
| Unauthenticated visitor requests `/kudos`, `/kudos/[id]`, or `/profile` | Redirected to `/login?next=<path>` | — | TC `71b3ef43` |
| Carousel at slide 1 | Prev arrow disabled | — | `sun-kudos-live-board` B.2.1/B.5.1 |
| Carousel at slide 5 | Next arrow disabled | — | `sun-kudos-live-board` B.2.2/B.5.3 |
| Secret Box counters, no data yet | Real values from `secret_box_gift`, default `0` — not hidden, not "Chưa có dữ liệu" | — | `clarifications.md` Round 2 |
| "Mở quà" clicked | No-op — button is `disabled`; a CSS `group-hover` tooltip still fires on hover despite the native disabled-button hover quirk | "Sắp ra mắt" (`kudos.sidebar.openGiftTooltip`) | see `## Copy gaps` |
| Filter applied, then Highlight is on page 3 | Highlight resets to page 1/5 on any filter change (URL-driven `key` remount of the client shell) | — | `sun-kudos-live-board` B "Chọn filter: ... đặt pagination về 1" |
| `/kudos/{unknownId}` | Renders a not-found state (shared `common.notFound` catalogue), never a crash | — | `e2e/kudos-detail.spec.ts` "Item 3" |
| `/profile` with no `id`, an array `id`, or an unresolved `id` | All resolve to the same safe placeholder (`profile: null`), never a throw | — | `e2e/kudos-detail.spec.ts` "Item 5" |
| Direct `storage.objects` insert to another Sunner's `kudos/{their-id}/...` prefix | Rejected by the scoped RLS policy (Group-3 High-severity fix) | — | see `## Security fix` |

## Copy gaps

Three strings in this feature have no design source. Resolved per the C2.4–C2.6 precedent
from round 1 (a minimal Vietnamese copy decision, logged rather than invented from nothing),
and recorded in `docs/test-traceability.md` § Copy gaps (round 2):

1. **"Mở quà" tooltip copy** (`kudos.sidebar.openGiftTooltip`): "Sắp ra mắt".
2. **Spotlight search max-length error** (`kudos.spotlight.searchMaxLengthError`): "Tối đa 100
   ký tự".
3. **Spotlight search empty-on-submit error** (`kudos.spotlight.searchEmptyError`): "Vui lòng
   nhập từ khóa".

## Security fix (Group-3 checkpoint, 2026-09-02)

The Group-3 code review found the original `images_insert_authenticated` storage policy
(`supabase/migrations/20260831000200_storage_images_policies.sql`) checked only
`bucket_id = 'images'` — any authenticated Sunner could upload to *any* path in the bucket,
including another Sunner's `kudos/{their_id}/...` prefix, defeating the app-level path
convention entirely (the app-level `verifyKudosImageStoragePath()` only gates whether a path
may be *linked into a `kudos_image` row*, not the underlying object write). Fixed in
`supabase/migrations/20260902000000_scope_images_insert_policy.sql`, which drops and recreates
the policy scoped to the caller's own folder segment:

```sql
with check (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = 'kudos'
  and (storage.foldername(name))[2] = auth.uid()::text
)
```

The sibling `images_select_authenticated` policy is unchanged — every signed-in Sunner still
needs to view every kudos's images in the feed, so read access stays bucket-wide by design.

## Unresolved Questions

- **Rank-promotion leaderboard tie-break precision** — `deriveRankPromotions()`
  (`src/lib/kudos/derive/rank-promotion.ts`) breaks an exact milestone-timestamp tie by
  `userId` ascending; unspecified by the spec, fixed here purely for determinism.
- **Hero tier badge threshold** — the design shows a separate 4-tier "Hero" badge (New/Rising/
  Super/Legend) next to a name; no threshold rule exists in any spec row (the round-1
  clarifications session left "hero tier thresholds by distinct senders" open, non-blocking).
  The shipped code reuses the already-approved asterisk-tier milestones (10/20/50 kudos
  received) rather than inventing a second, undefined scale — flagged for a design checkpoint
  to override if that reuse is wrong.
