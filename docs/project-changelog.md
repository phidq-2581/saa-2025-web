# Project Changelog — SAA 2025 Web

Reverse-chronological record of delivered work. One entry per delivery group from
`plans/260828-1257-saa-2025-web-login-homepage-awards/`; see `docs/development-roadmap.md` for
phase status and `docs/test-traceability.md` / `docs/visual-qa/` for verification evidence.

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
