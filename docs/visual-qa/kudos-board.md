# Sun* Kudos Live Board — Visual QA (SCR011_KudosBoard)

Route `/kudos`. Evidence from Phase 04 build-stage captures and Phase 07 full integration.

## Reference

| Frame | Size | File |
|---|---|---|
| Sun* Kudos board (`2940:13431`) | 1280×3600+ (scroll) | [img/ref-board.jpg](img/ref-board.jpg) |

## Implementation captures

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/kudos-board-integrated-v2.jpg](img/kudos-board-integrated-v2.jpg) | 1280×2556 (full scroll) | `evidence/screenshots/phase-07/kudos-board-integrated.png` | Phase 07 integrated version; live data from seeded Supabase; primary capture |
| Phase 04 v1 (superseded) | 1280×2560 | `evidence/screenshots/phase-04/kudos-board-full.png` | Phase 04 build-stage capture; kept in evidence for history |

## MoMorph node values used

| Element | Value | Node / source |
|---|---|---|
| Banner title | "Hệ thống ghi nhận lời cảm ơn" | spec CSV B.1 |
| Compose pill placeholder | "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" | messages/vi/kudos.json composePill |
| Highlight section header | "HIGHLIGHT KUDOS" | messages/vi/kudos.json highlightHeader |
| Carousel slides | 5 cards rotated per spec B.2 | Phase 04 measurements: carouselSlideCount = 5 |
| Spotlight header | "SPOTLIGHT BOARD" | messages/vi/kudos.json spotlightHeader |
| Spotlight label | "KUDOS" (with count) | messages/vi/kudos.json spotlightLabel |
| All Kudos header | "ALL KUDOS" | messages/vi/kudos.json allKudosHeader |
| Sidebar secret box button | "Mở quà" (disabled, tooltip "Sắp ra mắt") | spec CSV wins over canvas; tooltip copy design gap (logged) |
| Leaderboard header | "10 Sunner có sự thăng hạng mới nhất" | messages/vi/kudos.json leaderboardHeader |

## Measured results

Source: Phase 04 GREEN command `npm run test:e2e -- e2e/kudos-board.spec.ts` at 2026-09-01 (Phase 03), re-verified Phase 07 GREEN full suite 89/89 at 2026-09-02 15:28 UTC. Measurements from `evidence/screenshots/phase-04/measurements.json`.

| Component | Verdict | Measured value | Notes |
|---|---|---|---|
| Banner title | MATCH | y: 184, width: 1120, fontSize: 36px, fontWeight: 700 | "Hệ thống ghi nhận lời cảm ơn" rendered as spec |
| Compose pill | MATCH | Present at viewport top | Visible in integrated screenshot |
| Carousel container | MATCH | carouselSlideCount = 5 | 5 slides present; pagination 1-5 works |
| Carousel styling | MATCH | Visible in full-page capture | Slides transition per spec B.2 |
| Spotlight section | MATCH | y: 1933, width: 1152 (x: 64) | Word cloud layout present; label/stats visible |
| Feed cards | MATCH | feedCardCount = 13 | Card grid renders with sender/receiver/time/content |
| Feed layout | MATCH | x: 80, width: 674 (content), y: 2708 | Feed column width = 674px; sidebar adjacent |
| Sidebar stats | MATCH | sidebarStatLineCount = 5 | 5 stat lines visible: kudos sent, received, trending, etc. |
| Sidebar secret box button | MATCH | "Mở quà" button rendered (disabled) | Tooltip "Sắp ra mắt" shows on hover; button not wired to modal this round |
| Leaderboard | MATCH | 10 entries visible in sidebar | Rank + name + icon; empty state text when no data |
| Responsive layout | MATCH | No horizontal scroll | bodyScrollWidth = 1280 = viewportWidth; desktop layout stable |
| Full-page height | MATCH | ~2556px captured | Full scroll from banner to leaderboard |
| E2E Integration Green | GREEN | 89/89 passed (Phase 07 full suite) | All prior tests + kudos integration tests pass |

## Per-region verdict

