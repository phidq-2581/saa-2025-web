---
status: implemented
authored_by: takumi
created: 2026-08-31
promoted: 2026-09-02
lang: en
---

## Why It Matters

SAA 2025's kudos culture depends on this modal: it is the only place a Sunner can write and
send a "lời cảm ơn" (kudos) to a colleague. Without it F006's live board has nothing to
display — every card, the highlight carousel, the spotlight word cloud, and the leaderboards
all read data this feature writes.

## Who Uses It

- **Sunner (sender)** — any signed-in Sunner; opens the modal from the FAB "Viết KUDOS" action
  or the `/kudos` input pill, writes a kudos, and sends it — optionally anonymously.
- **Sunner (recipient)** — chosen via the required recipient autocomplete; may also be
  `@mentioned` inline in the message body, independent of the recipient field.
- **Sunner (mentioned)** — anyone `@`-mentioned in the body via the TipTap mention extension;
  purely textual, does not receive a notification or role in this round (no notification
  system is wired to kudos — see Unresolved Questions).

## What They Do

1. A signed-in Sunner clicks "Viết KUDOS" (FAB) or the `/kudos` input pill; the modal opens.
2. They search and select a recipient (required, autocomplete over `profile`) — themselves
   excluded: selecting your own name still submits, but the server rejects the send (see
   `## Group-3 checkpoint: self-kudos is blocked` below).
3. They write the message in the TipTap editor — bold/italic/strike/ordered-list/quote
   formatting, an `@mention` autocomplete for colleagues, and a Link tool that opens the
   Addlink Box sub-dialog (Text 1–100 chars, URL http/https 5–2048 chars, both required).
4. They pick 1–5 hashtags from the seeded 13-tag list (dropdown-list-hashtag).
5. They optionally attach up to 5 images (jpg/png/webp, ≤5MB each).
6. They optionally toggle "Gửi ẩn danh" (send anonymously), which reveals a display-name field
   shown to the recipient instead of their real name — the real `sender_id` is still recorded
   (see `../../data-model.md` § Kudos Cluster).
7. "Gửi" stays disabled until recipient + content + ≥1 hashtag are all valid; clicking it shows
   a loading state, submits, and closes the modal on success. "Hủy" discards and closes
   immediately, no confirmation.

## Group-3 checkpoint: self-kudos is blocked

The spec/TC set is silent on sending a kudos to yourself; the Group-3 code review flagged it as
an unresolved gap (farming the 10/20/50 hoa-thị milestones). The checkpoint decision (2026-09-02,
`plans/clarifications.md`) settled it: **blocked**. `createKudos`
(`src/lib/kudos/write/create-kudos-action.ts`) rejects a request whose `receiverId` equals the
authenticated sender before any draft validation runs, returning the typed code
`self-kudos-not-allowed`; `ComposeDialogContainer` mirrors the same check client-side
(`isSelfKudos()`, `src/lib/kudos/write/validate-draft.ts`) for an immediate inline error
(`compose.selfKudosError`, "Không thể gửi Kudos cho chính mình.") before the network round trip.
No RLS/DB constraint backs it — `kudos_insert_own`'s `with check` only verifies `sender_id`, not
`sender_id <> receiver_id` — so the Server Action is the sole enforcement point.

## Unresolved Questions

- **No notification on mention/recipient**: `@mention` and "recipient selected" have no
  notification-system hook in this round (F002's notification bell badge is deferred per the
  2026-08-28 clarifications session) — a mentioned/recipient Sunner only learns about a kudos
  by browsing `/kudos`.
