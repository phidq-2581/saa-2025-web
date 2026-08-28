---
status: implemented
fcode: F003
authored_by: takumi
created: 2026-08-28
lang: en
---

# F000_HomepageOverview

**Priority**: P0
**Type**: ui
**Generated**: 2026-08-28

## Overview

The homepage (`/`, public) is SAA 2025's front door: a keyvisual hero with a client-only live countdown and event info, a Root Further theme description, a 6-card award-category grid linking to the award-system page, and a Kudos promo block. Any visitor (no login required) lands here; the page's job is to communicate "what/when" and hand off to `/he-thong-giai` (award detail, per-category hash anchor) or the deferred Kudos page. Header/footer/language/account-menu/FAB are owned by F002_NavigationShell, not this feature.

## Polymorphic Behavior

N/A — no discriminator fields in Key Entities. `award_category` has 6 fixed values but the spec states they render identically save for content ("Hiển thị của các hạng mục sẽ tương tự nhau, chỉ khác nội dung" — specs.csv C2), so it is parameterized content, not a DISC-### field with distinct render/validation/persistence per value. No DISC-### entries exist anywhere in `data-model.md` yet.

## Cross-Cutting Logic
### Requirements

None — every FR below applies to exactly one User Story; see `## User Stories`.

### Business Rules

#### BR-001_CountdownZeroPadding
**Spec/Test Source:** specs.csv B1 ("hiển thị số có 0-padding"), B1.3.1–B1.3.3; test-cases.csv TC ID-12, ID-40
**Applies to:** the 3 countdown tiles (days/hours/minutes)
**Rule:** Every tile always renders exactly 2 digits, left-padded with `0` (e.g. `05`, not `5`), regardless of how small the remaining value is.
```text
pad2(n) = String(max(0, n)).padStart(2, '0')
```

#### BR-002_CountdownClampAtOrAfterTarget
**Spec/Test Source:** specs.csv B1 ("Khi về 0: ẩn subtitle... giữ nguyên trạng thái 00"); test-cases.csv TC ID-41
**Applies to:** the countdown's remaining-time calculation
**Rule:** Once `now >= eventStartAt`, all three tiles clamp to `00` and stay there — no negative numbers, no rollover past zero.
```text
diff = eventStartAt - now
if diff <= 0: return { days: '00', hours: '00', minutes: '00', reached: true }
```

#### BR-003_ComingSoonVisibility
**Spec/Test Source:** specs.csv B1.2; test-cases.csv TC ID-42, ID-43
**Applies to:** the 'Coming soon' label
**Rule:** 'Coming soon' shows only while `reached = false`; the moment the countdown clamps (BR-002), the label is removed. Single boolean — below the DISC/DEC branching threshold, kept here as a plain rule.

#### BR-004_CountdownEnvFallback
**Spec/Test Source:** clarifications.md § Assumptions ("Countdown target datetime... ISO-8601 environment variable"); test-cases.csv TC ID-60
**Applies to:** parsing `NEXT_PUBLIC_EVENT_START_AT`
**Rule:** If the env value is missing or fails to parse as a valid ISO-8601 datetime, the page must not crash; it renders a safe fallback state instead (exact fallback visual is an Unresolved Question below).

#### BR-005_CountdownClientOnlyHydration
**Spec/Test Source:** clarifications.md § Loading ("Client-only after mount... server renders 00 00 00")
**Applies to:** the countdown's render lifecycle
**Rule:** The server always renders the `00`/`00`/`00` placeholder; the client swaps in the real value only after mount, so first paint and hydration never disagree.

#### BR-006_AwardCardHashAnchorNavigation
**Spec/Test Source:** specs.csv C2, C2.1.1–C2.1.4; test-cases.csv TC ID-47–ID-50, ID-52
**Applies to:** all 6 award cards
**Rule:** Clicking a card's thumbnail, title, or 'Chi tiết' link navigates to `/he-thong-giai` with a hash anchor equal to that category's slug, so the award-system page auto-scrolls to the matching section.

