# Project Changelog — SAA 2025 Web

Reverse-chronological record of delivered work. Round 1 entries are per delivery group from
`plans/260828-1257-saa-2025-web-login-homepage-awards/`; round 2 entries are per delivery group
from `plans/260831-2303-saa-2025-web-kudos-round-2/`. See `docs/development-roadmap.md` for
phase status and `docs/test-traceability.md` / `docs/visual-qa/` for verification evidence.

## 2026-09-03 — Pixel-parity pass: Homepage + Login vs Figma canvas

- **Method**: MoMorph `list_frame_styles` node positions (Homepage `i87tDx10uM` at 1512, Login
  `GzbNeVGJHz` at 1440) joined by text to Playwright DOM measurements; 55 + 4 text nodes compared on
  geometry/typography. Homepage went from 0/55 matched to canvas-exact except state (hidden
  "Coming soon", guest header) and Figma's `81.92px` tile rounding; Login 3/4 exact, the 4th a
  Figma text-box quirk. Evidence and per-node fix table in `docs/visual-qa/{homepage,login}.md`.
- **Product fixes** (`src/components/layout/*`, `homepage/*`, `login/*`): header/footer nav items
  are real 52/56px buttons with 16px padding and letter-spacing; language trigger uses the 24×24
  icon box; CTA pair 60px with 8px icon gap and inset stroke; Root Further rhythm 102/32/101;
  awards header→grid 80, rows 80, cards 336 with 108 gutters, no clamp; Kudos promo 500 tall,
  64px inset, 364px lockup at its node offset; footer 144 incl. top rule; Login content block
  vertically centred in Bìa (was 112px high), footer 91, keyvisual layers moved to the route-group
  layout (`login-keyvisual.tsx`).
- **Decisions** (`plans/clarifications.md` § 2026-09-03): canvas beats spec CSV for content —
  event info now `26/12/2025` / `Âu Cơ Art Center` / `… qua sóng Livestream` (both locales, e2e
  updated), awards sub-description removed, card descriptions unclamped; countdown digits switch
  to DSEG7 Classic (`dseg` dependency, `--font-digital`); Login keyvisual awaits a manual Figma
  export to `public/login/keyvisual-bg.png` (drawn `cover`, CSS background).
