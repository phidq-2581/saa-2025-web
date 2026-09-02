# Feature F005_KudosCompose — Reading Guide

Promoted from `plans/260831-2303-saa-2025-web-kudos-round-2/spec/F005_KudosCompose/` at the
round's Phase 08 checkpoint. Mirrors `docs/features/F001_GoogleOAuthLogin/` file shape.

## Reading order

1. [business-context.md](business-context.md) — why this feature exists
2. [screens.md](screens.md) — what the user sees
3. [technical-spec.md](technical-spec.md) — how it works
4. [edge-cases.md](edge-cases.md) — what breaks

## Screens in this feature

| Screen | MoMorph | Spec source |
|---|---|---|
| Viết Kudo modal | [`ihQ26W78P2`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2) | `docs/momorph/viet-kudo/` (26 specs / 57 TC) |
| Add link sub-dialog (inside the editor's link tool) | [`OyDLDuSGEa`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/OyDLDuSGEa) | `docs/momorph/addlink-box/` (10 specs / 25 TC) |
| Hashtag picker dropdown (nested in the modal) | [`p9zO-c4a4x`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x) | `docs/momorph/dropdown-list-hashtag/` (10 specs, no TCs) |

Screen spec: [docs/screens/SCR007_KudosCompose/spec.md](../../screens/SCR007_KudosCompose/spec.md).

## Shared references

- Data model: [../../data-model.md](../../data-model.md) § Kudos Cluster (round 2) — `kudos`,
  `kudos_image`, `hashtag`, `kudos_hashtag`, storage bucket `images`, the `create_kudos` RPC.
- Clarifications: `plans/clarifications.md` § Session 2026-08-31 — Round 2 (authoritative; the
  spec drafts this feature was promoted from predate several of its rulings — see `## Notes` in
  `technical-spec.md` for what changed).
- `testPolicy`: **e2e-red-first** — `e2e/kudos-compose.spec.ts` (16 tests) plus the integration
  wiring in `e2e/kudos-integration.spec.ts` (real submit, item 2).

## Entry points

- FAB "Viết KUDOS" action — [docs/screens/SCR004_Fab/spec.md](../../screens/SCR004_Fab/spec.md)
  opens this feature's modal (wired since Phase 03/07 — see that screen spec's own update note).
- `/kudos` input pill — see [F006_KudosLiveBoard](../F006_KudosLiveBoard/screens.md).
- Both entry points render the same `ComposeDialogContainer`
  (`src/components/kudos/containers/compose-dialog-container.tsx`), so there is exactly one
  compose implementation regardless of which control opened it.
