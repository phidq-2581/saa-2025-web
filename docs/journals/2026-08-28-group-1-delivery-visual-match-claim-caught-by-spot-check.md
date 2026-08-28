# Group 1 delivery — a tester's visual MATCH was wrong; the RED protocol worked as designed

**Date**: 2026-08-28 15:48
**Severity**: medium
**Component**: Phase 02 (UI) visual-contract validation
**Status**: resolved

## What Happened

Phase 02 E2E red-first followed protocol: (1) infra probe `e2e/home-page.spec.ts` exited GREEN (dev server, browser, runner ready); (2) screen RED `e2e/navigation-shell.spec.ts` exited 1 (5/5 assertions failed on `locator('[data-testid="site-header"]') element(s) not found`). The momorph-ui-implementer built components to 11 test-id selectors and reported the tester had marked FAB expanded state a visual "MATCH". Orchestrator spot-checked the screenshot: the collapsed pill and label were still rendering when expanded — a material mismatch. The fix was bounded (hide pill when expanded, icon-only close button with sr-only text), tester re-captured, and verdict changed to MATCH.

## The Brutal Truth

A visual contract hand-off felt complete because the tester marked it done. But that claim was genuinely wrong — the FAB still showed both states at once. If the orchestrator had not independently compared reference to capture, that mismatch would have shipped. The sting is that the tester had the right frame but did not see the layering issue on first glance.

## Technical Details

**Infra probe:** `npm run test:e2e -- e2e/home-page.spec.ts` exited 0 (asserts `main` visible, proves harness ready).

**Screen RED:** `npm run test:e2e -- e2e/navigation-shell.spec.ts` exit 1; trace: "Timeout 30000ms exceeded waiting for locator('[data-testid="site-header"]')".

**Visual mismatch (FAB expanded):** Reference showed red icon-only button with sr-only "Hủy"; first capture showed the yellow pill + text + red button all visible.

**Validator error (Source Code References):** doc-writer initially used bullet format `- Source citation`; validator regex `^\*\*Source:\*\*` expected bold markdown. Normalized after code existed.

## What We Tried

1. Tester compared visual FAB state without flagging the doubtful element the implementer had marked.
2. Doc-writer hand-edited artifact and skipped re-run of validator.
3. Evidence gate blocked on brief scope: study-context listed all 8 phases but Group 1 sealed only 2.

## Root Cause Analysis

(1) **Visual claim without spot-check:** Tester did glance-comparison; did not verify the one element (FAB) flagged as needing care. A visual hand-off is a claim, not law.

(2) **Validator regex binding:** `validate_feature_spec.py` checks `^\*\*Source:\*\*`, not `^- Source:`. Regex is binding; hand-edit without re-run courts failure.

(3) **Evidence brief scope:** Study-context aggregated all 8 phases; Group 1 Deliver owns only 2. Per-Deliver scope prevents spill and catch.

## Lessons Learned

1. **A valid RED has two exit codes:** infra probe GREEN (dev server/browser ready) and screen spec RED (assertions fail). Record both. A RED without its probe is unattributable; a probe without a RED proves nothing about the screen.

2. **Spot-check visual "MATCH" on flagged elements:** When implementer or tester raises doubt about a complex state (expanded/collapsed, overlays, layering), compare reference to capture independently before sealing the phase.

3. **Read validator regexes before hand-edits:** `^\*\*Source:\*\*` is the binding contract, not the spec example. Run the validator after changes.

4. **Evidence briefs are per-Deliver, not plan-wide:** Scope study-context to the Deliver's sealed phases only; archive plan-wide baseline separately.

5. **Phase file beats orchestrator contradictions:** Phase said "two @ rejected" (strict email); orchestrator prompt said "last segment only". Phase file won. Implementer ran RED before test flip.

## Next Steps

- Orchestrator spot-check visual "MATCH" on complex interactive states.
- Validators run automatically; doc-writer must not hand-edit and skip re-run.
- Study-context scope: always re-scope to Deliver granularity.
- Test RED protocol: always record probe exit code + screen RED exit code.

**Status:** DONE
**Summary:** `/Users/duong.quang.phi/Documents/agentic-coding-hands-on/docs/journals/2026-08-28-group-1-delivery-visual-match-claim-caught-by-spot-check.md` (115 lines) · Tester's visual MATCH wrong on FAB expanded; orchestrator spot-check caught it; RED protocol worked as designed
**Concerns/Blockers:** None.
