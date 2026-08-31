# User Stories

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 4 — IPE enumeration over `screen-list.md` (SCR001_Home, SCR002_Login,
SCR003_AwardSystem), cross-referenced with `permissions-matrix.md` (guest/member/admin/system)
and `behavior-logic.md` (BL001–BL005). Source-verified per the task's flagged interactions: locale
switch (`language-dropdown.tsx`, `select-locale-action.ts`), logout (`account-menu.tsx`,
`src/app/auth/sign-out/route.ts`), award-nav deep-link (`award-category-nav.tsx`,
`resolve-active-slug.ts`, `award-card.tsx`), countdown (`use-countdown.ts`).

**Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login, US002_ViewDashboard)

**US Types**:
- `ui` - User-facing stories (require Screen mapping)
- `system` - System stories: hook, event, observer, bg-job, trigger, etc. (no Screen mapping needed)

**Note**: Feature mapping is managed in FeatureList.md only (not yet generated at this wave). No
`system`-typed US is emitted this round — all 5 BL### items are reachable from a real user click
(sign-in, sign-out, or passive countdown view) and are cited as Background Logic under the owning
`ui` US instead of duplicated into a standalone `system` story. `BL005_ProfileProvisioningTrigger`
fires on a Postgres `security definer` trigger — actor `system`, not an HTTP-reachable human role
per `permissions-matrix.md` — so per rule it is **not** written as its own US; it is cited as
Background Logic under `US001_SignInWithGoogle`, the one human action that causes it.

## Interaction Inventory

> One row per interactive (wired) element, pre-merge. A control with no `onClick`/`href`/form
> action is inert decoration, not an interaction point (dfm-form analog rule extended to web) —
> excluded here and logged below the table instead of silently dropped.

| Screen | Element | Type | Action | Endpoint |
|--------|---------|------|--------|---------|
| SCR002_Login | GoogleSignInButton form (`google-sign-in-button.tsx:76`) | primary-action | Submit Google OAuth Server Action | Server Action `signInWithGoogle` → GET /auth/callback |
| SCR001_Home, SCR003_AwardSystem | AccountMenu Logout form (`account-menu.tsx:96`) | destructive-action | Submit sign-out form | POST /auth/sign-out |
| SCR001_Home, SCR003_AwardSystem | LanguageDropdown "VN" option (`language-dropdown.tsx:44-58`) | secondary-action | Select Vietnamese locale | Server Action `selectLocaleAction("vi")` |
| SCR001_Home, SCR003_AwardSystem | LanguageDropdown "EN" option (`language-dropdown.tsx:59-70`) | secondary-action | Select English locale | Server Action `selectLocaleAction("en")` |
| SCR001_Home, SCR003_AwardSystem | Header logo (`site-header.tsx:53-55`) | navigation | Navigate to Home | GET / |
| SCR001_Home, SCR003_AwardSystem | Footer logo (`site-footer.tsx:32-34`) | navigation | Navigate to Home | GET / |
| SCR001_Home, SCR003_AwardSystem | Header/Footer "About SAA 2025" nav link | navigation | Navigate to Home | GET / |
| SCR001_Home | Hero "ABOUT AWARDS" CTA (`hero-section.tsx:88-95`) | navigation | Navigate to Awards System | GET /he-thong-giai |
| SCR001_Home, SCR003_AwardSystem | Header/Footer "Awards Information" nav link | navigation | Navigate to Awards System | GET /he-thong-giai |
| SCR001_Home | AwardCard ×6 (`award-card.tsx:42-77`) | navigation | Open award category detail | GET /he-thong-giai#{slug} |
| SCR003_AwardSystem | AwardCategoryNav item ×6 (`award-category-nav.tsx:120-133`) | navigation | Select category — scroll + highlight | N/A (client-only, no HTTP) |
| SCR001_Home | EventCountdownLive tick (`use-countdown.ts:26-29`) | system-action | Recompute + render remaining time every 30s | N/A (client-only) |
| SCR001_Home, SCR003_AwardSystem | FabWidget toggle + 2 inner buttons + cancel (`fab-widget.tsx`) | secondary-action | Expand/collapse floating widget | N/A (client-only) |

**Excluded — no wired handler (inert decoration, verified by reading each file, not by omission)**:
`hero-section.tsx:98-107` "About Kudos" CTA (`aria-disabled`, no href/onClick, BR-008 deferred) ·
`kudos-promo.tsx:64-73` "Chi tiết" button (same pattern) · `award-kudos-banner.tsx:38-47` detail
button (same pattern) · `site-header.tsx:22`/`site-footer.tsx:42-44` "Sun* Kudos" nav item (`role=
"link"`, no href/onClick, BR-004) · `site-footer.tsx:45-47` "Tiêu chuẩn chung" button (no onClick)
· `notification-bell.tsx` bell button (no onClick, visual-only this round) ·
`account-menu.tsx:74-90` "Profile"/"Dashboard" rows (`onClick={close}` only — no navigation this
round, BR-004, PERM007). `SCR002_Login`'s own `LanguageDropdown` (`login-header.tsx:29`) is also
excluded from that screen's rows: it renders but no `onSelectLocale` is passed, so VI/EN selection
there is a no-op — flagged in `US003`'s Notes, not silently dropped.