#### BR-007_AwardCardMissingHashFallback
**Spec/Test Source:** test-cases.csv TC ID-62
**Applies to:** a card whose category has no resolvable hash/slug
**Rule:** The click still navigates to `/he-thong-giai`; it omits the hash anchor, so the page opens at the top instead of auto-scrolling.

#### BR-008_AboutKudosDeferredAffordance
**Spec/Test Source:** clarifications.md § Navigation ("Kudos detail page... Out of scope... mark deferred rather than inventing a screen")
**Applies to:** the hero's 'ABOUT KUDOS' button and the Kudos promo block's 'Chi tiết' button
**Rule:** Both render as normal, styled, clickable-looking CTAs; neither performs a navigation this round. Deliberate scope decision, not a bug.

### Decision Logic

N/A — no user-facing decision logic beyond DISC-### Polymorphic Behavior. The countdown's reached/not-reached toggle and the award-card hash/no-hash branch are each single-field conditions, captured as BR-002/BR-003 and BR-006/BR-007 per the DISC/DEC boundary (boolean flags are Business Rules, not DEC).

### State Machines

None — the countdown's reached/not-reached toggle is a single boolean below the ≥3-state/≥2-transition SM threshold; captured as BR-002/BR-003 instead.

### Algorithms

#### ALG-001_CountdownRemainingTime
**Linked FR:** FR-002
**Spec/Test Source:** research-02 report § Q3 (`computeRemaining` sketch); test-cases.csv TC ID-39, ID-56, ID-57
**Input:** `nowMs: number`, `targetMs: number` (both epoch-ms; `targetMs` parsed once from `NEXT_PUBLIC_EVENT_START_AT`)
**Output:** `{ days: string, hours: string, minutes: string, reached: boolean }` (numeric fields 2-digit zero-padded)
**Complexity:** O(1)
**Description:** Diffs two epoch-ms timestamps, floors into whole minutes, derives days/hours/minutes by integer division, clamps to zero once the diff is non-positive. Epoch-ms math makes the env string's UTC offset irrelevant to the arithmetic (research-02 report).
```text
function computeRemaining(nowMs, targetMs):
  diff = targetMs - nowMs
  if diff <= 0: return { days:'00', hours:'00', minutes:'00', reached: true }
  totalMinutes = floor(diff / 60000)
  days = floor(totalMinutes / 1440)
  hours = floor((totalMinutes % 1440) / 60)
  minutes = totalMinutes % 60
  return { pad2(days), pad2(hours), pad2(minutes), reached: false }
```

### External Integrations

None — no third-party API calls in this feature's owned region. The countdown target comes from a local environment variable, not an external service (clarifications.md § Assumptions).

### Verification

None beyond the per-US SC-### entries under `## User Stories` — no cross-cutting verification spans ≥2 user stories in this feature.

**Client behavior:** see behavior-logic.md, permissions.md, screen-flow.md

## User Stories

### US001_ViewHeroAndCountdown — View Hero and Countdown (Priority: P0)

**What happens:** Any visitor (no login required) lands on `/` and sees the ROOT FURTHER hero: theme title, 'Coming soon' tagline, a 3-tile live countdown (DAYS/HOURS/MINUTES), and the event info line ('18h30', 'Nhà hát nghệ thuật quân đội', the Facebook livestream note). The countdown shows a fixed `00`/`00`/`00` placeholder on first paint, then swaps to the real remaining time once the client mounts, ticking without a page reload.
**Why this priority:** First thing every visitor sees; carries the event's core "what/when" message.
**Independent Test:** Load `/` as a guest and confirm the hero, countdown tiles, and event info render without any other feature (login, award grid) being present.

