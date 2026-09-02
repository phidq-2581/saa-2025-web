# Screen List

**Project**: SAA 2025 Web
**Generated**: 2026-09-02
**Analysis Scope**: Wave 2 — route-view (web) screens + modal overlays, all `src/app/**` page
files per `route-list.md` plus the two Kudos dialogs the task brief names explicitly (Compose,
AddLink). Renumbered fresh from round-1's `docs/generated/screen-list.md` (3 SCR) — contiguous
SCR001–SCR002 below; round-1's SCR001–SCR003 identity (Home/Login/AwardSystem) is preserved,
only the numbers are the same by coincidence of ordering, not a carried file.

**Code Format**: All codes follow `SCR###_NameSlug` | `SCR###/REG###` for region-scoped
references within a composite screen.

**Note**: Feature mapping is managed in FeatureList.md (Wave 5, now complete — see
`feature-list.md` § Cross-Reference Validation for the SCR###→F### mapping). UserStory mapping is
done in UserStories.md (not in this document).

**Screen source**: route-view (web) — one SCR per distinct `page.tsx` file (6) + one SCR per
real modal overlay component the task brief names (2: Compose dialog, AddLink sub-dialog).
Cross-referenced against `route-list.md` (re-verified this wave, 6 frontend pages).

**Composite-gate method (H1–H6, `composite-screen-detection.md`)**: applied to every SCR below,
execution order H6→H4→H5→H2→H3→H1→2-of-3 gate. `feature-list.md` does not exist yet at W2, so
**H1 = 0 (fail) for every screen this wave** — same structural condition round-1 hit. **H2 also
fails on every screen**: this codebase has no `features/*`/`modules/*`/`domains/*` literal
directories; the closest analog (`@/components/{x}/*`, `@/lib/{x}/*` per-feature subfolders)
never mixes ≥2 distinct `{x}` values inside one screen's own composition file — every screen's
imports resolve to exactly one such folder. Consequently the 2-of-3 gate `(H1∧H2)∨(H1∧H3)∨(H2∧H3)`
can only be met if both H1 and H2 pass, which never happens this wave — **every SCR below is
atomic**, including SCR004_KudosBoard where H3 alone passes (see its own note for why this is a
closer call than SCR001/SCR003 were).

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Home | Home | atomic | 9 | 4 |
| SCR005_Login | Login | atomic | 4 | 2 |
| SCR003_AwardSystem | AwardSystem | atomic | 5 | 2 |
| SCR004_KudosBoard | KudosBoard | atomic | 9 | 6 |
| SCR006_KudosDetail | KudosDetail | atomic | 5 | 2 |
| SCR007_Profile | Profile | atomic | 1 | 1 |
| SCR008_KudosCompose | KudosCompose (modal) | atomic | 7 | 5 |
| SCR002_AddLink | AddLink (modal) | atomic | 1 | 0 |

---

## SCR001_Home: Home

**Type**: atomic

### Description

Public homepage (`src/app/(site)/page.tsx`, MoMorph `i87tDx10uM`) — hero + live countdown, event
info, Root Further theme copy, award-category teaser grid, and a Kudos promo block. Unchanged
this round (re-verified against current source): H6/H4/H5 N/A, H2 fail (imports resolve to one
domain, `@/components/homepage/*`), H3 pass (4 named `<section>` wrappers), H1 fail (0, no
`feature-list.md` yet) → **2-of-3 gate not met → atomic**, no REG### (no section carries an
independence signal — every section is static content plus the client-only countdown tick).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| HeroSection | section (server) | Keyvisual, wordmark, countdown+event-info slot, CTA pair (`src/components/homepage/hero-section.tsx`) |
| EventCountdownLive / EventCountdown | client / presentational | Live countdown tick (BL004), digit-tile display |
| EventInfo | presentational | Event date/place/livestream note |
| RootFurtherBlock | section (server) | Theme description paragraphs |
| AwardGrid | section (server) | Award-teaser header + 6× `AwardCard`, links to `/he-thong-giai#{slug}` |
| AwardCard (×6) | presentational | One award-category teaser card |
| KudosPromo | section (server) | Kudos promo block — **CTA still inert this round** (`kudos-promo.tsx:64-73`, `aria-disabled`/`tabIndex={-1}`, BR-008 deferred; unchanged from round-1) |
| IconLinkArrow | shared icon | Arrow glyph reused across CTAs/cards |

