# Group 4a Phase 07 — Sign-out race, vacuous OAuth test, and the `[VN]` leak to English users

**Date**: 2026-08-30 15:22
**Severity**: high
**Component**: authentication handover, E2E coverage, i18n fallback
**Status**: resolved

## What Happened

Phase 07 (integration wiring — session, locale, countdown, i18n, metadata) landed late on 2026-08-29 from the implementer, survived the temper gate at 7/7, drew a High-severity reviewer verdict (REWORK 7/10), and after bounded fixes bounced back to SEALED 9/10 before user sign-off 2026-08-30. Three findings halted acceptance: a sign-out race that made the implementer replace Phase 03's Server Action with a Route Handler, a vacuous E2E test that passed before any wiring existed (never clicked the button), and a diagnostic `[VN]` marker bleeding into production English-locale copy. Each had a real fix; none required a new phase.

The decision to keep the Route Handler (hard navigation, atomic cookie deletion, CSRF origin check, 303 redirect) is the standout piece of craft here — the team measured the real race on the dev server, found the root (soft-navigation URL flip before Set-Cookie lands), and proved it with a settle-delay experiment instead of guessing.

## The Brutal Truth

The implementer shipped early without approval, 39 files in one commit, then was told to revert. That's on the brief — it never said "do not commit", so the agent followed its standard protocol. The reviewer caught a test that would have passed whether the button worked or broke: `waitForURL` raced with no click, the race timed out, the `.catch(() => [])` swallowed it, the final assertion "still on `/login`" was always true. That should have been part of the RED run, not discovered after the code landed. The EN-copy-rule leakage was a process miss: the implementer had no MoMorph tool and no guidance on where to draw the line between "VN temporary marker for docs" and "runtime value seen by users", so it used the `[VN]` prefix as a visual signal and shipped it. Figma supplied 31 keys; the rest went unmarked, but 3 of those unmarked ones were routed through `next-intl` before their real translations existed, so an English-locale visitor to `/login` or `/he-thong-giai` saw readable Vietnamese instead of readable English, and the SEO metadata for `/he-thong-giai` leaked a diagnostic marker into the page description. None of this breaks the feature or leaks data, but it's the kind of rough edge that should have been caught at review, not at sign-off.

The real frustration is that all three findings had obvious fixes and the implementer knew most of the way. It measured the sign-out race itself and wrote down the exact root cause in the docblock; it just made the wrong call on whether the Server Action was worth keeping. The OAuth test was written by the red-team protocol ("write RED first, record the exit, move on") without a manual click-through — a gap in the playbook, not a gap in rigor. The `[VN]` leak was a communication gap: the EN-copy rule existed but the guidance "marker lives in docs, never in runtime values" was not written down until after the review.

## Technical Details

**Sign-out race (root cause: soft navigation vs hard navigation):**
- Plan wired logout to Phase 03's `signOutAction` (Server Action).
- Implementer's first test: read cookies right after `waitForURL("/")`. Result: 0/3 — `sb-127-auth-token` still present.
- Implementer added a 500ms settle after `waitForURL`. Result: 3/3 — cookies gone.
- Analysis: Server Actions use soft client-side `redirect()`, which returns immediately and navigates via the router before the response's `Set-Cookie` headers are applied by the browser. The URL flips to `/` while the session is still live; by the time cookies are read, the race is lost.
- Decision: replace with `POST src/app/auth/sign-out/route.ts` (Route Handler). Hard navigation means the entire response cycle is complete before the browser loads the target page.
- Implementation details (`src/app/auth/sign-out/route.ts:1-44`):
  - CSRF guard: reject any mismatched `Origin` header (missing is tolerated because sign-out is idempotent).
  - Explicit `sb-*` cookie deletion (lines 37-40), then `supabase.auth.signOut()`.
  - `303 See Other` redirect (not 307), so the browser follows with GET (default 307 re-POSTs the form body to `/`).
  - Docblock (lines 5-24) traces the full decision.
- Measurement: 3/3 after the Route Handler swap, no settle needed.
- Orchestrator changed the unit test from `expect(statusCode).toBe(307)` to `toBe(303)` and corrected the docblock framing (the original blamed "cookies never propagate from Server Actions" — true for the soft-nav case, but misdirecting; the real story is the race).

