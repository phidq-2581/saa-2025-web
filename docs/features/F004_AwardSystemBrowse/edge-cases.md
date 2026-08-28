---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Unauthenticated user requests `/he-thong-giai` directly (TC ID-1) | Server-side redirect to `/login` before the page renders — enforced by F001's proxy guard, not re-implemented here | "None — silent redirect, no error message shown." |
| An unknown/invalid section id is triggered on load or via console (TC ID-13) | No-op: no JavaScript error is thrown, no scroll happens, no nav item becomes active | "None — the page stays exactly where it was." |
| Sunner clicks the Kudos "Chi tiết" button (TC ID-12, TC ID-14) | No navigation occurs — `/kudos` is deferred this round; the button is a visible affordance only | "None — button renders but does nothing yet (deferred feature)." |
| Page loads with a valid category hash from a Homepage deep link, e.g. `/he-thong-giai#top-talent` | Page scrolls to the matching card and marks the corresponding nav item active on mount, no click required | "None — the page opens already scrolled to the right category." |
| `specs.csv` ghost rows `3.2` / `7.4` (empty container rows, no itemType) | No independent UI renders for these rows — they carry no content or behavior of their own | "N/A — not user-visible; nothing to display." |