- **Hệ thống giải + Kudos board (same day, with the viewer's real session)**: `/he-thong-giai` rebuilt to the frame's Bìa column — keyvisual + cover as absolute layers (`award-keyvisual.tsx`, art export pending), title over the art, 178/853 space-between columns, card content `gap: 32` with rules, canvas-sized description boxes, trailing rule on all cards but the last; page height now 6410 = canvas. `/kudos`: 1152 column at x144, compose pill inside the 72px KV button row, filters on the HIGHLIGHT heading row, full-width ALL KUDOS header, 680/422 columns, Frame 552 insets, carousel kept as a centred 1440px stage, spotlight box 1157×548; inset strokes replace CSS borders where the canvas measures inner offsets; copy "Hệ thống ghi nhận và cảm ơn" / "Mở Secret Box"; gift list above rank list. Site footer no longer wraps at 1440. Details: `docs/visual-qa/{award-system,kudos-board}.md` § Pixel-parity pass.
- **Thể lệ panel (evening, MoMorph `b1Filzi9i6`)**: new `src/components/rules/*` — right-hand drawer (553px, #00070C, scrollable content, "Đóng" + "Viết KUDOS" footer) with the four Hero tiers, the six badges and the KUDOS QUỐC DÂN rule, copy from the canvas `character` fields (`messages/*/rules.json`, new `rules` namespace). Opened by the footer's "Tiêu chuẩn chung" (now a real trigger), the FAB's "Thể lệ" and the compose toolbar's "Tiêu chuẩn cộng đồng"; a guest's "Viết KUDOS" is disabled, a member's hands off to the compose dialog. TDD: `e2e/rules-panel.spec.ts` RED (exit 1, 5 failing) → GREEN (5/5, same command). `HeroTierBadge` gained a `size="md"` variant. REVIVAL badge asset pending Figma export.
- **Hero tooltip clipped in the carousel (evening)**: the "Hover danh hiệu" card opened upward from the pill row and the HIGHLIGHT KUDOS track (`overflow-x-auto` inside an `overflow-hidden` stage) cut off its top. It now opens below the pill (`top-full mt-1`); placement was never on the canvas.
- **Filter menus vs carousel fades (evening)**: the HIGHLIGHT KUDOS edge fades (`mm:2940:13467/13469`) sat at `z-10`, the same layer as the Hashtag / Phòng ban dropdown menus but later in the DOM, so an open menu was dimmed by the right-hand gradient. Fades lowered to `z-[1]` (only need to beat the static slides); menus stay `z-10` and hero tooltips (`z-10`) still paint above the fades.
- **Hero pills + hover (evening)**: `HeroTierBadge` now renders the MoMorph pill exports (all four tiers; New Hero hand-exported at 2× since MoMorph has no file for it) at 109×19 on cards and 126×22 in the Thể lệ panel, and carries the designed hover card from the "Hover danh hiệu *" frames (304×192, 2× pill, white range / grey description; RED→GREEN unit tests). Card and leaderboard avatars turn their ring gold on hover per "Hover Avatar info user" (721:5827). The spec's "preview profile" popover is blocked: its frame ("Infor - HoverAvatar", 405:5274) is not synced in MoMorph.
- **Campaign hover (evening)**: the sidebar x2 marker now opens the "Hover campain" card (frame 3241:15021) with the real special-day window (`campaign-window.ts`, RED→GREEN unit tests); `KudosBoardContainer` derives `campaign` from `special_days` instead of a boolean. Fire art delivered as a hand export of Group 435 (label baked in, 114×133) at `public/kudos-board/campaign-x2.png`, rendered as a plain image in both the 34×40 marker and the 56×66 card slot.
- **Not done**: Profile page is still the stub (full feature, separate phase); "Tìm kiếm profile Sunner" pill deferred with it.
- **Gate**: typecheck clean, lint 0 errors, vitest 292/292, `next build` OK; e2e — see roadmap row 9.

## 2026-09-02 — Post-Group-4 docs verification: nav-link fix, validateImages wiring, gen-gate re-baseline

- **Gen-gate re-baseline**: `docs/generated/*` (11 artifacts + permissions-matrix) and
  `docs/system/{overview,architecture,business-rules}.md` regenerated (code-derived layer,
  machine-owned). `docs/generated/api-map.md` now carries a "Validation gate confirmed active"
  note for `validateImages` — closes the dead-code finding that the function had no confirmed
  production caller.
- **Product fix**: `site-header.tsx`/`site-footer.tsx` — the header/footer "Sun* Kudos" link now
  points at `/kudos` (a real `<Link>`, was a non-navigating `<span role="link">`), superseding
  round-1 BR-004's "no confirmed destination" deferral. New e2e:
  `e2e/navigation-shell.spec.ts` "06" clicks it and confirms landing on the live board.
- **Product fix**: `submit-kudos.ts` now calls `validateImages()` as `submitKudos`'s first gate,
  before any upload starts, returning a new `invalid-images` result (`too-many-images` /
  `unsupported-type` / `too-large`) on rejection — the compose UI's own inline file filtering was
  never a trust-boundary substitute for this check.
- **Docs**: hand-reconciled `docs/features/F002_NavigationShell/technical-spec.md` (BR-004's scope
  narrowed to the still-deferred "Tiêu chuẩn chung"/FAB "Thể lệ" affordances; US004/US005
  acceptance scenarios, Assumptions, and 3 Source Code References updated) and `edge-cases.md`
  (removed the now-stale "Sun* Kudos… inert" row — no longer an edge case);
  `docs/features/F005_KudosCompose/technical-spec.md` (2 Source Code References for
  `validate-image.ts`/`submit-kudos.ts` updated to their current line counts and behavior);
  `docs/test-traceability.md` (TC ID-22 moved deferred → covered; Homepage SAA/Total summary
  counts recounted programmatically: 42/3/17 and 63/5/26); `docs/system-architecture.md` (the
  Documentation-layers note's "no regeneration planned" claim corrected — `docs/features/.stale`
  reappeared today after the gen-gate re-baseline ran, and a `/tkm:rebuild-spec --feature-specs`
  pass is pending for the code-derived layer, though the affected SDD specs above were already
  hand-reconciled). `docs/screens/SCR002_Header/spec.md`, `SCR003_Footer/spec.md`, and
  `SCR004_Fab/spec.md` re-checked — already accurate, no edit needed (SCR004_Fab was corrected
  earlier the same day).
- **Verification**: `npm run typecheck` clean; `npm run lint` 0 errors (40 pre-existing
  `@next/next/no-img-element` warnings, unrelated); both `validate_feature_spec.py` and
  `validate_source_citations.py` report zero issues across all 6 feature specs;
  `src/lib/kudos/write/__tests__/submit-kudos.test.ts` 6/6 passing. Full `test:e2e` suite not
  re-run this pass — see the Group 4 review below for the last full-diff verification.

## 2026-09-02 — Round 2 Group 4 (Phase 07 + 08): integration wiring, hardening, docs promotion

- **Feature**: Kudos cluster now fully wired end to end — real submit (compose modal → DB),
  real heart toggle with special-day 2× grant, real hashtag/department filtering, infinite
  scroll, Copy Link/detail navigation, EN catalogues for the three new namespaces
  (`compose`, `kudos`, `profile`). Phase 07 evidence: full e2e suite 89/89 passing, gate
  (lint/typecheck/unit/build) all exit 0, after reverting a set of tester-side test weakenings
  (unique `contentText` markers + `expect.poll`/`waitForURL` replacing fixed sleeps, a real
  `memberSession` fixture for the disabled-heart-on-own-kudos case, `pickFirstHashtags` no
  longer force-closing the picker).
- **Security fix**: `storage.objects`' insert policy for the `images` bucket, originally scoped
  only to `bucket_id = 'images'` (any authenticated Sunner could upload into another Sunner's
  folder), re-scoped to the caller's own `kudos/{auth.uid()}/...` path segment
  (`supabase/migrations/20260902000000_scope_images_insert_policy.sql`) — a Group-3 review
  finding (High/Security).
- **Behavior fix**: self-kudos (sending to yourself) is now blocked in `createKudos` — a
  Group-3 checkpoint decision closing a gap the review flagged (no spec/TC row addressed it;
  farming the 10/20/50 hoa-thị milestones was the risk).
- **Docs**: `docs/features/F005_KudosCompose/` and `docs/features/F006_KudosLiveBoard/` (5
  files each) promoted from the round's Stage-1.5 spec drafts, reconciled to the shipped code —
  fixes include the TipTap link-extension claim (StarterKit's bundled `link`, not a separate
  `@tiptap/extension-link` package), the rank-promotion leaderboard (populated from real
  10/20/50-kudos milestones, not permanently empty as the draft assumed), the sidebar stat
  count (5 real rows, not the design prose's miscounted 6), and two genuine implementation
  gaps found only during this promotion pass — avatar/name clicks do not open `/profile` on
  any card or leaderboard (no `onClick`/`<Link>` exists), and no test exercises a successful
  Addlink save. `docs/screens/SCR007_KudosCompose/spec.md` and
  `docs/screens/SCR008_KudosLiveBoard/spec.md` added (mirroring SCR004's shape).
  `docs/screens/SCR004_Fab/spec.md` corrected — "Viết KUDOS" now opens F005's compose modal
  (the prior "nothing opens this round" line was a live contradiction with Phase 03's own
  delivery). `docs/system-architecture.md` gained a Kudos-domain section and its "Data flow"
  section's stale `profile_select_own` claim was replaced with the round-2 widened policy.
  `docs/data-model.md` gained a verified-in-code Kudos Cluster section (8 tables, the
  `kudos_card_view` aggregate, the `create_kudos` RPC, storage, the special-day rule).
  `docs/system/permissions.md`'s inverted profile-boundary statement was **replaced**, not
  appended to: profile-read is now the system's widest boundary (any authenticated user reads
  any profile row), reversing the round-1 "stricter than the role boundary" framing.
  `docs/test-traceability.md` gained a 123-case Kudos traceability table (91 covered, 1
  deferred, 31 not-covered) and a round-2 copy-gap log (3 design-gap strings, 21 `[VN]`-mirrored
  EN keys across `compose`/`kudos`/`profile`, 3 of them found by direct file comparison rather
  than carried from any prior list).

## 2026-08-31/09-02 — Round 2 Groups 1–3 (Phases 01–06): Kudos cluster schema, read/write layers, UI

- **Schema** (Phase 01, alone — edits `supabase/config.toml`): 8 new tables (`department`,
  `hashtag`, `kudos`, `kudos_image`, `kudos_hashtag`, `heart`, `special_days`,
  `secret_box_gift` — the Stage-1.5 spec draft counted 7; `secret_box_gift` was added during
  implementation per a clarifications ruling), the `kudos_card_view` aggregate (`security_invoker`),
  the atomic `create_kudos` RPC, `profile` RLS widened to read-all-authenticated (replacing
  `profile_select_own`), `images` storage bucket policies, 13-hashtag + 50-department seed.
  New pinned dependencies: `@tiptap/{core,pm,react,starter-kit,extension-mention,suggestion}@3.30.6`,
  `d3-cloud`/`d3-zoom`/`d3-selection`.
- **Read layer** (Phase 02): `src/lib/kudos/queries/**` (highlight top-5, feed pages, spotlight,
  sidebar stats, leaderboards, recipients) + `src/lib/kudos/derive/**` (pure filter/sort/tier/
  milestone functions) — reworked mid-phase after a plan-owner ruling corrected the Spotlight
  word cloud from a hashtag-shaped stub to a recipient cloud (one node per kudos).
- **Viết Kudo compose modal UI** (Phase 03): TipTap editor (bold/italic/strike/ordered-list/
  quote/link/mention), Addlink Box sub-dialog, hashtag picker, image attachment grid, anonymous
  toggle — client-side only this phase, wired to real data in Phase 07.
- **Kudos Live board UI** (Phase 04): KV banner, Highlight carousel, Hashtag/Phòng ban filter
  dropdowns, Spotlight word cloud (d3-cloud + d3-zoom), All Kudos feed, sidebar (stats +
  leaderboards) — reviewed SEALED 9/10 at the Group 2 checkpoint, 2 High findings fixed and
  re-verified.
- **Write layer** (Phase 05): `createKudos`/`toggleHeart` Server Actions, content/draft/image
  validators, storage-path builder + verifier — the special-day 2× heart grant is decided
  server-side only, in `Asia/Ho_Chi_Minh`, never trusting a client-supplied amount.
- **Detail + profile stub UI** (Phase 06): `/kudos/[id]` (full, untruncated card, real gallery),
  `/profile?id={uuid}` (minimal placeholder) — reused Phase 04's card/avatar building blocks,
  no forked components. Group 3 checkpoint: SEALED 8/10, 2 High + 1 Med + 1 Low fixed & verified
  (storage insert-policy scoping, content depth/size caps, atomic heart-revoke round trip,
  self-kudos block).

## 2026-08-31 — Group 4b (Phase 08 + 08b): hardening, a11y, docs sync

- a11y: FAB toggle carries `aria-expanded`/`aria-controls` pointing at an always-mounted
  `#fab-menu` (Tailwind `hidden` toggles visibility, never conditional unmount); FAB menu copy
  moved to `common.fab.*` catalogue keys (EN "Rules"/"Write KUDOS"/"Cancel" from MoMorph, toggle
  "Hành động nhanh" in both locales, MoMorph-sourced spec text).
- a11y: homepage countdown wrapper carries `aria-live="polite" aria-atomic="true"` so assistive
  tech announces tile changes without a full page re-read.
- Fix: `(auth)/layout.tsx` now passes `selectLocaleAction` to `LoginHeader` — the language
  dropdown on `/login` previously rendered with a hardcoded `locale="vi"` and no
  `onSelectLocale`, a silent no-op.
- Test infra: `e2e/support/with-retry.ts` extracts a bounded `withRetry()` helper for Supabase
  `verifyOtp` JWT timing collisions under parallel Playwright workers.
- Docs: `docs/visual-qa/` (login, homepage, award-system, navigation-shell + 25 reference/capture
  images) — a MATCH/deviation verdict per screen and per shell state (guest/member/admin/
  dropdown-open/FAB-expanded). `docs/test-traceability.md` — full 94-case MoMorph traceability
  table (login 17, homepage 62, award system 15; dropdown ngôn ngữ has 0 published cases):
  62 covered, 6 deferred, 26 not-covered, each with a stated file+title or reason — never a
  blank cell.
- Docs: rebuild-spec Core promote — 13 code-derived artifacts under `docs/generated/` and
  `docs/system/{overview,architecture,permissions,business-rules}.md`, user-approved 2026-08-31.
  `docs/features/` (4) and `docs/screens/` (6 SCR) kept SDD-authored at component granularity —
  the promoted `docs/generated/screen-list.md`'s 3-SCR route-granularity count is an intentional
  divergence, not a defect; `docs/features/.stale` removed deliberately, no regeneration planned.
- Review: Group 4b inspection SEALED — score 8/10, 0 critical, 0 high, 2 Medium (both
  non-blocking) — M1 (`docs/visual-qa/navigation-shell.md` stale claims) and M2 (this entry)
  both closed.

## 2026-08-30 — Group 4a (Phase 07 + 07b): integration wiring, body-copy i18n

- Session-aware `SiteHeaderContainer`/`FabWidgetContainer` server containers replace the
  prop-driven Phase 02 shell; guest/member/admin variants read `getCurrentProfile()`.
- Sign-out moved from a Server Action to a `POST /auth/sign-out` Route Handler — the Server
  Action's soft client-side `redirect()` raced the response's `Set-Cookie` headers (0/3
  reproducible); the hard form-POST navigation is atomic (3/3).
- `selectLocaleAction` (Server Action reference wrapper) + `messages/en/*` catalogs (31 keys
  confirmed via MoMorph `list_file_localizations`; 15 keys fall back to the Vietnamese text at
  runtime, never a `[VN]`-prefixed marker that would leak to English-locale visitors).
- Live countdown wrapper (`EventCountdownLive`) and per-route `generateMetadata`.
- Phase 07b: remaining 13 Group 3 body-copy components converted to `useTranslations`
  (e2e-red-first); `src/test-utils/render-with-intl.tsx` + `e2e/locale-body-copy.spec.ts` added;
  unused hand-written `common.auth.loginError` key removed (no MoMorph source).

## 2026-08-28 — Group 3 (Phases 04–06): screen UI

- Login, Homepage, and Award System screens built from MoMorph specs under `(site)`/`(auth)`
  route groups.
- `AWARD_CATEGORIES` trimmed to `{ name, slug }` — Phase 02's `quantity`/`prize` fields were
  wrong/paraphrased against verified Figma `character` values.
- Deferred/inert-CTA a11y fix: destinations out of scope this round render as
  `<button type="button" aria-disabled="true" tabIndex={-1}>`, never a bare `<span role="button">`.

## 2026-08-28 — Group 2 (Phase 03): auth guard and core i18n

- `src/proxy.ts` route guard (Next.js 16's `middleware.ts` replacement) — exact-match
  `PUBLIC_ROUTES`, re-validated via `getClaims()` on every request.
- OAuth callback (`/auth/callback`), next-intl cookie-mode locale resolution, countdown math
  (`compute-remaining.ts`/`parse-target.ts`), minimal 404/403, E2E seeded-session fixture.

## 2026-08-28 — Group 1 (Phases 01–02): foundation

- Supabase schema: `public.profile` (1:1 with `auth.users`), RLS `profile_select_own` policy,
  `handle_new_user()` definer trigger; `isAllowedEmail()` domain predicate.
- Design tokens (`globals.css` `@theme inline`, MoMorph `list_frame_styles`) and the shared
  navigation shell (Header/Footer/FAB/LanguageDropdown/AccountMenu/NotificationBell).

## 2026-08-28 — Bootstrap

- Next.js 16 (App Router) + Supabase local + Vitest/Playwright test stack scaffolded.
