---
status: implemented
authored_by: takumi
created: 2026-08-31
promoted: 2026-09-02
lang: en
---

## Why It Matters

`/kudos` is where the whole SAA 2025 kudos culture becomes visible: every kudos F005 writes
lands here, ranked (Highlight), browsable (All Kudos feed), searchable (Spotlight word cloud),
and filterable (Hashtag/Phòng ban). It is also where a Sunner sees their own standing (sidebar
stats) and can start writing a new kudos (input pill → F005's modal).

## Who Uses It

- **Sunner** — any signed-in Sunner; browses, filters, hearts kudos, opens details, opens
  profiles, starts a new kudos.
- **Sunner (viewing their own stats)** — the sidebar's stat lines and Secret Box counters are
  always the viewer's own numbers, never another Sunner's.

## What They Do

1. A signed-in Sunner opens `/kudos`; sees the KV banner, the input pill (opens F005), the
   Highlight carousel (top 5 by hearts, center-prominent, arrows/pagination), the Hashtag +
   Phòng ban filter dropdowns, the Spotlight word cloud, the All Kudos infinite-scroll feed, and
   a sidebar (stats + Secret Box + two leaderboards).
2. Selecting a Hashtag or Phòng ban filter re-queries both the Highlight carousel and the All
   Kudos feed together (via a shared URL query param), resetting Highlight's pagination to 1.
3. Clicking a hashtag chip on any card sets the Hashtag filter to that tag and re-filters both
   surfaces the same way.
4. Clicking a card's heart toggles the Sunner's own like; the sender cannot heart their own
   kudos. A heart credits the **sender**, not the receiver, +1 point (+2 on a `special_days`
   date) — see the heart-grant rule in `technical-spec.md`.
5. Clicking "Copy Link" copies the kudos's URL and shows a toast; clicking "Xem chi tiết" (on a
   Highlight card) or a feed card's content (spec C.2/C.3.5) opens `/kudos/[id]`. On that detail
   page itself, the same heart and Copy Link controls are interactive, not just structural.
6. Searching or clicking a node in the Spotlight word cloud surfaces or opens a specific
   recipient's kudos — the word cloud is a **recipient** cloud (one node per kudos, labeled by
   its receiver's name), not a hashtag cloud.
7. A `/profile?id={uuid}` stub screen exists for round 3 to build on. Clicking a card's
   sender/receiver avatar or name opens it (`CardAuthorBlock` wraps the whole block in a
   `next/link` `Link`); a leaderboard entry's avatar/name is wired the same way in
   `LeaderboardList` but has no test exercising the click yet — see `## Notes on promotion`.
8. The sidebar's "Mở quà" (open gift) button is visibly disabled with a tooltip — the Secret Box
   open flow itself is a later round; the counters next to it are real DB values, defaulting to
   0.
9. The sidebar shows two leaderboards: a rank-promotion board (Sunners who most recently crossed
   the 10th/20th/50th received-kudos milestone) and a gift-recipient board (legitimately empty
   this round — no Secret Box redemption flow exists yet).

## Notes on promotion from the Stage-1.5 draft

The spec drafts under `spec/F006_KudosLiveBoard/` (2026-08-31) render the rank-promotion
leaderboard as permanently empty ("this draft's call: render the leaderboard shell with the
'Chưa có dữ liệu' empty state permanently this round"). That call was superseded before
implementation: `plans/clarifications.md`'s own Round 2 session already resolved the leaderboard's
data source ("Suy từ mốc hoa thị" — derived from the 10/20/50 received-kudos milestones), and the
shipped code implements exactly that derivation (`src/lib/kudos/derive/rank-promotion.ts`). Only
the **gift**-recipient leaderboard is legitimately empty this round (see the sidebar
empty-states rule in `technical-spec.md`).

**Update (2026-09-02):** the draft's own user journey (and its TC citation `0952e2f0`) says
clicking a card's or leaderboard's avatar/name opens `/profile?id={uuid}`. This was flagged as a
real gap by this promotion's first pass — `CardAuthorBlock` and `LeaderboardList` rendered plain,
non-interactive markup, and the phase's own RED tests navigated to `/profile?id=` directly by
URL rather than by clicking a rendered avatar, so the gap had no test to catch it. It is fixed
now: `CardAuthorBlock` (`src/components/kudos/card/card-author-block.tsx`) wraps its whole block
in a `next/link` `Link` to `/profile?id={author.id}`, and `LeaderboardList`
(`src/components/kudos/board/leaderboard-list.tsx`) wraps each entry the same way (`className="contents"`
so the flex layout is unaffected). A new e2e test ("4b" in `e2e/kudos-integration.spec.ts`)
clicks a card's sender name and asserts the `/profile?id=` navigation — green. No test yet
clicks a leaderboard entry specifically (`docs/test-traceability.md` TC `6b1e2359`).

**Update (2026-09-02, second pass):** two further gaps of the same shape were flagged, then
closed within the same round — verified on disk again, not carried forward from either draft:

- **Feed-card content → `/kudos/[id]`** (spec C.2/C.3.5, TC `31693bb7`). `kudos-card.tsx`'s
  content block (feed variant only) now carries `role="link"`, `tabIndex={0}`, and both
  `onClick`/`onKeyDown` handlers that `router.push()` to `/kudos/${view.id}` — guarded so a
  click on an embedded link mark inside the rendered content (`content-schema.ts` allows `link`
  nodes) doesn't double-navigate. `e2e/kudos-integration.spec.ts` "4c" clicks the content region
  and asserts the navigation — green.
- **Detail-page heart toggle and Copy Link.** `KudosDetailContainer` now passes the signed-in
  Sunner's id (`currentViewerId`, from `getClaims()`) to `KudosDetailView`, which derives
  `canHeart` from it and toggles through the shared `useHeartToggle` hook
  (`src/components/kudos/containers/use-heart-toggle.ts`) — the same in-flight-guard/
  optimistic-count logic the board's cards already used, factored out rather than duplicated.
  Copy Link shows the identical verbatim toast. `e2e/kudos-detail.spec.ts` "Item 2" clicks the
  heart button (0→1→0) and Copy Link (toast text) end to end — green.

## Unresolved Questions

- **Department seed list** was unstructured in the raw spec CSV — see
  `../../data-model.md` § Kudos Cluster for the resolved 50-name seed.
