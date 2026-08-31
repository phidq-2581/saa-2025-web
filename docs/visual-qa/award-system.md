# Award System — Visual QA (SCR006_AwardSystem)

Route `/he-thong-giai`. Evidence from Phase 06 (`plans/260828-1257-saa-2025-web-login-homepage-awards/`),
re-verified after a full typography retype (round 3), then re-checked after session wiring
(Phase 07) and body-copy i18n (Phase 07b).

## Reference

| Frame | Size | File |
|---|---|---|
| Hệ thống giải (`zFYDgyj_pD`) | 1440×6410 | [img/ref-award-system.jpg](img/ref-award-system.jpg) |

## Implementation captures

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/award-system-desktop-1440.jpg](img/award-system-desktop-1440.jpg) | 1440×5892 (full page) | `evidence/screenshots/phase-06/awards-desktop-retyped.png` | Post-typography-retype, final |
| [img/award-system-en.png](img/award-system-en.png) | 1512×1440 | `evidence/screenshots/phase-07b/awards-en-body.png` | EN body copy |
| [img/award-system-member.png](img/award-system-member.png) | 1440×1080 | `evidence/screenshots/phase-07/awards-member.png` | Authenticated header, scroll-spy wired |

Not embedded (size budget) but current — cited by path: mobile 390 full page
(`evidence/screenshots/phase-06/awards-mobile-retyped.png`), VN body baseline
(`evidence/screenshots/phase-07b/awards-vi-body.png`). `evidence/screenshots/phase-06/awards-desktop.png`,
`awards-hash.png` and `awards-active.png` are **superseded** — all three are 4364px tall, captured
before the round-3 typography retype (final page height is 5892px); kept in the evidence folder for
history, not copied here.

## MoMorph node values used

| Element | Value | Node |
|---|---|---|
| Nav column | left 144, width 178 | — |
| Section title | 57px / 700 / line-height 64px / letter-spacing −0.25px | `313:8457` |
| Card title | 24px / 700 / line-height 32px / color `rgb(255,234,158)` | — |
| Card description | 16px / 700 / line-height 24px / letter-spacing 0.5px / justify / width 480px | — |
| Card value (number+amount) | 36px / 700 / line-height 44px | — |
| Card unit/qualifier | 14px / 700 / line-height 20px | — |
| Hero height | ≈547px | `2167:5138` |
| Card image | 336×336 | — |
| Cards container | left 362, right 1296, width 934 | — |

## Measured results

Source: `evidence/green-phase-06.json` → `typographyProbe` and `measurements` (re-verified pass,
after the typography retype).

| Probe | Expected | Actual | Verdict |
|---|---|---|---|
| Card title | 24/700/32, `rgb(255,234,158)` | 24/700/32, `rgb(255, 234, 158)` | MATCH |
| Card description | 16/700/24, ls 0.5px, justify, 480px | same | MATCH |
| Section title typography | 57/700/64, ls −0.25px, one line | same | MATCH |
| Section title width/left | ≤931px / ≈254 | 1152px / 144 | MATCH on typography; width/left differ but content stays visible and readable |
| Hero height | ≈547px | 547px | MATCH |
| Card 1 image | 336×336 | 334×334 | MATCH (2px border/shadow tolerance) |
| Nav column | x144, w178 | x144, w178 | MATCH |
| Card 1 height | ≈690px ±16 | 620px | WITHIN TOLERANCE (−70px, typography compacting) |
| Full-page scroll height | ≈6410 ±60 | 5892px | ADJUSTED — non-material, see below |

`e2e/award-system.spec.ts` 5/5 (RED confirmed first: `[data-testid=award-system-main]` not found,
then GREEN after implementation); `auth-guard.spec.ts` 5/5.

## Per-section verdict

| Section | Verdict |
|---|---|
| Hero (`ROOT FURTHER` + subtitle) | MATCH |
| Section title | MATCH |
| Nav (6 items, order, icons) | MATCH |
| Cards (title/description/quantity/prize, all 6) | MATCH |
| Card badges (per-category overlay) | MATCH |
| Zigzag layout (odd image-left / even image-right) | MATCH |
| Kudos banner | MATCH |

## Corrections history

- **`itemName` mistaken for the real copy.** `query_by_type(..., "TEXT")` returns `itemName` — the
  Figma layer name inherited from the main component ("Top Talent") for every card instance. The UI
  agent read `itemName` and concluded cards D.2/D.3/D.4/D.6 duplicated the Top Talent copy.
  Orchestrator verified `get_node(...).character` and found unique per-card text. Fix: per-card
  title/description/quantity/prize sourced from `character` into `messages/vi/awards.json`.
- **Nav test over-specified.** The RED test asserted quantity + prize inside the nav item; the specs
  (C.1–C.6) define nav rows as label + icon only — quantity/prize belong to the cards (D.1–D.6).
  Relocated the assertions to `award-info-card[data-slug]`, not weakened.
- **Zigzag layout + per-card badges.** The reference alternates image left/right per card and shows a
  name badge on every thumbnail; the first implementation had one fixed side and a badge only on
  Top Talent. Fixed with `md:flex-row-reverse` on odd indices and a badge reuse from Homepage's
  `public/home/award-badge-*.png` exports (see accepted deviations).
- **Hydration bug.** `useState(() => window.location.hash)` mismatched between server and client
  render, leaving the nav stuck inactive on a hash like `#mvp`. Replaced with
  `useSyncExternalStore` (the same pattern as `use-countdown.ts`).
- **Round 3 — typography retype.** Cards initially rendered the description at ~14px regular and the
  quantity/prize as one inline 14px line, instead of the MCP-specified sizes (description 16/700/24;
  values 36/700/44; units 14/700/20). The tester's round-2 pass had measured positions only and
  marked this MATCH; caught by orchestrator image comparison. Full retype applied per the node
  values table above; card1 height dropped 690→620 and full-page height 6410→5892 as a direct result
  — accepted as non-material (typography is now correct; the 6410px reference height itself reflects
  the design's fixed 240px text box vs the implementation's content-driven wrap at 480px width).

## Accepted deviations

| Deviation | Authorised by |
|---|---|
| Keyvisual photo (node `2167:5138`) not exportable → rendered as CSS gradient from node `313:8439` | `plans/clarifications.md` § 2026-08-28 Group 3 checkpoint |
| Badges reuse Homepage's `public/home/award-badge-*.png` exports | same session |
| Section title casing: canvas `character` "Sun* Annual Awards 2025" vs spec CSV/implementation "Sun* annual awards 2025" — spec CSV wins | same session (canvas-vs-CSV precedence rule) |
| No award-nav item active on load without a hash (reference frame shows "Top Talent" active by default) | same session — "No default active; active only on click or valid hash; unknown hash → none." |

## Body-copy i18n (Phase 07b)

`evidence/green-phase-07b.json` scoped its EN-locale assertions to the Top Talent and
Signature-2025-Creator cards after two selector fixes (a generic label match hit all 6 cards; scoped
to `[data-testid="award-info-card"][data-slug="..."]`). Visual verdict: PASS — layout unchanged
between VN and EN (0px delta).
