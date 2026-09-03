# Login — Visual QA (SCR001_Login)

Route `/login`. Evidence from Phase 04 (`plans/260828-1257-saa-2025-web-login-homepage-awards/`)
and re-verified in Phase 07 after auth wiring landed.

## Reference

| Frame | Size | File |
|---|---|---|
| Login (`GzbNeVGJHz`) | 1440×1024 | [img/ref-login.jpg](img/ref-login.jpg) |
| Dropdown-ngôn ngữ (`hUyaaugye2`, shared with header) | 215×304 crop | [img/ref-dropdown-language.png](img/ref-dropdown-language.png) |

## Implementation captures

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/login-desktop-1440x1024.png](img/login-desktop-1440x1024.png) | 1440×1024 | `evidence/screenshots/phase-07/login-after-wiring.png` | Post-integration capture (Google button wired, metadata title added); layout identical to Phase 04's own `login-desktop.png` |
| [img/login-desktop-error.png](img/login-desktop-error.png) | 1440×900 | `evidence/screenshots/phase-04/login-desktop-error.png` | `/login?error=domain` |
| [img/login-mobile-390x844.png](img/login-mobile-390x844.png) | 390×844 | `evidence/screenshots/phase-04/login-mobile.png` | |

## MoMorph node values used

| Element | Value | Node / source |
|---|---|---|
| Header background | `rgba(11,15,18,.8)` | `list_frame_styles("GzbNeVGJHz")` |
| Google button child order | text `SPAN` before icon `SVG` | `get_frame_node_tree` child order on the button node |
| Hero keyvisual | node `662:14389` ("image 1", 1441×1022 at y2) | no `MM_MEDIA_*` tag; `get_media_file` → 401, `get_figma_image` → 500 — awaits a manual Figma export to `public/login/keyvisual-bg.png` (clarifications.md 2026-09-03); painted as a `cover` CSS background so the page degrades to the canvas colour until then |

## Measured results

Source: `evidence/green-phase-04.json` → `visualVerdict` (re-verified pass).

| Section | Verdict | Note |
|---|---|---|
| Header | MATCH | Logo left, language trigger (VN + flag) right, dark background `rgba(11,15,18,.8)` |
| Hero title | MATCH | `ROOT FURTHER`, white, large bold, left-aligned |
| Hero subtitle | MATCH | Both tagline lines visible |
| Google button | MATCH | Gold `#ffea9e` background; DOM order confirmed text (`x=184`) before icon (`x=416`); form submit button |
| Error state | MATCH | `/login?error=domain` shows the red error copy; button stays enabled |
| Footer | MATCH | Copyright line centered |
| Language dropdown | MATCH | Opens to show VN (selected) and EN |
| Mobile layout (390×844) | MATCH | Text stacks, header/footer sticky, button full-width |
| Keyvisual area | **KNOWN_GAP** | Artwork not exportable — see below |

Neighbour suites also green at this checkpoint: `auth-guard.spec.ts` 5/5, `navigation-shell.spec.ts` 5/5.

## Corrections history

- **Google button element order.** The first verification round marked the button MATCH on presence
  alone, without checking child order. The phase's own forge note records the actual defect: the
  implementation had the icon leading, but the reference frame shows text first. Caught by
  orchestrator image comparison; the fix was returned to `momorph-ui-implementer` with instruction
  to read the child order from `get_frame_node_tree` before editing. The re-verification pass
  confirmed the corrected DOM order (`SPAN` at `x=184`, `SVG` at `x=416`).
- **Screenshot viewport.** Re-captured at the MoMorph frame's own size, 1440×1024 (the first capture
  used 1440×900), for an accurate hero-proportion comparison.

## Known gap

- **Hero keyvisual artwork (node `662:14388`).** MoMorph has no media URL for this node and
  `get_media_file` returns 401; the design's colorful wave-pattern background could not be exported.
  Rendered as a flat `--color-canvas` fill inside `[data-testid="login-keyvisual"]`. No other visual
  element is affected. Authorised as an accepted deviation in `plans/clarifications.md` §
  2026-08-28 Group 3 checkpoint (see [README.md](README.md) § Accepted deviations); listed again
  here as a known gap because it is a visual absence, not a design choice — the designer still owes
  a PNG export.

## Out of scope for this page

Login body-copy i18n (EN mirror) is a chrome/metadata-only change through Phase 07b — no separate
error-state or hero screenshot was captured in EN this round; `login-error-notice.tsx` now reads its
copy via `useTranslations("login")` with a Vietnamese fallback where no Figma EN source exists (see
`plans/clarifications.md` § 2026-08-30).

## Pixel-parity pass (2026-09-03)

Method as in `homepage.md`: the 4 Figma `TEXT` nodes of `list_frame_styles("GzbNeVGJHz")` joined to a
1440×1024 Playwright DOM dump. Before: 0/4 matched (content block 112px too high, "VN" 3px left).
After: 3/4 exact; the copyright line differs only in Figma's 11px text-box quirk (its centre, 978.5,
matches). Capture:
[img/login-desktop-1440x1024-parity-260903.jpg](img/login-desktop-1440x1024-parity-260903.jpg).

| Fix | Figma node | Detail |
|---|---|---|
| Content block vertically centred in Bìa | `662:14393` → `662:14394` | Bìa is y88–933 (8px under the fixed header, padding 96/144); Frame 487 fills it and centres its two children 80px apart — wordmark now at y288/289 (was 176), copy at 568/569, button at 672/673 |
| Intro copy box 480×80 | `662:14753` | explicit width (was shrink-wrapped to 476) |
| Footer 91px tall, line centred | `662:14447` | was 105 (40+24+40+1) |
| Keyvisual + both gradient covers moved to `(auth)/layout.tsx` behind header/main/footer | `662:14388/14392/14390` | they span the full canvas including the footer strip; new `login-keyvisual.tsx` |
| Language trigger geometry | shared with header — see `homepage.md` | flag box 1206,33 20×15 and "VN" 1232 exact |

Still open: the keyvisual PNG itself (export pending, see the node table above).
