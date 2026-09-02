# Feature List

**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Analysis Scope**: Wave 5 — clustering over `user-stories.md` (US001–US017), `screen-list.md`
(SCR001–SCR008), `route-list.md` (ROUTE001–002 + 6 frontend pages), `data-model.md`
(MODEL001–011), `behavior-logic.md` (BL001–006), `permissions.md` (PERM001–017), cross-checked
against `api-map.md`.

**Stability constraint (CRITICAL, honored below)**: `docs/features/**` already carries 6
load-bearing fcodes cited across docs and test-traceability: `F001_GoogleOAuthLogin`,
`F002_NavigationShell`, `F003_HomepageOverview`, `F004_AwardSystemBrowse`, `F005_KudosCompose`,
`F006_KudosLiveBoard`. This wave's clustering converges on exactly these six — every US/SCR/BL/
PERM/MODEL below sorts cleanly into one (or, for a handful of dual-purpose Kudos-cluster RLS
items, two) of them with no remainder, so no seventh feature is created. Round-1's own F001–F004 scope is
**extended**, not renumbered: F001 now also guards 3 more private routes and its Logout trigger
now also renders on 3 more screens; F002's shared chrome now spans 5 `(site)`-group screens
instead of 2. F005/F006 are new this round, matching the scope already promoted to
`docs/features/F005_KudosCompose/` and `docs/features/F006_KudosLiveBoard/` (read for this
convergence check — their README's own screen/route lists match this wave's SCR004/SCR006/
SCR007→F006 and SCR008/SCR002→F005 clustering exactly, including the Profile stub living under
F006, not a stray seventh code).

**Slug-derivation override**: `F001_GoogleOAuthLogin`'s `OAuth` capitalization does not match the
canonical mechanical grammar in `canonical-fcode-schema.md` (`Google OAuth Login` → token-wise
capitalize-first-lowercase-rest would derive `GoogleOauthLogin`). The load-bearing slug already
in `docs/features/F001_GoogleOAuthLogin/` is preserved verbatim, overriding the mechanical
derivation for this one feature only — consistent with the stability constraint's "extend, don't
renumber" instruction. All other 5 slugs derive mechanically with no override needed.

**Code Format**: All codes MUST follow `F###_NameSlug` format (e.g., F001_Auth, F002_UserProfile)
**Screen Code Format**: All screen codes MUST follow `SCR###_NameSlug` format
**User Story Code Format**: All US codes MUST follow `US###_NameSlug` format
**Background Logic Code Format**: All BL codes MUST follow `BL###_NameSlug` format
**Permission Code Format**: All PERM codes MUST follow `PERM###_NameSlug` format

