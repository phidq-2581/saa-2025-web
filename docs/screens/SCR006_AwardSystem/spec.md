---
status: draft
fcode: F004
authored_by: takumi
created: 2026-08-28
---

# SCR006_AwardSystem — Screen Spec

**Screen**: SCR006_AwardSystem: Hệ thống giải
**Feature**: F004_AwardSystemBrowse (provisional)
**Type**: composite
**Route**: /he-thong-giai
**Generated**: 2026-08-28

## Purpose

A signed-in Sunner reads the SAA 2025 keyvisual hero and section title, browses all six award categories via a scroll-spy left menu, and sees the Sun* Kudos promo block at the end of the page.

## Screen Layout

The page is a single scrollable column below the global header. A keyvisual hero and static section title sit at the top, followed by a two-column award section — a sticky left category menu (6 items) alongside a vertically stacked list of six award cards — and closes with the Sun* Kudos promo block above the global footer. Header, footer, and the floating action button are owned by F002_NavigationShell and are not part of this screen's regions. Per clarifications.md § Responsive, the grid collapses from the 3-column desktop layout implied by the design to Tailwind's default breakpoints (sm 640 / md 768 / lg 1024 / xl 1280) — the left menu becomes a horizontal or collapsible list below `md`.

### Layout Sketch

```
┌───────────────────────────────────────────────────┐
│  R1: Header (owned by F002_NavigationShell, fixed) │
├─────────────────────────────────────────────────────┤
│  R2: Keyvisual Hero (static)                        │
├─────────────────────────────────────────────────────┤
│  R3: Section Title (static)                         │
├──────────────┬──────────────────────────────────────┤
│ R4: Category │ R5: Award Cards D.1–D.6              │
│ Nav (sticky, │ (scrollable, main content)           │
│ lg+ only)    │                                      │
├──────────────┴──────────────────────────────────────┤
│  R6: Sun* Kudos Promo Block (static)                 │
├───────────────────────────────────────────────────┤
│  R7: Footer + FAB (owned by F002_NavigationShell)   │
└───────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|------------------|-----------------------|
| R1 | Header | fixed-top | no | owned by F002_NavigationShell | visible-md+ / hamburger-sm |
| R2 | Keyvisual Hero | static | no (page scrolls past it) | hero background image, title "ROOT FURTHER", subtitle "Sun* Annual Award 2025" | fluid, cover/center-crop at all sizes |
| R3 | Section Title | static | no | subtitle "Sun* annual awards 2025" + heading "Hệ thống giải thưởng SAA 2025" | fluid |
| R4 | Award Category Nav | sticky (lg+) | no | 6 nav items C.1–C.6 | sticky sidebar lg+; collapses to a non-sticky horizontal/stacked list below lg per Tailwind defaults |
| R5 | Award Cards | static | yes (page scroll) | 6 award cards D.1–D.6 (336x336 image + title + description + quantity + prize) | 3-col desktop / 2-col tablet-mobile per clarifications.md § Responsive |
| R6 | Sun* Kudos Promo Block | static | no | label, title, description, illustration, "Chi tiết" button (D2.1) | fluid, stacks illustration below text on small screens |
| R7 | Footer + FAB | static / fixed | no | owned by F002_NavigationShell | visible-md+ / hamburger-sm |

## User Flow

### Happy Path

1. Sunner arrives at R2 Keyvisual Hero / R3 Section Title at the top of the page (direct nav) or already scrolled to a category in R5 (Homepage deep-link hash).
2. Sunner clicks a category item in R4 Award Category Nav.
3. The page smooth-scrolls R5 to the matching award card and R4 highlights that item gold + underlined, clearing any previous active item.
4. Sunner reads the card's image, description, quantity, and prize value in R5.
5. Sunner repeats steps 2–4 for other categories, or scrolls freely without clicking R4.
6. Sunner reaches R6 Sun* Kudos Promo Block and sees the "Chi tiết" button (D2.1).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Page mount | URL has a valid category hash (e.g. `#top-talent`) | R5 scrolls to that card and R4 marks it active on load, no click needed | TBD (draft) |
| Page mount / console call | URL hash or programmatic section id is unknown/invalid | No JS error; page stays at current position, no R4 item becomes active (TC ID-13) | TBD (draft) |
| Click in R6 | Sunner clicks "Chi tiết" (D2.1) | No navigation this round — `/kudos` is deferred; button stays a visible affordance only (TC ID-12, TC ID-14 deferred) | TBD (draft) |

## UI States

N/A — no async ops. All award content (hero, title, 6 cards, Kudos block) is static design data rendered on load; there is no loading/empty/error/saving/success cycle on this screen. The one navigational edge case (an invalid hash) is documented under `## Validation & Error Feedback` and in `edge-cases.md`, not as a UI state.

## Validation & Error Feedback

### A) Client-side

N/A — no form fields on this screen; it is a read-only browse page with no user input to validate.

### B) Server-side

N/A — no submit-style actions on this screen. The Kudos "Chi tiết" button is a non-navigating affordance this round (deferred), and the unauthenticated-access redirect belongs to F001_GoogleOAuthLogin's guard, not this screen.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial (draft) | The hero image has literal alt text from the design ("Keyvisual Sun* Annual Award 2025"); the active nav item should carry `aria-current="true"` when built — not yet implemented |
| Keyboard navigation | not implemented (draft) | The 6 left-menu items should be reachable via Tab and activate the same scroll+active behavior as a click; not yet built |
| Focus management | unmanaged (draft) | No modal/drawer on this screen. Recommended: move focus to the target section's heading on scroll for screen-reader users — not specified in the source design, a build-time recommendation only |
| Screen reader compatibility | unknown (draft) | Not yet testable — no code exists |
