---
status: draft
fcode: F002
authored_by: takumi
created: 2026-08-28
---

# SCR002_Header — Screen Spec

**Screen**: SCR002_Header (draft): Header
**Feature**: F002_NavigationShell (provisional)
**Type**: composite
**Route**: N/A — shared region rendered on `/` and `/he-thong-giai` (full) and `/login` (logo + language only, pre-auth)
**Generated**: 2026-08-28

## Purpose

Gives every in-scope page the same top navigation, language switch, and (once signed in) a role-aware account menu, so a user never loses their bearings moving between pages.

## Screen Layout

A single fixed-top bar spans the page width. Left: the SAA logo. Center: the 3 main nav links. Right: a controls cluster — notification bell, language switcher, and account avatar — each opening its own dropdown panel below the bar. Pre-auth (Login screen), only the logo and language switch render; the bell, nav links, and avatar are omitted since there is no session yet. No breakpoint or mobile pattern is specified in the design (see technical-spec.md `## Unresolved Questions`).

### Layout Sketch

```
┌───────────────────────────────────────────────────────────┐
│ R1: Header bar (fixed-top)                                 │
│  [Logo]   [Link1] [Link2] [Link3]   [Bell][Lang][Avatar]   │
├ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ┤
│ R2: Language panel (VN/EN) — visible only while open        │
├ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ┤
│ R3: Account panel (member: Profile/Logout;                  │
│     admin: Profile/Dashboard/Logout) — visible while open    │
└───────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | Header bar | fixed-top | no | Logo, 3 nav links, notification bell, language switcher, account avatar | not specified by design — see Unresolved Questions |
| R2 | Language dropdown panel | anchored to language switcher | no | VN option, EN option | opens/closes on trigger, no breakpoint variance noted |
| R3 | Account dropdown panel | anchored to avatar | no | Profile, (Dashboard for admin), Logout | opens/closes on trigger, no breakpoint variance noted |

## User Flow

### Happy Path

1. User loads any in-scope page; the Header bar (R1) renders with the current locale and, if authenticated, the current role's menu shape.
2. User clicks a nav link in R1; the corresponding page (or scroll-to-top, if already selected) is shown, and R1's active-link styling updates.
3. User clicks the language switcher in R1; R2 opens showing VN/EN; picking one updates the interface language and closes R2.
4. User clicks the avatar in R1 (signed in only); R3 opens showing Profile/Logout (member) or Profile/Dashboard/Logout (admin); selecting Logout signs the user out and redirects to the homepage.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| R1 render | no session present | only Logo + language switcher render; nav links, bell, avatar are omitted | TBD (draft) |
| R3 content | `profile.role` | member → Profile/Logout; admin → Profile/Dashboard/Logout (Dashboard renders but does not navigate) | TBD (draft) |
| R1 nav link click | link already the active/selected one | page scrolls to top instead of reloading | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| guest | no session | R1 shows only Logo + language switcher | switch language, click logo | TBD (draft) |
| member | authenticated, role = member | full R1; R3 shows Profile/Logout | navigate, switch language, open R3, sign out | TBD (draft) |
| admin | authenticated, role = admin | full R1; R3 shows Profile/Dashboard/Logout | same as member, plus a non-navigating Dashboard row | TBD (draft) |
| dropdown-closed | default | R2/R3 hidden | click/Enter/Space to open | TBD (draft) |
| dropdown-open | trigger clicked or activated by keyboard | R2 or R3 visible below its trigger | select an option, click outside, Escape, or re-toggle to close | TBD (draft) |
| notification-badge | unread notifications exist | red badge on the bell icon | click bell (no panel opens this round — deferred) | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no form fields in the header.

### B) Server-side

#### Switch language
- **Endpoint:** server action `setLocale(locale, pathname)`
- **Request:** `locale` (`vi`|`en`)
- **Success:** cookie set, page revalidated in the new locale
- **Errors:** none specified — a failed cookie write is not covered by any spec row
- **Trigger:** selecting VN or EN in R2
- **Source:** TBD (draft)

#### Sign out
- **Endpoint:** server action / route handler (logout)
- **Request:** none (uses the current session)
- **Success:** session cleared, redirect to `/`
- **Errors:** none specified — see technical-spec.md `## Unresolved Questions` for the network-failure gap
- **Trigger:** clicking Logout in R3
- **Source:** TBD (draft)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | not specified by the MoMorph spec text; dropdowns should use `aria-expanded`/`aria-haspopup` at build time |
| Keyboard navigation | partial | Enter/Space open a focused trigger, Escape closes an open panel (per test cases ID-33–35) — no explicit tab-order spec |
| Focus management | TBD (draft) | no focus-trap behavior specified for R2/R3 |
| Screen reader compatibility | TBD (draft) | not covered by any spec row |
