---
status: draft
fcode: F002
authored_by: takumi
created: 2026-08-28
---

# SCR003_Footer — Screen Spec

**Screen**: SCR003_Footer (draft): Footer
**Feature**: F002_NavigationShell (provisional)
**Type**: atomic
**Route**: N/A — shared region rendered on every in-scope screen
**Generated**: 2026-08-28

## Purpose

Repeats the main navigation at the bottom of every page along with copyright and a secondary "general standards" link, so a user who has scrolled past the header can still move around the site.

## Screen Layout

A single static row at the bottom of the page: logo on the left, the same 3 nav links centered, copyright text on the right, plus a separate "Tiêu chuẩn chung" button. It does not vary by auth state or role — every visitor sees the same footer.

### Layout Sketch

```
┌───────────────────────────────────────────────────────────┐
│ R1: Footer bar (static)                                     │
│  [Logo]   [Link1] [Link2] [Link3]   [© copyright]           │
│           [Tiêu chuẩn chung button]                          │
└───────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | Footer bar | static, bottom of page | no | Logo, 3 nav links, copyright text, "Tiêu chuẩn chung" button | not specified by design |

## User Flow

### Happy Path

1. User scrolls to the bottom of any in-scope page and sees the Footer bar (R1).
2. User clicks the logo or a nav link; behavior matches the header's equivalent link (navigate, or scroll to top if already on that page).
3. User clicks "Tiêu chuẩn chung"; destination is unresolved this round (see technical-spec.md `## Unresolved Questions`).

### Branches

`N/A — single-purpose region, no branches beyond the deferred-destination note above.`

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| default | always | full footer renders identically for guest, member, and admin | click logo/links/"Tiêu chuẩn chung" | TBD (draft) |
| hover | mouse over a link | highlight, matching the header's hover treatment | click | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no form fields.

### B) Server-side

N/A — no submit-style action handlers; all footer interactions are client-side navigation or a not-yet-defined destination.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | not specified; footer should use a `<footer>` landmark at build time |
| Keyboard navigation | TBD (draft) | standard tab order assumed, not explicitly tested |
| Focus management | TBD (draft) | no panels to manage focus for |
| Screen reader compatibility | TBD (draft) | not covered by any spec row |
