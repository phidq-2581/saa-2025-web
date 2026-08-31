# Screen List

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 2 — route-view (web) screens, all `src/app/**` page files per `route-list.md`

**Code Format**: All codes follow `SCR###_NameSlug` | `SCR###/REG###` for region-scoped references within a composite screen.

**Note**: Feature mapping is managed in FeatureList.md (generated at W5 — 4 features; see its Cross-Reference Validation). UserStory mapping is done in UserStories.md (not in this document).

**Screen source**: route-view (web) — one SCR per distinct `page.tsx` file, cross-referenced against `route-list.md` (Wave 1, complete: 3 frontend pages).

**[STACK_LIST_MISSING] advisory** (composite-screen-detection.md § Stack Probe): the task's stack note carries `[MULTI_STACK]` narrative text ("JS/TS + SQL/Postgres via Supabase migrations") but not the exact `all stacks: X, Y` comma-list format the union procedure expects. Per the documented fallback, H1–H6 below were evaluated against JS/TS signal tables only; this advisory is cited once here and referenced per-screen rather than repeated three times (DRY). SQL/Postgres carries no `screen`-tagged files in the File Inventory, so this has no practical effect on screen classification — it affects `behavior-logic.md` (SQL trigger BL item) instead.

**H6 shared-shell judgment call**: `src/app/(site)/layout.tsx` renders persistent layout UI (`SiteHeaderContainer`, `SiteFooter`, `FabWidgetContainer`) AND performs independent data fetch (`getCurrentProfile()` in both the header and FAB containers) — H6's "Parent shell: SCR### only if independent data fetch OR persistent layout UI" criterion is technically satisfied. However, `scout-report.md` § File Inventory classifies both `(site)/layout.tsx` and `(auth)/layout.tsx` as `route` (structural route-segment shell), not `screen`, and `route-list.md` excludes them from Frontend Routes/Pages entirely (route groups are organizational, not distinct URLs). Treated here as shared cross-cutting shell context documented in each site-page SCR's Description, not as a standalone SCR — flagged for reviewer confirmation rather than silently decided.