**Acceptance Scenarios:**
1. **Given** the event start time is in the future, **When** the page finishes mounting on the client, **Then** the tiles show the real remaining days/hours/minutes, zero-padded, and 'Coming soon' stays visible.
2. **Given** the event start time has already passed, **When** the visitor loads the page, **Then** all three tiles clamp to `00` and 'Coming soon' is not shown.
3. **Given** the countdown has not yet mounted on the client, **When** the server renders the page, **Then** all three tiles show `00` as a placeholder (no hydration mismatch).

**Requirements fulfilled:**
- **FR-001** Render the hero keyvisual, 'ROOT FURTHER' title, and event info block ('18h30' / 'Nhà hát nghệ thuật quân đội' / livestream note) as static content — planned hero section component
- **FR-002** Compute and display a client-only live countdown (days/hours/minutes, 2-digit zero-padded) against an ISO-8601 target read from `NEXT_PUBLIC_EVENT_START_AT` — planned `useCountdown` hook (research-02 report)

**Rules enforced:** BR-001_CountdownZeroPadding, BR-002_CountdownClampAtOrAfterTarget, BR-003_ComingSoonVisibility, BR-004_CountdownEnvFallback, BR-005_CountdownClientOnlyHydration (see `## Cross-Cutting Logic`)

**Verification:**
- **SC-001** Countdown never shows a 1-digit number and never shows a negative value (covers FR-002, BR-001, BR-002)
- **SC-002** No hydration-mismatch warning appears on first paint (covers FR-002, BR-005)

---

### US002_NavigateViaHeroCTAs — Navigate via Hero CTAs (Priority: P0)

**What happens:** The hero shows a CTA pair — 'ABOUT AWARDS' (hover-look styling) and 'ABOUT KUDOS' (normal-look styling). Clicking 'ABOUT AWARDS' navigates to `/he-thong-giai`. Clicking 'ABOUT KUDOS' does nothing this round — the Kudos page is deferred (clarifications.md § Navigation) — but the button stays visible and interactive-looking.
**Why this priority:** The hero's only way out to more detail; the homepage's main conversion goal.
**Independent Test:** Click 'ABOUT AWARDS' from a fresh load and confirm navigation to `/he-thong-giai`; click 'ABOUT KUDOS' and confirm the URL does not change.

**Acceptance Scenarios:**
1. **Given** the visitor is on `/`, **When** they click 'ABOUT AWARDS', **Then** the browser navigates to `/he-thong-giai`.
2. **Given** the visitor is on `/`, **When** they click 'ABOUT KUDOS', **Then** nothing navigates — deferred affordance only.

**Requirements fulfilled:**
- **FR-003** 'ABOUT AWARDS' CTA navigates to `/he-thong-giai` — planned hero CTA component

**Rules enforced:** BR-008_AboutKudosDeferredAffordance (see `## Cross-Cutting Logic`)

**Verification:**
- **SC-003** 'ABOUT AWARDS' click always results in `/he-thong-giai` in the address bar (covers FR-003)

---

### US003_ReadRootFurtherIntro — Read Root Further Introduction (Priority: P2)

**What happens:** Below the hero, the visitor reads a static block describing the 'Root Further' theme — decorative 'ROOT'/'FURTHER' background typography, body paragraphs, and the quote "A tree with deep roots fears no storm."
**Why this priority:** Purely informational context; not required to reach the countdown or award grid.
**Independent Test:** Load `/` and confirm the Root Further paragraph block renders with no interaction required.

**Acceptance Scenarios:**
1. **Given** the visitor scrolls past the hero, **When** the Root Further block enters view, **Then** the paragraph content and quote render as static text — no loading or error state.

**Requirements fulfilled:**
- **FR-004** Render the static 'Root Further' description block (paragraphs + quote) below the hero — planned static content component

**Rules enforced:** None beyond static rendering.

**Verification:**
- **SC-004** Root Further block always renders on page load, with no async dependency (covers FR-004)

---

### US004_BrowseAwardGrid — Browse Award Grid (Priority: P1)