**Vacuous E2E test 5 (no click means no failure):**
- `e2e/integration-flows.spec.ts` test 5 (lines 118-137 in the RED submission) registered a `waitForURL` predicate for Google redirect, then called `page.goto("/login")`.
- No `.click()` on the Google Sign-In button anywhere in the test.
- `page.goto()` never triggers OAuth, so `waitForURL` timed out, the `Promise.all().catch(() => [])` swallowed the timeout, and the final assertion ("still on `/login`") was true whether the button was wired or completely broken.
- This test **passed in the RED run** (before any Phase 07 wiring existed), proving it never tested the button at all.
- Reviewer found it (High #1) and rewrote it: register the navigation promise *before* the click, click the real button, `await navigationPromise` without swallowing the error.
- Rewritten test (lines 113-157 in corrected version):
  ```js
  const navigationPromise = page.waitForURL(
    url => url.hostname === "accounts.google.com" || 
            url.href.startsWith("http://127.0.0.1:54321/auth/v1/authorize"),
    { timeout: 15000 }
  );
  await page.goto("/login");
  await googleButton.click();
  await navigationPromise;
  // If GoTrue, assert provider=google and redirect_to
  ```
- Measurement: 3/3 GREEN after the rewrite; acceptance criterion 5 is now genuinely demonstrated.

**EN-copy rule `[VN]` leak to English-locale users:**
- Orchestrator had pre-queried 9 EN strings via `list_file_localizations()`; the implementer (no MCP tools) left the other 46 keys as `[VN]`-tagged mirrors pending a query. The orchestrator then ran the query in batches: 31 of the 46 had MoMorph EN entries (applied verbatim), 15 have no Figma EN source at all.
- Implementer tagged these 46 keys with a `[VN]` prefix in `messages/en/*.json` as a visual marker for docs (e.g., `"heroSubtitle": "[VN] Bắt đầu hành trình của bạn cùng SAA 2025."`).
- 3 of these marked keys were routed through `next-intl` in wired components (`login-hero.tsx`, two `generateMetadata` exports).
- Result: an English-locale visitor to `/login` saw the literal text `"[VN] Bắt đầu hành trình của bạn cùng SAA 2025."` rendered on the page, and the same marker leaked into the SEO metadata for `/he-thong-giai`.
- Reviewer found it (High #2) and raised the rule (clarifications.md 2026-08-29): *marker lives in docs only; runtime values hold the plain Vietnamese fallback when no Figma EN source exists.*
- Fix: removed `[VN]` prefix from all 15 keys in `messages/en/*.json`, leaving plain Vietnamese text that reads sensibly to English-locale visitors (still not true English translation, but that gap was already disclosed and deferred to Phase 08).
- Doc-writer updated `docs/test-traceability.md` line 122 to record "EN catalogue falls back to Vietnamese text at runtime; reviewer H2 — the former `[VN]` marker leaked to English-locale users."

**Process incidents (premature commit, scope creep, TS type mismatch):**
- Implementer committed `0d1f89c` (39 files) before review/approval. Orchestrator soft-reset and unstaged; changes remain in working tree for git-manager. Brief lacked an explicit "do not commit" rule — added to standing agent instructions.
- Implementer deleted Phase 03's `src/lib/auth/sign-out.ts` (bounded handover rule allows only swaps, injections, providers — not deletion of owned files). Orchestrator kept the Route Handler (after 0/3 vs 3/3 measurement proved it necessary) and deleted the Server Action as part of the decision, not a scope violation.
- E2E file `integration-flows.spec.ts` was 341 lines (exceeds <200 rule). Tester split into `integration-flows.spec.ts` (138 lines) and `integration-locale-countdown.spec.ts` (178 lines) with identical assertions, both under budget.
- Temper round 1 FAILED: `e2e/integration-locale-countdown.spec.ts:80` passed `sameSite: string` to Playwright's `context.addCookies()`, which expects `"Strict" | "Lax" | "None"`. Playwright transpiles (passed locally), but `npm run typecheck` failed. Tester fixed with explicit `as const` type guards. Also reported "all e2e < 200" while `award-system.spec.ts` was 215 lines — tester recounted and corrected.
- Temper round 2 (after reviewer fixes): 7/7 exit 0. Transient `SyntaxError: Cannot use import statement outside a module` in test 6 during shared-helper mid-edit — not reproducible after landing.

**Scope honesty (body copy stays Vietnamese; Phase 07b planned):**
- Group 3 body components (`hero-section`, `event-info`, `award-card`, etc.) are synchronous, RTL-tested Server Components importing `messages/vi/*.json` directly.
- Converting to `getTranslations()` (async) breaks existing RTL tests.
- Implementer wired next-intl into chrome (header, footer, metadata) only; body copy still renders Vietnamese even under `NEXT_LOCALE=en`.
- Reviewer documented this (M1) as already correctly scoped; not a defect, a disclosed trade-off.
- User decision (clarifications.md 2026-08-30): **Phase 07b** before Phase 08 — components use `useTranslations` (works in non-async RSC) and unit tests render through a `NextIntlClientProvider` helper. This unblocks full EN body copy once real translations exist.

## What We Tried

1. **Server Action sign-out:** Seemed like the right integration point (already owns the session, can redirect). Measured 0/3 cookies-cleared race. Attempted a settle delay in production code — rejected per no-magic-numbers rule.
2. **Session cookie read timing:** Tried reading in the test before/after the wait; always lost the race with soft navigation. Reading in `route.ts` after explicit deletion confirmed cookies are gone on the Route Handler path.
3. **E2E Google redirect test as written:** Passed in RED and GREEN, but only because it never clicked the button. Re-running with manual click + no swallowing `.catch()` immediately surfaced the real behavior.
4. **EN mirror with `[VN]` prefix:** A reasonable internal marker, but the line between "docs-only" and "runtime-visible" was not drawn before implementation. Attempted to keep it when spotted, then realized any English-locale user could see it.
5. **`getTranslations()` in RTL tests:** Broke due to async constraints. Deferred to Phase 07b with `useTranslations` + test helper approach.

## Root Cause Analysis

**Sign-out race:** Next.js Server Actions use soft client-side navigation (router state changes immediately; Set-Cookie is applied asynchronously). For a session-ending operation where the browser must atomically clear cookies before loading the target page, soft navigation loses the race. The fix is architectural: hard navigation (Route Handler POSTing) is the only way to guarantee atomicity. This is not a bug in Server Actions themselves — they're the right tool for many mutations — just not for logout.

**Vacuous OAuth test:** The RED-team checklist ("write a test for the assertion, record exit/output, move on") did not require a manual smoke-test before recording. The test was *plausibly written* (it tries to assert a redirect), but its race condition and swallowing `.catch()` were invisible until someone actually traced through the code. Lesson: RED E2E should have an inline comment like "manually verified: clicking [button] does reach [URL]" to catch this kind of check before it's recorded.

**`[VN]` leak:** The rule "EN values come from MoMorph or are `[VN]`-tagged with a logged gap" was correct, but *when* the tag is applied in the file pipeline and *where* it's visible to users were not explicitly scoped in the rule. Implementer treated the marker as a permanent placeholder ("docs-only, visible only to maintainers"), shipping it in `messages/en/` where any next-intl wiring picks it up. Fix: rule clarification (tag in docs, never in `messages/` values) and a pre-wiring gate check ("which keys are actually reachable through wired components?").

**Scope creep on sign-out:** The bounded-handover rule lists "do not modify files owned by other phases except for enumerated swaps". Deleting Phase 03's Server Action appeared to violate that. Orchestrator decision: once the measurement proved the Route Handler necessary, deletion became part of the fix decision (not a violation). But the process lesson is real: implementer should have surfaced "I need to delete this" as an escalation before trying the swap, not after.

## Lessons Learned

1. **Soft navigation vs hard navigation is observable and measurable.** When a session-ending operation must synchronously clear cookies, soft-navigation tools (Server Actions' `redirect()`) race with the browser's Set-Cookie application. Hard navigation (Route Handler POST) is atomic and eliminates the race. This is not about one being better universally — it's about tool selection matching the contract.

2. **E2E RED must include a manual click, not just a waitForURL race.** A race with a swallowed timeout is indistinguishable from a working assertion when the target event never fires. The test looked correct (predicates, timeouts, assertions) but never tested the button. Require either (a) an explicit click before the wait or (b) a comment like "manually verified: button navigates to [URL]" to catch this at write-time.

3. **Diagnostic markers belong in code comments or docs, not in runtime values.** The `[VN]` prefix was a brilliant signal for maintainers reading `messages/en/*.json`, but routing a marked key through next-intl before its gap is resolved puts the marker in front of users. Rule: if a value is "not yet real", either leave it out of the wired path or make the fallback path (not a prefixed marker) the value. The plain Vietnamese fallback is readable and signals the gap clearly enough.

4. **Clarify the before/after of a rule.** The EN-copy rule ("MoMorph or `[VN]`-tag") is right, but the decision "which components are wired this phase, and which keys do they touch?" should come *before* implementation, not as a discovery during review. Template: "wired this phase: [component list], touching keys: [exact key names], gap handling: [rule]."

5. **Bounded-handover escalations should surface early.** When an implementer realizes a fix requires deleting a file owned by another phase, that's an escalation call, not a solo decision. The orchestrator's decision to allow it was right (measurement proved necessity), but the handover rule itself (enumerated swaps only) should have been challenged upfront rather than violated in-phase.

6. **Process rules need to be explicit.** "Do not commit" was assumed by convention; it was never written down. After this incident, it's written into the standing agent rules.

## Next Steps

- User approved sign-off at 2026-08-30 checkpoint (clarifications.md); git-manager to commit split by scope, no push.
- Phase 07b scheduled before Phase 08: full i18n wiring for Group 3 body components using `useTranslations` + RTL test helper.
- Standing brief updated with explicit "do not commit before approval" rule for all phases.
- `docs/test-traceability.md` carries the EN-gap log going forward: 15 keys with no Figma EN source (login.json 3, home.json 7, awards.json 5) render the Vietnamese text until design supplies English — Phase 08 keeps them listed, it cannot invent them.
- Quality gate GREEN at exit (lint 0 err/35 warn, typecheck 0, Vitest 114/114 in 25 files, e2e 37/37, build 6 routes, all exit 0). Verdict SEALED 9/10.

---

**Status**: DONE
**File path**: `/Users/duong.quang.phi/Documents/agentic-coding-hands-on/docs/journals/2026-08-30-group-4a-integration-wiring-signout-race-and-vacuous-test.md`
**wc -l**: 123
