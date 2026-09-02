# User Stories
**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Analysis Scope**: Wave 4 (round 2, post-Kudos) — IPE enumeration over all 8 screens in `screen-list.md` (SCR001–SCR008), cross-referenced with `permissions.md` (PERM001–017), `behavior-logic.md` (BL001–006), `data-model.md` (MODEL001–011) and `route-list.md`. Extends round-1's baseline (`docs/generated/user-stories.md`, 9 US over 3 screens) — **renumbered fresh, contiguous US001–US002** (US codes are not stable across rounds; round-1's US001–US003 map 1:1 by content into this round's US001–US003 below, only the numbers happen to repeat).

**Round-1 deltas found this wave (not blind carry-forward — each re-verified against current source):**
- `SCR002_Login` → **`SCR005_Login`** this round (screen-list.md renumbering) — every carried story's Screens section is updated to the new code.
- Shared-shell interactions (Logout, language switch, Home/Awards nav, FAB) now render on **5** `(site)`-group screens (SCR001, SCR003, SCR004, SCR006, SCR007), not 2 — `route-list.md`'s `(site)/layout.tsx` scope and `permissions.md`'s own Related Screens (PERM006/008/009) confirm this directly; Screens sections below are extended accordingly, not guessed.
- **Login's language-dropdown gap is fixed.** Round-1's US004 documented an Edge Case: `/login`'s own `LanguageDropdown` had no `onSelectLocale` wired (no-op). `(auth)/layout.tsx:19-26` now reads: `"Phase 08 fix: the login header language dropdown was a no-op (rebuild-spec W4 finding) -- resolve the live locale and inject the same server action..."` — SCR005_Login is added to US004's Screens, the round-1 Edge Case becomes a Happy Path.
- **FAB "Viết KUDOS" now does something.** Round-1's US003 documented both inner FAB buttons as render-only (`BR-004`, "destinations deferred"). `fab-widget.tsx:68-78` now wires "Viết KUDOS" to open the real Kudos Compose dialog (`ComposeDialogContainer`) — carved out of US003 into its own entry point of `US005_ComposeKudos` (materially different dataflow: one renders/collapses a menu, the other opens a modal with a real backend-bound submit). "Thể lệ" remains inert.

**Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login, US006_ViewDashboard)

**US Types**:
- `ui` - User-facing stories (require Screen mapping)
- `system` - System stories: hook, event, observer, bg-job, trigger, etc. (no Screen mapping needed)