### Data Displayed

- Event schedule/venue copy (`messages/{locale}/home.json` — static config)
- Live countdown remaining time (client-computed, BL004 — not persisted)
- MODEL004_AwardCategory × 6 (fixed list) — titles/badges from `home.json`
- Root Further / Kudos promo static copy (design content, no entity)

### Routes/URLs

- `/` (GET, public — exact-match, `src/proxy.ts` `PUBLIC_ROUTES`)

### Related Screens

- SCR003_AwardSystem: AwardSystem (navigation — hero CTA, header nav, award-card links, footer)
- **Gap (unchanged from round-1, now more notable)**: no live in-app link reaches
  SCR004_KudosBoard from Home — `kudos-promo.tsx`'s "Chi tiết" button and `site-header.tsx`'s
  "Sun* Kudos" nav item (line 22, no `href`) are both still render-only. The FAB's "Viết KUDOS"
  (present on this screen too) opens SCR008_KudosCompose directly, bypassing the board entirely.

---

## SCR005_Login: Login

**Type**: atomic

### Description

Google OAuth sign-in gate (`src/app/(auth)/login/page.tsx`, MoMorph `GzbNeVGJHz`). Renders its
own minimal `(auth)/layout.tsx` shell (no site header/footer/FAB). Unchanged this round: H6/H4/H5
N/A, H2 fail (one domain, `@/components/login/*`), H3 fail (1 `<section>` only), H1 fail (0) →
**atomic**, unambiguously.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| LoginHero | section (server) | Hero wrapper — keyvisual, wordmark, tagline |
| LoginErrorNotice | presentational | Conditional OAuth-failure banner (`domain`/`exchange_failed`/`missing_code`) |
| GoogleSignInButton | client (form) | Wraps `signInWithGoogle` Server Action (BL001) |
| SubmitButton | client (internal) | `useFormStatus`-driven spinner/disabled state |

### Data Displayed

- OAuth error state (transient, from `?error=` — no persisted entity)
- Login hero/CTA static copy (`messages/{locale}/login.json`)

### Routes/URLs

- `/login` (GET, public — exact-match; authenticated visitors redirected to `/`)

### Related Screens

- SCR001_Home: Home (OAuth success, no `next`; or already-authed hitting `/login`)
- SCR003_AwardSystem, SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile: any guarded screen
  reachable via its own `?next=` carried through `signInWithGoogle` → `/auth/callback`

---

## SCR003_AwardSystem: AwardSystem

**Type**: atomic

### Description

"Hệ thống giải" browse page (`src/app/(site)/he-thong-giai/page.tsx`, MoMorph `zFYDgyj_pD`),
guarded (`PERM001_PrivateRouteAuthGuard`). Unchanged this round: H4-evaluated (scroll-spy anchor
nav, not real tabs — all 6 `AwardInfoCard` sections render simultaneously), H2 fail (one domain,
`@/components/awards/*`), H3 pass (8 named `<section>` occurrences), H1 fail (0) → **2-of-3 gate
not met → atomic**, no REG### (no section has an independence signal).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| AwardHero | section (server) | Keyvisual with baked-in title/subtitle |
| AwardSectionTitle | presentational | Eyebrow + heading |
| AwardCategoryNav | client (scroll-spy) | Left nav, hash-driven active-item highlight |
| AwardInfoCard (×6) | presentational | Per-category detail card |
| AwardKudosBanner | presentational | Kudos promo banner — mirrors SCR001's `KudosPromo`, also still inert |

