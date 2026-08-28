---
status: draft
fcode: F002
authored_by: takumi
created: 2026-08-28
---

# SCR004_Fab — Screen Spec

**Screen**: SCR004_Fab (draft): Floating Action Button
**Feature**: F002_NavigationShell (provisional)
**Type**: atomic
**Route**: N/A — floating widget rendered over Homepage SAA and Hệ thống giải for authenticated users
**Generated**: 2026-08-28

## Purpose

Gives a signed-in user quick access to two upcoming actions — writing a kudos and reading the rules — from a single floating button, without leaving the current page.

## Screen Layout

A pill-shaped button floats fixed at the bottom-right of the viewport. Collapsed, it shows a pencil icon and the SAA icon separated by "/". Clicking it expands to reveal two labeled buttons (Thể lệ, Viết KUDOS) plus a round red Hủy (cancel) button that collapses it again.

### Layout Sketch

```
                                          ┌────────────────┐
                                          │ R2: Thể lệ      │
                                          ├────────────────┤
                                          │ R2: Viết KUDOS  │
                                          ├───────┬────────┤
                                          │  R1    │  R3    │
                                          │ (pill) │ (Hủy)  │
                                          └───────┴────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | Collapsed widget | fixed bottom-right | no | pencil icon, SAA icon, "/" separator | not specified by design |
| R2 | Expanded option buttons | anchored above R1, visible only when expanded | no | "Thể lệ" button, "Viết KUDOS" button | not specified by design |
| R3 | Cancel (Hủy) button | anchored beside/above R1 when expanded | no | round red button with "×" icon | not specified by design |

## User Flow

### Happy Path

1. Authenticated user sees the collapsed widget (R1) floating at the bottom-right.
2. User clicks R1; it expands to show R2 (Thể lệ, Viết KUDOS) and R3 (Hủy).
3. User clicks Thể lệ or Viết KUDOS; nothing opens this round (both destinations are deferred).
4. User clicks Hủy, clicks outside the widget, or clicks R1 again; the widget collapses back to R1.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Widget visibility | no session present | widget does not render at all (guest users do not see it) | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| hidden | no session | widget not rendered | none | TBD (draft) |
| collapsed | default, authenticated | pill widget only (R1) | click to expand | TBD (draft) |
| expanded | R1 clicked | R2 + R3 visible | click Thể lệ/Viết KUDOS (no-op, deferred), click Hủy/outside to collapse | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no form fields.

### B) Server-side

N/A — no submit-style action handlers detected; both destinations behind R2 are deferred this round.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | not specified by design |
| Keyboard navigation | TBD (draft) | not covered by any test case specific to the widget |
| Focus management | TBD (draft) | not specified |
| Screen reader compatibility | TBD (draft) | not covered |
