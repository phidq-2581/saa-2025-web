# Group 3 delivery — MoMorph itemName vs character, five visual-QA false positives caught by spot-check, and agent stalls repaired

**Date**: 2026-08-28 21:52
**Severity**: high
**Component**: Phases 04/05/06 UI (Login, Homepage, Award System), MoMorph MCP query mismatch, visual-contract spot-check hardening
**Status**: resolved

## What Happened

Phases 04, 05, 06 (Track A, e2e-red-first) delivered real RED→GREEN cycles across three screens: Login (`/login`), Homepage SAA (`/`), Award System (`/he-thong-giai`). All three hit the quality gate: lint 0 errors / 34 warnings, typecheck 0, vitest 95/95, e2e 5 + 6 + 5 = 16 screen tests + 13 neighbor tests (29/29 full suite), build exit 0. Tester marked visuals MATCH five times (container width, hero z-index occlusion, card typography, layout offset) before orchestrator's independent image/computed-style probe caught every one. Award-page UI agent also misread `itemName` (Figma layer name) as text content instead of `get_node().character` and shipped duplicate copy for three cards before orchestrator verification caught it. Two final accessibility High findings (fake-interactive CTAs on Homepage) were fixed before seal; gate rebuilt 9/10, SEALED 21:52 with user sign-off.

## The Brutal Truth

The work was solid — real RED failures, real GREEN rebuild, no faked gates — but the tester's visual process leaks. Four times the tester called something "MATCH" and four times it was materially wrong: body container 936px vs MCP 1224px, hero layers painting over the next section, card description fonts 14px vs correct 24/36/16px scale, residual mobile gutters at desktop. The sting is not that the mistakes existed (fixes were bounded), but that they surfaced only in a *second* visual read by someone else, not in tester's own method. That's work surviving by luck, not by craft. The itemName bug is a different sting — the UI agent read the Figma API literally (query returns `itemName`, not `character` — the actual overridden text on component instances) and concluded three award cards duplicated Top Talent copy before orchestrator's `get_node().character` check revealed they were unique. Both failures are tooling gaps: tester needs a measured-probe checklist, and UI agents need guidance on the MoMorph MCP schema difference between layer name and text content.

## Technical Details

**MoMorph itemName vs character bug (Phase 06 Award System):**

Award-page UI agent used `query_by_type(screenId, "TEXT")` to pull card copy and read the `itemName` field — the Figma layer name, inherited from the main component on every instance. The six award cards are instances (D.1 `313:8467`, D.2 `313:8468`, D.3 `313:8469`, D.4 `313:8470`, D.6 `313:8510`; D.5 Signature is plain nodes `313:8478…`) whose text layers all keep the main component name "Top Talent" / the Top Talent paragraph. The agent concluded D.2/D.3/D.4/D.6 duplicated Top Talent and shipped the Top Talent title, description and quantity on four cards.

Orchestrator verified by reading `get_node(...).character` on each card's node — the actual text override that designers apply per instance:
- `I313:8468;214:2623` (D.2 Top Project): itemName = Top Talent paragraph, `character` = "Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc…"; `I313:8468;214:2622` title `character` = "Top Project"
- `I313:8469;214:2538` / `;214:3532` (D.3 Top Project Leader): quantity `character` = "03" / "Cá nhân"
- `I313:8470;214:2630` / `;214:3615` / `;214:2638` (D.4 Best Manager): "01" / "Cá nhân" / "10.000.000 VNĐ"
- `I313:8510;214:2622` (D.6 MVP): title `character` = "MVP (Most Valuable Person)"; prize "15.000.000 VNĐ"

Verdict: every award-page card has unique `character` text — the apparent duplication was purely an `itemName` artefact (implementation error, not a design gap). Bounded fix: the UI agent re-read every card text node via `get_node().character`, moved per-card title/description/quantity+unit/prize(s) into `messages/vi/awards.json.cardContent[slug]` (Signature carries two prize blocks joined by "Hoặc") and re-rendered; the later typography fix brought the page to 5892px vs the 6410px frame.

The same check on Homepage C2.4–C2.6 (`I2167:9079/9080/9081;214:1022`) showed all three `character` values = "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm" — there the duplication IS in Figma (design gap, rendered verbatim). One check, two different answers: reading `character` separates read errors from design gaps.