### Data Displayed

- MODEL004_AwardCategory × 6 (fixed list)
- Per-category detail copy — `messages/{locale}/awards.json` → `cardContent[slug]`

### Routes/URLs

- `/he-thong-giai` (GET, guarded — unauthenticated → `/login?next=/he-thong-giai`)

### Related Screens

- SCR001_Home: Home (header logo, nav "About SAA 2025", footer link)
- SCR005_Login: Login (guard redirect target for unauthenticated visitors)

---

## SCR004_KudosBoard: KudosBoard

**Type**: atomic

### Description

Sun* Kudos Live board (`src/app/(site)/kudos/page.tsx` → `kudos-board-container.tsx`, MoMorph
`MaZUn5xHXZ`), guarded. Filter state lives in the URL (`?hashtag=&department=`); the server
container resolves 8 queries in parallel and hands one shared payload to
`KudosFeedContainer` (`kudos-board-container.tsx:132-198`), the single client boundary for
everything below the keyvisual banner. `key={hashtag::department}` on that client shell forces a
full remount on every filter change (`kudos-feed-container.tsx` usage in
`kudos-board-container.tsx:180-195`) — simpler than diffing stale client state against a
re-filtered dataset (documented DEC).

**Composite classification — closer call than SCR001/SCR003**: H6/H4/H5 N/A. H2 fail — every
import in `kudos-board-container.tsx` and `kudos-feed-container.tsx` resolves to `@/lib/kudos/*`
or `@/components/kudos/*`, one domain. H3 **pass** — 4 named region wrappers across the composed
tree: `HighlightCarousel` (`<section>`), `SpotlightBoard` (`<section aria-labelledby>`),
`KudosFeed` (`<section>`), `BoardSidebar` (`<aside data-testid="kudos-board-sidebar">`,
`board-sidebar.tsx:27`). H1 fail — only 1 inline `F006` doc-comment ref found in the composition
files (`kudos-board-container.tsx:120`), below the ≥3 threshold. **2-of-3 gate: only H3 passes →
atomic per the letter of the rule** — same structural outcome as SCR001/SCR003, but unlike those
two, the Feed region here genuinely does carry an independence signal (its own "load more" inline
Server Action `loadMoreFeedAction`, `kudos-board-container.tsx:104-117`, plus its own
`loadingMore` client state, `kudos-feed-container.tsx:83-87`) that would justify a `REG###` under
Region Guidance's "distinct mutation surface / distinct loading state" test — it simply never
reaches evaluation because the gate itself (driven by H1's structural 0-until-W5 condition) closes
first. Flagged for the reviewer as the clearest false-negative risk in this artifact, not
silently decided.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| KvBanner | section (server) | Static keyvisual banner (`kv-banner.tsx`, mm:2940:13437) |
| ComposePill | client (button) | "Ghi nhận" pill, opens SCR008 (`compose-pill.tsx:24-49`) |
| FilterBar | client (composite) | Hashtag + Department dropdowns, push `/kudos?hashtag=&department=` (`filter-bar.tsx`) |
| HighlightCarousel | client (carousel) | Top-5 highlight slides, prev/next nav (`highlight-carousel.tsx` + `-nav`/`-track`) |
| SpotlightBoard | client | d3-canvas node cloud + ticker, node click → SCR006 (`spotlight-board.tsx:80`) |
| KudosFeed | client | Paginated "ALL KUDOS" list, infinite "load more" (`kudos-feed.tsx`, `use-infinite-feed.ts`) |
| KudosCard (×N, `feed`/`highlight` variants) | presentational | Shared card — author blocks (→SCR007), content, hashtags, heart, copy-link, "Xem chi tiết" (highlight only) (`kudos-card.tsx`) |
| BoardSidebar | client | Stats card + 2 leaderboards, entries → SCR007 (`board-sidebar.tsx`, `leaderboard-list.tsx:52`) |
| ComposeDialogContainer | client (modal mount) | Mounts SCR008 for both the FAB and this pill (`compose-dialog-container.tsx`) |

### Data Displayed

- MODEL001_KudosCardView — feed rows, highlight top-5, spotlight nodes (`get-feed-page.ts`, `get-highlight-top5.ts`, `get-spotlight.ts`)
- MODEL005_Hashtag — filter options + per-card chips (`get-filter-options.ts`)
- MODEL003_Department — filter options (`get-filter-options.ts`)
- MODEL009_Heart — aggregate `heartCount` + session-local `liked` override (`use-heart-toggle.ts`)
- Non-persisted derived view-models: `SidebarStats`, `LeaderboardEntry` ×2 lists, `SpotlightNode` (`types.ts:39-69`, `get-sidebar-stats.ts`, `get-leaderboards.ts`)
- MODEL002_Profile — as `KudosAuthor` recipients list feeding SCR008's autocomplete (`get-recipients.ts`)

### Routes/URLs

- `/kudos` (GET, guarded — unauthenticated → `/login?next=/kudos`), query params `?hashtag=`, `?department=`

### Related Screens

- SCR006_KudosDetail: highlight "Xem chi tiết" (`kudos-card.tsx:181-188`), feed-card content click (`kudos-card.tsx:81-84`), spotlight node click (`kudos-feed-container.tsx:137`)
- SCR007_Profile: author avatar/name click (`card-author-block.tsx:37-39`), leaderboard entry click (`leaderboard-list.tsx:52`)
- SCR008_KudosCompose: FAB "Viết KUDOS" (site-wide) or this screen's ComposePill

---

## SCR006_KudosDetail: KudosDetail

**Type**: atomic

### Description

Decision-sourced detail screen (`src/app/(site)/kudos/[id]/page.tsx` →
`kudos-detail-container.tsx`), no MoMorph frame of its own (clarifications.md 2026-08-31: "trang
detail tối thiểu … tái dùng component card"). Guarded purely by absence from `PUBLIC_ROUTES`
(BR-001) — no route-specific guard code. `getKudosById(id)` miss renders an inline not-found
block reusing `common.notFound` copy (`kudos-detail-container.tsx:36-55`) — **not** a separate
route or SCR, just the same content displayed within this screen. H6/H4/H5 N/A, H2 fail (one
domain), H3 fail (only 1 `<article>` wrapper, `kudos-detail-view.tsx:65`), H1 fail (2 `F006` refs,
below ≥3) → **atomic**.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| KudosDetailView | composite (article) | Full, untruncated card — reuses feed-card building blocks (`kudos-detail-view.tsx`) |
| CardAuthorBlock (×2) | presentational | Sender/receiver, each → SCR007 (`card-author-block.tsx`) |
| DetailGallery | presentational | Full-size image grid, no thumbnail cap (`detail-gallery.tsx`) |
| HeartButton | client | Heart toggle mutation, same `useHeartToggle` hook as the board (`kudos-detail-view.tsx:54,109-114`) |
| CopyLinkButton | client | Clipboard copy + toast, no navigation |

### Data Displayed

- MODEL001_KudosCardView — single row via `getKudosById(id)` (`get-kudos-by-id.ts`)
- MODEL009_Heart — aggregate `heartCount` + toggle (same hook as SCR004)

### Routes/URLs

- `/kudos/[id]` (GET, guarded — unauthenticated → `/login?next=/kudos/{id}`), dynamic `id` segment

### Related Screens

- SCR007_Profile: sender/receiver avatar or name click
- SCR001_Home: not-found state's only exit link ("back home", `kudos-detail-container.tsx:46-51`)
- **Gap**: no link back to SCR004_KudosBoard exists on this screen — a visitor who lands here via a shared link or spotlight click has no in-page way back to the board short of the browser back button or re-typing `/kudos`. Hashtag chips are also rendered non-interactive here (`kudos-detail-view.tsx:100-102` passes no `onHashtagClick`, unlike the feed card's filter-click behavior) — a second, smaller parity gap versus SCR004.

---

## SCR007_Profile: Profile

**Type**: atomic

### Description

Minimal placeholder stub (`src/app/(site)/profile/page.tsx` → `profile-container.tsx` →
`profile-stub.tsx`), decision-sourced (clarifications.md 2026-08-31: "trang placeholder tối
thiểu (avatar + tên + 'Đang phát triển'); round 3 thay bằng màn thật"). A missing or unresolved
`id` renders the same stub with `profile: null` rather than erroring (`profile-container.tsx:14-17`).
H6/H4/H5/H2/H3/H1 all trivially fail (one `<section>`, one domain, 1 `F006` ref) → **atomic**.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| ProfileStub | presentational (async server) | Avatar/initials fallback + name + "Đang phát triển" message (`profile-stub.tsx`) |

### Data Displayed

- MODEL002_Profile — projected as `KudosAuthor {id, fullName, avatarUrl}` via `getProfileById(id)` (`get-profile-by-id.ts`)

### Routes/URLs

- `/profile` (GET, guarded — unauthenticated → `/login?next=/profile`), optional `?id=` query param

### Related Screens

- No outbound links — leaf screen, no CTA (still inherits the shared `(site)` header/footer/FAB shell)
- Inbound from SCR004_KudosBoard and SCR006_KudosDetail (avatar/name/leaderboard clicks)
- **Gap**: no "view my own profile" entry exists anywhere — `account-menu.tsx`'s "Profile" menu item is still render-only, no `href`/navigation (`account-menu.tsx:74-81`, `BR-004`, unchanged behavior class from round-1's Dashboard item). A signed-in Sunner can only view *other* Sunners' stubs, never their own, via this UI.

---

## SCR008_KudosCompose: KudosCompose (modal)

**Type**: atomic (modal overlay, no route)

### Description

"Viết Kudo" compose dialog (`kudos-compose-dialog.tsx`, MoMorph node `520:11647`, 752×1012,
padding 40, gap 32, radius 24, bg `#FFF8E1`). The single shared modal both the FAB's "Viết KUDOS"
button (site-wide — mounted by `fab-widget.tsx:105-111` inside `FabWidget`, rendered on every
`(site)`-group screen: SCR001, SCR003, SCR004, SCR006, SCR007) and SCR004's ComposePill open
(`compose-dialog-container.tsx` docblock: "one shared modal … no matter which entry point opened
it"). Not a route — `route-list.md` § Notes: "Kudos Compose has no route of its own … belongs in
screen-list.md." H6/H4/H5 N/A. H2 fail — every imported child (`RecipientAutocomplete`,
`KudosEditor`, `HashtagPicker`, `ImageAttachmentGrid`, `AnonymousToggle`, `ComposeFooter`) is
`./`-local, one domain (`compose`). H3 fail — none of those children render a top-level
`<section>`/`<article>`/`<aside>` (raw-div fallback, `[H3_RAW_DIV]`). H1 fail (0 `F###` refs in
the dialog files themselves) → **atomic**, no REG###.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| RecipientAutocomplete | client | Searchable recipient picker over MODEL002_Profile rows |
| KudosEditor | client (TipTap) | Rich-text body, `@mention` suggestion, opens SCR002 via toolbar link button (`kudos-editor.tsx:75,99-110`) |
| EditorToolbar | client | Bold/Italic/Strike/OrderedList/Link/Quote (`editor-toolbar.tsx`) |
| HashtagPicker | client | 1–5 hashtag multi-select over MODEL005_Hashtag |
| ImageAttachmentGrid | client | ≤5 image attach, client-side MIME/size validation (`validate-image.ts`) |
| AnonymousToggle | client | "Ẩn danh" toggle + conditional display-name field |
| ComposeFooter | presentational | Cancel / Submit ("Gửi", disabled until valid) |

### Data Displayed

- Reads: MODEL002_Profile (recipients list), MODEL005_Hashtag (options)
- Writes (on submit, via `createKudos` → `create_kudos` RPC, `create-kudos-action.ts`): MODEL007_Kudos, MODEL006_KudosHashtag, MODEL008_KudosImage, plus image bytes to the `images` Storage bucket

### Routes/URLs

- N/A — modal, no route. Opened from the FAB "Viết KUDOS" (any `(site)` page) or SCR004's ComposePill; closes back to whichever page opened it, `router.refresh()` + `revalidatePath("/kudos")` on success (`compose-dialog-container.tsx:87-91`, `create-kudos-action.ts`)

### Related Screens

- SCR004_KudosBoard: successful submit revalidates the board's feed data
- SCR002_AddLink: nested child dialog (editor toolbar link button)
- **Unsaved-changes gap**: "Hủy" (`compose-footer.tsx:23-31`) discards recipient/content/hashtags/images/anonymous-name immediately, no confirm prompt and no `beforeunload` guard — unlike round-1's login/logout forms (which had nothing to lose), this form genuinely can lose real user input silently.

---

## SCR002_AddLink: AddLink (modal)

**Type**: atomic (nested modal overlay, no route)

### Description

"Add link" sub-dialog (`addlink-dialog.tsx`, MoMorph node `1002:12682`, 752px card, padding 40,
gap 32, radius 24, bg `#FFF8E1`; inputs border `#998C5F`, radius 8, height 56). Opened from
SCR008's editor toolbar link button (`editor-toolbar.tsx:96-104` → `kudos-editor.tsx:75`).
Inserts a **new** text run carrying the link mark into the TipTap doc (`kudos-editor.tsx:99-110`)
rather than converting an existing selection. Escape key or "Hủy" both cancel with no confirm
(`addlink-dialog.tsx:53-60,119-127`) — low-stakes (2 fields only). H6/H4/H5/H2/H3/H1 all trivially
fail (single form, one file) → **atomic**.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| AddLink form | client | Text + URL inputs (client-validated: text 1–100 chars, URL `^https?://`, 5–2048 chars), Save (disabled until both valid) / Cancel |

### Data Displayed

- None persisted directly by this screen — the inserted text+link becomes part of SCR008's
  in-progress `content` doc, which is only written to MODEL007_Kudos.content on SCR008's own
  submit.

### Routes/URLs

- N/A — modal, no route. Opened from SCR008's editor toolbar; closes back to SCR008 on Save or Cancel/Escape.

### Related Screens

- SCR008_KudosCompose: parent (only entry and only exit)

---

## Summary

- **Total Screens**: 8 (all atomic — no REG### declared this wave; see SCR004's note for the
  one screen where the gate outcome is a closer call than the others)
- 6 route-view screens (SCR001–SCR007) + 2 modal overlays (SCR008–SCR002) named explicitly in
  the task brief
- Carried identity from round-1: SCR001_Home, SCR005_Login, SCR003_AwardSystem (re-verified
  against current source, unchanged)
- New this round: SCR004_KudosBoard, SCR006_KudosDetail, SCR007_Profile, SCR008_KudosCompose,
  SCR002_AddLink
- Not-found (`src/app/not-found.tsx`) and Forbidden (`src/app/forbidden.tsx`) remain **excluded**
  from the Screen Index, same reasoning as round-1: `route-list.md` § Special Files still
  documents both as provisional/no-route (no Figma frame; `forbidden()` uncalled this round).
  SCR006's own inline not-found state reuses the same `common.notFound` copy but is not a
  separate screen — see SCR006's Description.

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md
- [x] All related screen references are valid
- [x] All route URLs are properly formatted (SCR008/SCR002 explicitly marked N/A — modal, no route)
- [x] All SCR### codes are referenced in FeatureList.md — **resolved**: `feature-list.md` (Wave 5)
  is now complete; all 8 SCR### are referenced (`feature-list.md` § Cross-Reference Validation).
- [x] No orphaned screen references
