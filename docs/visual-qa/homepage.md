# Homepage — Visual QA (SCR005_Homepage)

Route `/`. Evidence from Phase 05 (`plans/260828-1257-saa-2025-web-login-homepage-awards/`),
re-verified through 3 correction rounds, then re-checked after session wiring (Phase 07) and
body-copy i18n (Phase 07b).

## Reference

| Frame | Size | File |
|---|---|---|
| Homepage SAA (`i87tDx10uM`) | 1512×4480 | [img/ref-homepage.jpg](img/ref-homepage.jpg) |

## Implementation captures

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/homepage-desktop-1512.jpg](img/homepage-desktop-1512.jpg) | 1512×4560 (full page) | `evidence/screenshots/phase-05/home-desktop.png` | Round 2 capture, all layout deltas 0px |
| [img/homepage-member-header.jpg](img/homepage-member-header.jpg) | 1512×1080 | `evidence/screenshots/phase-07/home-member.png` | Authenticated header (avatar/bell/FAB), layout unchanged from Group 3 |

Not embedded (size budget) but current — cited by path: guest header
(`evidence/screenshots/phase-07/home-guest.png`), mobile 390 full page
(`evidence/screenshots/phase-05/home-mobile.png`), EN body copy
(`evidence/screenshots/phase-07b/home-en-body.png`), VN body baseline
(`evidence/screenshots/phase-07b/home-vi-body.png`). `evidence/screenshots/phase-07/home-en.png` is
**superseded** — it shows chrome-only EN with body copy still Vietnamese, the state Phase 07b fixed;
kept in the evidence folder for history, not copied here.

## MoMorph node values used

| Section | Left (x) | Width | Node |
|---|---|---|---|
| Hero heading | 144 | 1224 | `2167:9031` |
| Event info | 144 | 1224 | (same content column) |
| Award grid | 144 | 1224 (right edge 1368) | `2167:9068` |
| Root Further paragraph | 180 | 1152 | `3204:10152` |
| Kudos promo | 196 | 1120 | `I3390:10349;313:8415` |
| Keyvisual height | — | 1392 (image height) | — |

## Measured results

Source: `evidence/green-phase-05.json` → `layoutMeasurements` (verification round 2, viewport
1512px, tolerance 8px).

| Section | Expected | Actual | Delta | Verdict |
|---|---|---|---|---|
| Hero heading | left 144, width 1224 | left 144, width 1224 | 0px | MATCH |
| Event info | left 144, width 1224 | left 144, width 1224 | 0px | MATCH |
| Award grid | left 144, width 1224, right 1368 | same | 0px | MATCH |
| Root Further paragraph | left 180, width 1152 | left 180, width 1152 | 0px | MATCH |
| Kudos promo | left 196, width 1120 | left 196, width 1120 | 0px | MATCH |
| Keyvisual height | 1392 | 1392 | 0px | MATCH |
| Mobile (390×844) | hero/card left 16 (px-4 gutter), 2 cards/row | same | — | MATCH |

Occlusion probe (`elementFromPoint` on the Root Further paragraphs, 1512px viewport): all three
paragraphs resolve to their own `<p>` element, not occluded — confirms the z-index fix below.
`e2e/homepage.spec.ts` 6/6, `navigation-shell.spec.ts` 5/5.

## Corrections history

- **Round 1 — container width guessed.** Body sections rendered ≈936px wide instead of the frame's
  1224px column (Kudos 1220 vs 1120; keyvisual clipped ≈620px vs the design's ≈1392px; hero top 92
  vs 184). Found by orchestrator image comparison. Fixed by reading widths/heights from `get_node`
  on the hero, Root Further, award grid, and Kudos nodes.
- **Round 2 — residual mobile gutter at desktop.** After the round-1 fix, four columns still sat at
  +16px left / −32px width — a mobile `px-4` gutter was still applied at the desktop breakpoint.
  Found by tester `getBoundingClientRect` measurement. Fixed with `md:px-0`; re-measured at 0px delta
  on all six desktop probes.
- **Round 3 — hero background occluding text.** The hero's background image and gradient layers
  (absolute-positioned, no z-index) painted over the Root Further paragraphs from y≈980 to y≈1460,
  hiding the first visible line of text. Found by orchestrator image comparison (the tester's round-2
  pass measured column edges only and had marked this section MATCH). Fixed with `-z-10` on both
  layers in `hero-section.tsx`; verified with the occlusion probe above.

