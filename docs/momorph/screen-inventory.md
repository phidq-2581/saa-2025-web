# Screen inventory — SAA 2025 Web

Source: MoMorph MCP, fileKey `9ypp4enmFmdK3YAFJLIu6C`, fetched 2026-08-28.
Selection: all frames with `spec_status = done` excluding the `[iOS]` set (Native-app page).

| metric | value |
|---|---|
| Frames in file | 174 |
| `[iOS]` frames (Native-app) | 38 |
| Non-iOS frames | 136 |
| Non-iOS with `spec_status = done` | **18** ← scope |
| Spec rows read | 252 |
| Test-case rows read | 292 |

> **Caveat on the "Website" page filter.** MoMorph MCP exposes no Figma page name —
> `get_frame`, `get_frame_node_tree`, `query_section` are all frame-scoped, `list_frame_sets`
> returns empty, and `list_frames` has no page filter. This table is therefore *all* non-iOS
> spec-done frames, a superset that cannot miss a Website screen but may include a stray.
> Confirm against **MoMorph: Filter Screens** in the VSCode extension if exactness matters.

## Pages

| screenId | Screen | Route (evidence) | Kind | Data entities | TC | Depends on |
|---|---|---|---|---|---|---|
| `GzbNeVGJHz` | Login | `/login` — Profile TC_WEB_PROFILE_ACC_001 "redirected to /login" | behavioral | profile, session | 17 | — (entry) |
| `i87tDx10uM` | Homepage SAA | `/` — Homepage ID-0 "URL: / (homepage)" | behavioral | event config, notification, profile, award category | 62 | Hệ thống giải, Kudos board, Viết Kudo, lang/profile dropdowns |
| `zFYDgyj_pD` | Hệ thống giải | `/he-thong-giai` — TC ID-0/ID-1 name it verbatim | behavioral (scroll-spy) | award category (static ×6) | 15 | Kudos board (CTA "Chi tiết") |
| `MaZUn5xHXZ` | Sun* Kudos — Live board | `/kudos` — Profile TC_WEB_PROFILE_GUI_006 compares "the same Kudo on /kudos" | behavioral (heavy) | kudos, profile, hashtag, department, heart, secret_box, badge | 41 | Viết Kudo, Profile, Open secret box, hashtag/dept dropdowns |
| `3FoIx6ALVb` | Profile bản thân | `/profile` and `/profile?id={uuid}` — TC_WEB_PROFILE_FUN_001..005 | behavioral | profile, kudos, heart, badge, secret_box | 30 | Viết Kudo (write bar), Kudos board (hashtag) |
| `ihQ26W78P2` | Viết Kudo | modal — no standalone route in any spec | behavioral (heavy) | kudos, profile, hashtag, image | 57 | Addlink Box, Dropdown list hashtag |
| `b1Filzi9i6` | Thể lệ UPDATE | modal/panel — no route in spec | behavioral (open/close/scroll) | static rules content, badge ×6 | 9 | Viết Kudo |
| `J3-4YFIpMM` | Open secret box — chưa mở | modal — no route in spec | behavioral | secret_box, badge | 19 | — |
| `8PJQswPZmU` | Countdown — Prelaunch page | **undefined** — no route in spec or TC | behavioral | event config (target datetime) | 17 | Locks navigation to every other page until 0 |

## Components and overlays

| screenId | Component | Kind | Data entities | TC | Used by |
|---|---|---|---|---|---|
| `OyDLDuSGEa` | Addlink Box | behavioral (validation) | link {text 1–100, url 5–2048} | **25** | Viết Kudo → toolbar Link button |
| `JWpsISMAaM` | Dropdown Hashtag filter | static+behavioral | hashtag (13 listed) | 0 | Kudos board filter |
| `p9zO-c4a4x` | Dropdown list hashtag | behavioral (max 5 select) | hashtag | 0 | Viết Kudo → "+ Hashtag" |
| `WXK5AYB_rG` | Dropdown Phòng ban | static+behavioral | department (~50 listed) | 0 | Kudos board filter |
| `hUyaaugye2` | Dropdown-ngôn ngữ | behavioral | locale VN/EN | 0 | Header (all pages), Login |
| `z4sCl3_Qtk` | Dropdown-profile | behavioral | session | 0 | Header — regular user |
| `54rekaCHG1` | Dropdown-profile Admin | behavioral | session, role | 0 | Header — admin user |
| `_hphd32jN2` | Floating Action Button | behavioral | — | 0 | Homepage, Kudos board |
| `Sv7DFwBw1h` | Floating Action Button 2 | behavioral | — | 0 | Expanded state of the FAB above |

## Referenced but NOT in scope (no finished spec)

These are named by in-scope specs/test cases yet have `spec_status` of `none` or `in_progress`:

| Referenced target | Referenced by | Status in MoMorph |
|---|---|---|
| **Kudos detail page** ("Xem chi tiết") | Live board ×6, Homepage, Spotlight node click | no frame with done spec |
| Awards Information | Homepage header + footer + 6 award cards (with hash anchor) | possibly = Hệ thống giải — unconfirmed |
| Notification panel / Tất cả thông báo | Homepage A1.6, TC ID-27 | `none` |
| Admin Dashboard | Dropdown-profile Admin A.2 (spec itself says "TODO: route chưa xác định") | `none` |
| Error page 403 / 404 | Profile TC_WEB_PROFILE_FUN_003/004 expect a 404 page | `in_progress` |
| Profile người khác | covered by `/profile?id=` on Profile bản thân | `none` |

## Risk ranking

1. **Sun* Kudos — Live board** (64 specs / 41 TC). Largest surface by far: highlight carousel,
   Spotlight word-cloud with pan/zoom + search, infinite-scroll feed, two filters that drive both
   sections at once, heart rules with a special-day double-count, sidebar with two leaderboards.
   The Spotlight word cloud has no library named and no layout algorithm specified.
2. **Viết Kudo** (57 TC). Rich-text editor (bold/italic/stroke/list/link/quote), `@` mention
   autocomplete, hashtag chips max 5, image upload max 5, anonymous toggle revealing a name field.
   No editor library named; no image size/dimension limit given; no upload endpoint.
3. **Profile bản thân** (30 TC). Its 28 spec rows are **titles only — every description is empty**,
   so the entire screen definition lives in the test cases, which reference an implementation that
   does not exist in this repo (`proxy.ts`, `PUBLIC_ROUTES`, `app/kudos/use-board-interactions.ts`,
   "the plan's clarifications.md"). Also carries the sharpest security rule in the whole set
   (TC_WEB_PROFILE_SEC_001: never expose another Sunner's sent count — it would leak anonymous sends).
4. **Homepage SAA** (46 specs / 62 TC). Breadth rather than depth, but it owns the shared Header
   and Footer that every other page reuses, so its component contract is on the critical path.
5. **Countdown — Prelaunch page**. Small, but it claims the power to lock navigation site-wide and
   has no route, no API and an explicit `TODO` in its own `databaseNote`.
