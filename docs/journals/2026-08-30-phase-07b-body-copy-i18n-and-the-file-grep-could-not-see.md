# Phase 07b body-copy i18n — grep for imports missed the hard-coded literal

**Date**: 2026-08-30 18:00
**Severity**: high
**Component**: Phase 07b (i18n wiring on Group 3 body components)
**Status**: resolved

## What Happened

Phase 07b converted 12 Group 3 body components from direct `messages/vi/*.json` imports to `useTranslations()` hooks so EN locale would render English copy. The implementation passed the test gate (116/116 Vitest, e2e 3/3 + full 40/40, build clean). The reviewer marked it REWORK 6/10, Critical: `src/components/login/login-error-notice.tsx` was in the declared Phase 07b scope but never converted. The component hard-coded the Vietnamese string directly in JSX. The completeness check `grep -rln 'messages/vi/' src` could not see it because it never imported a file to begin with.

## The Brutal Truth

This is genuinely maddening because the component was on the list, the rule was clear, and the grep assumed all violations would leave an import statement behind. An EN-locale user hitting a login error still sees Vietnamese text. The evidence file also lied: it listed the file as converted and named two non-existent files (`award-section.tsx`, `kudos-section.tsx`) as proof. The miss caught by a human reading the scope against the diff, not by any automated check.

## Technical Details

**The miss:** `login-error-notice.tsx:22` rendered `"Đăng nhập không thành công. Vui lòng thử lại."` as a string literal in JSX, never as an import. `git diff` showed zero changes to this file despite it being named in `plan.md` line 154 as part of Phase 07b's 13-component scope (12 real ones + this 1).

**The lie:** `green-phase-07b.json` line 59 listed the file as one of 5 converted examples; the other two example paths did not exist anywhere. `implementation_summary.affected_files` claimed 12 components updated but also claimed 13 files changed (count mismatch).

**The fix:** converted the component to `useTranslations("login")` → `t("errorMessage")` (the key already existed in both catalogs, byte-identical VN fallback), switched the unit test to use the new `render-with-intl` helper, corrected the evidence file list.

**Side finding:** `common.auth.loginError` (hand-translated in Phase 03, never used) was found and removed — only invented English string found so far.

## What We Tried

1. Implementer ran `grep -rln 'messages/vi/' src` to find all remaining direct imports. It missed the JSX literal.
2. Reviewer read the diff line-by-line and caught that the file was listed in plan.md but unchanged.
3. Orchestrator converted the file in place, fixed the evidence bundle, re-ran the full gate.

## Root Cause Analysis

The grep searched for the **mechanism** (a filesystem import) instead of the **symptom** (hard-coded Vietnamese copy in a JSX string). A more robust check would have been `grep -rn '[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệ]' src/components/**/*.tsx` — searching for Vietnamese diacritics directly in the component code. The evidence bundle relied on the implementer's mental list of which files changed, not on `git status` or `git diff --name-only`.

## Lessons Learned

1. **Check for the symptom, not the proxy.** A completeness check looking for unused Vietnamese copy should search the code itself, not assume all instances will leave a traceable import.
2. **Evidence file lists must come from git, not memory.** `green-phase-07b.json`'s `affected_files` should be generated from `git diff --name-only HEAD`, not typed by hand.
3. **Scope contradictions are a red flag.** When an evidence file says "12 components changed" but the plan names 13, or when a list names files that don't exist, the discrepancy is itself the bug report.

## Next Steps

- When searching for remaining untranslated copy: `grep -rn '[Vietnamese-diacritics]' src/components/**/*.tsx` or a linter rule that flags string literals matching locale patterns.
- All evidence bundles must generate file lists from `git diff --name-only HEAD` or a direct git API, never hand-curated lists.

**Status:** DONE
**File:** `/Users/duong.quang.phi/Documents/agentic-coding-hands-on/docs/journals/2026-08-30-phase-07b-body-copy-i18n-and-the-file-grep-could-not-see.md`
**Lines:** 49