**What happens:** The visitor sees the awards section title ('Sun* annual awards 2025' caption, 'Hệ thống giải thưởng' heading, sub-description) followed by a 6-card grid — Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP. Each card shows a thumbnail, title, a 1–2 line description, and a 'Chi tiết' link. Clicking any of the three (thumbnail/title/'Chi tiết') on any card navigates to `/he-thong-giai` with a hash anchor equal to that category's slug.
**Why this priority:** The homepage's main content and the reason most visitors keep scrolling — one step removed from the hero's primary CTA, hence P1 not P0.
**Independent Test:** Load `/`, click each of the 6 cards in turn, and confirm each lands on `/he-thong-giai` at a different hash anchor.

**Acceptance Scenarios:**
1. **Given** the visitor is on `/`, **When** they click the Top Talent card's thumbnail, title, or 'Chi tiết' link, **Then** the browser navigates to `/he-thong-giai#{top-talent-slug}` and the page scrolls to that section.
2. **Given** a category card has no resolvable slug, **When** the visitor clicks it, **Then** the browser still navigates to `/he-thong-giai`, without an auto-scroll anchor.
3. **Given** the viewport is desktop (`≥lg`), **When** the grid renders, **Then** cards lay out 3 per row; on `md` and below, 2 per row (Tailwind default breakpoints, clarifications.md § Responsive).

**Requirements fulfilled:**
- **FR-005** Render the awards section title and the 6-card award grid, sourcing card copy from the Figma design content (never hand-invented) — planned `AwardGrid`/`AwardCard` components
- **FR-006** Each card element (thumbnail, title, 'Chi tiết' link) navigates to `/he-thong-giai#{category-slug}` — planned client navigation handler

**Rules enforced:** BR-006_AwardCardHashAnchorNavigation, BR-007_AwardCardMissingHashFallback (see `## Cross-Cutting Logic`)

**Verification:**
- **SC-005** Every one of the 6 cards produces a distinct navigation target when clicked (covers FR-006, BR-006)
- **SC-006** A card without a slug still navigates, never throws, never dead-ends (covers BR-007)

---

### US005_ViewKudosPromo — View Kudos Promo Block (Priority: P2)

**What happens:** Above the footer, the visitor sees a Kudos promo block: 'Phong trào ghi nhận' label, 'Sun* Kudos' title, a short description, an illustration, and a 'Chi tiết' button. Clicking 'Chi tiết' does nothing this round (Kudos page deferred, clarifications.md § Navigation).
**Why this priority:** Awareness-building for a feature not live yet this round; lowest priority of the five stories.
**Independent Test:** Load `/`, scroll to the Kudos block, and confirm it renders with its CTA visible but non-navigating.

**Acceptance Scenarios:**
1. **Given** the visitor scrolls to the bottom of the page, **When** the Kudos promo block enters view, **Then** title/description/illustration/CTA all render as static content.
2. **Given** the visitor clicks the Kudos block's 'Chi tiết' button, **When** the click registers, **Then** no navigation occurs.

**Requirements fulfilled:**
- **FR-007** Render the Kudos promo block (label/title/description/illustration/CTA) as a deferred, non-navigating affordance — planned static content component

**Rules enforced:** BR-008_AboutKudosDeferredAffordance (see `## Cross-Cutting Logic`, shared with US002)

**Verification:**
- **SC-007** Kudos 'Chi tiết' click never changes the URL (covers FR-007, BR-008)

### Edge Cases

See edge-cases.md.

## Key Entities

Only 2 entities apply to this feature's owned region — both are static/env-derived, not database tables (data-model.md confirms neither has a backing table this round). Adding a 3rd row would be fabricated.