**Merge groups applied** (web merge exception — same actor + same Server Action/route + same
dataflow, only the option value differs): VN+EN dropdown options → `US003`; header logo + footer
logo + "About SAA 2025" link → `US004`; Hero CTA + "Awards Information" link → `US005`. 13 raw
rows → 9 US (matches Step 5's `≥N unless merge exception` check: 3 merges collapse 5 rows into 2,
net −4 → 9).

## User Story Index

| Code | Title | Type | Priority | Screens |
|------|-------|------|----------|---------|
| US001_SignInWithGoogle | Sign in with Google | ui | P0 | SCR002_Login |
| US002_LogOutOfAccount | Log out of account | ui | P0 | SCR001_Home, SCR003_AwardSystem |
| US003_SwitchSiteLanguage | Switch site display language | ui | P1 | SCR001_Home, SCR003_AwardSystem |
| US004_NavigateToHome | Navigate to Home | ui | P1 | SCR001_Home, SCR003_AwardSystem |
| US005_NavigateToAwardsSystem | Navigate to Awards System | ui | P1 | SCR001_Home, SCR003_AwardSystem |
| US006_OpenAwardCategoryFromHome | Open award category detail from Home | ui | P1 | SCR001_Home, SCR003_AwardSystem |
| US007_SelectAwardCategoryFromSideNav | Select award category from side nav | ui | P1 | SCR003_AwardSystem |
| US008_ViewLiveEventCountdown | View live event countdown | ui | P2 | SCR001_Home |
| US009_OpenFloatingActionWidget | Open floating action widget | ui | P2 | SCR001_Home, SCR003_AwardSystem |

---

## US001_SignInWithGoogle: Sign in with Google

**Type**: ui
**Interaction**: primary-action
**Priority**: P0
**Estimate**: M

### User Story

As a guest, I want to sign in with my Google account so that I can access the award-system pages
reserved for Sun* members.

### Acceptance Criteria

- [ ] Clicking "Sign in with Google" starts the Supabase OAuth handshake with `hd=sun-asterisk.com`
  pre-filled (`src/app/login/actions.ts:26-32`) — a UI hint only, not the enforcement point.
- [ ] Only a `@sun-asterisk.com` account with a Google-verified email is granted a session; any
  other account is signed out immediately and returned to `/login?error=domain`
  (`src/app/auth/callback/route.ts:39-42`).
- [ ] A successful sign-in redirects to the `next` query param when present and safe, otherwise
  to `/`.

### Technical Notes

- **Endpoint**: Server Action `signInWithGoogle` (`src/app/login/actions.ts`) → GET
  /auth/callback (ROUTE001, `src/app/auth/callback/route.ts`)
- **Data Required**: Google account, `@sun-asterisk.com` domain, verified email
- **Dependencies**: Supabase Auth Google provider; PERM003_SunAsteriskDomainSignInGate

### Screens

- SCR002_Login: Login

### Background Logic

- BL001_GoogleOAuthSignIn
- BL003_OAuthCallbackExchange
- BL005_ProfileProvisioningTrigger

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest with a verified `@sun-asterisk.com` Google account, on `/login` | Clicks "Sign in with Google" and completes Google consent | Session created, `profile` row provisioned (BL005), redirected to `/` or `next` |
| Error Case | Guest with a non-`sun-asterisk.com` Google account | Completes Google consent | Session revoked, redirected to `/login?error=domain`, error banner shown |

---

## US002_LogOutOfAccount: Log out of account

**Type**: ui
**Interaction**: destructive-action
**Priority**: P0
**Estimate**: S

### User Story

As a member, I want to log out of my account so that my session no longer stays active on this
device.

### Acceptance Criteria

- [ ] Clicking "Logout" in the account menu submits a same-origin POST to `/auth/sign-out`.
- [ ] A cross-origin POST to the same endpoint is rejected with 403 before any session is touched
  (`src/app/auth/sign-out/route.ts:26-31`).
- [ ] After sign-out, all `sb-`-prefixed cookies are cleared and the visitor is redirected to `/`.

### Technical Notes

- **Endpoint**: POST /auth/sign-out (ROUTE002)
- **Data Required**: active Supabase session
- **Dependencies**: PERM006_SignOutOriginCheck

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

- BL002_SignOutSession

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home or AwardSystem | Opens account menu, clicks Logout | Session cleared, redirected to `/`, header reverts to guest variant |
| Error Case | Forged cross-origin POST to `/auth/sign-out` | Request sent with mismatched Origin header | 403 returned, session left intact |