**Error surfaces excluded from Screen Index**: `src/app/not-found.tsx` (404) and `src/app/forbidden.tsx` (403) are tagged `screen` in the File Inventory (real, localized, user-facing content — not inert stubs) but `route-list.md` § Special Files documents both as **provisional, not routes** (no Figma frame, no route in the Frontend Routes/Pages table; `forbidden.tsx`'s own docblock confirms no route currently triggers it). Emitting them as SCR### would fail the "Has Route" validity requirement (`code-formats.md` / `verification-checklist-core-artifacts.md`) on a route-view profile where RouteList IS produced. Per the task's fallback instruction, they are **noted, not emitted as SCR###**: both render `common.notFound.*` / `common.forbidden.*` copy over shared design tokens (`clarifications.md § Error state`), reachable respectively via Next.js's automatic 404 boundary and the (currently uncalled) `forbidden()` API.

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Home | Home | atomic | 9 | 4 |
| SCR002_Login | Login | atomic | 4 | 2 |
| SCR003_AwardSystem | AwardSystem | atomic | 5 | 2 |

---

## SCR001_Home: Home

**Type**: atomic

### Description

Public homepage (`src/app/(site)/page.tsx`, MoMorph `i87tDx10uM`) — event keyvisual + live countdown, event info, Root Further theme copy, award category teaser grid, and a Sun* Kudos promo block. Inherits the shared session-aware header/footer/FAB shell from `(site)/layout.tsx` (see H6 shared-shell note above) — this page owns only the `<main>` landmark and its four in-flow sections.

**Composite classification** [STACK_LIST_MISSING advisory applies]: H6 N/A (no router-outlet delegation — standard Next.js page). H4 N/A (no tab UI). H5 N/A (no wizard/stepper). H2 = fail: all 4 imports (`AwardGrid`, `HeroSection`, `KudosPromo`, `RootFurtherBlock`) resolve to `@/components/homepage/*` — one domain folder, not ≥2 distinct domain-module matches (JS/TS include pattern requires `features/*`/`modules/*`/`domains/*`; this project has no such tree). H3 = pass (4 named `<section>` wrappers: `HeroSection`, `RootFurtherBlock`, `AwardGrid`, `KudosPromo`, each independently identifiable). H1 = fail (0 — `feature-list.md` does not exist yet at W2, so no F### refs can be counted). **2-of-3 gate: only H3 passes → atomic.** Even disregarding the gate, no candidate region (hero+countdown, event info, Root Further, award grid, Kudos promo) carries an independence signal — every section renders static Figma-sourced copy plus the client-only countdown tick (BL004, no fetch); none has its own API endpoint, loading state, auth gate, or mutation surface (Trap 1/Trap 3) — so no REG would be declared even under a passing gate.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| HeroSection | section (server) | Keyvisual, ROOT FURTHER wordmark, countdown+event-info slot, CTA pair (`src/components/homepage/hero-section.tsx`) |
| EventCountdownLive | client wrapper | Feeds live tick (BL004_EventCountdownTick) into `EventCountdown` |
| EventCountdown | presentational | Digit-tile countdown display, "coming soon" vs. reached state |
| EventInfo | presentational | Event date/place/livestream note |
| IconLinkArrow | shared icon | Arrow glyph reused across CTAs and award cards |
| RootFurtherBlock | section (server) | Root Further theme description paragraphs |
| AwardGrid | section (server) | Award-teaser header + 6× `AwardCard` grid |
| AwardCard | presentational (×6) | One award-category teaser card, links to `/he-thong-giai#{slug}` |
| KudosPromo | section (server) | Sun* Kudos promo block (CTA rendered inert — deferred, BR-008) |

### Data Displayed

- Data Entity 1: Event schedule/venue copy (`messages/{locale}/home.json` — no MODEL### backing, static config)
- Data Entity 2: Live countdown remaining time (client-computed from `NEXT_PUBLIC_EVENT_START_AT`, BL004 — not a persisted entity)
- Data Entity 3: Award category teasers — MODEL002_AwardCategory × 6, titles/badges from `home.json`
- Data Entity 4: Root Further / Kudos promo static copy (design content, no entity)

### Routes/URLs

- `/` (GET, public — exact-match, `src/proxy.ts` `PUBLIC_ROUTES`)

### Related Screens

- SCR003_AwardSystem: AwardSystem (navigation — hero "ABOUT AWARDS" CTA, header nav "Awards Information", award-card links, footer nav)

---

## SCR002_Login: Login

**Type**: atomic

### Description

Google OAuth sign-in gate (`src/app/(auth)/login/page.tsx`, MoMorph `GzbNeVGJHz`). Renders its own minimal header/footer via `(auth)/layout.tsx` (`LoginHeader`/`LoginFooter` — logo + language switcher only, no site nav/bell/account menu), deliberately not inheriting the `(site)` shell. Reads `?error=` for the OAuth-failure banner and `?next=` to thread the post-login redirect target through `signInWithGoogle` → `/auth/callback` (BL001/BL003).

**Composite classification**: H6/H4/H5 all N/A (no outlet, tabs, or steps). H2 = fail — imports resolve to `@/components/login/*`, one domain, not ≥2. H3 = fail — only 1 semantic `<section>` (`LoginHero`); `GoogleSignInButton` is a `<form>`, `LoginErrorNotice` is a `<p>`, neither is an H3 wrapper. H1 = fail (0, no F### yet). **2-of-3 gate: 0 of 3 → atomic**, unambiguously — single hero region with an embedded form, no candidate regions considered.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| LoginHero | section (server) | Hero wrapper — keyvisual, wordmark, tagline, children slot |
| LoginErrorNotice | presentational | Conditional OAuth-failure banner (`domain`/`exchange_failed`/`missing_code`) |
| GoogleSignInButton | client (form) | Wraps `signInWithGoogle` Server Action (BL001), pending-state submit button |
| SubmitButton | client (internal) | `useFormStatus`-driven spinner/disabled state, nested in `GoogleSignInButton` |

### Data Displayed

- Data Entity 1: OAuth error state (transient, from `?error=` query param — no persisted entity)
- Data Entity 2: Login hero/CTA static copy (`messages/{locale}/login.json`)

### Routes/URLs

- `/login` (GET, public — exact-match; authenticated visitors are redirected away to `/` by `src/proxy.ts`)

### Related Screens

- SCR001_Home: Home (navigation — successful OAuth with no `next` param, or an already-authenticated session hitting `/login`)
- SCR003_AwardSystem: AwardSystem (navigation — successful OAuth when `?next=/he-thong-giai` was carried in, e.g. from the guard redirect)

---

## SCR003_AwardSystem: AwardSystem

**Type**: atomic

### Description

"Hệ thống giải" award-system browse page (`src/app/(site)/he-thong-giai/page.tsx`, MoMorph `zFYDgyj_pD`), guarded — unauthenticated visitors are redirected to `/login?next=/he-thong-giai` by `src/proxy.ts`. Stacks hero → section title → a two-column (nav + cards) region → Kudos banner. Inherits the `(site)` shell (see H6 note on SCR001_Home).

**Composite classification** [H4-evaluated, not tabs]: `AwardCategoryNav` superficially resembles a tab strip (a side list with an active/`aria-current` state, one item highlighted at a time) but fails H4's condition — there is no `<Tab>/<TabPanel>/<TabList>`, no `role="tab"`/`role="tabpanel"`, no `.nav-tabs`/`.tab-pane` CSS pattern, and critically the 6 `AwardInfoCard` sections are **all rendered simultaneously** (mapped over `AWARD_CATEGORIES`, never conditionally hidden) — clicking a nav item scrolls to an anchor (`scrollIntoView`) rather than switching mutually-exclusive panels. This is a scroll-spy anchor nav, not H4 tabs (avoiding a Trap 2 misclassification). H5 N/A — no sequential step/validation/endpoint-per-step pattern. H6 N/A — no outlet. H2 = fail — `AwardHero`/`AwardSectionTitle`/`AwardCategoryNav`/`AwardInfoCard`/`AwardKudosBanner` all resolve to one domain folder (`@/components/awards/*`); the one non-component import (`AWARD_CATEGORIES`) is data, not a domain-module import. H3 = pass — 8 named `<section>` occurrences (`AwardHero` ×1, `AwardInfoCard` ×6 distinct anchor sections, `AwardKudosBanner` ×1); `AwardSectionTitle` (`<div>`) and `AwardCategoryNav` (`<nav>`) are not H3 signal tags, excluded from the count. H1 = fail (0, no F### yet). **2-of-3 gate: only H3 passes → atomic.** As with SCR001_Home, no candidate region (hero, nav, card sections, Kudos banner) carries an independence signal — all content is static (`AWARD_CATEGORIES` + `awards.json`), no per-section API/loading/auth/mutation divergence — so no REG would be declared even under a passing gate.

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| AwardHero | section (server) | Keyvisual with baked-in title/subtitle (exposed as `sr-only` text) |
| AwardSectionTitle | presentational | Eyebrow + heading for the award-list section |
| AwardCategoryNav | client (scroll-spy nav) | Left nav, hash-driven + click-driven active-item highlight, scrolls to anchor |
| AwardInfoCard | presentational (×6, mapped) | Per-category detail card (title, description, quantity, prize tiers) |
| AwardKudosBanner | presentational | Kudos promo banner (CTA rendered inert — deferred, mirrors SCR001's KudosPromo) |

### Data Displayed

- Data Entity 1: Award categories — MODEL002_AwardCategory × 6 (fixed `AWARD_CATEGORIES` list)
- Data Entity 2: Per-category detail copy — `messages/{locale}/awards.json` → `cardContent[slug]` (title/description/quantity/prizes)

### Routes/URLs

- `/he-thong-giai` (GET, guarded — unauthenticated → `/login?next=/he-thong-giai` via `src/proxy.ts`)

### Related Screens

- SCR001_Home: Home (navigation — header logo, nav "About SAA 2025", footer link)
- SCR002_Login: Login (guard — unauthenticated visitor redirected here by `src/proxy.ts`)

---

## Summary

- **Total Screens**: 3 (all atomic — no REG### declared in this wave)

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md
- [x] All related screen references are valid
- [x] All route URLs are properly formatted
- [x] All SCR### codes are referenced in FeatureList.md — confirmed no orphans (`feature-list.md` § Cross-Reference Validation: SCR001_Home→F001(partial)/F002/F003; SCR002_Login→F001; SCR003_AwardSystem→F001(partial)/F002/F004)
- [x] No orphaned screen references
