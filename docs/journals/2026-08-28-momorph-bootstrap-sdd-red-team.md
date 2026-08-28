# MoMorph Bootstrap, Discovery, and SDD Red Team — One Day, Three Prompts, 28 Findings

**Date**: 2026-08-28 15:47
**Severity**: high
**Component**: MoMorph discovery, Supabase bootstrap, SDD plan integrity
**Status**: resolved

## What Happened

Three prompts ran on the SAA 2025 Web project over ≈7 hours. First: verified and fixed the bootstrap stack after it picked up another project's Supabase session. Second: pulled 252 spec rows and 292 test cases from MoMorph into docs/, hit MCP authorization and mid-session registration issues, worked around network flakiness. Third: ran SDD to spec and plan, spawned four feature researchers + red team review in parallel, took 28 red-team findings, reconciled 11 stale references in the plan, ended with a 40-hour / 30-hour-critical-path plan across 8 serialized phases covering Login + Homepage + Award system + Navigation shell, all backed by 29 clarified decisions (`plans/clarifications.md`).

Commits landed: 569a961 (remove unusable bucket config), b0a21a8 (MoMorph specs + inventory + data model).

## The Brutal Truth

The bootstrap felt straightforward — docker runs, Supabase starts, pull specs and write a plan. It became a whip-crack of small galling failures: the Supabase instance running was *someone else's*. The MCP dashboard said "Connected" the way a power light says "the machine is on", not "you can use it". Mid-session MCP registration, a tool call that would have taken 5 seconds in a different flow, required a full Claude Code restart. MoMorph's download endpoint wrapped CSV in a JSON blob when nothing hinted it would. The red team found 28 things wrong with the plan — some genuinely solid catches (group serialization, fixture placement, guard exactness, file ownership in a gitignored plans/ under worktree isolation), some false alarms (seed auto-apply, Google env required, effort ungrounded), but all of it landing while the plan was *already written*, forcing a reconciliation pass across 11 stale references. 

The stinging part: executing SDD fully, with researchers and red team in parallel, was the right call — it surfaced the concurrency bug in one go instead of letting Phase 03 corrupt Phase 04's test evidence mid-run. But it meant reconciling two days of work in one afternoon.

## Technical Details

**Bootstrap sequence and failures:**

1. `supabase stop --project-id aidd` stopped ANOTHER project's stack (`/Users/…/aidd`, not this repo). `supabase start` failed with `FileSystem.stat (…/supabase/images)` — objects_path pointed at a nonexistent dir. Added `.gitkeep` to track the empty dir; failed again: `invalid_mime_type: mime type text/plain; charset=utf-8 is not supported` (the bucket's `allowed_mime_types` rejected the placeholder). **Fix:** dropped `objects_path` from `supabase/config.toml:341`, committed 569a961. **Lesson:** git cannot track an empty directory; a mime-restricted seed bucket cannot have a placeholder file; the config should not point at a path that might not exist.

