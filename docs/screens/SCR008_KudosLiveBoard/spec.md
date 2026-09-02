---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-09-02
---

# SCR008_KudosLiveBoard — Screen Spec

**Screen**: SCR008_KudosLiveBoard: Sun* Kudos Live board
**Feature**: F006_KudosLiveBoard
**Type**: composite
**Route**: `/kudos` (private — auth-guarded by absence from `PUBLIC_ROUTES`)
**MoMorph**: [`MaZUn5xHXZ`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ)
**Generated**: 2026-09-02

## Purpose

The hub where the SAA 2025 kudos culture becomes visible: every kudos F005 writes lands here,
ranked, browsable, searchable and filterable, next to the viewer's own standing.

## Screen Layout

Below the shared header (F002_NavigationShell), the page stacks a KV banner, an input pill
(opens F005's modal), the Highlight carousel with its two filter dropdowns, the Spotlight word
cloud, the All Kudos infinite-scroll feed, and a two-column layout where a 422px-wide sidebar
(stats + leaderboards) sits alongside the feed.

### Layout Sketch

```
┌──────────────────────────────────────────────┐
│  Header — owned by F002_NavigationShell       │
├──────────────────────────────────────────────┤
│  R1: KV banner (title + logo)                 │
│  R2: Input pill (opens F005 modal)            │
├──────────────────────────────────────────────┤
│  R3: Highlight header + Hashtag/Phòng ban      │
│  R4: Highlight carousel (5 slides, arrows)    │
├──────────────────────────────────────────────┤
│  R5: Spotlight header                         │
│  R6: Spotlight word cloud + search             │
├──────────────────────────────────────────────┤
│  R7: All Kudos header      │  R9: Sidebar      │
│  R8: All Kudos feed        │  (stats, Mở quà,  │
│      (infinite scroll)     │   2 leaderboards) │
├──────────────────────────────────────────────┤
│  Footer — owned by F002_NavigationShell       │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | KV banner | top | no | full-bleed keyvisual + title + wordmark | not specified by design |
| R2 | Input pill | below banner | no | text-shaped button opening F005's modal | not specified by design |
| R3 | Highlight header + filters | below pill | no | headings, Hashtag/Phòng ban dropdown triggers | not specified by design |
| R4 | Highlight carousel | below R3 | no (paged) | 5 `KudosCard variant="highlight"`, prev/next arrows, "n/5" pagination | not specified by design |
| R5 | Spotlight header | below carousel | no | headings | not specified by design |
| R6 | Spotlight board | below R5 | pan/zoom (not page scroll) | d3-cloud canvas, "N KUDOS" total, search input | not specified by design |
| R7/R8 | All Kudos header + feed | below spotlight, left column | vertical, infinite scroll | `KudosCard variant="feed"` list, page size 10 | not specified by design |
| R9 | Sidebar | right column, alongside feed | no | 5-row stats card, "Mở quà" (disabled + tooltip), rank + gift leaderboards | fixed 422px width; not specified by design below that |

## User Flow

### Happy Path

1. Signed-in Sunner loads `/kudos`; sees the banner, pill, Highlight carousel (top 5 by
   hearts), Spotlight, All Kudos feed, and sidebar.
2. Sunner filters by Hashtag/Phòng ban (dropdown or a card's hashtag chip); Highlight and the
   feed both re-query and Highlight resets to slide 1.
3. Sunner hearts a kudos (own kudos excluded), copies a link, or opens a detail/profile page.
4. Sunner scrolls the feed; more cards load automatically.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Visitor has no session | unauthenticated request to `/kudos`, `/kudos/[id]`, or `/profile` | Redirected to `/login?next=<path>` | F001 BR-002_PublicRouteAllowList |
| Heart clicked on own kudos | `kudos.sender_id === currentUser.id` | Button renders `disabled`; a direct API bypass is independently rejected by RLS | TC `63645b03`; `heart_insert_not_self` policy |
| Heart clicked on a `special_days` date | today (Asia/Ho_Chi_Minh) is in `special_days` | Sender credited +2 instead of +1 | TC `31936b72` |
| "Xem chi tiết" clicked | Highlight card only (feed cards have no such button per the real Figma action bar) | Opens `/kudos/[id]` | spec B.4.4 vs C.4 |
| "Mở quà" clicked | Secret Box redemption is a later round | No-op; button stays `disabled`, tooltip explains why on hover | `clarifications.md` Round 2 |
| `/kudos/{unknownId}` requested | id does not resolve to a row | Not-found state (shared `common.notFound` copy), no crash | `e2e/kudos-detail.spec.ts` "Item 3" |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| loading (server render) | initial request | server resolves every query in parallel before first paint (no client loading spinner for the initial page) | none | `kudos-board-container.tsx` |
| filtered | a Hashtag/Phòng ban value is set in the URL | Highlight + feed both scoped to the filter; carousel on slide 1 | change/clear the filter | DEC-002_FilterApplyFlow |
| feed loading more | scroll near bottom, `hasMore=true` | next page of 10 appended | keep scrolling | DEC-003_InfiniteScrollLoad |
| empty feed | zero kudos match the active filter | "Hiện tại chưa có Kudos nào." | clear the filter | TC `926d92a5` |
| empty leaderboard | a leaderboard has zero rows | "Chưa có dữ liệu" | — | TC `d035e3b8`/`d662780b` |
| heart liked / unliked | click toggles per-viewer heart state | icon color + count flip | click again to toggle back | SM-001_HeartState |

## Validation & Error Feedback

### A) Client-side

| Field | Rule | Error copy | Source |
|---|---|---|---|
| Spotlight search | ≤100 chars, non-empty on Enter | "Tối đa 100 ký tự" / "Vui lòng nhập từ khóa" | TC `9e689933` |

### B) Server-side

Heart insert/delete is re-checked by RLS regardless of the UI's disabled state (`heart_insert_not_self`,
`heart_delete_own`); `granted_amount` is computed server-side only, never accepted from the
client (BR-006). A department/hashtag filter value that resolves to zero matching Sunners/tags
degrades to an empty result set, never an error.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | Partial | heart button carries `aria-pressed`/`data-active`; Spotlight search error uses `role="alert"`; carousel/leaderboard regions not otherwise audited |
| Keyboard navigation | TBD (draft) | not specified by design, not asserted by any test this round |
| Focus management | TBD (draft) | not specified |
| Screen reader compatibility | TBD (draft) | not covered |