**Notes**: applies equally to admin — no role differentiation for this action.

---

## US003_SwitchSiteLanguage: Switch site display language

**Type**: ui
**Interaction**: secondary-action
**Priority**: P1
**Estimate**: S

### User Story

As a guest, I want to switch the site's display language between Vietnamese and English so that
I can read the content in my preferred language.

### Acceptance Criteria

- [ ] Selecting "VN" or "EN" in the language dropdown persists a 1-year locale cookie and
  revalidates the current page (`src/lib/i18n/set-locale.ts:17-30`).
- [ ] The dropdown highlights the currently active locale.
- [ ] An untrusted/invalid locale value falls back to the default locale rather than being applied
  verbatim (`set-locale.ts:18`).

### Technical Notes

- **Endpoint**: Server Action `selectLocaleAction` → `setLocale`
  (`src/lib/i18n/select-locale-action.ts`, `src/lib/i18n/set-locale.ts`)
- **Data Required**: N/A
- **Dependencies**: `src/i18n/request.ts` locale allow-list (`vi`, `en`)

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest or authed visitor on Home or AwardSystem | Selects "EN" from the language dropdown | Page content re-renders in English, cookie persists across reload |
| Edge Case | Visitor on SCR002_Login | Opens the login header's language dropdown and selects an option | No effect — `onSelectLocale` is not wired on this screen (`login-header.tsx:29`); a verified, documented gap, not a functional interaction on SCR002 |

---

## US004_NavigateToHome: Navigate to Home

**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story

As a guest, I want to navigate to the homepage from the header/footer logo or the "About SAA
2025" nav link so that I can return to the event overview from anywhere in the site shell.

### Acceptance Criteria

- [ ] Clicking the header logo, footer logo, or the "About SAA 2025" nav item navigates to `/`.
- [ ] The active nav item styling reflects the current route (`site-header.tsx:58-61`).

### Technical Notes

- **Endpoint**: GET / (Next.js `<Link>` navigation)
- **Data Required**: N/A
- **Dependencies**: none — public route

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Visitor on AwardSystem | Clicks header logo | Navigates to `/`, Home renders |

---

## US005_NavigateToAwardsSystem: Navigate to Awards System

**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story

As a guest, I want to navigate to the Awards System page from the Home hero CTA or the "Awards
Information" nav link so that I can learn about the award categories.

### Acceptance Criteria

- [ ] Clicking the Hero "ABOUT AWARDS" CTA or the header/footer "Awards Information" link
  navigates to `/he-thong-giai`.
- [ ] An unauthenticated visitor is redirected to `/login?next=/he-thong-giai` before the page
  renders (PERM001_PrivateRouteAuthGuard, `src/proxy.ts:64-70`).
- [ ] An authenticated visitor lands directly on the Awards System page.

### Technical Notes

- **Endpoint**: GET /he-thong-giai (guarded)
- **Data Required**: N/A
- **Dependencies**: PERM001_PrivateRouteAuthGuard

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home | Clicks "ABOUT AWARDS" | Navigates directly to AwardSystem |
| Error Case | Unauthenticated guest on Home | Clicks "Awards Information" | Redirected to `/login?next=/he-thong-giai` instead of AwardSystem |

---

## US006_OpenAwardCategoryFromHome: Open award category detail from Home

**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story

As a guest, I want to open a specific award category's detail from a Home award-grid card so
that I land directly on that category instead of scrolling the Awards System page myself.

### Acceptance Criteria

- [ ] Clicking an award card (thumbnail, title, or "Chi tiết" — one shared anchor,
  `award-card.tsx:42`) navigates to `/he-thong-giai#{slug}`.
- [ ] On arrival, the matching side-nav item and detail card are marked active/scrolled-into-view
  via `resolveActiveSlug` (BR-002, `resolve-active-slug.ts`).
- [ ] An unauthenticated visitor is redirected to `/login?next=/he-thong-giai` before the category
  ever renders (PERM001).

### Technical Notes

- **Endpoint**: GET /he-thong-giai#{slug} (guarded)
- **Data Required**: MODEL002_AwardCategory slug
- **Dependencies**: PERM001_PrivateRouteAuthGuard, `resolve-active-slug.ts`

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home | Clicks the "MVP" award card | Navigates to `/he-thong-giai#mvp`, MVP category scrolled into view and highlighted |
| Error Case | Unauthenticated guest on Home | Clicks an award card | Redirected to `/login?next=/he-thong-giai` |

---

## US007_SelectAwardCategoryFromSideNav: Select award category from side nav

**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: M

### User Story

As a guest, I want to select an award category from the Awards System side navigation so that I
can jump straight to its detail card without manually scrolling.