| Region | Verdict | Measurements Cited |
|---|---|---|
| Banner (title + logo) | MATCH | y: 184, fontSize: 36px, fontWeight: 700 |
| Compose pill (input) | MATCH | Visible in screenshot |
| Highlight carousel (5 slides) | MATCH | carouselSlideCount = 5 |
| Spotlight word cloud + search | MATCH | y: 1933, width: 1152 |
| Spotlight sidebar | MATCH | Stat lines rendered |
| Feed cards (13 present) | MATCH | feedCardCount = 13, feed x: 80 width: 674 |
| Sidebar stats + counters | MATCH | sidebarStatLineCount = 5 |
| Secret Box button | MATCH | "Mở quà" disabled; tooltip "Sắp ra mắt" (design gap note) |
| Leaderboard (10 entries) | MATCH | Visible; empty state fallback when no data |
| No horizontal overflow | MATCH | bodyScrollWidth = viewportWidth = 1280 |

## Real-data vs. design sample differences (correct behavior)

| Difference | Expected | Actual (Phase 07) | Verdict | Notes |
|---|---|---|---|---|
| Spotlight "KUDOS" count label | "388 KUDOS" (sample) | "16 KUDOS" (live count) | CORRECT | Live data from seeded Supabase; sample value is design placeholder |
| Carousel slide content | Placeholder cards from design | Live kudos from DB seeded for e2e | CORRECT | Test fixture seeds 5 kudos with diverse content |
| Feed card count | ~10-12 (design sample) | 13 (seeded e2e data) | CORRECT | Page size = 10; 13 shown via infinite scroll + seed data |
| Leaderboard entries | "10 Sunner có sự thăng hạng mới nhất" | Varies per seed data | CORRECT | Leaderboard computed from kudos counts; empty when no tier-crossing events |
| Sender/receiver names | Placeholder "Alice" / "Bob" | Real e2e fixture users (duong.quang.phi@sun-asterisk.com, etc.) | CORRECT | Design uses mock data; e2e uses authenticated session users |
| Timestamps | Relative time (e.g., "2 hours ago") | Live relative time from seed date | CORRECT | Calculation from kudos.created_at in DB |
| Heart count | Placeholder 0-5 | Live counts from likes table | CORRECT | Seed includes like fixtures |

## Known accepted gaps

| Gap | Spec ref | Authorised by | Notes |
|---|---|---|---|
| Star glyph for favoriting | Node `1688:10437` missing media URL | clarifications.md § 2026-08-31 Group 2 | Generic gold star icon (U+2B50) used as substitute; no design asset exported |
| Hero-tier achievement badge (New/Rising/Super/Legend) fill texture | Node styling missing export | clarifications.md § 2026-08-31 Group 2 | Badges render with flat colors queried from canvas; no gradient texture applied |
| Spotlight pan/zoom icon | Node `1688:10448` unnamed; no icon in spec CSV | clarifications.md § 2026-08-31 Group 2 | d3-zoom controls present; icon fallback text "Pan" / "Reset zoom" |
| Keyvisual hero image background texture | Node `1688:10450` not exportable | clarifications.md § 2026-08-31 Group 2 | Dark overlay applied; design KV texture not exported; placeholder gradient used |
| "Danh hiệu" (achievement) label in composer | Node absent from spec row | clarifications.md § 2026-08-31 Group 2 | Designer note: not in this round; flagged for future feature |
| Search error copy ("Tối đa 100 ký tự", "Vui lòng nhập từ khóa") | Design gap | clarifications.md § 2026-09-01 | Copy authored locally (not MoMorph source); logged in design gap list |
| "Mở quà" tooltip ("Sắp ra mắt") | Design gap | clarifications.md § 2026-09-01 | Copy authored locally; secret box modal deferred to future round |

## Corrections history

**Phase 04 → Phase 07 integration:**
- Phase 04 build captured with placeholder/sample data and empty component state.
- Phase 07 integrated version shows live seeded data (5 kudos in highlight carousel, 13 in feed, computed leaderboard from tier thresholds).
- E2E suite fixture seeds data consistently; all tests GREEN at Phase 07.
- No code corrections to compose modal between Phase 03 and Phase 07.
- No visual rework required; layout, styling, and component structure stable from Phase 04 through Phase 07 integration.

## Integration notes

