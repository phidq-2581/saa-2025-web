---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Event start time is reached while the page is open | Countdown clamps to `00`/`00`/`00` and stops ticking down; 'Coming soon' is removed | "None — the countdown reads 00 00 00 and 'Coming soon' disappears" |
| `NEXT_PUBLIC_EVENT_START_AT` is missing or not valid ISO-8601 | App does not crash; falls back to a safe placeholder state instead of computing from an invalid date | "None — silent fallback, no error banner shown to the visitor" |
| Remaining time drops into single digits (e.g. 5 days) | Value still renders as two digits | "None — shown as '05', not '5'" |
| An award card has no category slug/hashtag to anchor to | Clicking still opens the award-system page, without auto-scroll to a section | "None — visitor lands on the award-system page and can scroll manually" |
| Visitor clicks 'ABOUT KUDOS' or the Kudos promo's 'Chi tiết' link | Nothing navigates — the Kudos board is not open yet this round | "None — button is visible and styled but intentionally does nothing yet" |