### Acceptance Criteria

- [ ] Clicking a side-nav item scrolls its matching detail card into view and marks that item
  `aria-current` (BR-001, `award-category-nav.tsx:102-105`).
- [ ] A category deep-linked via URL hash on page load pre-activates the same way, without a
  React hydration-attribute mismatch (BR-002, `award-category-nav.tsx:17-34`).
- [ ] Selection is entirely client-side — no navigation, no HTTP request, no
  `window.location.hash` mutation (`handleSelect`, `award-category-nav.tsx:102-105`).

### Technical Notes

- **Endpoint**: N/A — client-only
- **Data Required**: MODEL002_AwardCategory list
- **Dependencies**: `resolve-active-slug.ts`, `useSyncExternalStore` hash subscription

### Screens

- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on AwardSystem | Clicks "Top Talent" in the side nav | Top Talent's detail card scrolls into view, its nav item shows the active/gold state |
| Edge Case | Authenticated member loads `/he-thong-giai#mvp` directly | Page mounts | MVP starts pre-activated without a hydration-mismatch warning |

---

## US008_ViewLiveEventCountdown: View live event countdown

**Type**: ui
**Interaction**: system-action
**Priority**: P2
**Estimate**: M

### User Story

As a guest, I want to see a live countdown to the event on the homepage so that I know how much
time remains before it starts.

### Acceptance Criteria

- [ ] The countdown recomputes and re-renders every 30 seconds from `NEXT_PUBLIC_EVENT_START_AT`
  (`use-countdown.ts:26-29`).
- [ ] The server-rendered output and the client's first hydration render both show the same fixed
  placeholder, so hydration never mismatches (BR-005_CountdownClientOnlyHydration).
- [ ] Once the event start time has passed, the display switches to a "reached"/coming-soon state
  instead of showing a negative duration.

### Technical Notes

- **Endpoint**: N/A — client-only
- **Data Required**: `NEXT_PUBLIC_EVENT_START_AT` env value
- **Dependencies**: `compute-remaining.ts`, `parse-target.ts`

### Screens

- SCR001_Home: Home

### Background Logic

- BL004_EventCountdownTick

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest on Home, event start time in the future | Page stays open past a 30s tick | Digits decrease accordingly on the next tick |
| Edge Case | Guest on Home, event start time already passed | Page loads | Countdown renders the "coming soon"/reached state instead of a negative duration |

---

## US009_OpenFloatingActionWidget: Open floating action widget

**Type**: ui
**Interaction**: secondary-action
**Priority**: P2
**Estimate**: S

### User Story

As a member, I want to open the floating action widget so that I can see its quick-action
shortcuts.

### Acceptance Criteria

- [ ] The FAB renders only for an authenticated visitor whose profile resolves; guests never see
  it (PERM008_FabWidgetAuthenticatedVisibility, `fab-widget-container.tsx`).
- [ ] Clicking the collapsed pill expands it into "Thể lệ", "Viết KUDOS", and a cancel control.
- [ ] Clicking any of the three expanded controls collapses the widget back to the pill; neither
  "Thể lệ" nor "Viết KUDOS" navigates anywhere yet (BR-004, destinations deferred).

### Technical Notes

- **Endpoint**: N/A — client-only
- **Data Required**: current profile (visibility gate only)
- **Dependencies**: PERM008_FabWidgetAuthenticatedVisibility

### Screens

- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

### Background Logic

_None._

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home | Clicks the collapsed FAB pill | Widget expands, showing "Thể lệ"/"Viết KUDOS"/cancel |
| Edge Case | Unauthenticated guest on Home | Page loads | FAB is not rendered at all |

**Notes**: applies equally to admin — no role differentiation.

---

## Screen → US Map

| Screen | US Codes |
|--------|---------|
| SCR001_Home | US002, US003, US004, US005, US006, US008, US009 |
| SCR002_Login | US001 |
| SCR003_AwardSystem | US002, US003, US004, US005, US006, US007, US009 |

> No screen has 0 US mapped — `[IPE_ZERO]` not triggered.

## Cross-Reference Validation

- [x] All US### codes are unique
- [x] All acceptance criteria are testable
- [x] All technical notes are complete
- [x] All US### codes are referenced in FeatureList.md — confirmed no orphans (`feature-list.md`
  § Cross-Reference Validation: US001,US002→F001; US003,US004,US005,US009→F002; US006,US008→F003;
  US007→F004)
- [x] All `ui` US### mapped to SCR### or SCR###/REG### (parent SCR confirmed in `screen-list.md`)
- [x] All system US### have at least one BL### mapped — **N/A**: no `system`-typed US emitted;
  all 5 BL### items are cited as Background Logic under a `ui` US instead (BL001/BL003/BL005 →
  US001; BL002 → US002; BL004 → US008) — see header Note for the rationale on BL005/`system` actor
