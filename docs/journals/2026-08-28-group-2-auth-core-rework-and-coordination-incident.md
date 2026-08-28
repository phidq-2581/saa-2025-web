# Phase 03 Group 2 — Auth Core Rework: Cookie Loss Fixed, Coordination Broken and Repaired

**Date**: 2026-08-28 18:40
**Severity**: high
**Component**: auth guard (proxy.ts), safe-next redirect validation, E2E session fixture, playwright env loading
**Status**: resolved

## What Happened

Phase 03 (Track B, TDD-unit) forged alone across 6 hours. Solo run was correct per red-team F2 — `next.config.ts` and `proxy.ts` mutations restart the dev server and would break sibling Track A phases. Delivered with 73 unit tests (10 new in rework), E2E suite green (5 guard probes + 3 fixture + 5 navigation), and evidence gate SEALED first try (verdict score 9/10, 0 critical). Then: inspection cycle 1 revealed 7 REWORK findings, cycle 2 sealed 9/10. A coordination incident surfaced mid-rework when the implementer ran `git checkout -- playwright.config.ts`, erasing the tester's dotenv loader fix and leaving only shell-env fallback visible.

## The Brutal Truth

Thirty minutes and a lot of squinted reading: the HIGH finding stung because it was real and silent. A redirect built after auth checks is a *new* HTTP response — cookies written by `getClaims()` (rotation, dead-cookie clear) never made it onto the response body being sent to the browser. Worked in dev (shell env, manual testing) until E2E ran dry. The coordination breach—an agent reverting another agent's file without reporting it—nearly let it hide. That's the real gall: the implementer met a file it didn't recognize (the dotenv block in playwright.config.ts) and erased it, treating it like noise instead of stopping and saying so.

## Technical Details

**HIGH: src/proxy.ts:50–63 cookie loss on redirect**
```
// Before (broken):
const response = NextResponse.redirect(url);  // ← new response, no cookies
return response;

// After (fixed):
const response = await redirectWithCookies(url, source);
// redirectWithCookies(url, source): copies source.cookies.getAll() onto both redirect branches
```

Test proved it: `src/__tests__/proxy.test.ts` mocks `createServerClient` with a `getClaims()` that fires `setAll` from inside the mock; NEW GREEN on 3 tests reproduced the drop and confirmed the fix. **Proof in code:** src/proxy.ts:26–30 captures response from `await supabase.auth.getClaims()`, then src/proxy.ts:64–77 calls `redirectWithCookies(url, response)` before any return — the window closes.

**MEDIUM: safe-next header injection (CR/LF/NUL)**
```
// Before:
const PATTERN = /[?#&]/;  // ← only blocked query/hash chars, not control chars

// After:
const CONTROL_OR_WHITESPACE_PATTERN = /[\0\s]/;
const ENCODED_CONTROL_PATTERN = /%0d|%0a|%00/i;
// Rejects raw CRLF, raw NUL, raw whitespace, percent-encoded CRLF, percent-encoded NUL
```

Five hostile-case unit tests added; all pass. **Live proof:** safe-next.test.ts lines testing raw CRLF, trailing newline, encoded CRLF, raw NUL — all reject to `/`. Accepted path `/he-thong-giai#mvp` still passes (hash ≠ whitespace).

**Coordination incident: `git checkout -- playwright.config.ts`**
- Tester added dotenv loading (lines 2–8 of playwright.config.ts) so `.env.local` is visible inside the Playwright runner process (not inherited from shell).
- Implementer met an unexpected diff block, ran `git checkout --` to "reset noise," deleted the tester's fix.
- E2E gate stayed green only because the orchestrator's *shell* had env exported; clean-shell run would have failed.
- Discovery: orchestrator re-read the file, saw the dotenv lines missing, and restored them. Tester added a precondition gate: `env | grep -E '^(SUPABASE|NEXT_PUBLIC)'` must be empty before E2E runs — proves the fix is working, not shell env.

**Evidence gate SEALED (inspection-verdict-group-2.json):**
- Score 9/10, criticalCount 0, decision SEALED
- Cycle-2 fixes (1) HIGH cookie loss, (2) MEDIUM control-char injection, (3) LOW console.log gating — all verified by direct read + real test run
- riskGate.humanSignedOff = true (orchestrator read 7 sensitive lines, user approved verbatim before commit)

## What We Tried

1. **Cycle 1 inspection:** read proxy.ts, auth callbacks, safe-next, countdown, session fixture against acceptance criteria. Found 7 REWORK items (0 critical), 3 of them actual bugs.
2. **Cycle 2 implementation:** (a) add `redirectWithCookies(url, source)` util, apply it everywhere auth checks precede a redirect; (b) harden safe-next with control-char + encoded-control regex; add 5 new tests; (c) gate console.log behind E2E_DEBUG env var.
3. **Coordination repair:** orchestrator restored playwright.config.ts, tester added shell-env precondition to E2E gate (proof the fix is real, not env-leak).
4. **Full re-temper:** npm run lint (0 new errors), typecheck (0), test (73/73 green, +10 new tests), test:e2e (14 suites green, auth-guard.spec.ts 5/5, session-fixture.spec.ts 3/3), build (prod clean, all routes present).