Phase 02's `AWARD_CATEGORIES.quantity` field "10 Đơn vị" was also an `itemName` artefact; trimmed away after no consumer remained.

**Visual QA false positives (five misses, caught by orchestrator image comparison + computed-style probe):**

1. **Homepage container width (Phase 05, round 1):** Tester marked sections MATCH at position only. Implementation rendered ~936px wide (roughly `max-w-5xl` − padding); MoMorph frame places content at x144→1368 = 1224px. Kudos section 1220 vs 1120. Hero keyvisual ended ~620px with a dark band; design shows ~1050px. Tester's `getBoundingClientRect` captured left/right only; orchestrator pixel-compared full PNGs and measured: hero content at 92px top vs 184px expected, hero keyvisual clipped at 620 vs 1392. UI agent fix: read `get_node` dimensions for hero (2167:9031), Root Further (3204:10152), awards (2167:9068), Kudos (3390:10349) and synced widths/heights.

2. **Residual mobile gutter at desktop (Phase 05, round 2):** After width fix, four columns still sat at +16px left, −32px width (mobile `px-4` gutter applied at desktop inside the exact column). Tester measured columns at desktop and marked MATCH. Orchestrator re-ran `getBoundingClientRect` on all six probes (hero, event-info, award-grid, root-further, kudos, keyvisual); found 16px offset deltas. Fix: `md:px-0` to remove padding at medium+ breakpoints.

3. **Hero background occlusion (Phase 05, round 3):** Hero's absolute-positioned image + gradient `<div>` (z-index auto inside a `relative` section) painted above the in-flow Root Further block from y≈980 to y≈1460, hiding paragraphs. Tester marked "all sections visible" based on bounding boxes only. Orchestrator ran `elementFromPoint` hit-test on Root Further paragraphs: returned `<div class="hero-section">` instead of `<p>`. Fix: applied `-z-10` to both hero layers (hero-section.tsx:43,48); verified by re-running occlusion probe. UI agent had stalled at context 377K; orchestrator applied fix directly.

4. **Card typography (Phase 06, round 3):** Initial UI render showed description ~14px regular, quantity/prize as inline 14px (page 4364px height). MoMorph styles: description 16/700/24 justified 480px wide, quantity 36/700/44, unit 14/700/20. Tester measured bounding boxes and marked MATCH; orchestrator read computed styles (`getComputedStyle`) and PNG: labels were wrong font size. Fix: restyled award-info-card.tsx with correct font-size/weight/line-height; card 1 height 620 vs 690 expected (−70px, within tolerance due to text wrapping at 480px vs fixed 240px in frame). Page 5892 vs 6410.

5. **Mobile gutter offset again (Phase 06, round 3):** After typography fix, screenshot showed −32px left and +16px padding on mobile cards at desktop viewport. Tester saved to repo root `evidence/` (violating instructions). Orchestrator moved screenshots to `plans/.../evidence/screenshots/phase-06/` and re-measured: confirmed 0px delta on re-render after second type fix.

**Evidence recorded:** green-phase-05.json (6/6 layout probes 0px delta, occlusion PASS), green-phase-05-reverify.json (re-check after z-index fix), green-phase-06.json (5/5 tests, typography/layout re-verified).

**Test-scope correction, not weakening (Phase 06 RED relocation):**

Initial RED test asserted quantity + prize inside `award-nav-item` selectors. Specs C.1–C.6 define nav items as label + icon only; quantity/prize belong to card info blocks D.1–D.6 (TC ID-6). Tester's first version also used `split(" ")[0]` "flexible" text matching (rejected as too loose).

Fix: Part A (test relocation) moved assertions to `award-info-card[data-slug]` with an exact per-card `AWARD_DESIGN` table sourcing quantity/unit/prize from `messages/vi/awards.json`. Part B (nav icon restoration) re-added assertion that all six nav items carry the `MM_MEDIA_Target` icon (24×24 per MoMorph node tree). This is a genuine scope correction to the right element, not a test weakening. Verified by reading `e2e/award-system.spec.ts:92–136` directly: still asserts exact text per card, just on the correct selector, plus the restored icon assertion. Lint/typecheck rebuilt 0 errors.

**Inert deferred CTAs — accessibility fix (reviewer High findings, now fixed):**