| Entity | Table | Key Columns | Purpose |
|--------|-------|-------------|---------|
| award_category | N/A — no DB table; static 6-row content fixed in the design (data-model.md § award_category, superseded-by-code note) | `name`, `slug` in code (`award-categories.ts`); this grid's own short title/description copy in `messages/vi/home.json` → `awards.cards[slug]` (a separate, shorter set from the Award System page's `messages/vi/awards.json` → `cardContent[slug]`) | Source of the 6 award-card titles + badge copy shown in the grid |
| event config | N/A — no DB table; value comes from the `NEXT_PUBLIC_EVENT_START_AT` env var (data-model.md § event config) | target datetime (ISO-8601) | Drives the countdown's remaining-time calculation (ALG-001) |

## Artifact References

| Artifact | File | Codes Used | Reviewed |
|----------|------|------------|----------|
| System Overview | docs/system/system-overview.md | — | [ ] |
| Architecture | docs/system/architecture.md | — | [ ] |
| Feature List | [feature-list.md](../feature-list.md) | F003_HomepageOverview | [ ] |
| API Map | docs/generated/api-map.md | TBD (draft) | [ ] |
| Entities | docs/generated/entities.md | TBD (draft) | [ ] |
| Screens | [screens.md](./screens.md) | TBD (draft) | [ ] |
| Behavior Logic | docs/system/behavior-logic.md | TBD (draft) | [ ] |
| Permissions Matrix | docs/generated/permissions-matrix.md | TBD (draft) | [ ] |
| User Stories | docs/generated/user-stories.md | US001–US005 (local draft, this file) | [ ] |

## Assumptions

- Award card body copy for C2.2–C2.6 is empty in specs.csv (only Top Talent has a description); it will be read from the Figma design content via MoMorph MCP `query_by_type(screenId, "TEXT")` at implement time, never hand-written (clarifications.md § Assumptions).
- Countdown target datetime resolves from `NEXT_PUBLIC_EVENT_START_AT`, an ISO-8601 string with an explicit UTC offset (e.g. `+07:00`); epoch-ms diff math makes display correct regardless of server/client machine timezone (research-02 report § Q3).
- `award_category` and event config have no backing DB table this round — both are static/env-derived, per data-model.md.
- The Kudos promo 'Chi tiết' and hero 'ABOUT KUDOS' CTAs render as affordances only; no navigation target exists this round (Kudos board deferred, clarifications.md § Navigation).

## Source Code References

**Source:** `src/lib/countdown/compute-remaining.ts:1-33` — ALG-001_CountdownRemainingTime: diffs two epoch-ms timestamps, floors to whole minutes, derives days/hours/minutes by integer division, clamps to zero past target (BR-002), every field 2-digit zero-padded (BR-001).
**Source:** `src/lib/countdown/parse-target.ts:1-14` — BR-004_CountdownEnvFallback (TC ID-60): parses `NEXT_PUBLIC_EVENT_START_AT` into epoch-ms; never throws — an invalid or missing value returns `null`, the safe fallback sentinel.
**Source:** `src/lib/countdown/use-countdown.ts:1-55` — BR-005_CountdownClientOnlyHydration: `useSyncExternalStore` hook; `getServerSnapshot` always returns the `00/00/00` placeholder so first paint and hydration never disagree, 30s tick interval, minute-bucket memoized.
**Source:** `src/app/(site)/page.tsx:1-44` — route composition (hero → Root Further → award grid → Kudos promo); `(site)/layout.tsx` renders no `<main>` of its own, so this page owns the top-level landmark; the server always passes the `00/00/00`/`reached: false` placeholder into `HeroSection` (BR-005).
**Source:** `src/components/homepage/hero-section.tsx:1-104` — FR-001, keyvisual hero + wordmark + CTA pair; background image/gradient layers use `-z-10` so they can bleed under `RootFurtherBlock` without adding to document flow height.
**Source:** `src/components/homepage/event-countdown.tsx:1-79` — FR-002, BR-001_CountdownZeroPadding: presentational tiles only, receives the already-computed `remaining` prop and never touches the clock itself.
**Source:** `src/components/homepage/event-info.tsx:1-43` — FR-001, event info line; renders the spec-CSV copy ("18h30" / "Nhà hát nghệ thuật quân đội"), not the stale Figma canvas text (Group 3 checkpoint decision — spec CSV wins).
**Source:** `src/components/homepage/icon-link-arrow.tsx:1-19` — shared arrow icon reused by the hero CTAs, award cards, and the Kudos promo link.
**Source:** `src/components/homepage/root-further-block.tsx:1-57` — FR-004, static Root Further theme description.
**Source:** `src/components/homepage/award-grid.tsx:1-86` — FR-005/FR-006, BR-006/BR-007: 6-card grid, each card's `href` is `/he-thong-giai#{slug}` (falls back to no hash when a category has no slug).
**Source:** `src/components/homepage/award-card.tsx:1-79` — FR-005/FR-006: one `<a>` wraps the whole card body so thumbnail/title/'Chi tiết' share a single navigation target (BR-006).
**Source:** `src/components/homepage/kudos-promo.tsx:1-78` — FR-007, BR-008_AboutKudosDeferredAffordance: inert "Chi tiết" CTA (`type="button" aria-disabled="true" tabIndex={-1}`).

