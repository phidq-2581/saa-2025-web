# Development Roadmap — SAA 2025 Web

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Bootstrap: Next.js + Supabase + test stack | ✅ Done (2026-08-28) | This commit |
| 1 | Spec discovery: pull specs/test cases from MoMorph, data model, clarifications | ✅ Done (2026-08-28) | 18 screens, 252 specs, 292 TCs → docs/momorph/, docs/data-model.md; 29 decisions in plans/clarifications.md (local). Commit b0a21a8 |
| 2 | Plan: /tkm:create-plan --e2e-test-first | ✅ Done (2026-08-28) | plans/260828-1257-saa-2025-web-login-homepage-awards/ (local): 4-feature spec draft, 8 phases, red-team 28 findings applied. Scope: Login, Homepage, Hệ thống giải + shell |
| 3 | Implementation: /tkm:takumi per phase | 🔄 In Progress (2026-08-30) | 8 phases total (`plans/260828-1257-.../`). Group 1 (01–02): Supabase schema + auth predicate, design tokens + navigation shell. Group 2 (03): auth guard (`proxy.ts`) + OAuth callback, next-intl i18n, countdown logic, minimal 404/403, E2E session fixture. Group 3 (04–06, delivered 2026-08-28): Login/Homepage/Award System screen UI — `(site)`/`(auth)` route groups, `AWARD_CATEGORIES` trimmed to `{name, slug}`, inert-CTA a11y fix. Group 4a (07, delivered 2026-08-30, approved at the same-day checkpoint): session-aware header/FAB containers, sign-out Route Handler (replaces the Phase 03 Server Action — soft-navigation race), locale Server Action wrapper, `messages/en/*` catalogs + EN fallback rule, live countdown wrapper, per-route `generateMetadata`. **7/8 phases complete.** Next: **Phase 07b** (approved, before Phase 08) — convert the remaining Group 3 body-copy components to `useTranslations`; then Phase 08 hardening + visual QA + docs |
| 4 | Visual QA vs Figma + test traceability | 🔄 Started (2026-08-30) | docs/visual-qa/ not started; `docs/test-traceability.md` created by Phase 07 with its EN-copy-gap log only — the full spec/test-case ↔ implementation table is still Phase 08's own deliverable |
| 5 | Review, docs sync, PR | ⬜ Not started | |

## Success metrics (DoD)

- UI matches Figma exactly (screenshot evidence in docs/visual-qa/).
- Logic matches MoMorph screen specs (traceability in docs/test-traceability.md).
- Unit + E2E tests written TDD-first; full gate green.
