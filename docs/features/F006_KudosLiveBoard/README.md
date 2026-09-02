# Feature F006_KudosLiveBoard — Reading Guide

Promoted from `plans/260831-2303-saa-2025-web-kudos-round-2/spec/F006_KudosLiveBoard/` at the
round's Phase 08 checkpoint. Mirrors `docs/features/F001_GoogleOAuthLogin/` file shape.

## Reading order

1. [business-context.md](business-context.md) — why this feature exists
2. [screens.md](screens.md) — what the user sees
3. [technical-spec.md](technical-spec.md) — how it works
4. [edge-cases.md](edge-cases.md) — what breaks

## Screens in this feature

| Screen | MoMorph | Spec source |
|---|---|---|
| Sun* Kudos Live board (`/kudos`) | [`MaZUn5xHXZ`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ) | `docs/momorph/sun-kudos-live-board/` (64 specs / 41 TC) |
| Hashtag filter dropdown | [`JWpsISMAaM`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JWpsISMAaM) | `docs/momorph/dropdown-hashtag-filter/` (4 specs, no TCs) |
| Phòng ban filter dropdown | [`WXK5AYB_rG`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/WXK5AYB_rG) | `docs/momorph/dropdown-phong-ban/` (4 specs, no TCs) |
| Kudos detail (minimal) `/kudos/[id]` | not in MoMorph (decision-sourced, `clarifications.md` Round 2) | reuses the feed card component |
| Profile stub `/profile?id={uuid}` | not in MoMorph (decision-sourced, `clarifications.md` Round 2) | minimal placeholder |

Screen spec: [docs/screens/SCR008_KudosLiveBoard/spec.md](../../screens/SCR008_KudosLiveBoard/spec.md).

## Shared references

- Data model: [../../data-model.md](../../data-model.md) § Kudos Cluster (round 2) — `kudos`,
  `heart`, `special_days`, `department`, `hashtag`, `secret_box_gift`, storage bucket `images`.
- Compose entry point: [F005_KudosCompose](../F005_KudosCompose/) (this board's input pill
  opens F005's modal — same trigger as the FAB).
- Clarifications: `plans/clarifications.md` § Session 2026-08-31 — Round 2 (authoritative; the
  spec drafts this feature was promoted from predate several of its rulings — see `## Notes` in
  `technical-spec.md`).
- `testPolicy`: **e2e-red-first** — `e2e/kudos-board.spec.ts`, `e2e/kudos-detail.spec.ts`, plus
  the integration wiring in `e2e/kudos-integration.spec.ts` and
  `e2e/kudos-integration-heart-filters.spec.ts`.

## Route

`/kudos`, `/kudos/[id]`, `/profile` — auth-guarded like every other private route (F001
BR-002_PublicRouteAllowList; none of the three are in `["/", "/login"]`, so `proxy.ts` already
covers them once the routes exist — no guard code was added this round).
