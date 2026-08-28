# Feature List

## Feature Hierarchy

| # | Code | Feature | Priority | Type | Status |
|---|------|---------|----------|------|--------|
| 1 | F001 | Google OAuth Login & Session Guard | P0 | mixed | implemented |
| 2 | F002 | Global Navigation Shell (Header/Footer/Language/Account Menu/FAB) | P0 | ui | implemented |
| 3 | F003 | Homepage Overview (Hero, Countdown, Award Grid, Kudos Promo) | P0 | ui | implemented |
| 4 | F004 | Award System Browsing (Scroll-Spy Categories) | P1 | ui | implemented |

## Feature Details

### F001 — Google OAuth Login & Session Guard

**Priority:** P0 | **Type:** mixed | **Status:** implemented | **Slug:** F001_GoogleOAuthLogin

A Sunner signs in with a `@sun-asterisk.com` Google account from the Login screen and holds a guarded session across the site; non-domain accounts are rejected at the OAuth callback, and every subsequent request is re-checked by the route guard.

**Related:** screens: SCR001 | routes: — | models: —

### F002 — Global Navigation Shell (Header/Footer/Language/Account Menu/FAB)

**Priority:** P0 | **Type:** ui | **Status:** implemented | **Slug:** F002_NavigationShell

The persistent header/footer chrome — with language switch and role-aware account menu — reused verbatim across Login (partial: logo + language only, no account menu pre-auth), Homepage SAA, and Hệ thống giải; the floating action button renders in the same shell but its two destinations (Kudos composer, Thể lệ rules) are deferred screens this round, so it is presentational-only here (visible, non-navigating). Kept as its own feature per the template's partial-screen-ownership note: each screen owns only its unique content region, not the shared header/footer/FAB.

**Related:** screens: SCR002, SCR003, SCR004 | routes: — | models: —

### F003 — Homepage Overview (Hero, Countdown, Award Grid, Kudos Promo)

**Priority:** P0 | **Type:** ui | **Status:** implemented | **Slug:** F003_HomepageOverview

A visitor or Sunner reads the SAA 2025 homepage — hero with a client-only live countdown, event info, six award-category cards linking to the Award System page (per-category hash anchor), and a Kudos promo banner — then moves on via the CTA/links. Public route (`/`) per clarifications.md. Header/footer/language/account-menu/FAB are NOT owned here — see F002_NavigationShell.

**Related:** screens: SCR005 | routes: — | models: —

### F004 — Award System Browsing (Scroll-Spy Categories)

**Priority:** P1 | **Type:** ui | **Status:** implemented | **Slug:** F004_AwardSystemBrowse

A Sunner browses the `/he-thong-giai` page — hero, six award-info cards, and a scroll-spy side navigation that highlights the active category as the user scrolls, plus a Kudos banner. This is the same page the Homepage terms "Awards Information" (confirmed identical in clarifications.md). Header/footer/language/account-menu/FAB are NOT owned here — see F002_NavigationShell. Requires a session per clarifications.md (private route).

**Related:** screens: SCR006 | routes: — | models: —
