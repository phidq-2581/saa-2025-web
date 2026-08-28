# Development Roadmap — SAA 2025 Web

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Bootstrap: Next.js + Supabase + test stack | ✅ Done (2026-08-28) | This commit |
| 1 | Spec discovery: pull specs/test cases from MoMorph, data model, clarifications | ✅ Done (2026-08-28) | 18 screens, 252 specs, 292 TCs → docs/momorph/, docs/data-model.md; 29 decisions in plans/clarifications.md (local). Commit b0a21a8 |
| 2 | Plan: /tkm:create-plan --e2e-test-first | ✅ Done (2026-08-28) | plans/260828-1257-saa-2025-web-login-homepage-awards/ (local): 4-feature spec draft, 8 phases, red-team 28 findings applied. Scope: Login, Homepage, Hệ thống giải + shell |
| 3 | Implementation: /tkm:takumi per phase | 🔄 In Progress (2026-08-28) | Group 1 (Phases 01–02) delivered 2026-08-28: Phase 01 Supabase schema + auth predicate, Phase 02 design tokens + navigation shell. Group 2 (Phase 03) delivered 2026-08-28: auth guard (`proxy.ts`) + OAuth callback, next-intl i18n, countdown logic, minimal 404/403, E2E session fixture. Next: screens → integration |
| 4 | Visual QA vs Figma + test traceability | ⬜ Not started | docs/visual-qa/, docs/test-traceability.md |
| 5 | Review, docs sync, PR | ⬜ Not started | |

## Success metrics (DoD)

- UI matches Figma exactly (screenshot evidence in docs/visual-qa/).
- Logic matches MoMorph screen specs (traceability in docs/test-traceability.md).
- Unit + E2E tests written TDD-first; full gate green.
