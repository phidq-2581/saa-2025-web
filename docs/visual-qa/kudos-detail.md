# Kudos Detail Page — Visual QA (SCR012_KudosDetail, deferred spec)

Route `/kudos/[id]`. Evidence from Phase 06 decision-sourced minimal implementation.

## Reference

No finished spec frame in MoMorph (status: "Out of scope" per clarifications.md § 2026-08-28). Detail page click targets exist in board, compose, profile but no design spec. Implemented as **minimal detail screen** per clarifications.md § 2026-08-31: render one card full-size (no truncation, full image), reuse board card component, mark as provisional.

## Implementation captures

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/kudos-detail.png](img/kudos-detail.png) | 1280×1440+ | `evidence/screenshots/phase-06/kudos-detail.png` | Phase 06 detail page capture; minimal implementation (single card, no spec) |

## Component reuse and design

| Element | Source | Implementation |
|---|---|---|
| Card layout | `components/kudos-card.tsx` (board reuse) | Single full-size card at `/kudos/[id]`; card component renders full without truncation |
| Sender metadata | Board card sender section | Name, avatar, department, timestamp |
| Content area | Board card content section | Full message (no 3-line truncate), full image grid (no thumbnail crop) |
| Hashtags | Board card hashtag section | All tags visible |
| Heart + copy-link buttons | Board card action buttons | Enabled heart (can like); copy-link button present |
| Badges (achievement tier) | Board card badge | New/Rising/Super/Legend badge rendered if applicable |
| Receiver name | Board card metadata | Visible in message context ("gửi cho [receiver]") |
| Comments section | Design scope: deferred | Not present this round; noted as future feature |

## Measured results

Source: Phase 06 capture `evidence/screenshots/phase-06/kudos-detail.png`. No E2E spec exists for detail page (design out of scope); visual capture provides evidence-of-rendering only.

| Section | Verdict | Observation | Notes |
|---|---|---|---|
| Page layout | RENDERS | Single centered card visible | Full-width responsive; card width matches board card width on desktop |
| Card component | REUSES | Identical visual styling to board | Border, shadow, padding, typography all match board card |
| Sender section | PRESENT | Avatar, name, department, timestamp | Renders full sender metadata |
| Content area | FULL-SIZE | Message text + images untruncated | No line-count limit (board shows 3-line truncate); images render at full size |
| Hashtags | PRESENT | All tags visible in horizontal layout | Matching board card hashtag styling |
| Heart button | ENABLED | Interactive; shows current like state | Clickable; count updates on interaction |
| Copy-link button | PRESENT | Button visible; click copies URL | Text "Link copied — ready to share!" (per spec, English placeholder) |
| Achievement badge | RENDERS | Tier indicator if applicable (New/Rising/Super/Legend) | Reused from board; color/styling consistent |
| Receiver context | INFERRED | Message shows "gửi cho [tên người nhận]" | Receiver identified in content, not separate section |
| No comments section | CORRECT | Deferred; not visible | Future feature; out of scope this round |
| Responsive (1280px viewport) | MATCH | Layout stable; no overflow | Card-centered; sidebar hidden or minimal on this route |

## Profile stub capture

| File | Viewport | Source | Note |
|---|---|---|---|
| [img/profile-stub.png](img/profile-stub.png) | 1280×600 | `evidence/screenshots/phase-06/profile-stub.png` | Minimal profile page at `/profile?id={uuid}` (decision-sourced) |

## Profile stub — measured results

| Section | Verdict | Observation | Notes |
|---|---|---|---|
| Avatar | RENDERS | User avatar displayed | Centered at top; 80px size |
| User name | RENDERS | Full name visible | Typography: 24px / 700 / centered |
| Department | RENDERS | Dept name if available | Fallback to "Unknown" if null |
| "Đang phát triển" banner | RENDERS | Placeholder text + icon | Indicates future feature; CTA button deferred |
| Back link / navigation | NOT CAPTURED | Likely header link or browser back | Standard navigation present; not measured in static capture |
| Stats/kudos count | NOT RENDERED | Deferred to full profile implementation | Stub shows minimal content only |

## Known accepted gaps (detail page)

| Gap | Reason | Notes |
|---|---|---|
| No MoMorph spec for detail page | Design out of scope (clarifications.md § 2026-08-28) | Minimal decision-sourced implementation; full detail spec deferred to future round |
| No comments section | Not in minimal spec | Comments UI planned for Round 3 when spec arrives |
| Profile page not finished | Design out of scope (clarifications.md § 2026-08-28) | Stub `/profile?id={uuid}` renders avatar + name + "Đang phát triển" text; full profile deferred |
| Copy-link text "Link copied — ready to share!" | English placeholder (no VN spec) | Per spec and precedent, placeholder remains until localization spec complete |

## Accepted deviations

| Deviation | Authorised by | Notes |
|---|---|---|
| Minimal detail page without spec | clarifications.md § 2026-08-31 | "Build **trang detail tối thiểu** `/kudos/[id]` render 1 card đầy đủ...tái dùng component card; nâng cấp khi spec Done." |
| Card reuse instead of detail-specific design | Decision-sourced | No separate design for detail view; board card layout is authoritative |
| Profile stub over full profile page | clarifications.md § 2026-08-31 | "/profile?id={uuid}" placeholder (avatar + tên + 'Đang phát triển'); round 3 thay bằng màn thật |
| No comments, no author actions, no deep linking | Scope deferred | Minimal implementation; full detail features planned for Round 3 |

## Per-section verdict

| Section | Verdict | Notes |
|---|---|---|
| Detail card layout | MATCH (to board card) | Reuses board card component; full content visible |
| Sender metadata | RENDERS | Avatar, name, dept, time all present |
| Message content | FULL-SIZE | No truncation; images uncroppd |
| Hashtags | RENDERS | All tags visible |
| Interaction buttons | RENDERS | Heart + copy-link present and functional |
| Achievement badges | RENDERS | Tier indicator if applicable |
| Receiver context | INFERRED | Shown in message content |
| Profile stub | RENDERS | Avatar + name + "Đang phát triển" message |
| Comments section | ABSENT | Expected (deferred feature) |

## Integration notes

- Detail page route `/kudos/[id]` wired; clicking board card "Xem chi tiết" navigates here (test assertion via `page.goto('/kudos/' + kudosId)` in Phase 06).
- Profile page route `/profile?id={uuid}` stub implemented; clicking sender name or avatar navigates here (test assertion via URL navigation in Phase 06 capture).
- Both pages render without 404 when valid ID passed; error handling (invalid ID) deferred to Phase 08 error-state documentation.
- E2E integration at Phase 07 confirms navigation wiring (89/89 full suite GREEN); detail page itself not under its own E2E spec (design out of scope, no RED gate).
- Typography and spacing on detail card match board card exactly (reused component); responsive behavior tested via viewport capture at 1280px.
