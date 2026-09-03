# Thể lệ panel — Visual QA (MoMorph `b1Filzi9i6`, frame 3204:6051)

Delivered 2026-09-03 (evening), e2e-red-first. Opened by the footer's "Tiêu chuẩn chung", the FAB's
"Thể lệ" and the compose toolbar's "Tiêu chuẩn cộng đồng" (`plans/clarifications.md` § 2026-09-03
evening). Code: `src/components/rules/*`, copy in `messages/{vi,en}/rules.json`.

## Reference

| Frame | Size | Note |
|---|---|---|
| Thể lệ UPDATE (`b1Filzi9i6`) | 1440×1796 canvas; drawer `3204:6052` at x887, 553×1410 | canvas draws the drawer at its content height; the app's drawer is viewport-high with internal scroll (spec A: "scroll khi quá dài") |

## Implementation capture

| File | Viewport | Note |
|---|---|---|
| [img/rules-panel-desktop-1440x1410-260903.jpg](img/rules-panel-desktop-1440x1410-260903.jpg) | 1440×1410, guest, opened from the footer | "Viết KUDOS" in its disabled state; REVIVAL badge ring-only (export pending) |

## Measured results

Method as in `homepage.md`: the frame's 29 `TEXT` nodes joined to a DOM dump of the open panel at
1440×1410. Drawer box `887,0 553×1410` = canvas. Every text node lands at the canvas x/y; the only
rows the joiner flags are button/pill boxes matched against the text inside them (e.g. "Đóng" text
966,1330 inside the 927,1314 94×56 button — both as designed). Canvas quirks reproduced on purpose:
72px tier rows (44px description boxes around 40px of text), 59px sender heading, 120px / 96px
paragraph boxes where the canvas ends on an empty line, per-tier pill label sizes
(13.205 / 13.159 / 13.476 / 14.845px).

| Element | Figma node | Result |
|---|---|---|
| Drawer 553 wide, `#00070C`, padding 24 40 40 40, content/footer space-between | `3204:6052` | MATCH |
| Title 45/700/52 gold; headings 22/700/28 gold; paragraphs 16/700/24 0.5px justified | `3204:6055`, `6132`, `6077`, `6133`… | MATCH |
| 4 Hero tiers: 126×22 pill (shared `HeroTierBadge` md) + range text 8px right, 2-line 14px description, 20px inset | `3204:6161…6191` | MATCH |
| 6 badges: 64px ring cropped from the 80×N export, 8px, real-text label 12/11px; rows 377 wide space-between, 16 apart | `3204:6079…6088` | MATCH (REVIVAL art pending export) |
| Footer: "Đóng" 94×56 inset stroke, "Viết KUDOS" 363×56 gold, gap 16 | `3204:6092…6094` | MATCH |

## Behaviour evidence

`e2e/rules-panel.spec.ts` — RED first (`npx playwright test rules-panel.spec.ts`, exit 1, 5 failing on
the missing `rules-panel` testid), GREEN after implementation (5/5, same command): open from footer,
every declared element present, scrolls to its end, "Đóng" closes, Escape closes, guest "Viết KUDOS"
disabled + dimmed + inert. FAB and toolbar triggers (signed-in) go through the same `RulesPanelProvider`; verified with the
viewer's real session on 2026-09-03: FAB "Thể lệ" opens the panel, its enabled "Viết KUDOS" closes it
and opens the compose dialog, the compose toolbar's "Tiêu chuẩn cộng đồng" reopens the panel above
the dialog (z-index 30 over 20), and "Đóng" leaves the dialog open. Not in the guest e2e spec.

## Accepted deviations

| Deviation | Authorised by |
|---|---|
| Backdrop, click-outside and Escape close, initial focus on "Đóng" — not on the canvas | clarifications 2026-09-03 evening |
| Disabled dim = 60% opacity (spec says "mờ", no value) | same |
| REVIVAL badge artwork missing until exported from Figma (`3204:6082` → `public/rules/badge-revival.png`) | same |
| Pill backgrounds are the card pill's flat `rgba(9,36,50,.5)`; the canvas paints a texture image in each pill (no exportable asset) | inherited from the card badge |