**Feature Types**:
- `ui` - Feature has UI screens (SCR###)
- `background` - Feature only has background logic (BL###, no SCR###)
- `mixed` - Feature has both UI screens and background logic

**Related Screens column format**: bare `SCR###` only — no `REG###` was declared this wave
(`screen-list.md`: "all atomic — no REG### declared").

**Dual-ownership note**: 4 Kudos-cluster RLS permissions (PERM010, PERM011, PERM013, PERM015) and
several data models (MODEL005–MODEL008) are listed under **both** F005_KudosCompose (their write/
insert half, or picker-read half) and F006_KudosLiveBoard (their select/display half) — the same
pattern round-1 used for shared-shell screens appearing under multiple features. Each dual entry
carries a parenthetical noting which half is owned where; no ambiguity for a downstream FS.1
researcher, since the full permission/data-model detail lives in `permissions.md`/`data-model.md`.

## Feature Hierarchy

**Note**: sorted by priority (P0 → P1 → P2 → P3); ties broken by `F###` ascending. Priority is the
highest (lowest P-number) among each feature's own User Stories.

| Code | Name | Type | Language | Workspace | Priority |
|------|------|------|----------|-----------|----------|
| F001_GoogleOAuthLogin | Google OAuth Login | mixed | TypeScript, SQL (Postgres trigger) | saa-web | P0 |
| F005_KudosCompose | Kudos Compose | mixed | TypeScript, SQL (Postgres RPC) | saa-web | P0 |
| F006_KudosLiveBoard | Kudos Live Board | ui | TypeScript, SQL (Postgres view) | saa-web | P0 |
| F002_NavigationShell | Navigation Shell | ui | TypeScript | saa-web | P1 |
| F003_HomepageOverview | Homepage Overview | mixed | TypeScript | saa-web | P1 |
| F004_AwardSystemBrowse | Award System Browse | ui | TypeScript | saa-web | P1 |

## Feature Details

### F001_GoogleOAuthLogin: Google OAuth Login

**Type**: mixed
**Description**: A guest signs in with a `@sun-asterisk.com` Google account from the Login screen
and holds a guarded session across the site. Input: Google OAuth consent (domain-gated at the
callback, not just the pre-fill hint) → Process: exchange code for session, reject and revoke on a
non-`sun-asterisk.com`/unverified email, provision the `profile` row via DB trigger, guard every
private route via one default-deny allow-list (`PERM001`) — this round the same gate, unchanged in
code, now also covers `/kudos`, `/kudos/[id]`, `/profile` simply because they're absent from
`PUBLIC_ROUTES` → Output: an authenticated session with a `member`/`admin` role, or an explicit
`?error=domain` bounce back to Login. Also owns the inverse action — a signed-in visitor submits
Logout (from the shared header, now rendered on 5 `(site)`-group screens, up from 2) → session and
cookies are cleared → visitor returns to `/` as a guest. Round-2 addition: `PERM004` widened from
own-row-only to all-authenticated select (`profile_select_all_authenticated`, replace-not-add,
migration `20260831000100`) — required by F005's recipient autocomplete and F006's author/
leaderboard display; the `Profile` entity itself and its write-restriction (`PERM005`) stay owned
here regardless of who reads it. Single lifecycle: establish, guard, and end one session.

**Workspace**: saa-web
**Languages**: TypeScript, SQL (Postgres trigger)
**Components**: 4 (`LoginHero`, `LoginErrorNotice`, `GoogleSignInButton`, `SubmitButton` —
Logout's own trigger UI, `AccountMenu`, is owned by F002_NavigationShell)

**Related Screens**:
- SCR005_Login: Login
- SCR001_Home: Home (Logout trigger only, via the shared account menu)
- SCR003_AwardSystem: AwardSystem (Logout trigger only, via the shared account menu)
- SCR004_KudosBoard: KudosBoard (Logout trigger only, via the shared account menu — new this round)
- SCR006_KudosDetail: KudosDetail (Logout trigger only, via the shared account menu — new this round)
- SCR007_Profile: Profile (Logout trigger only, via the shared account menu — new this round)

**Related User Stories**:
- US001_SignInWithGoogle: Sign in with Google
- US006_LogOutOfAccount: Log out of account

**Related APIs/Routes**:
- (GET) /auth/callback — ROUTE001
- (POST) /auth/sign-out — ROUTE002
- (GET) /login

**Related Data Models**:
- MODEL002_Profile

**Related Background Logic**:
- BL001_GoogleOAuthSignIn: GoogleOAuthSignIn
- BL002_SignOutSession: SignOutSession
- BL003_OAuthCallbackExchange: OAuthCallbackExchange
- BL005_ProfileProvisioningTrigger: ProfileProvisioningTrigger

**Related Permissions**:
- PERM001_PrivateRouteAuthGuard: PrivateRouteAuthGuard
- PERM002_AuthedLoginRouteRedirect: AuthedLoginRouteRedirect
- PERM003_SunAsteriskDomainSignInGate: SunAsteriskDomainSignInGate
- PERM004_ProfileSelectAllAuthenticatedRLS: ProfileSelectAllAuthenticatedRLS
- PERM005_ProfileWriteRestrictedToSystemTrigger: ProfileWriteRestrictedToSystemTrigger
- PERM006_SignOutOriginCheck: SignOutOriginCheck

---

### F002_NavigationShell: Navigation Shell

**Type**: ui
**Description**: The persistent header/footer/FAB chrome shared across every `(site)`-group
screen — extended this round from 2 screens (Home, AwardSystem) to 5, adding KudosBoard,
KudosDetail, Profile; Login still renders its own distinct minimal header
(`(auth)/layout.tsx`'s `LoginHeader`), not this shell. Input: a click on the logo, a nav link, a
language option, or the FAB pill → Process: client-side route navigation for logo/nav links, a
`selectLocaleAction` Server Action + cookie + `revalidatePath` for language — this round the same
action is also wired into Login's own header (Phase 08 fix), so `US004_SwitchSiteLanguage` covers
that instance too even though Login's own header itself belongs to F001 — local expand/collapse
state for the FAB → Output: the visitor lands on the target screen, the page re-renders in the
chosen locale, or the FAB reveals its quick-action controls. Round-2 change: the FAB's
"Viết KUDOS" control now opens F005_KudosCompose's dialog (was render-only in round 1); "Thể lệ"
remains inert. The account-menu/bell/FAB visibility variant (guest vs. authenticated) is also
owned here.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 8 (`SiteHeader`, `SiteHeaderContainer`, `AccountMenu`, `LanguageDropdown`,
`NotificationBell`, `SiteFooter`, `FabWidget`, `FabWidgetContainer` — unchanged this round)

**Related Screens**:
- SCR001_Home: Home
- SCR003_AwardSystem: AwardSystem
- SCR004_KudosBoard: KudosBoard (new this round)
- SCR006_KudosDetail: KudosDetail (new this round)
- SCR007_Profile: Profile (new this round)
- SCR005_Login: Login (language dropdown only, via `(auth)/layout.tsx`'s own `LoginHeader` —
  Phase 08 fix; Login's own header/footer otherwise belongs to F001, not this shell)

**Related User Stories**:
- US004_SwitchSiteLanguage: Switch site display language
- US009_NavigateToHome: Navigate to Home
- US010_NavigateToAwardsSystem: Navigate to Awards System
- US003_OpenFloatingActionWidget: Open floating action widget

**Related APIs/Routes**:
_None — chrome only; navigation targets are owned by the destination features (F003, F004, F006)._

**Related Data Models**:
_None — reads MODEL002_Profile only to select a visibility variant; ownership stays with F001._

**Related Background Logic**:
_None._

**Related Permissions**:
- PERM007_AccountMenuDashboardVisibility: AccountMenuDashboardVisibility
- PERM008_FabWidgetAuthenticatedVisibility: FabWidgetAuthenticatedVisibility
- PERM009_HeaderAuthedVariant: HeaderAuthedVariant

---

### F003_HomepageOverview: Homepage Overview

**Type**: mixed
**Description**: A visitor reads the SAA 2025 homepage. Input: page load at `/` → Process: render
the hero keyvisual with a client-only live countdown (recomputed every 30s from
`NEXT_PUBLIC_EVENT_START_AT`, hydration-safe placeholder on first paint), the Root Further theme
copy, a 6-card award-category teaser grid, and a Kudos promo block (CTA still inert this round,
unchanged from round 1) → Output: a visitor either stays to watch the countdown tick down, or
clicks an award card to jump straight into that category's detail on the Awards System page.
Re-verified unchanged this round — no Kudos-round drift; the only change is the entity code
(`MODEL002_AwardCategory` in round 1 → `MODEL004_AwardCategory` this round, renumbered, not
recontent-ed). Header/footer/language/account-menu/FAB are NOT owned here — see
F002_NavigationShell.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 9 (`HeroSection`, `EventCountdownLive`, `EventCountdown`, `EventInfo`,
`IconLinkArrow`, `RootFurtherBlock`, `AwardGrid`, `AwardCard`, `KudosPromo`)

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US014_OpenAwardCategoryFromHome: Open award category detail from Home
- US016_ViewLiveEventCountdown: View live event countdown

**Related APIs/Routes**:
- (GET) /

**Related Data Models**:
- MODEL004_AwardCategory

**Related Background Logic**:
- BL004_EventCountdownTick: EventCountdownTick

**Related Permissions**:
_None — this page's own content is public; the deep-link into AwardSystem is guarded by PERM001,
owned under F001._

---

### F004_AwardSystemBrowse: Award System Browse

**Type**: ui
**Description**: An authenticated visitor browses the "Hệ thống giải" award-system page. Input:
arrival at `/he-thong-giai` (guarded — unauthenticated visitors never reach this point, see
PERM001 under F001) or a click on a side-nav category item → Process: render the hero, all 6
award-info detail cards simultaneously (no tab-panel switching), and a client-only scroll-spy nav
that resolves the active category from a URL hash or a click and highlights it → Output: the
matching detail card is scrolled into view and marked active, with no navigation, no HTTP request,
and no hydration mismatch on a direct hash-linked page load. Re-verified unchanged this round.
Header/footer/language/account-menu/FAB are NOT owned here — see F002_NavigationShell.

**Workspace**: saa-web
**Languages**: TypeScript
**Components**: 5 (`AwardHero`, `AwardSectionTitle`, `AwardCategoryNav`, `AwardInfoCard`,
`AwardKudosBanner`)

**Related Screens**:
- SCR003_AwardSystem: AwardSystem

**Related User Stories**:
- US015_SelectAwardCategoryFromSideNav: Select award category from side nav

**Related APIs/Routes**:
- (GET) /he-thong-giai

**Related Data Models**:
- MODEL004_AwardCategory

**Related Background Logic**:
_None._

**Related Permissions**:
_None owned directly — arrival at this screen is gated by PERM001_PrivateRouteAuthGuard, owned
under F001 (the guard is generic infrastructure, not this feature's own logic)._

---

### F005_KudosCompose: Kudos Compose

**Type**: mixed
**Description**: A member composes and submits a Kudos — pick a recipient, write rich-text content
with an `@mention`, tag 1–5 hashtags, attach up to 5 images, optionally send anonymously,
optionally insert a link via a nested sub-dialog — to publicly recognize a colleague. Input:
opening the shared `ComposeDialogContainer` modal from either the FAB's "Viết KUDOS" (any
`(site)` page, F002's own trigger) or KudosBoard's ComposePill (F006's own trigger) → Process:
client-side draft validation (recipient required, non-self, 1–5 hashtags, ≤5 images MIME/size-
checked, anonymous display-name required when toggled), then `createKudos` re-validates
server-side (getClaims-only identity, self-kudos block, storage-path ownership) and calls the
`create_kudos` RPC — one atomic transaction inserting `kudos` + 1–5 `kudos_hashtag` rows + ≤5
`kudos_image` rows → Output: on success the dialog closes and `/kudos` revalidates so the new
kudos appears on F006's board; on rejection the dialog stays open with an inline error. The
nested AddLink sub-dialog (its own modal, `SCR002_AddLink`, opened from the editor toolbar's link
button) inserts a link-marked text run into the in-progress editor content — draft state only,
persisted only on this feature's own Submit. Reads `MODEL002_Profile` (recipient pool, ownership
stays F001) and the read half of the Kudos-cluster reference/RLS surface shared with F006 (see
Related Permissions/Data Models below).

**Workspace**: saa-web
**Languages**: TypeScript, SQL (Postgres RPC)
**Components**: 8 (7 in `SCR008_KudosCompose`: `RecipientAutocomplete`, `KudosEditor`,
`EditorToolbar`, `HashtagPicker`, `ImageAttachmentGrid`, `AnonymousToggle`, `ComposeFooter`; 1 in
`SCR002_AddLink`: the AddLink form)

**Related Screens**:
- SCR008_KudosCompose: KudosCompose (modal)
- SCR002_AddLink: AddLink (modal, nested inside SCR008 via the editor toolbar's link button)

**Related User Stories**:
- US005_ComposeKudos: Compose and submit a Kudos
- US017_InsertLinkInKudosContent: Insert a link into Kudos content

**Related APIs/Routes**:
_None — modal only, no route of its own (`route-list.md` § Notes: "Kudos Compose has no route of
its own … belongs in screen-list.md"). Opened from F002's FAB or F006's ComposePill._

**Related Data Models**:
- MODEL005_Hashtag (picker read half — filter-dropdown read half owned by F006)
- MODEL006_KudosHashtag (insert half — select/display half owned by F006)
- MODEL007_Kudos (insert half — select/display half owned by F006)
- MODEL008_KudosImage (insert half — select/display half owned by F006)

**Related Background Logic**:
- BL006_CreateKudosTransaction: CreateKudosTransaction

**Related Permissions**:
- PERM010_KudosSelectAllInsertOwnRLS: KudosSelectAllInsertOwnRLS (insert half — select half owned by F006)
- PERM011_KudosImageAndHashtagInsertOwnRLS: KudosImageAndHashtagInsertOwnRLS (insert half — select half owned by F006)
- PERM013_SeedReferenceDataReadOnlyRLS: SeedReferenceDataReadOnlyRLS (hashtag-picker read half — filter-dropdown half owned by F006)
- PERM015_StorageImagesBucketScopedInsertRLS: StorageImagesBucketScopedInsertRLS (upload/insert half — thumbnail/gallery select half owned by F006)
- PERM016_CreateKudosIdentityAndSelfBlockGuard: CreateKudosIdentityAndSelfBlockGuard

---

### F006_KudosLiveBoard: Kudos Live Board

**Type**: ui
**Description**: A member browses the Sun\* Kudos Live board — highlight carousel, Spotlight
word-cloud, sidebar stats/leaderboards, and a paginated feed — filters it by hashtag/department,
opens a kudos's full detail, hearts/un-hearts a kudos, and reaches a Sunner's minimal profile stub
from an author block or leaderboard entry. Input: arrival at `/kudos` (guarded, see PERM001 under
F001) → Process: one shared server payload resolves 8 parallel queries into highlight/spotlight/
sidebar/feed; selecting a hashtag or department pushes the URL and remounts the client shell
(`key={hashtag::department}`); scrolling near the bottom auto-fetches the next feed page via an
inline Server Action; clicking a card's content, "Xem chi tiết", or a Spotlight node opens
`/kudos/{id}` (`SCR006_KudosDetail`, same card building blocks, reused not duplicated); clicking
an author block or leaderboard entry opens `/profile?id={uid}` (`SCR007_Profile`, a
decision-sourced minimal stub — avatar/name/"Đang phát triển", no real profile screen this round);
the heart button on any card grants/revokes a `heart` row with a server-computed amount (1, or 2
on a special day) → Output: a live, filterable social feed of recognition, with heart counts and
detail views, and a stub identity lookup for any Sunner mentioned on it. Composing a new kudos is
NOT owned here — see F005_KudosCompose (this board's own ComposePill and every FAB "Viết KUDOS"
both open that feature's modal).

**Workspace**: saa-web
**Languages**: TypeScript, SQL (Postgres view)
**Components**: 15 (9 in `SCR004_KudosBoard`: `KvBanner`, `ComposePill`, `FilterBar`,
`HighlightCarousel`, `SpotlightBoard`, `KudosFeed`, `KudosCard`, `BoardSidebar`,
`ComposeDialogContainer`; 5 in `SCR006_KudosDetail`: `KudosDetailView`, `CardAuthorBlock`,
`DetailGallery`, `HeartButton`, `CopyLinkButton`; 1 in `SCR007_Profile`: `ProfileStub`)

**Related Screens**:
- SCR004_KudosBoard: KudosBoard
- SCR006_KudosDetail: KudosDetail
- SCR007_Profile: Profile

**Related User Stories**:
- US008_BrowseKudosBoard: Browse the Kudos board
- US011_FilterKudosBoard: Filter the Kudos board
- US012_ViewKudosDetail: View a kudos's full detail
- US013_ToggleHeartOnKudos: Heart / un-heart a kudos
- US007_ViewProfileStub: View a Sunner's profile stub
- US002_LoadMoreKudosFeed: Load more kudos in the feed

**Related APIs/Routes**:
- (GET) /kudos
- (GET) /kudos/[id]
- (GET) /profile

**Related Data Models**:
- MODEL001_KudosCardView
- MODEL003_Department
- MODEL005_Hashtag (filter-dropdown read half — picker-read half owned by F005)
- MODEL006_KudosHashtag (select/display half — insert half owned by F005)
- MODEL007_Kudos (select/display half — insert half owned by F005)
- MODEL008_KudosImage (select/display half — insert half owned by F005)
- MODEL009_Heart
- MODEL010_SpecialDays
- MODEL011_SecretBoxGift

**Related Background Logic**:
_None — Track B core reads/writes per `behavior-logic.md`'s own exclusion (`toggleHeart`, the
load-more pagination action, and the board's own read queries all write only to this app's own
Supabase project, not a genuine background-logic type)._

**Related Permissions**:
- PERM010_KudosSelectAllInsertOwnRLS: KudosSelectAllInsertOwnRLS (select half — insert half owned by F005)
- PERM011_KudosImageAndHashtagInsertOwnRLS: KudosImageAndHashtagInsertOwnRLS (select half — insert half owned by F005)
- PERM012_HeartSelectInsertNotSelfDeleteOwnRLS: HeartSelectInsertNotSelfDeleteOwnRLS
- PERM013_SeedReferenceDataReadOnlyRLS: SeedReferenceDataReadOnlyRLS (filter-dropdown half — hashtag-picker half owned by F005)
- PERM014_KudosCardViewSecurityInvokerVisibility: KudosCardViewSecurityInvokerVisibility
- PERM015_StorageImagesBucketScopedInsertRLS: StorageImagesBucketScopedInsertRLS (thumbnail/gallery select half — upload/insert half owned by F005)
- PERM017_ToggleHeartIdentitySelfBlockAmountIntegrityGuard: ToggleHeartIdentitySelfBlockAmountIntegrityGuard

---

## Summary

- **Total Features**: 6
- **Total Screens**: 8
- **Total User Stories**: 17
- **Total Routes**: 8 (2 backend: ROUTE001, ROUTE002; 6 frontend pages: `/`, `/login`,
  `/he-thong-giai`, `/kudos`, `/kudos/[id]`, `/profile`)
- **Total Data Models**: 11 (MODEL001–MODEL011)
- **Total Background Logic**: 6
- **Total Permissions**: 17
- **Languages Detected**: TypeScript, SQL (Postgres)

## Cross-Reference Validation

- [x] All F### codes are unique (F001–F006)
- [x] All F### codes are referenced in UserStories.md — every US001–US017 cited above
- [x] All screen references are valid (SCR001–SCR008, all bare — confirmed against `screen-list.md`)
- [x] All user story references are valid (US001–US017 confirmed against `user-stories.md`)
- [x] All route references are valid (ROUTE001/ROUTE002 confirmed against `route-list.md`;
  frontend pages cited by path, matching `route-list.md`'s own no-code convention for pages)
- [x] All data model references are valid (MODEL001–MODEL011 confirmed against `data-model.md`)
- [x] All behavior logic references are valid (BL001–BL006 confirmed against `behavior-logic.md`)
- [x] All permission references are valid (PERM001–PERM017 confirmed against `permissions.md`)
- [x] Every US has a parent feature (F###) — US001,US006→F001; US003,US004,US009,US010→F002;
  US014,US016→F003; US015→F004; US005,US017→F005; US002,US007,US008,US011,US012,US013→F006
- [x] Every screen has a parent feature (F###) — SCR005_Login→F001(primary)/F002(partial);
  SCR001_Home→F001(partial)/F002(partial)/F003(primary); SCR003_AwardSystem→F001(partial)/
  F002(partial)/F004(primary); SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile→
  F001(partial)/F002(partial)/F006(primary); SCR008_KudosCompose, SCR002_AddLink→F005(primary)
- [x] Every route maps to a feature (F###) — ROUTE001/ROUTE002/`/login`→F001; `/`→F003;
  `/he-thong-giai`→F004; `/kudos`,`/kudos/[id]`,`/profile`→F006
- [x] Every data model maps to a feature (F###) — MODEL002→F001; MODEL004→F003,F004;
  MODEL001,MODEL003,MODEL009,MODEL010,MODEL011→F006 only; MODEL005,MODEL006,MODEL007,MODEL008→
  F005+F006 (dual, insert/select split as noted per-item)
- [x] Every background logic maps to a feature (F###) — BL001,BL002,BL003,BL005→F001; BL004→F003;
  BL006→F005
- [x] Every permission maps to a feature (F###) — PERM001–PERM006→F001; PERM007–PERM009→F002;
  PERM016→F005 only; PERM012,PERM014,PERM017→F006 only; PERM010,PERM011,PERM013,PERM015→F005+F006
  (dual, insert/select split as noted per-item)

**Resolved this wave** (previously flagged `pending W5` in `user-stories.md`, `screen-list.md`,
`behavior-logic.md`, `permissions.md`, `route-list.md`): every one of those artifacts' own
Cross-Reference Validation "cannot confirm this wave" rows is now satisfied by the mapping above —
no orphaned US/SCR/BL/PERM/ROUTE remains, and the round-1 carried items (US001,US006→F001;
US003,US004,US009,US010→F002; US014,US016→F003; US015→F004) hold exactly as those artifacts'
own authors predicted, renumbered to this round's codes.
