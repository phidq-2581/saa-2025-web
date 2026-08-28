# Development Roadmap — SAA 2025 Web

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Bootstrap: Next.js + Supabase + test stack | ✅ Done (2026-08-28) | This commit |
| 1 | Spec discovery: pull specs/test cases from MoMorph, data model, clarifications | ⬜ Not started | Output: docs/momorph/, docs/data-model.md, plans/clarifications.md |
| 2 | Plan: /tkm:create-plan --e2e-test-first | ⬜ Not started | |
| 3 | Implementation: /tkm:takumi per phase | ⬜ Not started | Schema → shared layout → screens → integration |
| 4 | Visual QA vs Figma + test traceability | ⬜ Not started | docs/visual-qa/, docs/test-traceability.md |
| 5 | Review, docs sync, PR | ⬜ Not started | |

## Success metrics (DoD)

- UI matches Figma exactly (screenshot evidence in docs/visual-qa/).
- Logic matches MoMorph screen specs (traceability in docs/test-traceability.md).
- Unit + E2E tests written TDD-first; full gate green.