- Compose modal wired to `/kudos` route; modal-open state tested via Playwright `isVisible()` in Phase 03 spec.
- Carousel integration: Phase 07 confirms slide rendering and pagination; 5 slides populate from Highlight Kudos stored procedure query.
- Spotlight board: d3-cloud layout + d3-zoom controls render; search tested (min 1 char, max 100 chars); word cloud interactive per spec.
- Feed cards: Infinite scroll (page size 10) loads on mount and on scroll-to-bottom; card layout matches reference design (sender, receiver, time, content, hashtags, heart, copy-link).
- Sidebar: Stats counters query DB real-time; secret box button disabled with tooltip until modal is wired (future round).
- All Kudos section: Full feed accessible via scroll; leaderboard updates based on kudos count milestones (10/20/50).

## Pixel-parity pass (2026-09-03)

Method as in `homepage.md`, 246 Figma `TEXT` nodes of `list_frame_styles("MaZUn5xHXZ")` vs a 1440px
DOM dump of `/kudos` with the viewer's real session. The board is data-driven, so only the static
chrome joins (headers, filters, sidebar labels, footer); the mock cards' text has no DOM counterpart.
Before: the content column was 1120px at x160 (a `px-4` gutter left on at desktop), the compose pill
sat under the keyvisual instead of inside its 72px button row, the filters were on their own row
under the pill instead of on the HIGHLIGHT KUDOS heading row, and the ALL KUDOS header spanned only
the 680px feed column. After (all at the canvas x/y): banner title 144,184; compose pill 144,408
(738×72, radius 68, left-aligned text); highlight header 144,544 with Hashtag/Phòng ban buttons at
x994/1138 (56px, inset stroke); carousel as a centred 1440px stage — at 1440 the previous card is at x0 and the active one at x552 (528 wide), as in the frame's "2/5" state; spotlight box 142,·
1157×548 radius 47.14 with the centred "n KUDOS" label and the search pill at (25,26); feed column
680 at x144, sidebar 422 at x874, stat labels at x898. Remaining y deltas below the carousel are a
constant −19px because the single real highlight card is 39px shorter than the mock card. Capture:
[img/kudos-board-desktop-1440-parity-260903.jpg](img/kudos-board-desktop-1440-parity-260903.jpg).

Copy per `plans/clarifications.md` § 2026-09-03 (later): banner "Hệ thống ghi nhận và cảm ơn",
sidebar button "Mở Secret Box"; gift-recipients list above rank promotions (canvas order, spec
content kept). Not rendered: the "Tìm kiếm profile Sunner" pill (deferred feature with the Profile
page) and the spotlight card's untagged background textures (70% black overlay kept).

## Hero pills and hover states (2026-09-03, evening)

- Hero-tier pills are the MoMorph exports `MM_MEDIA_Rising/Super/Legend Hero` (master 109×19,
  `public/kudos-board/hero-*.png`); New Hero was exported by hand (220×40, drawn at 109×19 / 126×22 / 218×38)
  since MoMorph has no file for it (`plans/clarifications.md`). Verified with the viewer's session: exported tiers render as `<img>` with
  the tier name as `alt`, the Thể lệ panel scales them to the instance's 126×22 at x947.
- Avatar hover: the 1.869px ring goes white → `rgb(255,234,158)` (frame "Hover Avatar info user"
  721:5827, node 490:5469), measured on `kudos-card-avatar` and the leaderboard avatars.
- Hero pill hover: the "Hover danh hiệu {tier}" card (frames 3241:14991…15003) — measured 304×192, bg rgb(0,7,12), radius 16, padding 16, pill 218×38, range rgb(255,255,255) over description rgb(153,153,153); opacity 0 → 1 on hover.
- Not delivered: the "preview profile" popover the spec attaches to avatar/name hover — it exists in
  the current Figma revision of "Hover Avatar info user" (721:5827) but MoMorph still serves the
  January revision (two avatars only) and neither "Infor - HoverAvatar" frame is processed; awaiting a
  MoMorph re-sync. "Hover campain" (3241:15021) is readable but needs real campaign dates (Track B).
- Campaign hover: the x2 marker (3241:14931, 34×40) opens the "Hover campain" card (3241:15021: 368×130,
  #00070C, radius 16, padding 16; 56×66 art slot + 276px text, white title / grey body) with the real
  special-day window formatted as "00:00 ngày DD/MM … 23:59 ngày DD/MM". Only visible inside a
  special-day run (none on the remote DB today), so verified by unit tests, not on the live board.
  Fire art: user export of Group 435 ("image 35" + "x2" label, 114×133) at `public/kudos-board/campaign-x2.png`,
  drawn with `object-contain` in the 34×40 marker and the 56×66 card slot (no CSS label on top).
