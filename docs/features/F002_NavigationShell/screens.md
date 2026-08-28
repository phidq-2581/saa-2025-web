---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

## Screen List

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Header | SCR002_Header (draft) | Logo, 3 nav links (About SAA 2025 / Awards Information / Sun* Kudos), notification bell with unread badge, language switcher, account avatar — full set on Homepage SAA and Hệ thống giải; logo + language only on Login (no session yet) | Navigate via logo/links, open the language dropdown and the account dropdown (member or admin variant), see the notification badge |
| Footer | SCR003_Footer (draft) | Logo, the same 3 nav links, copyright line, "Tiêu chuẩn chung" button — identical on every in-scope screen | Navigate via logo/links; click "Tiêu chuẩn chung" (destination TBD) |
| Floating Action Button | SCR004_Fab (draft) | Collapsed pill widget bottom-right; expands to Thể lệ / Viết KUDOS / Hủy | Toggle open/closed; both destinations render without navigating (deferred) |

## User Journey

1. A user lands on any in-scope page and sees the Header at the top and the Footer at the bottom.
2. The user picks a language from the Header's language switch; the page re-renders in that language.
3. A signed-in user opens the Header's account menu, sees Profile/Logout (or, as an admin, Profile/Dashboard/Logout), and can sign out — which returns them to the Homepage.
4. The user opens the Floating Action Button to preview its two options, then dismisses it by clicking outside, pressing Escape, or clicking Hủy.
5. The user scrolls to the Footer and finds the same navigation links again, plus the copyright and "Tiêu chuẩn chung" button.