## Accepted deviations (this screen)

| Deviation | Authorised by |
|---|---|
| Countdown LED digit font "Digital Numbers" unavailable → **DSEG7 Classic** (OFL-1.1, `dseg` package) at the design's 49.152px/400; superseded the earlier Montserrat-bold fallback | `plans/clarifications.md` § 2026-09-03 |
| Card descriptions C2.4–C2.6 render one identical placeholder sentence (verified against Figma `character`) | same session |
| Canvas vs spec CSV text — **canvas implemented** since 2026-09-03 (`26/12/2025` / `Âu Cơ Art Center` / `… qua sóng Livestream`; awards sub-description line dropped; card description no longer clamped). Two canvas typos stay spec-spelled: `Coming soon`, `Awards Information` | `plans/clarifications.md` § 2026-09-03 |

## Known gap

- **Countdown digit font** — the exact "Digital Numbers" face is still not available; DSEG7 Classic
  is a same-class 7-segment substitute at the design size/weight, so glyph shapes differ slightly.
- **"Awards Information" label** — kept from the spec CSV (canvas says "Award Information"); the extra
  glyph shifts the following header/footer items right by 6–9px at 1512.

## Body-copy i18n (Phase 07b)

`evidence/green-phase-07b.json` measured the EN and VN body renders at the same 1512×1440 viewport:
hero/grid/Root-Further/Kudos x-offsets identical between locales (max delta 0px) — English copy is
longer but does not shift layout or wrap differently at this width. Visual verdict: PASS for both
locales.

## Pixel-parity pass (2026-09-03)

Method: every Figma `TEXT` node from `list_frame_styles("i87tDx10uM")` (55 nodes, positions at the
1512 canvas) joined by text content to a Playwright `getBoundingClientRect` dump of the rendered page
at 1512px; geometry, font size/weight, line-height, letter-spacing and colour compared per node.
Before: 0/55 matched, 43 mismatched. After: every remaining delta is one of (a) the 48px
"Coming soon" block the live countdown hides once the event date passes, (b) Figma's `81.92px`
countdown tiles rounding to integer node positions (a constant +0.92px below the hero, browser-side),
(c) the guest header lacking the bell/avatar the canvas shows for a signed-in user (language
trigger sits 56px further right — exactly 40 + 16), (d) the spec-spelled "Awards Information".
Capture: [img/homepage-desktop-1512-parity-260903.jpg](img/homepage-desktop-1512-parity-260903.jpg).

| Fix | Figma node | Before → after |
|---|---|---|
| Header nav items are 52px buttons, 16px padding, 0.1px tracking; selected = gold inset rule + glow | `186:1579/1587/1593` | text-only links → button boxes `260,14 152×52` = canvas |
| Language trigger: 24×24 icon box around the 20×15 flag, 0.15px tracking, chevron 1px into the group | `186:1696` | flag 21×16 free-floating → box; "VN" x exact at 1440 |
| Countdown digits DSEG7 Classic 49.152px/400 in 51.2×81.92 tiles | `186:2616/2617` | Montserrat 32px bold in 51×82 |
| Event-info row → note gap 8 (was 16); canvas copy | `2167:9053` | — |
| CTA pair 60px tall, 8px label→arrow gap, Kudos stroke as inset shadow | `2167:9063/9064` | 271×62 / 251×62 → 275×60 / 253×60 (276/254 in Figma; sub-px text metrics) |
| Root Further block 102 above / 32 between / 101 below; quote box 66px | `3204:10152` | +120/+120+80 → block height 1459 = canvas |
| Awards: header→grid 80, rows 80 apart, cards 336 with 108 gutters; sub-description removed | `2167:9068`, `2167:9074/9078` | 381-wide cards, 40/56 gaps → grid 1224×1144 = canvas |
| Card text: no 2-line clamp, no extra 8px above "Chi tiết", 0.15px tracking | `214:1020-1023` | — |
| Kudos promo 500 tall, content 64 in, logo lockup 364 wide at right 84 / top 215, 120 above / 124 below | `I3390:10349;313:8415` | 600 tall, 96 inset, 280-wide 80%-opacity lockup |
| Footer 144 tall incl. 1px top rule; links are 56px buttons with 16px padding, 0.15px tracking | `5001:14800` | no rule, text-only links |
