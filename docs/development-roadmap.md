# Development Roadmap — SAA 2025 Web

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Bootstrap: Next.js + Supabase + test stack | ✅ Done (2026-08-28) | This commit |
| 1 | Spec discovery: pull specs/test cases from MoMorph, data model, clarifications | ✅ Done (2026-08-28) | 18 screens, 252 specs, 292 TCs → docs/momorph/, docs/data-model.md; 29 decisions in plans/clarifications.md (local). Commit b0a21a8 |
| 2 | Plan: /tkm:create-plan --e2e-test-first | ✅ Done (2026-08-28) | plans/260828-1257-saa-2025-web-login-homepage-awards/ (local): 4-feature spec draft, 8 phases, red-team 28 findings applied. Scope: Login, Homepage, Hệ thống giải + shell |
| 3 | Implementation: /tkm:takumi per phase | ✅ Done (2026-08-31) | 8/8 phases delivered (`plans/260828-1257-.../`). Group 1 (01–02): Supabase schema + auth predicate, design tokens + navigation shell. Group 2 (03): auth guard (`proxy.ts`) + OAuth callback, next-intl i18n, countdown logic, minimal 404/403, E2E session fixture. Group 3 (04–06, delivered 2026-08-28): Login/Homepage/Award System screen UI — `(site)`/`(auth)` route groups, `AWARD_CATEGORIES` trimmed to `{name, slug}`, inert-CTA a11y fix. Group 4a (07 + 07b, delivered 2026-08-30): session-aware header/FAB containers, sign-out Route Handler (replaces the Phase 03 Server Action — soft-navigation race), locale Server Action wrapper, `messages/en/*` catalogs + EN fallback rule, live countdown wrapper, per-route `generateMetadata`, remaining 13 body-copy components converted to `useTranslations`, `common.auth.loginError` key removed (no MoMorph source). Group 4b (08 + 08b, delivered 2026-08-31): full quality gate, a11y hardening (FAB `aria-expanded`/`aria-controls` on an always-mounted menu target, `common.fab.*` catalogue keys, countdown `aria-live="polite"`), `(auth)/layout.tsx` now wires `selectLocaleAction` (the `/login` language dropdown was a silent no-op), `e2e/support/with-retry.ts` bounded retry for Supabase auth timing, `docs/visual-qa/` + full `docs/test-traceability.md`, rebuild-spec Core promote (13 code-derived artifacts, user-approved). **Plan complete — 8/8 phases.** |
| 4 | Visual QA vs Figma + test traceability | ✅ Done (2026-08-31) | `docs/visual-qa/` — login, homepage, award-system, navigation-shell (+25 reference/capture images), each screen and each of the 5 shell states (guest/member/admin/dropdown-open/FAB-expanded) carries a MATCH/deviation verdict against a MoMorph reference frame. `docs/test-traceability.md` — full 94-case MoMorph traceability table (login 17, homepage 62, award system 15; dropdown ngôn ngữ has 0 published cases): 62 covered, 6 deferred, 26 not-covered, each with a cited test file+title or a stated reason. |
| 5 | Review, docs sync, PR | 🔄 In Progress (2026-08-31) | Group 4b inspection SEALED — score 8/10, 0 critical, 0 high, 2 Medium (both non-blocking): M1 (`docs/visual-qa/navigation-shell.md` stale claims) fixed same-day; M2 (this roadmap, code-standards, project-changelog sync) closed by this pass. PR: not yet opened. |

## Success metrics (DoD)

- UI matches Figma exactly (screenshot evidence in docs/visual-qa/).
- Logic matches MoMorph screen specs (traceability in docs/test-traceability.md).
- Unit + E2E tests written TDD-first; full gate green.