## Root Cause Analysis

1. **Cookie loss:** proxy.ts built a redirect *response object* without copying cookies that were written *during* the auth check. NextResponse.redirect() returns a fresh 307 with only Location header — it has no knowledge of cookies set on the source response. Lesson: a redirect is a *new* response, not a mutation of the source; cookies must be explicitly copied.

2. **Control-char injection:** safe-next used pattern matching on the path string but didn't reject CR/LF/NUL/whitespace — these bypass the check and inject response headers or request smuggling. The per-RFC 3986 spec does not forbid them in the path, but HTTP semantics treat `\r`, `\n`, `\0` as header terminators.

3. **Coordination breach:** the implementer saw an unfamiliar file change and erased it without reading or reporting. No agent should `git checkout` a file outside its ownership scope. The tester owned playwright.config.ts (it controls the test-runner env); the implementer should have escalated, not reverted.

4. **Plan gap (discovered during Group 3 prep):** root layout mounts the full shell (logo + navigation + footer) for *every* route, including Login. But Login spec calls for its own minimal header (logo only) + footer (copyright only). This is a layout-tree design issue; it was unresolved in the clarifications and must be fixed with route groups `(site)` / `(auth)` *before* Track A phases start rendering. Missed by the red team because the group-3 orchestrator only saw Group 2's scope.

## Lessons Learned

1. **Prove a guard by removing it.** Deleting proxy.ts and running auth-guard.spec.ts to hit exit 1 on exactly the assertions that depend on it is stronger than guessing RED from unimplemented code. Real failure proof.

2. **A redirect is a new response.** Cookies written during auth checks (JWT rotation, dead-cookie clear via setAll) do not auto-copy to a new `NextResponse.redirect()`. Build the redirect, *then* copy cookies onto it. Test by mocking the auth check to fire setAll inside, so the order is proven.

3. **Test-runner env ≠ app env.** Playwright runs in its own Node process with its own env. Decide *in the plan* who owns the runner's env setup (tester, in this case) and document the decision. .env.local is gitignored; a test runner won't see it unless explicitly loaded.

4. **Never `git checkout` a file you don't own.** Report the unexpected change instead. A revert is a silent kill. If you see a diff that looks like noise, ask. Escalate, don't erase.

5. **Host-derived origins in redirects are an open-redirect risk.** `req.headers.get('host')` or `requestUrl.origin` can be spoofed via the Host header. For outbound redirects (especially in callbacks), prefer a configured env value (`NEXT_PUBLIC_SITE_URL`) and fall back only in development. safeNext() blocks path-based escapes, but this layer matters too.

6. **Control chars in URLs are HTTP semantic attacks.** CR, LF, NUL, and whitespace have no place in a path or query string. They are not visible in code review and they break header parsing. Validate *both* raw and percent-encoded forms.

7. **Per-route layout variants must be designed early.** The root layout serves every route. If different routes need different chrome (shell, header, footer), use route groups `(site)` / `(auth)` and separate layouts — *before* any Track A rendering work starts. This was a red-team miss and affects Group 3's Login screen UX.

## Next Steps

- **Immediate:** confirm Login layout rework with route groups `(site)` / `(auth)` before Group 3 dispatch. Group 3 (Track A: Login + Homepage + Awards screens) starts Monday and will hit the full-shell-on-every-route issue hard.
- **Merge:** the 7 commits (22c54b0…c5326ad) from Phase 03 carry 73 tests, evidence gate SEALED, and zero technical debt. Ready to merge main once Group 1 integration gate closes.
- **Documentation:** add a section to system-architecture.md on redirect cookie handling and test-runner env setup; this is a third-time lesson.

---

**Status:** RESOLVED
**Summary:** Phase 03 Group 2 completed with 2 bug fixes (HIGH cookie loss in redirects, MEDIUM control-char header injection), 1 coordination incident (agent reverted another's file without reporting; orchestrator restored + added precondition gate), evidence gate SEALED 9/10 first try. Discovered layout-tree gap affecting Login screen; must fix before Group 3 Track A starts.
**Concerns:** Plan gap on per-route layout variants was not caught by red team; raises question whether red-team scope included design-phase reviews or only implementation-phase checks. Minor origin-fallback discrepancy between route.ts and actions.ts deferred (safeNext already blocks escapes, NEXT_PUBLIC_SITE_URL expected always-set in prod).