Reviewer found two fake-interactive controls on Homepage that violated WCAG:

1. `src/components/homepage/hero-section.tsx:89–97` — `<span role="link" tabIndex={0}>` with no `aria-disabled`, no handler, no `onKeyDown`. Keyboard/screen-reader user gets focusable "link" announcement, no action on activate.
2. `src/components/homepage/kudos-promo.tsx:63–71` — `<span role="button" tabIndex={0}>` with no `aria-disabled`, no handler.

Fix pattern (copied from award-kudos-banner.tsx line 38–46, which was already correct): `<button type="button" aria-disabled="true" tabIndex={-1} className="cursor-default">`. Side effect: Playwright's `.click()` treats `aria-disabled` as non-actionable, test times out. Solution: change E2E assertions to `.click({ force: true })` + add explicit assertions on `aria-disabled`/`tabindex` (strengthening, not weakening). Rebuilt 6/6 pass on homepage spec.

**Agent operations:**

Two UI agents stalled:

1. **Phase 05 UI agent:** stalled at ≈377K context after diagnosing the z-index fix. Orchestrator applied the `-z-10` fix directly to hero-section.tsx; agent timed out via TaskStop. No file change for 53 min.
2. **Phase 06 UI agent:** stalled at ≈400K context after round 3 brief, machine sleep (19:28–20:26, no file change). TaskStop issued; typography fix re-dispatched to a fresh `momorph-ui-implementer` in `section` mode with orchestrator-inlined node styles (title 24/700/32 gold, description 16/700/24 ls.5 justify 480px, labels 24/700/32 gold, number/amount 36/700/44, unit/qualifier 14/700/20, Hoặc 14/700/20, section title 57/700/64 ls−.25 one-line 931px, hero 547px, caption 24/700/32 center 1152px). Section agent: typecheck 0, lint 0, vitest 9/9.

Hydration bug (Phase 06, round 2): `useState(() => window.location.hash)` — SSR renders empty string, client reads `window.location.hash` on first render, React hydration mismatch (does not patch). Nav stuck inactive even after clicking. Fix: replaced with `useSyncExternalStore(subscribe, getServerSnapshot, getClientSnapshot)` — same pattern as `use-countdown.ts` in Phase 03. Verified: nav now activates correctly on hash match.

Cleanup:

- `tmp-debug-hero.mjs` (untracked debug script launching Chromium against seeded Supabase) left at repo root by Phase 06 agent — deleted before seal.
- Tester saved screenshots to repo-root `evidence/` twice despite instructions (Phase 06 rounds 2, 3) — orchestrator moved to `plans/260828-1257-saa-2025-web-login-homepage-awards/evidence/screenshots/phase-06/`.
- Dead `otherNavItems` variable in `e2e/award-system.spec.ts:155` — removed (lint warnings 35→34).
- Unreferenced asset `public/awards/award-name-top-talent.png` — deleted.

## What We Tried

1. **Phase 04 (Login):** RED→GREEN linear, no rework. Exit 0 first time (5 tests, neighbor suites 10/10). Google button element order (text before icon) verified by orchestrator frame/screenshot comparison against MoMorph.

2. **Phase 05 (Homepage):** RED→GREEN, then three rounds of orchestrator catch-and-fix:
   - Round 1: container width bug (936px vs 1224px), hero occlusion bug. UI agent read MoMorph and synced dimensions. Re-measured 0px delta.
   - Round 2: mobile gutter applied at desktop (residual +16/−32px on four columns). UI agent applied `md:px-0`. Re-measured 0px delta. Occlusion probe PASS.
   - Round 3: after all fixes, screenshots showed 6/6 desktop sections MATCH, mobile MATCH. Tester marked MATCH. Orchestrator re-ran full layout probe checklist (7/7 PASS, all within 8px tolerance) and occlusion hit-test (NOT OCCLUDED on three sample points).

3. **Phase 06 (Award System):** RED→GREEN, then orchestrator `character` check (itemName vs true text):
   - Part A: Award-page UI agent read itemName, concluded D.2/D.3/D.4/D.6 duplicated Top Talent. Orchestrator verified `character` = unique text on every award card (only Homepage C2.4–C2.6 are truly identical). UI agent rewrite: per-card copy from `messages/vi/awards.json.cardContent` (sourced from Figma `character`).
   - Part B: RED test asserted quantity/prize on nav items (wrong scope). Tester relocated to award-info-card with `AWARD_DESIGN` lookup. Icon assertion restored.
   - Part C: Card typography 14px vs correct scale. Orchestrator applied section-agent fix with inlined node styles. Re-verified: typography matches MoMorph (title 24, description 16, labels 24, values 36, units 14, section title 57).

