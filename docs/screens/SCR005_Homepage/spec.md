---
status: draft
fcode: F003
authored_by: takumi
created: 2026-08-28
---

# SCR005_Homepage — Screen Spec

**Screen**: SCR005_Homepage (draft — SCR### allocated at promote): Homepage (SAA 2025)
**Feature**: F003_HomepageOverview (provisional — feature-list.md; final F### allocated at promote)
**Type**: composite
**Route**: `/` (public)
**Generated**: 2026-08-28

## Purpose

A visitor or Sunner arrives here first to learn what SAA 2025 is, watch the live countdown to the event, and find a way into the award categories or the Kudos campaign.

## Screen Layout

Below the shared header (owned by F002_NavigationShell), the page stacks five sections top-to-bottom: the hero/countdown block, the Root Further description, the awards section (title + 6-card grid), the Kudos promo block, then the shared footer (owned by F002_NavigationShell). All regions are static-height on desktop and stack single-column on small screens (Tailwind default breakpoints, clarifications.md § Responsive).

### Layout Sketch

```
┌──────────────────────────────────────────────┐
│  Header — owned by F002_NavigationShell       │
├──────────────────────────────────────────────┤
│  R1: Hero + Countdown + Event Info (static)   │
│  R2: Root Further Description (static)        │
├──────────────────────────────────────────────┤
│  R3: Awards Section Title                     │
│  R4: Award Card Grid (3-col desktop /         │
│      2-col tablet-mobile)                     │
├──────────────────────────────────────────────┤
│  R5: Kudos Promo Block                        │
├──────────────────────────────────────────────┤
│  Footer — owned by F002_NavigationShell       │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|------------------|----------------------|
| Header | Navigation Shell Header | fixed-top / sticky | no | owned by F002_NavigationShell | always |
| R1 | Hero + Countdown + Event Info | static | no (page scrolls) | keyvisual background, 'ROOT FURTHER' title, 'Coming soon' label, 3-tile countdown, event info block, ABOUT AWARDS / ABOUT KUDOS CTA pair | stacks/shrinks on small screens |
| R2 | Root Further Description | static | no | paragraph content block | text wraps, no reflow |
| R3 | Awards Section Title | static | no | caption + heading + sub-description | none |
| R4 | Award Card Grid | static | no | 6 award-category cards (image, title, description, 'Chi tiết' link) | 3-col `≥lg`, 2-col `md` and below (Tailwind default, clarifications.md § Responsive) |
| R5 | Kudos Promo Block | static | no | title, description, illustration, 'Chi tiết' CTA | stacks single-column on small screens |
| Footer | Navigation Shell Footer | static | no | owned by F002_NavigationShell | always |

## User Flow

### Happy Path

1. Visitor lands on `/` and sees R1 (hero, countdown ticking, event info) render first.
2. Visitor scrolls past R2 (Root Further description).
3. Visitor reaches R3/R4 and reads the six award-category cards.
4. Visitor clicks a card's image, title, or 'Chi tiết' link in R4 and is carried to `/he-thong-giai#{category-slug}`.
5. (Alternate ending) Visitor instead scrolls to R5, reads the Kudos promo block, and may click its 'Chi tiết' link — a no-op affordance this round (Kudos page deferred).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Step 1 (countdown render) | Event start time already passed | R1 clamps to `00`/`00`/`00` and hides 'Coming soon'; nothing else changes | TBD (draft) |
| Step 4 (card click) | Card's category has no hash slug | Navigates to `/he-thong-giai` without a scroll anchor instead of `#{slug}` | TBD (draft) |
| Step 1/5 (CTA choice) | Button clicked is 'ABOUT AWARDS' | Navigates to `/he-thong-giai` | TBD (draft) |
| Step 1/5 (CTA choice) | Button clicked is 'ABOUT KUDOS' or Kudos 'Chi tiết' | No navigation — deferred target (clarifications.md § Navigation) | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| loading (countdown) | first paint, before client mount | server placeholder shows `00`/`00`/`00` on all three tiles, no ticking | none | TBD (draft) |
| ready (countdown) | client mounts | real remaining time renders and ticks | none | TBD (draft) |
| reached (countdown) | now ≥ event start time | all tiles clamp to `00`, 'Coming soon' label removed | none | TBD (draft) |
| static (all other regions) | always | R2/R3/R4/R5 render immediately, no async state | scroll, click | TBD (draft) |

N/A — no server error/saving/empty states on this screen: every non-countdown region is static content, and there is no form submission or data fetch that can fail.

## Validation & Error Feedback

### A) Client-side

N/A — no client-side form validation detected. This screen has no form fields; the only client-side check is the countdown's own env-value parsing (see `technical-spec.md` BR-004_CountdownEnvFallback), not user input validation.

### B) Server-side

N/A — no submit-style action handlers detected. Every interactive element on this screen is a navigation link (award cards, ABOUT AWARDS/ABOUT KUDOS, Kudos 'Chi tiết'), not a form submission.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | unknown | Countdown tiles should use `aria-live="polite"` per research-02 report's sketch; not yet confirmed against final markup |
| Keyboard navigation | unknown | Award cards and CTA buttons are expected to be real `<a>`/`<button>` elements, tab-reachable by default; not yet built |
| Focus management | unknown | No modal/drawer on this screen — no focus trap expected |
| Screen reader compatibility | unknown | Not yet tested |

[NO_A11Y_DETECTED] — accessibility audit needed before production release.