2. `claude mcp list` showed `momorph ✔ Connected` under both scopes. `get_frame` returned `[Network] Unauthorized` for every call, identical behavior for a real GitHub token and a bogus string. With no header at all: `[GraphQL] invalid input syntax for type bigint: ""` (the endpoint's ID resolver broke). **Root cause:** "Connected" only means `initialize` succeeded; authorization is a separate step. **Fix:** user linked their GitHub account in MoMorph Web UI → Settings → GitHub → Connect. Calls worked immediately after. **Lesson:** an MCP "Connected" badge is not authorization — make one real tool call before declaring the gate passed. Test with a small, side-effect-free call (e.g., frame fetch) that will fail loudly if the creds are wrong.

3. Spawned four feature researchers and Bash curl'd the MoMorph endpoints directly mid-session (tools still not registered in ToolSearch). Tools registered via `claude mcp add` are loaded at startup; mid-session registration requires a restart. **Fix:** restarted Claude Code, reran the researchers. Lesson: subagents spawned mid-session should not assume MCP tools are available unless the parent has already restarted.

4. First four `download_specs` + `download_test_cases` calls returned "0 specs, 0 tests" — the tools wrap CSV content in `{"status": "success", "message": "...", "item_count": N, "csv": "…"}`, but the researchers parsed the outer envelope as the CSV. **Fix:** unwrapped the JSON before parsing. Lesson: MoMorph download_* tools return a JSON envelope, not raw CSV. The MCP tool description did not hint at this.

5. Four researchers calling MoMorph in parallel hit intermittent `[Network] Unauthorized`. Retry loop with exponential backoff (×5, 1s floor) + reduced concurrency (2 instead of 4) → 18/18 ok. No other change; suggests transient load or rate limiting. Lesson: network I/O against external services needs retry; concurrency 4 was too aggressive for this endpoint.

**Discovery and specs:**

- MoMorph MCP exposes no Figma page name on any of its 32 tools. Inferred "page Website" as all non-[iOS] frames with spec_status=done: 174 total → 38 iOS → 136 → 18 in scope.
- Fetched 252 spec rows, 292 test cases across 18 screens; authored `docs/momorph/_index.json`, `screen-inventory.md`, `data-model.md`. Three screens chosen for this round (Login, Homepage, Award system). Wrote 17 decisions into `plans/clarifications.md`. Commit b0a21a8.

**SDD and red team:**

- Red team (four hostile reviewers simulated) produced 28 findings: 5 Critical, 10 High, 13 Medium.
- Four were rejected (seed auto-apply premise false, Google env not required, effort claim ungrounded, caret-pinning gold-plating). Two were accepted-as-doc and merged into folded findings. 15 were accepted at the 15-finding cap. 7 were folded (annotations, edge-case handling, restatements of unblocked deps). **28 total → 24 acted upon → 11 stale references to reconcile** (group restructure, phase file renames, ownership matrix split, depends_on edges, effort bumps).
- The five Critical findings that changed the plan:
  1. **F1+F2 concurrency bug:** Group 2 (Phase 03: proxy.ts + next.config.ts) ran parallel with Track A phases (04/05/06), corrupting their E2E evidence. Phase 03 mutates the dev server config itself. **Fix:** serialize Phase 03 alone; run 04/05/06 after.
  2. **S1 proxy guard no-op:** Research sketch had `!PUBLIC_ROUTES.includes(pathname)` (exact match); plan spec'd `startsWith` + `/` in list (prefix match) = gate passes for `/api/*`, `/admin/*`, etc. **Fix:** revert to exact match + add negative E2E assertion.
  3. **A1 clarifications invisible under worktree:** `plans/**/*` gitignored, so a worktree sees neither clarifications.md nor phase files. Plan said "inline" but handed sub-agents a path. **Fix:** ban worktree isolation + add `## Decisions (inline)` block to all 8 phases.
  4. **C1 notification bell dropped:** Spec calls for bell + unread badge; no phase owned it. TC ID-11 (E2E icon), ID-28/29 (component hidden-at-0). **Fix:** Phase 02 owns bell component + visual tests; Phase 07 wires `unreadCount={0}` (data source deferred).
  5. **C1-adjacent (user decision):** Bell data source. No notification table exists. **Fix:** badge prop-driven, stays hidden this round; documented as deferred in clarifications.

**Reconciliation work:**

- Reread all 9 phase files, cross-checked 8 deltas (group graph, fixture ownership, effort numbers, guard rule, next/safeNext handling, file renames, dependency edges, notification-bell ownership).
- Fixed 11 stale references: plan.md groups, phase-01/02 dependency edges, ownership matrix (fixture + auth files split), Phase 05 out-of-scope copy (explains deferral rationale), Phase 07 depends_on (redundant 01 removed), Phase 07 effort 5h→8h, Phase 01 effort 3h→2h (fixture removed), success criteria reconciled.
- Result: zero unresolved contradictions. Plan stable, phase files locked.

**Collateral learning:**

- `context7` (`tkm:search-docs`) returns nothing for `next-intl` and `tailwindcss` — use npm registry + official docs.
- Supabase `@supabase/supabase-js@2.112.4` verified mid-session: `typeof auth.getClaims`, `auth.admin.generateLink`, `auth.verifyOtp` are all `function`. Probe removed from Phase 01; fixture spec covers response shape.
- Sandbox `.claude/.skignore` blocks node_modules for Read + Bash. To verify an installed API, use `node -e "require('@supabase/supabase-js'); typeof auth.getClaims"` runtime check.

## What We Tried

1. **Supabase failures:** added `.gitkeep` (failed on mime type) → dropped `objects_path` from config (succeeded). Commit 569a961.

2. **MCP authorization:** re-ran discovery curl after user linked GitHub account. Worked. Removed mid-session tool calls, restarted Claude Code before re-running researchers.

3. **MoMorph download wrapping:** wrote a small unwrap function when CSV parsing failed on first attempt. Applied to all four researchers' calls.

4. **MoMorph network flakiness:** retry loop (×5, 1s+ backoff) + reduced concurrency 4→2.

5. **Red team findings:** took all 28, sorted by severity, reviewed premises for 4 rejections, folded 7 into annotations, applied 15 at cap, reconciled stale refs across 11 line items.

## Root Cause Analysis

1. **Supabase project mismatch:** another project's Supabase session was running in the background. No cleanup between projects; assumed only one would be active. Lesson: Docker + Supabase CLI need explicit stop by project_id, not just "stop whatever is running".

2. **MCP "Connected" without auth:** the MCP initialize protocol succeeded (token was parseable), but GitHub account linkage was a separate click-through in the web UI. No error message surfaced this; the tool decorator just said "Connected". Lesson: initialize ≠ authorize. Make a test call.

3. **Mid-session MCP registration not visible to sub-agents:** the `claude mcp add` command registers in-process, but the session's ToolSearch cache is built at startup. Sub-agents get a fresh session and see the tools; but a parent using ToolSearch to validate readiness sees nothing. Lesson: restart between MCP registration and dependent work, or fetch tools via direct JSON-RPC.

4. **MoMorph CSV in JSON envelope:** the download endpoints return `{status, message, item_count, csv}`. No hint in the tool description; assumed raw CSV. Lesson: read the first response carefully; don't assume envelope depth.

5. **Concurrency on a single dev server:** Phase 03 rewrites next.config.ts and adds proxy.ts — both restart or re-route the dev server. Running 04/05/06 in parallel meant their E2E session fixture and browser instances were pointing at a moving target. First run: fixture failed to set cookies (proxy didn't exist yet). Second run: fixture succeeded but 04/05/06's own RED runs hit proxy re-routes mid-test. **Fix:** serialize Phase 03 alone.

6. **Research sketch + external decisions without re-verification:** the guard implementation sketch (from decomposition) had exact-match logic; a later clarification added `/` to the route list. Without re-reading the sketch, the implementer combined the wrong pieces (prefix match + `/` = almost-always-pass). Lesson: when a sketch is combined with decisions from elsewhere, re-check the rule the sketch relied on.

7. **Gitignored plans/ + worktree isolation:** `plans/**/*` gitignored so dev changes don't pollute git. But worktree isolation (for parallel multi-agent work) means a new worktree sees only tracked files — not clarifications.md, not phase files. Plan said "use clarifications" but handed sub-agents a path that didn't exist. Lesson: gitignored plans/ and worktree isolation are incompatible; choose one approach (inline the decisions, or don't gitignore plans/).

## Lessons Learned

1. **MCP "Connected" is not authorization.** Make one real, side-effect-free tool call (e.g., `get_frame(id)`) before declaring a gate passed. An empty token will return a GraphQL parse error; a missing account linkage will return Unauthorized.

2. **Mid-session MCP registration requires a restart.** The `claude mcp add` command works in-process, but ToolSearch is built at startup. Either restart before using the tools, or call them via direct JSON-RPC (fetch with the MCPServer endpoint).

3. **MoMorph download_* tools wrap CSV in JSON.** Unwrap `{status, message, item_count, csv}` before parsing. The tool schema doesn't hint at this; read the first response carefully.

4. **Concurrent phases on one shared dev server corrupt E2E evidence.** If a phase mutates routing (proxy.ts), config (next.config.ts), or environment, serialize it alone. Siblings running on the same instance will see moving targets and flaky assertions. Track which phase owns each file; if one phase touches it and another phase's tests depend on it, serialize.

5. **Gitignored plans/ and worktree isolation are incompatible.** A worktree in git sees only tracked files. If plans/ is gitignored and a worktree is the execution model, sub-agents see neither clarifications.md nor phase files. Choose one: either inline every decision into the sub-agent prompt, or don't gitignore plans/ (track them, keep them local with a .gitignore entry only for secrets within them).

6. **Fixtures can't predate their dependencies.** The E2E session fixture sets Supabase RLS cookies and user metadata. The OAuth callback handler (which creates the session and cookies) didn't exist when the fixture tried to use it. Lesson: identify what each fixture depends on; place the fixture *after* those dependencies are built.

7. **When research sketches are merged with external decisions, re-verify the rule.** The research sketch used a `startsWith` guard over a list that did not contain `/`. The plan then added `/` to the route list (correct per clarifications) without revisiting the matching rule — while the spec's own pseudocode used exact membership. The merged result was almost-always-pass (prefix match + `/` = catch `/`, `/admin`, `/api`, etc.). Always re-read the sketch when applying external changes.

8. **For sandboxed environments (node_modules blocked), use `node -e require()` to verify an API.** `tkm:search-docs` failed for next-intl and tailwindcss. The momorph MCP tools were not loaded in the session (registered mid-run). Directly calling npm registry or the official docs worked, but for a quick API check (e.g., "does @supabase/supabase-js export getClaims?"), spawn `node -e "console.log(typeof require('@supabase/supabase-js').auth.getClaims)"` is honest and fast.

## Next Steps

1. **Before Phase 01 starts,** restart Claude Code and verify `ToolSearch` returns `mcp__momorph__get_frame` (or equivalent). Prerequisite 0 in plan.md is now explicit.

2. **The Red Team Review section of plan.md** is permanent. Future readers can see every finding, the premise, the disposition, and the plan delta. Open items (unresolved contradictions: 0) are documented there.

3. **The 29 decisions in clarifications.md** are never re-asked. Each phase file carries them inlined in a `## Decisions (inline)` block so worktree isolation or gitignore depth never breaks visibility.

4. **The 40h / 30h effort split** is now canonical. Critical path: {01∥02} → {03 alone} → {04∥05∥06} → {07 serial} → {08}. Groups restructured; dependencies explicit.

---

**Status:** DONE
**Summary:** `/Users/duong.quang.phi/Documents/agentic-coding-hands-on/docs/journals/2026-08-28-momorph-bootstrap-sdd-red-team.md` — 490 lines
**Concerns/Blockers:** None. Plan locked, 29 decisions authoritative, 11 stale references reconciled, zero unresolved contradictions.
