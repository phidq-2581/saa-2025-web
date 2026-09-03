---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| User clicks the footer's "Tiêu chuẩn chung" button | Opens the Thể lệ panel (`b1Filzi9i6`) as a right-hand drawer over the page; since 2026-09-03 | "None — silent handling" |
| Admin's account menu shows "Dashboard" and the user clicks it | Row renders as a normal menu item, but the destination route does not exist yet, so nothing happens | "None — silent handling" |
| A member somehow reaches an admin-only affordance (e.g. stale cached HTML) | The menu re-derives from the current role on every render; a member never sees the Dashboard row regardless of cached markup | "None — menu re-renders from the live role" |
| User clicks the notification bell | No panel opens this round (the panel is a deferred, unfinished screen); only the badge is functional | "None — panel not available yet" |
| User opens any dropdown or the FAB, then clicks elsewhere on the page | The open panel closes immediately | "None — silent dismissal" |
| User tabs to a closed dropdown trigger and presses Escape without opening it | No-op; Escape only closes an already-open panel | "None — no visible change" |
| Logout is triggered while a network error occurs | Sign-out fails silently at the network layer; the redirect-on-success path has no confirmed failure behavior this round | "Unresolved — no confirmed error copy for a failed sign-out" |