`e2e/homepage.spec.ts` (6 specs) now covers SC-001–SC-007 above.

## Unresolved Questions

1. **Countdown fallback UI**: BR-004 requires "no crash" on an invalid `NEXT_PUBLIC_EVENT_START_AT`, but no spec or clarification states the exact fallback visual (blank tiles? last-known value? a fixed message?) — TC ID-60 only asserts "fallback or error message without crashing."
2. **Category slug source**: specs.csv never states how a category's hash slug is derived (kebab-case of the English name? a fixed lookup table?) — needed to implement BR-006/BR-007.
3. **Countdown tick resolution**: research-02 report recommends a ~30s/minute-granularity tick; no test case pins down the exact refresh interval, only that TC ID-39 expects the minute value to change "after 1 minute."

### Resolved by orchestrator — 2026-08-28
- Award-card hash slug rule → kebab-case English award name (#top-talent … #mvp); shared with F004. (see plans/clarifications.md § Spec-stage gaps)
- Figma canvas vs. spec CSV conflicts (all screens) → spec CSV wins (status Done); applies here to the event-info line and countdown copy. (see plans/clarifications.md § Group 3 checkpoint)
- Award-card descriptions C2.4–C2.6 (identical placeholder sentence in Figma, `character` verified) → accepted; render verbatim, flagged to design for real copy. (see plans/clarifications.md § Group 3 checkpoint)
- Countdown LED "Digital Numbers" font has no licensed source → accepted; Montserrat bold substitute until a font file is provided. (see plans/clarifications.md § Group 3 checkpoint)

## Source Walkthrough

No source code written yet. Once implemented, recommended reading order:

1. **File:** `src/lib/countdown/compute-remaining.ts` (planned) — defines the countdown math this feature's hero depends on (ALG-001; see research-02 report § Q3).
2. **File:** `src/app/page.tsx` (planned) — the Homepage route composing this feature's regions.
3. **File:** `src/components/homepage/event-countdown.tsx` (planned) — client component per research-02's `useSyncExternalStore` sketch.
4. **File:** `src/components/homepage/award-grid.tsx` (planned) — renders the 6 award cards and the `/he-thong-giai#{slug}` navigation (BR-006/BR-007).

### Call Hierarchy

```text
Homepage route (page.tsx) -> EventCountdown (client) -> useCountdown -> computeRemaining
Homepage route (page.tsx) -> AwardGrid -> AwardCard x6 -> client navigation to /he-thong-giai#{slug}
```

**Related files:** see `## Source Code References` above (Order column added there — F15 DRY, one table not two).

## DB Impact per Event

N/A — read-only feature, no DB writes. Award-category content and the event countdown target are both static/env-derived (see `## Key Entities` and `## Assumptions`); this feature's owned region never writes to the database.
