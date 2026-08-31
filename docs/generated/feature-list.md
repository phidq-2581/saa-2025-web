# Feature List

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 5 — clustering over `user-stories.md` (US001–US009), `screen-list.md`
(SCR001–SCR003), `route-list.md` (ROUTE001–002 + 3 frontend pages), `data-model.md`
(MODEL001–002), `behavior-logic.md` (BL001–BL005), `permissions-matrix.md` (PERM001–009).

**Convergence note**: the hand-authored `docs/` SDD layer already defines F001_GoogleOAuthLogin,
F002_NavigationShell, F003_HomepageOverview, F004_AwardSystemBrowse. Clustering the current
wave's US/BL/PERM items independently by capability (auth+session vs. shared chrome vs. homepage
content vs. award browsing) lands on the same 4 boundaries — reused here, not forced: every
US/BL/PERM in this wave's drafts sorts cleanly into exactly one of these four capabilities with no
remainder. One real divergence: `docs/` screens the shell/homepage/awards/login at
component-granularity (SCR001_Login, SCR002_Header, SCR003_Footer, SCR004_Fab, SCR005_Homepage,
SCR006_AwardSystem — 6 codes). This wave's `screen-list.md` screens at route-view granularity (one
SCR per `page.tsx`, no REG### split — 3 codes: SCR001_Home, SCR002_Login, SCR003_AwardSystem).
**Screen references below use this wave's SCR001–SCR003 codes exclusively** — they are not
interchangeable with the `docs/` SCR001–SCR006 codes.

**Code Format**: All codes MUST follow `F###_NameSlug` format (e.g., F001_Auth, F002_UserProfile)
**Screen Code Format**: All screen codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm)
**User Story Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login)
**Background Logic Code Format**: All BL codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport)
**Permission Code Format**: All PERM codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports)