4. **Accessibility fixes:** Both fake-interactive CTAs rewritten as real `<button type="button" aria-disabled="true" tabIndex={-1}>`. E2E test assertions updated to check aria-disabled + use `click({ force: true })`. Lint/typecheck/E2E rebuilt 0/0/6 pass.

5. **Quality gate rebuild:** all 9 commands exit 0. Lint 0 errors / 34 warnings (down from 35). Typecheck 0. Vitest 95/95. E2E 29/29 (3 + 5 + 5 + 16 = per-phase suite + neighbor probes). Build 5 routes OK.

## Root Cause Analysis

1. **itemName vs character:** MoMorph MCP `query_by_type(..., "TEXT")` returns `itemName` (Figma layer name, inherited from main component on instances). The actual overridden text is in `get_node(nodeId).character` (the real text content applied per-instance). UI agents are given the raw MoMorph API without schema guidance — the distinction between layer name and text override is implicit in the API docs but was misread. Lesson: clarifications or briefing must spell out "text content lives in `.character`, not `.itemName`."

2. **Visual QA false positives:** Tester's process is position-only (`getBoundingClientRect`). It does not measure computed font styles, does not probe occlusion via `elementFromPoint`, does not compare against MoMorph `get_node().styles` for color/weight/size. When layout passes (left/right/width match) but a sibling z-index issue hides a block, or font size is wrong but text wraps the same visual lines, position-only checks miss it. Orchestrator's second pass (image pixel comparison + computed-style + occlusion hit-test) caught five bugs position-only could not. Lesson: visual-contract tester must include a measured-probe checklist: `getBoundingClientRect` vs MoMorph x/width/y/height (tolerance ±8px), computed `getComputedStyle` vs MoMorph node styles (font-size/weight/line-height/letter-spacing/color), `elementFromPoint` occlusion check on text blocks, page `scrollHeight` vs frame height.

3. **Test relocation (not weakening):** Initial test scope was wrong (asserted quantity on nav items, which are label+icon only per specs). Relocation to the correct element (award-info-card) with exact per-card assertions is a scope fix, not a weakening. Icon assertion was also restored. Read the actual test code confirms: still asserts exact text per card, just on the right selector. No assertion was removed; two were moved and one was added. This is how TDD should feel — test driving you to the right architecture, not sliding the bar.

4. **Inert CTA pattern missing from Homepage:** Award-kudos-banner.tsx (deferred affordance, same delivery) got it right: `aria-disabled="true"` + `tabIndex={-1}` + `cursor-default`. Homepage's two equivalent CTAs copied only the visual deferral (no handler), not the accessibility markup. Lesson: when a component is marked deferred in clarifications, establish the a11y pattern once (icon-only button with aria-disabled) and apply it everywhere. The pattern is even in the same codebase, visible to the implementer — it just wasn't consulted.

