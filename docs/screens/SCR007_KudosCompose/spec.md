---
status: implemented
fcode: F005
authored_by: takumi
created: 2026-09-02
---

# SCR007_KudosCompose — Screen Spec

**Screen**: SCR007_KudosCompose: Viết Kudo modal
**Feature**: F005_KudosCompose
**Type**: atomic (modal, not a routed page)
**Route**: N/A — overlay opened from the FAB "Viết KUDOS" action (`docs/screens/SCR004_Fab/spec.md`)
or the `/kudos` input pill; both mount the same `ComposeDialogContainer`
**MoMorph**: [`ihQ26W78P2`](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2)
**Generated**: 2026-09-02

## Purpose

Lets a signed-in Sunner compose and send a kudos to a colleague — pick a recipient, write a
formatted message, tag hashtags, optionally attach images or send anonymously.

## Screen Layout

A centered modal dialog (`role="dialog"`, `aria-modal="true"`) over a dimmed backdrop. Fields
stack top to bottom: title, recipient search, TipTap editor with a formatting toolbar, hashtag
picker, image attachment grid, anonymous-send checkbox, then a Hủy/Gửi footer. Two sub-dialogs
nest inside it: the Add link box (from the toolbar's link button) and the hashtag picker
dropdown.

### Layout Sketch

```
┌──────────────────────────────────────────────┐
│  R1: Title "Gửi lời cám ơn..."                │
├──────────────────────────────────────────────┤
│  R2: Recipient search (required)              │
│  R3: TipTap editor + toolbar (B/I/S/list/     │
│      link/quote) — required                   │
│  R4: Hashtag picker + chips (1-5, required)   │
│  R5: Image attachment grid (0-5, optional)     │
│  R6: "Gửi ẩn danh" checkbox + name field       │
├──────────────────────────────────────────────┤
│  R7: Footer — Hủy | Gửi (disabled until valid) │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|-----------------|----------------------|
| R1 | Title | top, centered | no | static text | not specified by design |
| R2 | Recipient search | below title | no | search input + autocomplete dropdown | not specified by design |
| R3 | Editor + toolbar | below recipient | no | TipTap `EditorContent` + `EditorToolbar` | not specified by design |
| R4 | Hashtag picker | below editor | no | "+ Hashtag" trigger, dropdown, chips | not specified by design |
| R5 | Image grid | below hashtag | no | thumbnails, "+ Image" trigger, hidden file input | not specified by design |
| R6 | Anonymous toggle | below image grid | no | checkbox, conditional name input | not specified by design |
| R7 | Footer | bottom | no | "Hủy" (always enabled), "Gửi" (gated) | not specified by design |

## User Flow

### Happy Path

1. Sunner clicks "Viết KUDOS" (FAB) or the `/kudos` input pill; the modal opens (fields empty).
2. Sunner picks a recipient from the autocomplete (any `profile` row except themselves).
3. Sunner writes a message, optionally applying toolbar formatting or inserting a link via the
   Add link sub-dialog, optionally `@mentioning` a colleague.
4. Sunner picks 1–5 hashtags via the picker dropdown; chips render inline.
5. Sunner optionally attaches up to 5 images and/or checks "Gửi ẩn danh" (revealing a
   display-name field).
6. "Gửi" enables once recipient + non-empty content + ≥1 hashtag all hold; clicking it uploads
   any images, submits, and closes the modal on success.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|-----------------|-----------|--------------------------|--------|
| Recipient = self | Sunner searches and selects their own name | Selection is allowed in the UI, but submit is rejected client- and server-side with `compose.selfKudosError` | Group-3 checkpoint decision, 2026-09-02 |
| Submit fails (upload error, network error, RLS rejection) | Any `SubmitKudosResult`/`CreateKudosResult` failure code | Modal stays open, inline error shown, already-entered fields preserved | `compose-dialog-container.tsx` |
| Cancel with data entered | "Hủy" clicked | Modal closes immediately, no confirmation, nothing persisted | TC ID-45 |
| Unauthenticated visitor reaches an entry point | No session | Redirected to `/login` before the modal can open (shared route guard) | F001 BR-002 |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|-------------------|--------------------------|--------|
| closed | default | not rendered | click FAB "Viết KUDOS" or `/kudos` pill to open | SM-001_ModalLifecycle |
| open | opened, form incomplete | all fields visible, "Gửi" disabled | fill fields, Hủy to close | SM-001_ModalLifecycle |
| open, valid | recipient + content + ≥1 hashtag all set | "Gửi" enabled | click Gửi to submit | DEC-001_SubmitEnablementFlow |
| submitting | "Gửi" clicked with a valid form | loading state on the submit button | none (form locked) | SM-001_ModalLifecycle |
| error | submit fails | inline error text (`role="alert"`), form re-enabled | retry or Hủy | `compose-dialog-container.tsx` |

## Validation & Error Feedback

### A) Client-side

| Field | Rule | Error copy | Source |
|---|---|---|---|
| Recipient | required | "Không được để trống" | TC ID-7/ID-50 |
| Editor content | non-empty after trim | "Không được để trống" | TC ID-11/ID-51 |
| Hashtags | 1–5 | "Không được để trống" (0) / "Tối đa 5 hashtag" (6th) | TC ID-14/ID-52, ID-17/ID-53 |
| Images | jpg/png/webp, ≤5MB, ≤5 files | "Định dạng file không hợp lệ" | TC ID-23/ID-24/ID-55 |
| Anonymous name | required when "Gửi ẩn danh" checked | (surfaces via the generic submit error) | `validate-draft.ts` |
| Add link — Text | 1–100 chars, non-whitespace | "Không được để trống" | addlink-box TC `3912184e`, `7d85997d` |
| Add link — Link | 5–2048 chars, http/https | "Đường dẫn không hợp lệ" | addlink-box TC `97dc4028`/`db2ca333`/`aad5791a` |

### B) Server-side

Every client check is re-validated in `createKudos` (`create-kudos-action.ts`) before the
insert: recipient/content/hashtag/image-count shape (`validate-draft.ts`), TipTap content
allow-list + depth/node-count caps (`validate-content.ts`), image storage-path ownership
(`storage-path.ts`), and self-kudos rejection. A rejected request never partially writes —
`create_kudos` is one atomic Postgres transaction.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | Implemented | `role="dialog"` `aria-modal="true"` `aria-label` on both the compose and Addlink dialogs; toolbar buttons carry `aria-label`/`aria-pressed` |
| Keyboard navigation | Partial | Addlink sub-dialog closes on Escape; full tab-order audit not covered by any test this round |
| Focus management | TBD (draft) | not specified by design, not asserted by any test |
| Screen reader compatibility | Partial | error text uses `role="alert"`; not otherwise audited |