**Feature Types**:
- `ui` - Feature has UI screens (SCR###)
- `background` - Feature only has background logic (BL###, no SCR###)
- `mixed` - Feature has both UI screens and background logic

**Related Screens column format**: Accepts `SCR###`, `SCR###/REG###`, or mixed comma-separated. No
`REG###` was declared this wave (`screen-list.md`: "all atomic — no REG### declared") — every ref
below is a bare `SCR###`.

**Note on F### code identity**: `Code` below is the bare `F###` number; `Name` is the
human-readable capability. Canonical slug derivation (`F###_NameSlug`) is a post-step the
orchestrator runs after renumber — not performed in this draft.

## Feature Hierarchy

| Code | Name | Type | Language | Workspace | Priority |
|------|------|------|----------|-----------|----------|
| F001 | Google OAuth Login | mixed | TypeScript | saa-web | P0 |
| F002 | Navigation Shell | ui | TypeScript | saa-web | P1 |
| F003 | Homepage Overview | mixed | TypeScript | saa-web | P1 |
| F004 | Award System Browse | ui | TypeScript | saa-web | P1 |

## Feature Details

### F001: Google OAuth Login

**Type**: mixed
**Description**: A guest signs in with a `@sun-asterisk.com` Google account from the Login screen
and holds a guarded session across the site. Input: Google OAuth consent (domain-gated at the
callback, not just the pre-fill hint) → Process: exchange code for session, reject and revoke on a
non-`sun-asterisk.com`/unverified email, provision the `profile` row via DB trigger, guard every
private route and the Login route itself → Output: an authenticated session with a `member`/`admin`
role, or an explicit `?error=domain` bounce back to Login. Also owns the inverse action — a signed-in
visitor submits Logout (from the shared header, wherever it is rendered) → session and cookies are
cleared → visitor returns to `/` as a guest. Single lifecycle: establish, guard, and end one session.

**Workspace**: saa-web
**Languages**: TypeScript, SQL (Postgres trigger)
**Components**: 4 (`LoginHero`, `LoginErrorNotice`, `GoogleSignInButton`, `SubmitButton` — Logout's
own trigger UI, `AccountMenu`, is owned by F002_NavigationShell)

**Related Screens**:
- SCR002_Login: Login
- SCR001_Home: Home (Logout trigger only, via the shared account menu)
- SCR003_AwardSystem: AwardSystem (Logout trigger only, via the shared account menu)

**Related User Stories**:
- US001_SignInWithGoogle: Sign in with Google
- US002_LogOutOfAccount: Log out of account

**Related APIs/Routes**:
- (GET) /auth/callback — ROUTE001
- (POST) /auth/sign-out — ROUTE002
- (GET) /login

**Related Data Models**:
- MODEL001_Profile

**Related Background Logic**:
- BL001_GoogleOAuthSignIn: GoogleOAuthSignIn
- BL002_SignOutSession: SignOutSession
- BL003_OAuthCallbackExchange: OAuthCallbackExchange
- BL005_ProfileProvisioningTrigger: ProfileProvisioningTrigger

**Related Permissions**:
- PERM001_PrivateRouteAuthGuard: PrivateRouteAuthGuard
- PERM002_AuthedLoginRouteRedirect: AuthedLoginRouteRedirect
- PERM003_SunAsteriskDomainSignInGate: SunAsteriskDomainSignInGate
- PERM004_ProfileSelectOwnRLS: ProfileSelectOwnRLS
- PERM005_ProfileWriteRestrictedToSystemTrigger: ProfileWriteRestrictedToSystemTrigger
- PERM006_SignOutOriginCheck: SignOutOriginCheck

---

### F002: Navigation Shell

**Type**: ui
**Description**: The persistent header/footer/FAB chrome shared across Home and AwardSystem (Login
renders its own distinct minimal header, not this shell — `screen-list.md` SCR002_Login
Description). Input: a click on the logo, a nav link, a language option, or the FAB pill → Process:
client-side route navigation for logo/nav links, a `selectLocaleAction` Server Action + cookie +
`revalidatePath` for language, local expand/collapse state for the FAB → Output: the visitor lands
on Home or AwardSystem, the page re-renders in the chosen locale, or the FAB reveals its two
(currently non-navigating) quick-action controls. The account-menu/bell/FAB visibility variant
itself (guest vs. authenticated) is also owned here — it is the shell rendering differently, not a
separate capability.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 8 (`SiteHeader`, `SiteHeaderContainer`, `AccountMenu`, `LanguageDropdown`,
`NotificationBell`, `SiteFooter`, `FabWidget`, `FabWidgetContainer`)

**Related Screens**:
- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem

**Related User Stories**:
- US003_SwitchSiteLanguage: Switch site display language
- US004_NavigateToHome: Navigate to Home
- US005_NavigateToAwardsSystem: Navigate to Awards System
- US009_OpenFloatingActionWidget: Open floating action widget

**Related APIs/Routes**:
_None — chrome only; navigation targets are owned by the destination features (F003, F004)._

**Related Data Models**:
_None — reads `MODEL001_Profile` only to select a visibility variant; ownership stays with F001._

**Related Background Logic**:
_None._

**Related Permissions**:
- PERM007_AccountMenuDashboardVisibility: AccountMenuDashboardVisibility
- PERM008_FabWidgetAuthenticatedVisibility: FabWidgetAuthenticatedVisibility
- PERM009_HeaderAuthedVariant: HeaderAuthedVariant

---

### F003: Homepage Overview

**Type**: mixed
**Description**: A visitor reads the SAA 2025 homepage. Input: page load at `/` → Process: render
the hero keyvisual with a client-only live countdown (recomputed every 30s from
`NEXT_PUBLIC_EVENT_START_AT`, hydration-safe placeholder on first paint), the Root Further theme
copy, a 6-card award-category teaser grid, and a Kudos promo block → Output: a visitor either stays
to watch the countdown tick down, or clicks an award card to jump straight into that category's
detail on the Awards System page. Header/footer/language/account-menu/FAB are NOT owned here — see
F002_NavigationShell.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 9 (`HeroSection`, `EventCountdownLive`, `EventCountdown`, `EventInfo`,
`IconLinkArrow`, `RootFurtherBlock`, `AwardGrid`, `AwardCard`, `KudosPromo`)

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US006_OpenAwardCategoryFromHome: Open award category detail from Home
- US008_ViewLiveEventCountdown: View live event countdown

**Related APIs/Routes**:
- (GET) /

**Related Data Models**:
- MODEL002_AwardCategory

**Related Background Logic**:
- BL004_EventCountdownTick: EventCountdownTick

**Related Permissions**:
_None — this page's own content is public; the deep-link into AwardSystem is guarded by
PERM001, owned under F001._

---

### F004: Award System Browse

**Type**: ui
**Description**: An authenticated visitor browses the "Hệ thống giải" award-system page. Input:
arrival at `/he-thong-giai` (guarded — unauthenticated visitors never reach this point, see
PERM001 under F001) or a click on a side-nav category item → Process: render the hero, all 6
award-info detail cards simultaneously (no tab-panel switching), and a client-only scroll-spy nav
that resolves the active category from a URL hash or a click and highlights it →
Output: the matching detail card is scrolled into view and marked active, with no navigation, no
HTTP request, and no hydration mismatch on a direct hash-linked page load. Header/footer/
language/account-menu/FAB are NOT owned here — see F002_NavigationShell.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 5 (`AwardHero`, `AwardSectionTitle`, `AwardCategoryNav`, `AwardInfoCard`,
`AwardKudosBanner`)

**Related Screens**:
- SCR003_AwardSystem: AwardSystem

**Related User Stories**:
- US007_SelectAwardCategoryFromSideNav: Select award category from side nav

**Related APIs/Routes**:
- (GET) /he-thong-giai

**Related Data Models**:
- MODEL002_AwardCategory

**Related Background Logic**:
_None._

**Related Permissions**:
_None owned directly — arrival at this screen is gated by PERM001_PrivateRouteAuthGuard, owned
under F001 (the guard is generic infrastructure, not this feature's own logic)._

---

## Summary

- **Total Features**: 4
- **Total Screens**: 3
- **Total User Stories**: 9
- **Total Routes**: 5 (2 backend: ROUTE001, ROUTE002; 3 frontend pages: `/`, `/login`, `/he-thong-giai`)
- **Total Data Models**: 2 (MODEL001_Profile, MODEL002_AwardCategory)
- **Total Background Logic**: 5
- **Total Permissions**: 9
- **Languages Detected**: TypeScript, SQL (Postgres)

## Cross-Reference Validation

- [x] All F### codes are unique (F001–F004)
- [x] All F### codes are referenced in UserStories.md — every US001–US009 cited above
- [x] All screen references are valid (SCR001–SCR003, all bare — confirmed against `screen-list.md`)
- [x] All user story references are valid (US001–US009 confirmed against `user-stories.md`)
- [x] All route references are valid (ROUTE001/ROUTE002 confirmed against `route-list.md`; frontend
  pages cited by path, matching `route-list.md`'s own no-code convention for pages)
- [x] All data model references are valid (MODEL001/MODEL002 confirmed against `data-model.md`)
- [x] All behavior logic references are valid (BL001–BL005 confirmed against `behavior-logic.md`)
- [x] All permission references are valid (PERM001–PERM009 confirmed against `permissions-matrix.md`)
- [x] Every US has a parent feature (F###) — US001,US002→F001; US003,US004,US005,US009→F002;
  US006,US008→F003; US007→F004
- [x] Every screen has a parent feature (F###) — SCR001_Home→F001(partial)/F002/F003;
  SCR002_Login→F001; SCR003_AwardSystem→F001(partial)/F002/F004
- [x] Every route maps to a feature (F###) — ROUTE001/ROUTE002/`/login`→F001; `/`→F003;
  `/he-thong-giai`→F004
- [x] Every data model maps to a feature (F###) — MODEL001→F001; MODEL002→F003,F004
- [x] Every background logic maps to a feature (F###) — BL001,BL002,BL003,BL005→F001; BL004→F003
- [x] Every permission maps to a feature (F###) — PERM001–PERM006→F001; PERM007–PERM009→F002