**Note**: Feature mapping is managed in FeatureList.md only (Wave 5, now complete — see
`feature-list.md` § Cross-Reference Validation for the US###→F### mapping).
No `system`-typed US is emitted this round — every BL### item is reachable from a real user action and is cited as Background Logic under its owning `ui` US rather than duplicated as a standalone `system` story. `BL004_EventCountdownTick` and `BL005_ProfileProvisioningTrigger` retain round-1's reasoning (client-visible tick, DB trigger fired by a human sign-in). `BL006` (new) is attached to `US005_ComposeKudos` per this wave's brief and `behavior-logic.md`'s own pending note ("Wave 4/5 must attach it to the Kudos-compose system US").

## Interaction Inventory
> One row per interactive (wired) element, pre-merge. A control with no `onClick`/`href`/form
> action is inert decoration, not an interaction point — excluded here and logged below instead
> of silently dropped. 37 raw rows below collapse into 17 US (21 merges) via Step 3's merge
> exception (same actor + same endpoint/Server-Action identity + same dataflow) — each merge is
> called out under its owning US's Notes, not silently absorbed.

| Screen | Element | Type | Action | Endpoint |
|--------|---------|------|--------|---------|
| SCR005_Login | GoogleSignInButton form (`google-sign-in-button.tsx:76`) | primary-action | Submit Google OAuth Server Action | Server Action `signInWithGoogle` → GET /auth/callback |
| SCR001, SCR003, SCR004, SCR006, SCR007 | AccountMenu Logout form (`account-menu.tsx:96`) | destructive-action | Submit sign-out form | POST /auth/sign-out |
| SCR001, SCR003, SCR004, SCR006, SCR007, SCR005 | LanguageDropdown "VN" option | secondary-action | Select Vietnamese locale | Server Action `selectLocaleAction("vi")` |
| SCR001, SCR003, SCR004, SCR006, SCR007, SCR005 | LanguageDropdown "EN" option | secondary-action | Select English locale | Server Action `selectLocaleAction("en")` |
| SCR001, SCR003, SCR004, SCR006, SCR007 | Header logo / Footer logo / "About SAA 2025" link | navigation | Navigate to Home | GET / |
| SCR001, SCR003, SCR004, SCR006, SCR007 | Header/Footer "Awards Information" link | navigation | Navigate to Awards System | GET /he-thong-giai |
| SCR001_Home | Hero "ABOUT AWARDS" CTA (`hero-section.tsx:88-95`) | navigation | Navigate to Awards System | GET /he-thong-giai |
| SCR001_Home | AwardCard ×6 (`award-card.tsx:42-77`) | navigation | Open award category detail | GET /he-thong-giai#{slug} |
| SCR003_AwardSystem | AwardCategoryNav item ×6 (`award-category-nav.tsx:120-133`) | navigation | Select category — scroll + highlight | N/A client-only |
| SCR001_Home | EventCountdownLive tick (`use-countdown.ts:26-29`) | system-action | Recompute + render remaining time every 30s | N/A client-only |
| SCR001, SCR003, SCR004, SCR006, SCR007 | FabWidget toggle (`fab-widget.tsx:89-103`) | secondary-action | Expand floating widget | N/A client-only |
| SCR001, SCR003, SCR004, SCR006, SCR007 | FabWidget "Thể lệ" / "Hủy" (`fab-widget.tsx:60-67,79-87`) | secondary-action | Collapse widget, no navigation | N/A client-only |
| SCR001, SCR003, SCR004, SCR006, SCR007 | FabWidget "Viết KUDOS" (`fab-widget.tsx:68-78`) | primary-action | Open Kudos Compose dialog | N/A client-only (mounts SCR008) |
| SCR004_KudosBoard | ComposePill (`compose-pill.tsx:24-49`) | primary-action | Open Kudos Compose dialog | N/A client-only (mounts SCR008) |
| SCR004_KudosBoard | HighlightCarouselNav prev/next (`highlight-carousel.tsx:50-54`) | secondary-action | Scroll highlight track one slide | N/A client-only |
| SCR004_KudosBoard | Spotlight pan/zoom toggle (`spotlight-cloud-canvas.tsx:169-179`) | secondary-action | Switch d3-zoom interaction mode | N/A client-only |
| SCR004_KudosBoard | Spotlight search input, Enter (`spotlight-search.tsx:30-43`) | secondary-action | Client-validate keyword (no filter applied) | N/A client-only |
| SCR004_KudosBoard | HashtagFilterDropdown option (`hashtag-filter-dropdown.tsx:81-94`) | secondary-action | Filter feed/highlight/spotlight by hashtag | GET /kudos?hashtag= |
| SCR004_KudosBoard | DepartmentFilterDropdown option (`department-filter-dropdown.tsx:79-92`) | secondary-action | Filter feed/highlight/spotlight by department | GET /kudos?department= |
| SCR004_KudosBoard | Card headline-hashtag button (`kudos-card.tsx:122-130`) | secondary-action | Apply hashtag filter | GET /kudos?hashtag= |
| SCR004, SCR006 | Card hashtag chip (`hashtag-chip.tsx`) | secondary-action | Apply hashtag filter | GET /kudos?hashtag= |
| SCR004_KudosBoard | Feed card content region (`kudos-card.tsx:81-91,137-146`) | navigation | Open kudos detail | GET /kudos/{id} |
| SCR004_KudosBoard | Highlight card "Xem chi tiết" (`kudos-card.tsx:180-189`) | navigation | Open kudos detail | GET /kudos/{id} |
| SCR004_KudosBoard | Spotlight word-cloud node (`kudos-feed-container.tsx:137`) | navigation | Open kudos detail | GET /kudos/{id} |
| SCR004, SCR006 | CopyLinkButton (`copy-link-button.tsx:26-29`) | secondary-action | Copy kudos URL to clipboard + toast | N/A client-only |
| SCR004, SCR006 | HeartButton (`heart-button.tsx:24-39`) | primary-action | Grant/revoke heart | Server Action `toggleHeart` |
| SCR004, SCR006 | CardAuthorBlock sender/receiver (`card-author-block.tsx:37-39`) | navigation | Open Sunner profile | GET /profile?id={uid} |
| SCR004_KudosBoard | LeaderboardList entry, ×2 lists (`leaderboard-list.tsx:52`) | navigation | Open Sunner profile | GET /profile?id={uid} |
| SCR004_KudosBoard | "Load more" scroll trigger (`use-infinite-feed.ts:57-67`) | system-action | Fetch next feed page | inline Server Action `loadMoreFeedAction` |
| SCR008_KudosCompose | RecipientAutocomplete option (`recipient-autocomplete.tsx:94-105`) | primary-action | Select recipient | N/A client-only (draft state) |
| SCR008_KudosCompose | KudosEditor content + `@mention` (`kudos-editor.tsx`) | primary-action | Compose rich-text body | N/A client-only (draft state) |
| SCR008_KudosCompose | HashtagPicker option, 1–5 (`hashtag-picker.tsx:77-101`) | primary-action | Select/deselect hashtag | N/A client-only (draft state) |
| SCR008_KudosCompose | ImageAttachmentGrid add/remove, ≤5 (`image-attachment-grid.tsx:114-141`) | primary-action | Attach/remove image | N/A client-only (draft state) |
| SCR008_KudosCompose | AnonymousToggle checkbox (`anonymous-toggle.tsx:30-42`) | secondary-action | Toggle anonymous send | N/A client-only (draft state) |
| SCR008_KudosCompose | ComposeFooter "Gửi" / "Hủy" (`compose-footer.tsx`) | primary-action / destructive-action | Submit kudos / discard draft | Server Action `createKudos` → RPC `create_kudos` / N/A |
| SCR008_KudosCompose | EditorToolbar link button (`editor-toolbar.tsx:96-104`) | secondary-action | Open Add Link dialog | N/A client-only |
| SCR002_AddLink | AddLink form Save / Cancel-Escape (`addlink-dialog.tsx`) | secondary-action | Insert link mark / close & discard | N/A client-only |

**Excluded — no wired handler (inert, re-verified by reading each file this round, not by omission)**: `hero-section.tsx:98-107` "About Kudos" CTA · `kudos-promo.tsx:64-73` "Chi tiết" button · `award-kudos-banner.tsx:38-47` detail button · `site-header.tsx:22` "Sun\* Kudos" nav item (still `role="link"`, no `href`, despite `/kudos` existing now — BR-004, an explicit, re-verified gap, not an oversight) · `site-footer.tsx:45-47` "Tiêu chuẩn chung" · `notification-bell.tsx` bell button · `account-menu.tsx:74-90` "Dashboard" row (admin-only visibility, PERM007, still render-only) · `account-menu.tsx:74-81` "Profile" row (still no `href` — no in-app way for a
Sunner to reach their OWN profile this round, see `US007` Notes) · `fab-widget.tsx` "Thể lệ" button (collapses the menu only, no destination — kept as an acceptance criterion under `US003`, not its own US, since it produces no observable result beyond a UI-state toggle) · Spotlight search's own validation-only Enter handler produces no filter side effect (kept under `US008`, not excluded, since it IS wired and testable, just not yet functional past validation).

**Merge groups applied** (web merge exception — same actor + same Server Action/endpoint identity
+ same dataflow): VN+EN dropdown options (now 6 screens) → `US004`; header logo + footer logo +
"About SAA 2025" link → `US009`; Hero CTA + "Awards Information" link → `US010`; FAB toggle+"Thể lệ"+"Hủy" → `US003`; highlight-nav+pan/zoom+search-validate → `US008`; both filter dropdowns + card headline-hashtag + hashtag chip → `US011`; feed-content-click +
"Xem chi tiết" + spotlight-node-click + copy-link (`[IPE_MERGE_EDITORIAL]`, per this wave's brief framing "view kudos detail via card content/Xem chi tiết/spotlight/copy link") → `US012`; FAB
"Viết KUDOS" + ComposePill + the 6 compose-form fields + Submit → `US005`; HeartButton across feed/highlight/detail → `US013`; CardAuthorBlock + both leaderboard lists → `US007`.

## User Story Index
| Code | Title | Type | Priority | Screens |
|------|-------|------|----------|---------|
| US001_SignInWithGoogle | Sign in with Google | ui | P0 | SCR005_Login |
| US006_LogOutOfAccount | Log out of account | ui | P0 | SCR001, SCR003, SCR004, SCR006, SCR007 |
| US004_SwitchSiteLanguage | Switch site display language | ui | P1 | SCR001, SCR003, SCR004, SCR005, SCR006, SCR007 |
| US009_NavigateToHome | Navigate to Home | ui | P1 | SCR001, SCR003, SCR004, SCR006, SCR007 |
| US010_NavigateToAwardsSystem | Navigate to Awards System | ui | P1 | SCR001, SCR003, SCR004, SCR006, SCR007 |
| US014_OpenAwardCategoryFromHome | Open award category detail from Home | ui | P1 | SCR001_Home |
| US015_SelectAwardCategoryFromSideNav | Select award category from side nav | ui | P1 | SCR003_AwardSystem |
| US016_ViewLiveEventCountdown | View live event countdown | ui | P2 | SCR001_Home |
| US003_OpenFloatingActionWidget | Open floating action widget | ui | P2 | SCR001, SCR003, SCR004, SCR006, SCR007 |
| US008_BrowseKudosBoard | Browse the Kudos board | ui | P0 | SCR004_KudosBoard |
| US011_FilterKudosBoard | Filter the Kudos board | ui | P1 | SCR004_KudosBoard |
| US012_ViewKudosDetail | View a kudos's full detail | ui | P0 | SCR004_KudosBoard, SCR006_KudosDetail |
| US005_ComposeKudos | Compose and submit a Kudos | ui | P0 | SCR008_KudosCompose |
| US017_InsertLinkInKudosContent | Insert a link into Kudos content | ui | P2 | SCR008_KudosCompose, SCR002_AddLink |
| US013_ToggleHeartOnKudos | Heart / un-heart a kudos | ui | P0 | SCR004_KudosBoard, SCR006_KudosDetail |
| US007_ViewProfileStub | View a Sunner's profile stub | ui | P2 | SCR004_KudosBoard, SCR006_KudosDetail |
| US002_LoadMoreKudosFeed | Load more kudos in the feed | ui | P1 | SCR004_KudosBoard |

---

## US001_SignInWithGoogle: Sign in with Google
**Type**: ui
**Interaction**: primary-action
**Priority**: P0
**Estimate**: M

### User Story
As a guest, I want to sign in with my Google account so that I can access the Sun\* member pages (Awards System, Kudos board, profiles).

### Acceptance Criteria
- [ ] Clicking "Sign in with Google" starts the Supabase OAuth handshake with `hd=sun-asterisk.com` pre-filled (`src/app/login/actions.ts:26-32`) — a UI hint only, not the enforcement point.
- [ ] Only a `@sun-asterisk.com` account with a Google-verified email is granted a session; any other account is signed out immediately and returned to `/login?error=domain` (`src/app/auth/callback/route.ts:39-42`).
- [ ] A successful sign-in redirects to the `next` query param when present and safe, otherwise to `/`.

### Technical Notes
- **Endpoint**: Server Action `signInWithGoogle` → GET /auth/callback (ROUTE001)
- **Data Required**: Google account, `@sun-asterisk.com` domain, verified email
- **Dependencies**: Supabase Auth Google provider; PERM003_SunAsteriskDomainSignInGate

### Screens
- SCR005_Login: Login

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

## US006_LogOutOfAccount: Log out of account
**Type**: ui
**Interaction**: destructive-action
**Priority**: P0
**Estimate**: S

### User Story
As a member, I want to log out of my account so that my session no longer stays active on this device.

### Acceptance Criteria
- [ ] Clicking "Logout" in the account menu (rendered on every `(site)`-group screen this round) submits a same-origin POST to `/auth/sign-out`.
- [ ] A cross-origin POST to the same endpoint is rejected with 403 before any session is touched (`src/app/auth/sign-out/route.ts:26-31`).
- [ ] After sign-out, all `sb-`-prefixed cookies are cleared and the visitor is redirected to `/`.

### Technical Notes
- **Endpoint**: POST /auth/sign-out (ROUTE002)
- **Data Required**: active Supabase session
- **Dependencies**: PERM006_SignOutOriginCheck

### Screens
- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Background Logic
- BL002_SignOutSession

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on any site-group screen | Opens account menu, clicks Logout | Session cleared, redirected to `/`, header reverts to guest variant |
| Error Case | Forged cross-origin POST to `/auth/sign-out` | Request sent with mismatched Origin header | 403 returned, session left intact |

**Notes**: applies equally to admin — no role differentiation for this action.

---

## US004_SwitchSiteLanguage: Switch site display language
**Type**: ui
**Interaction**: secondary-action
**Priority**: P1
**Estimate**: S

### User Story
As a guest, I want to switch the site's display language between Vietnamese and English so that
I can read the content in my preferred language.

### Acceptance Criteria
- [ ] Selecting "VN" or "EN" in the language dropdown persists a 1-year locale cookie and revalidates the current page (`src/lib/i18n/set-locale.ts:17-30`).
- [ ] The dropdown highlights the currently active locale.
- [ ] An untrusted/invalid locale value falls back to the default locale rather than being applied verbatim (`set-locale.ts:18`).
- [ ] `/login`'s own header dropdown now applies the selection too — `(auth)/layout.tsx:19-26` injects the same `selectLocaleAction` the site shell uses (round-1's no-op is fixed this round).

### Technical Notes
- **Endpoint**: Server Action `selectLocaleAction` → `setLocale`
- **Data Required**: N/A
- **Dependencies**: `src/i18n/request.ts` locale allow-list (`vi`, `en`)

### Screens
- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile,
  SCR005_Login

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest or authed visitor on any listed screen | Selects "EN" from the language dropdown | Page content re-renders in English, cookie persists across reload |
| Happy Path (fixed) | Visitor on SCR005_Login | Opens the login header's language dropdown and selects "VN" | Login page re-renders in Vietnamese — no longer a no-op |

---

## US009_NavigateToHome: Navigate to Home
**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story
As a guest, I want to navigate to the homepage from the header/footer logo or the "About SAA 2025" nav link so that I can return to the event overview from anywhere in the site shell.

### Acceptance Criteria
- [ ] Clicking the header logo, footer logo, or the "About SAA 2025" nav item navigates to `/`.
- [ ] The active nav item styling reflects the current route (`site-header.tsx:58-61`).

### Technical Notes
- **Endpoint**: GET / (Next.js `<Link>` navigation)
- **Data Required**: N/A
- **Dependencies**: none — public route

### Screens
- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Visitor on KudosBoard | Clicks header logo | Navigates to `/`, Home renders |

---

## US010_NavigateToAwardsSystem: Navigate to Awards System
**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story
As a guest, I want to navigate to the Awards System page from the Home hero CTA or the "Awards
Information" nav link so that I can learn about the award categories.

### Acceptance Criteria
- [ ] Clicking the Hero "ABOUT AWARDS" CTA (Home only) or the header/footer "Awards Information" link (all site-group screens) navigates to `/he-thong-giai`.
- [ ] An unauthenticated visitor is redirected to `/login?next=/he-thong-giai` before the page renders (PERM001_PrivateRouteAuthGuard).
- [ ] An authenticated visitor lands directly on the Awards System page.

### Technical Notes
- **Endpoint**: GET /he-thong-giai (guarded)
- **Data Required**: N/A
- **Dependencies**: PERM001_PrivateRouteAuthGuard

### Screens
- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home | Clicks "ABOUT AWARDS" | Navigates directly to AwardSystem |
| Error Case | Unauthenticated guest on KudosBoard's header | Clicks "Awards Information" | Redirected to `/login?next=/he-thong-giai` instead of AwardSystem |

---

## US014_OpenAwardCategoryFromHome: Open award category detail from Home
**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: S

### User Story
As a guest, I want to open a specific award category's detail from a Home award-grid card so that I land directly on that category instead of scrolling the Awards System page myself.

### Acceptance Criteria
- [ ] Clicking an award card (thumbnail, title, or "Chi tiết" — one shared anchor, `award-card.tsx:42`) navigates to `/he-thong-giai#{slug}`.
- [ ] On arrival, the matching side-nav item and detail card are marked active/scrolled-into-view via `resolveActiveSlug` (BR-002).
- [ ] An unauthenticated visitor is redirected to `/login?next=/he-thong-giai` before the category ever renders (PERM001).

### Technical Notes
- **Endpoint**: GET /he-thong-giai#{slug} (guarded)
- **Data Required**: MODEL004_AwardCategory slug
- **Dependencies**: PERM001_PrivateRouteAuthGuard, `resolve-active-slug.ts`

### Screens
- SCR001_Home

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on Home | Clicks the "MVP" award card | Navigates to `/he-thong-giai#mvp`, MVP category scrolled into view and highlighted |
| Error Case | Unauthenticated guest on Home | Clicks an award card | Redirected to `/login?next=/he-thong-giai` |

---

## US015_SelectAwardCategoryFromSideNav: Select award category from side nav
**Type**: ui
**Interaction**: navigation
**Priority**: P1
**Estimate**: M

### User Story
As a guest, I want to select an award category from the Awards System side navigation so that I can jump straight to its detail card without manually scrolling.

### Acceptance Criteria
- [ ] Clicking a side-nav item scrolls its matching detail card into view and marks that item `aria-current` (BR-001).
- [ ] A category deep-linked via URL hash on page load pre-activates the same way, without a
  React hydration-attribute mismatch (BR-002).
- [ ] Selection is entirely client-side — no navigation, no HTTP request.

### Technical Notes
- **Endpoint**: N/A — client-only
- **Data Required**: MODEL004_AwardCategory list
- **Dependencies**: `resolve-active-slug.ts`, `useSyncExternalStore` hash subscription

### Screens
- SCR003_AwardSystem

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on AwardSystem | Clicks "Top Talent" in the side nav | Top Talent's detail card scrolls into view, active/gold state shown |
| Edge Case | Authenticated member loads `/he-thong-giai#mvp` directly | Page mounts | MVP starts pre-activated, no hydration-mismatch warning |

---

## US016_ViewLiveEventCountdown: View live event countdown
**Type**: ui
**Interaction**: system-action
**Priority**: P2
**Estimate**: M

### User Story
As a guest, I want to see a live countdown to the event on the homepage so that I know how much time remains before it starts.

### Acceptance Criteria
- [ ] The countdown recomputes and re-renders every 30 seconds from `NEXT_PUBLIC_EVENT_START_AT` (`use-countdown.ts:26-29`).
- [ ] Server-rendered output and the client's first hydration render both show the same fixed placeholder, so hydration never mismatches (BR-005_CountdownClientOnlyHydration).
- [ ] Once the event start time has passed, the display switches to a "reached"/coming-soon state instead of a negative duration.

### Technical Notes
- **Endpoint**: N/A — client-only
- **Data Required**: `NEXT_PUBLIC_EVENT_START_AT` env value
- **Dependencies**: `compute-remaining.ts`, `parse-target.ts`

### Screens
- SCR001_Home

### Background Logic
- BL004_EventCountdownTick

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Guest on Home, event start time in the future | Page stays open past a 30s tick | Digits decrease on the next tick |
| Edge Case | Guest on Home, event start time already passed | Page loads | "Coming soon"/reached state instead of a negative duration |

---

## US003_OpenFloatingActionWidget: Open floating action widget
**Type**: ui
**Interaction**: secondary-action
**Priority**: P2
**Estimate**: S

### User Story
As a member, I want to open the floating action widget so that I can see its quick-action shortcuts.

### Acceptance Criteria
- [ ] The FAB renders only for an authenticated visitor whose profile resolves; guests never see it (PERM008_FabWidgetAuthenticatedVisibility).
- [ ] Clicking the collapsed pill expands it into "Thể lệ", "Viết KUDOS", and a cancel control.
- [ ] Clicking "Thể lệ" or the cancel control collapses the widget back to the pill; "Thể lệ" has no destination this round (BR-004, render-only).
- [ ] Clicking "Viết KUDOS" collapses the widget AND opens the Kudos Compose dialog — see `US005_ComposeKudos` for the compose flow itself (`fab-widget.tsx:68-78`).

### Technical Notes
- **Endpoint**: N/A — client-only
- **Data Required**: current profile (visibility gate only)
- **Dependencies**: PERM008_FabWidgetAuthenticatedVisibility

### Screens
- SCR001_Home, SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on KudosDetail | Clicks the collapsed FAB pill | Widget expands, showing "Thể lệ" / "Viết KUDOS" / cancel |
| Edge Case | Unauthenticated guest on Home | Page loads | FAB is not rendered at all |

**Notes**: applies equally to admin — no role differentiation.

---

## US008_BrowseKudosBoard: Browse the Kudos board
**Type**: ui
**Interaction**: secondary-action
**Priority**: P0
**Estimate**: M

### User Story
As a member, I want to browse the Kudos board's highlights, spotlight cloud, and sidebar so that
I can see what's happening around Sun\* Kudos at a glance.

### Acceptance Criteria
- [ ] On load, the board renders one shared server payload across the highlight carousel (top-5), the Spotlight word-cloud, the sidebar (stats + 2 leaderboards) and the paginated feed (`kudos-board-container.tsx:132-198`).
- [ ] Highlight Prev/Next arrows scroll the carousel track by one slide, never past the first or last slide (`highlight-carousel.tsx:50-54`).
- [ ] The Spotlight pan/zoom toggle switches d3-zoom interaction mode without navigating; hovering a word-cloud node shows the recipient's name and received time in a tooltip (`spotlight-cloud-canvas.tsx:157-165`).
- [ ] The Spotlight search input validates client-side only (empty → required error, >100 chars → max-length error) — it does **not** filter the word cloud this round, a documented gap (`spotlight-search.tsx:30-43`).
- [ ] An empty leaderboard renders `sidebar.leaderboardEmpty` copy instead of a blank list (`leaderboard-list.tsx:40-46`).

### Technical Notes
- **Endpoint**: GET /kudos (guarded)
- **Data Required**: MODEL001_KudosCardView (feed/highlight/spotlight), SidebarStats,
  LeaderboardEntry ×2
- **Dependencies**: PERM001, PERM010, PERM013, PERM014

### Screens
- SCR004_KudosBoard

### Background Logic
_None — Track B core reads (`get-highlight-top5.ts`, `get-spotlight.ts`, `get-sidebar-stats.ts`, `get-leaderboards.ts`), not a background-logic type per `behavior-logic.md`'s own exclusion._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Authenticated member on `/kudos` | Page loads | Highlight, spotlight, sidebar and feed all render from one payload |
| Edge Case | No rank-promotion entries exist yet | Page loads | That leaderboard shows the empty-state label, not a blank card |

---

## US011_FilterKudosBoard: Filter the Kudos board
**Type**: ui
**Interaction**: secondary-action
**Priority**: P1
**Estimate**: M

### User Story
As a member, I want to filter the Kudos board by hashtag or department so that I can narrow the feed, highlight and spotlight to what I care about.

### Acceptance Criteria
- [ ] Selecting a hashtag or department pushes `/kudos?hashtag=&department=`; the server recomputes filter+highlight+feed+spotlight together, and `key={hashtag::department}` fully remounts the client shell (`kudos-feed-container.tsx:48-54,117-122`).
- [ ] Opening one filter dropdown closes the other (`filter-bar.tsx` local `openFilter` state).
- [ ] Clicking a card's headline hashtag or a hashtag chip applies that hashtag filter the same way as the dropdown (`kudos-feed-container.tsx:102-104`).
- [ ] Selecting both a hashtag and a department narrows by both simultaneously (`buildKudosUrl` merges both params).
- [ ] Escape or an outside click closes an open dropdown without changing the current selection (`hashtag-filter-dropdown.tsx:33-47`).

### Technical Notes
- **Endpoint**: GET /kudos?hashtag={id}&department={name} (guarded)
- **Data Required**: MODEL005_Hashtag, MODEL003_Department option lists
- **Dependencies**: PERM013_SeedReferenceDataReadOnlyRLS

### Screens
- SCR004_KudosBoard

### Background Logic
_None — Track B core read (`get-filter-options.ts`, `get-feed-page.ts`)._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member on `/kudos` | Selects a hashtag from the dropdown | URL updates, feed/highlight/spotlight narrow to that hashtag |
| Edge Case | Member viewing a feed card | Clicks the card's headline hashtag | Same filter is applied as via the dropdown |

---

## US012_ViewKudosDetail: View a kudos's full detail
**Type**: ui
**Interaction**: navigation
**Priority**: P0
**Estimate**: M

### User Story
As a member, I want to open a kudos's full, untruncated detail so that I can read the complete message, image gallery and hashtags.

### Acceptance Criteria
- [ ] Clicking a feed card's content region (not an embedded link) navigates to `/kudos/{id}` (`kudos-card.tsx:81-91`).
- [ ] Clicking a highlight card's "Xem chi tiết" button navigates to the same route; the feed card variant has no such button (`kudos-card.tsx:180-189`).
- [ ] Clicking a Spotlight word-cloud node navigates to the same route (`kudos-feed-container.tsx:137`).
- [ ] The detail screen renders the full card (untruncated content, full gallery, all hashtags) reusing the feed card's own building blocks (`kudos-detail-view.tsx`).
- [ ] An unresolved `id` renders an inline "not found" block reusing `common.notFound` copy instead of a 404 route or crash (`kudos-detail-container.tsx:36-55`).
- [ ] Copying the link (present on both board cards and the detail card) writes `{origin}/kudos/{id}` to the clipboard and shows a 3-second toast — the same URL this story's other entry points navigate to (`copy-link-button.tsx:26-29`). `[IPE_MERGE_EDITORIAL]`: grouped here per this wave's brief framing, not split into a separate US.

### Technical Notes
- **Endpoint**: GET /kudos/[id] (guarded)
- **Data Required**: MODEL001_KudosCardView single row
- **Dependencies**: PERM010, PERM011, PERM014

### Screens
- SCR004_KudosBoard (origin: card content, "Xem chi tiết", spotlight node, copy-link)
- SCR006_KudosDetail (destination + its own copy-link + not-found state)

### Background Logic
_None — Track B core read (`get-kudos-by-id.ts`)._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member on the board | Clicks a feed card's content | Navigates to `/kudos/{id}`, full card renders |
| Error Case | Member visits `/kudos/{deleted-or-bad-id}` | Page loads | Inline not-found block renders, no crash, "back home" link only |

**Notes**: hashtag chips render non-interactive on this detail screen (`kudos-detail-view.tsx:100` passes no `onHashtagClick`) — a documented parity gap versus the board's own cards, not a defect of this story.

---

## US005_ComposeKudos: Compose and submit a Kudos
**Type**: ui
**Interaction**: primary-action
**Priority**: P0
**Estimate**: L

### User Story
As a member, I want to compose and submit a Kudos — pick a recipient, write rich-text content with an `@mention`, tag 1–5 hashtags, attach up to 5 images, and optionally send anonymously — so that I can publicly recognize a colleague.

### Acceptance Criteria
- [ ] Opening the dialog from the FAB's "Viết KUDOS" (any `(site)` page) or SCR004's ComposePill mounts the same shared modal with real recipients/hashtags (`compose-dialog-container.tsx`, `fab-widget.tsx:68-78`, `kudos-feed-container.tsx:113`).
- [ ] Recipient is required (autocomplete over every profile, PERM004's widened select); a self-kudos attempt is rejected client-side and, as a backstop, server-side (`self-kudos-not-allowed`, `create-kudos-action.ts:90-92`).
- [ ] Content supports bold/italic/strike/ordered-list/blockquote/link marks plus an `@mention` suggestion; Submit stays disabled while content is empty (`kudos-compose-dialog.tsx:72`).
- [ ] Exactly 1–5 hashtags are required — 0 selected blocks submit, a 6th attempt is blocked at the picker (`hashtag-picker.tsx:31-41`) and, redundantly, at the RPC (migration:301-303).
- [ ] Up to 5 images (jpg/png/webp, ≤5MB each) are validated client-side before upload; the "+
  Image" control hides at 5 (`image-attachment-grid.tsx:12-14,80,126`).
- [ ] Checking "Gửi ẩn danh" reveals a required display-name field; unchecking clears it — `sender_id` is still recorded server-side regardless (BR-007, `anonymous-toggle.tsx:33-37`).
- [ ] On submit, `createKudos` re-validates everything, calls `create_kudos` (one atomic transaction: kudos + 1–5 hashtag rows + ≤5 image rows), then `revalidatePath("/kudos")`; a rejection keeps the dialog open with an inline error instead of closing (`compose-dialog-container.tsx:79-85`).

### Technical Notes
- **Endpoint**: Server Action `createKudos` → RPC `create_kudos` (no HTTP route)
- **Data Required**: `receiverId`, non-empty `content`, 1–5 `hashtagIds`, ≤5 images, optional `anonymousDisplayName`
- **Dependencies**: PERM010, PERM011, PERM015, PERM016; BL006

### Screens
- SCR008_KudosCompose (the dialog); trigger origins SCR001, SCR003, SCR004, SCR006, SCR007 (FAB) and SCR004 (ComposePill)

### Background Logic
- BL006_CreateKudosTransaction

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member opens Compose via the FAB | Fills recipient, content, 2 hashtags, 1 image, submits | Kudos row + hashtag rows + image row created atomically, dialog closes, feed refreshes |
| Error Case | Member selects themself as recipient | Clicks "Gửi" | Inline `selfKudosError` shown, dialog stays open, no RPC call made |

---

## US017_InsertLinkInKudosContent: Insert a link into Kudos content
**Type**: ui
**Interaction**: secondary-action
**Priority**: P2
**Estimate**: S

### User Story
As a member, I want to insert a hyperlink into my Kudos message from the editor toolbar so that
I can reference something in the content.

### Acceptance Criteria
- [ ] Clicking the toolbar's link button opens the Add Link dialog (`editor-toolbar.tsx:96-104`).
- [ ] Text (1–100 chars) and URL (`^https?://`, 5–2048 chars) are both required before Save enables (`addlink-dialog.tsx:13-26,64-66`).
- [ ] Save inserts a **new** text run carrying the link mark into the TipTap doc at the cursor (`kudos-editor.tsx:99-110`) rather than converting an existing selection.
- [ ] Escape or "Hủy" cancels with no confirm prompt and discards both fields (`addlink-dialog.tsx:53-60`).

### Technical Notes
- **Endpoint**: N/A — client-only, feeds SCR008's own draft state
- **Data Required**: link text, URL
- **Dependencies**: SCR008_KudosCompose must be open

### Screens
- SCR008_KudosCompose (trigger), SCR002_AddLink (dialog)

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member composing a kudos | Fills text + a valid `https://` URL, clicks Save | A link-marked text run is inserted into the editor content |
| Edge Case | Member enters a URL without `http(s)://` | Types the URL | Save stays disabled, inline error shown |

---

## US013_ToggleHeartOnKudos: Heart / un-heart a kudos
**Type**: ui
**Interaction**: primary-action
**Priority**: P0
**Estimate**: M

### User Story
As a member, I want to heart (and un-heart) a colleague's kudos so that I can show appreciation, with double credit on a special day.

### Acceptance Criteria
- [ ] The heart button is disabled on a kudos the viewer themself sent (`heart-button.tsx:30`, BR-005, backstopped by `heart_insert_not_self` RLS).
- [ ] Granting inserts one `heart` row with a server-computed amount — 1 normally, 2 on a special day (Ho Chi Minh calendar date checked against `special_days`) — never client-writable (`toggle-heart-action.ts:100-111`, `heart-rules.ts:21-24`).
- [ ] Un-hearting deletes the caller's own row and reports the amount actually removed, never a stale prior read, closing a double-toggle race (`toggle-heart-action.ts:82-98`).
- [ ] A second click on the same kudos while a request is in flight is ignored, not queued twice (`use-heart-toggle.ts:33-35`).
- [ ] The heart button and its count are shared across the feed card, the highlight card, and the detail screen via one `useHeartToggle` hook (`kudos-detail-view.tsx:54`).

### Technical Notes
- **Endpoint**: Server Action `toggleHeart` (no HTTP route)
- **Data Required**: `kudosId`
- **Dependencies**: PERM012_HeartSelectInsertNotSelfDeleteOwnRLS, PERM017

### Screens
- SCR004_KudosBoard (feed + highlight cards), SCR006_KudosDetail

### Background Logic
_None — Track B core logic per `behavior-logic.md`'s own exclusion (`toggleHeart` writes only to the app's own tables, not a background-logic type)._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member views a colleague's kudos | Clicks the heart button | Heart count increments by 1 (or 2 on a special day), button shows liked state |
| Edge Case | Member views their own sent kudos | Looks at the heart button | Button is disabled — clicking has no effect |

---

## US007_ViewProfileStub: View a Sunner's profile stub
**Type**: ui
**Interaction**: navigation
**Priority**: P2
**Estimate**: S

### User Story
As a member, I want to open a Sunner's profile from their avatar/name on a kudos card or a sidebar leaderboard entry so that I can see who they are.

### Acceptance Criteria
- [ ] Clicking the sender or receiver avatar/name block on a feed, highlight, or detail card navigates to `/profile?id={author.id}` — the whole author block is one link, not just the avatar (`card-author-block.tsx:37-39`).
- [ ] Clicking a leaderboard entry (rank-promotion or gift list) navigates the same way (`leaderboard-list.tsx:52`).
- [ ] The destination renders a minimal stub — avatar/initials fallback, full name, "Đang phát triển" — never a real profile screen this round (`profile-stub.tsx`, decision-sourced).
- [ ] A missing/unresolved `id` renders the same stub with no name rather than a 404 or crash (`profile-container.tsx:14-17`).

### Technical Notes
- **Endpoint**: GET /profile?id={uuid} (guarded)
- **Data Required**: profile id
- **Dependencies**: PERM001, PERM004_ProfileSelectAllAuthenticatedRLS

### Screens
- SCR004_KudosBoard, SCR006_KudosDetail (origin) → SCR007_Profile (destination)

### Background Logic
_None._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member views a feed card | Clicks the sender's avatar | Navigates to `/profile?id={senderId}`, stub shows their name |
| Edge Case | A leaderboard entry's `id` resolves to nothing | Member clicks it | Stub renders with no name, no crash |

**Notes**: no in-app control lets a signed-in Sunner reach their OWN profile this round — `account-menu.tsx`'s "Profile" row is still render-only, no `href` (BR-004, unchanged gap from round 1) — a Sunner can only ever view *other* Sunners' stubs through this UI.

---

## US002_LoadMoreKudosFeed: Load more kudos in the feed
**Type**: ui
**Interaction**: system-action
**Priority**: P1
**Estimate**: S

### User Story
As a member, I want more kudos to load as I scroll the feed so that I can keep browsing without a full page reload.

### Acceptance Criteria
- [ ] Scrolling within 400px of the page bottom auto-triggers the next page fetch via the inline
  Server Action `loadMoreFeedAction` (`use-infinite-feed.ts:15,57-67`).
- [ ] A load already in flight blocks a second concurrent trigger (`loadingRef` guard).
- [ ] Newly loaded items append to the existing feed array; the currently applied hashtag/ department filter carries into every subsequent page (`use-infinite-feed.ts:42-47`).
- [ ] `nextOffset: null` (last page reached) stops further scroll-triggered fetches.
- [ ] Changing a filter (`US011`) discards any accumulated pages via the container's full remount, not a manual merge against stale state (`kudos-board-container.tsx` `key={hashtag::department}`).

### Technical Notes
- **Endpoint**: inline Server Action `loadMoreFeedAction` (`kudos-board-container.tsx:104-117`, no file-system route)
- **Data Required**: current offset, active hashtag/department filter
- **Dependencies**: none beyond SCR004's own PERM001 guard

### Screens
- SCR004_KudosBoard

### Background Logic
_None — behavior-logic.md explicitly excludes this as Track B core pagination, not a background- logic type._

### Test Scenarios
| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Member scrolls the feed | Reaches within 400px of the bottom | Next page of items appends automatically |
| Edge Case | Feed's `nextOffset` is already `null` | Member scrolls to the bottom | No further fetch is attempted |

---

## Screen → US Map
| Screen | US Codes |
|--------|---------|
| SCR001_Home | US006, US004, US009, US010, US014, US016, US003, US005 |
| SCR005_Login | US001, US004 |
| SCR003_AwardSystem | US006, US004, US009, US010, US015, US003, US005 |
| SCR004_KudosBoard | US006, US004, US009, US010, US003, US008, US011, US012, US005, US013, US007, US002 |
| SCR006_KudosDetail | US006, US004, US009, US010, US003, US012, US013, US007, US005 |
| SCR007_Profile | US006, US004, US009, US010, US003, US007, US005 |
| SCR008_KudosCompose | US005, US017 |
| SCR002_AddLink | US017 |

> No screen has 0 US mapped — `[IPE_ZERO]` not triggered.

## Cross-Reference Validation
- [x] All US### codes are unique
- [x] All acceptance criteria are testable
- [x] All technical notes are complete
- [x] All US### codes are referenced in FeatureList.md — **resolved**: `feature-list.md` (Wave 5)
  is now complete; all 17 US### are referenced (US001,US006→F001; US003,US004,US009,US010→F002;
  US014,US016→F003; US015→F004; US005,US017→F005; US002,US007,US008,US011,US012,US013→F006 —
  `feature-list.md` § Cross-Reference Validation).
- [x] All `ui` US### mapped to SCR### or SCR###/REG### (every parent SCR confirmed in `screen-list.md`; no REG### exists this round per that artifact's own composite-gate finding)
- [x] All system US### have at least one BL### mapped — **N/A**: no `system`-typed US emitted;
  BL001/BL003/BL005 → US001, BL002 → US006, BL004 → US016, BL006 → US005 (new this round, per this wave's brief and `behavior-logic.md`'s own pending note)