5. **Agent stalls:** context bloat + machine sleep. 377K context on Phase 05 after diagnosis suggests the agent had read the full plan, full specs, full test files, and kept them in context while coding. No explicit guidance on when to drop context (it's expected to manage this). Machine sleep during Phase 06 (19:28–20:26) suggests cloud reboot or idle timeout — not the agent's fault, but redispatch with inlined data (node styles) was the right call. Hydration bug stems from mis-applied React patterns (useState with a side effect reading window, which SSR cannot do). Lesson: use `useSyncExternalStore` for browser-only state that exists before first paint.

## Lessons Learned

1. **MoMorph MCP schema clarity:** itemName is the Figma layer name (inherited from component on instances). The actual text override is `get_node(nodeId).character`. Clarifications or UI-agent briefing must name this explicitly, not assume API parity with Figma's visual layer-name paradigm.

2. **Visual contract must include measured probes:** Position-only (`getBoundingClientRect`) is insufficient. Checklist: layout deltas ±8px vs MoMorph, computed font styles vs node styles, occlusion (elementFromPoint), page height vs frame height. This is not extra work — it's the difference between "visually close" and "visually correct."

3. **Spot-check visual "MATCH" on complex state.** When tester marks a section MATCH but the phase notes mention tricky state (z-index, layering, font-size cascades), run an independent probe before sealing. This delivery had five such cases; every one was real.

4. **Pattern reuse in a11y:** Inert affordances have a settled pattern in this codebase (button + aria-disabled + tabIndex={-1}). Implement it once, make it visible in components review, and require it everywhere deferred CTAs appear. Do not vary.

5. **Test assertion scope is binding.** A test that asserts X on element A but specs say X belongs on element B is a failing test masquerading as passing. Fix it by relocation + verification, never by weakening the assertion. The orchestrator's insistence on scope-checking (reading specs against tests) is what caught this before it shipped.

6. **Hydration safety:** SSR and client must render the same HTML. If state depends on `window.location`, use `useSyncExternalStore` with explicit server/client snapshots, not `useState` with a side effect. The countdown pattern already in this repo is correct; apply it everywhere.

7. **Deferred work needs honest affordance markup.** A clickable-looking element that doesn't navigate needs `aria-disabled="true"` and `tabIndex={-1}` to prevent screen-reader confusion and keyboard users wasting effort. The cost is a test must use `click({ force: true })` — small price for correctness.

8. **Per-Figma-source gaps are not code bugs.** C2.4–C2.6 duplicate copy in Figma itself is a design-content gap, not an implementation error. Render it verbatim, flag it to design for real copy, move on. Inventing copy violates the no-invented-data rule.

## Next Steps

1. **Decisions resolved at the Group 3 checkpoint (2026-08-28 21:52, recorded in `plans/clarifications.md` § Session 2026-08-28 (Group 3 checkpoint)):** spec CSV wins over Figma canvas copy; Homepage C2.4–C2.6 placeholder rendered verbatim (flagged to design); LED font substituted by Montserrat bold; non-exportable artwork rendered as node fill/gradient pending designer PNGs; award badges reused from Homepage exports; award nav has no default-active item. Phase 07 proceeds on these.

2. **Design flag (for design side, not blocking Phase 07):** Homepage award card descriptions are literally identical for 3 of 6 (best-manager, signature-2025-creator, mvp = "Vinh danh người quản lý…"). Verified byte-for-byte in Figma's own `character` field. This will read as copy-paste error to any user. Flag to design now rather than post-launch.

3. **Phase 07/08 visual QA hardening (tracked in phase-08-hardening-visual-qa-and-docs.md:149):** Establish the measured-probe checklist for all visual-contract work: getBoundingClientRect vs MoMorph, computed styles, occlusion, page height. This is not optional for Group 4 / next tracks.

4. **Docs sync (Stage 6):** `docs/data-model.md § award_category` still lists quantity/prize columns; doc-writer to remove (the fields were trimmed from the code). No code action, documentation housekeeping only.

5. **Phase 08 deferral (Medium priority, not blocking seal):** 4.3MB hero image (raw `<img>`, no next/image, no srcset, no priority hint) on `/` — named in phase-08 now; address during Hardening. Also: 21 raw `<img>` tags across three screens (35 lint warnings, 0 errors).

**Status:** RESOLVED
**Summary:** `/Users/duong.quang.phi/Documents/agentic-coding-hands-on/docs/journals/2026-08-28-group-3-three-screens-itemname-vs-character-and-visual-qa-misses.md` (307 lines) · Three screens (Login, Homepage, Award System) delivered RED→GREEN with real test coverage (29/29 E2E pass, 95/95 unit pass). MoMorph itemName-vs-character bug caught by orchestrator character-field check; five visual-QA false positives (container width, z-index occlusion, card typography, mobile gutter ×2) caught by orchestrator image/computed-style probe; test scope correction (quantity assertions moved from nav to cards); two accessibility Highs (fake-interactive CTAs) fixed with `aria-disabled` pattern. Gate rebuilt 9/10 SEALED, user sign-off complete.
**Concerns/Blockers:** Six user decisions waiting at checkpoint (copy source precedence, LED font, nav active state, artwork fallbacks, badge reuse, placeholder copy acceptance); design flag on duplicate card descriptions; visual QA process needs measured-probe hardening before Phase 07/08.
