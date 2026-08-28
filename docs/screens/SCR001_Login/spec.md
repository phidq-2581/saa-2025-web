---
status: draft
fcode: F001
authored_by: takumi
created: 2026-08-28
lang: en
---

# SCR001_Login — Screen Spec

**Screen**: SCR001_Login (draft): Login
**Feature**: F001_GoogleOAuthLogin
**Type**: atomic
**Route**: `/login`
**Generated**: 2026-08-28

## Purpose

A visitor who is not yet signed in lands here to start Google sign-in before reaching any other SAA 2025 page.

## Screen Layout

Three stacked regions fill the viewport: a fixed/sticky header (logo + language selector — owned by F002_NavigationShell), a hero/main section covering the space between header and footer with the abstract wave artwork, the "ROOT FURTHER" headline, intro copy, and the single "LOGIN With Google" button, and a fixed footer with the copyright line (also owned by F002_NavigationShell). No responsive breakpoint is stated in the raw MoMorph spec beyond the fixed header/footer positioning.

### Layout Sketch

```
┌───────────────────────────────────────────┐
│ R1: Header (fixed-top) — logo | language   │
├─────────────────────────────────────────────┤
│ R2: Hero / Main (static, full-bleed artwork)│
│   "ROOT FURTHER" + intro copy + Login btn  │
├─────────────────────────────────────────────┤
│ R3: Footer (fixed-bottom) — copyright      │
└───────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|-----------------------|
| R1 | Header | fixed-top | no | Logo, language selector (F002_NavigationShell) | TBD (draft) — no breakpoint stated |
| R2 | Hero / Main | static | no | Hero artwork, headline, intro copy, "LOGIN With Google" button | TBD (draft) — no breakpoint stated |
| R3 | Footer | fixed-bottom | no | Copyright text (F002_NavigationShell) | TBD (draft) — no breakpoint stated |

## User Flow

### Happy Path

1. Visitor opens the Login screen and sees the hero intro and the "LOGIN With Google" button in R2.
2. Visitor clicks "LOGIN With Google" in R2; the button becomes disabled and shows a loading indicator.
3. Google's own sign-in flow runs; on success with a `@sun-asterisk.com` account, the visitor leaves this screen for the Homepage screen already signed in.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Step 3 | Google sign-in cancelled or errors | Button returns to its default state; screen shows the error copy "Đăng nhập không thành công. Vui lòng thử lại." | TBD (draft) |
| Step 3 | Google account is not `@sun-asterisk.com` | Visitor is returned to this same screen with the same error copy (rejection happens server-side, after leaving and returning to this screen) | TBD (draft) |
| On mount | Visitor already has a valid session | Visitor never sees this screen's content — immediate redirect to the Homepage screen | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| default | screen mount, no session | Hero + intro + enabled "LOGIN With Google" button | click button | TBD (draft) |
| loading | button clicked | Button disabled, shows a loading indicator | none | TBD (draft) |
| error | Google sign-in cancelled/failed/domain-rejected | Same default layout plus the error copy "Đăng nhập không thành công. Vui lòng thử lại." | click button to retry | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no client-side form validation detected (this screen has no input fields, only a single OAuth trigger button).

### B) Server-side

#### Google sign-in
- **Endpoint:** TBD (draft) — planned OAuth initiation + callback, see `../../technical-spec.md § User Stories`
- **Request:** none (no form fields — sign-in is a single button click)
- **Success:** redirect to the Homepage screen with an active session
- **Errors:** cancelled/failed Google auth or a non-`@sun-asterisk.com` account both show "Đăng nhập không thành công. Vui lòng thử lại." (domain rejection happens server-side, after the OAuth round-trip)
- **Trigger:** click on the "LOGIN With Google" button
- **Source:** TBD (draft)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Not specified in the raw MoMorph spec |
| Keyboard navigation | TBD (draft) | Single interactive element (login button); no stated tab order beyond default |
| Focus management | TBD (draft) | No modal/drawer on this screen |
| Screen reader compatibility | TBD (draft) | Not specified |

[NO_A11Y_DETECTED] — accessibility audit needed before production release.
