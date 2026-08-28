---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

## Why It Matters

Every screen in this round shares the same header, footer, and quick-action button, so visitors always know where they are, can switch between Vietnamese and English, and — once signed in — can tell at a glance whether they are looking at a regular account or an admin one. Without this shared shell, each page would need its own navigation and account menu, which would be slower to build and easy to make inconsistent.

## Who Uses It

- **Any visitor** — reads the header and footer to move between the public pages and to switch language.
- **Signed-in Sunner** — additionally sees the account menu (view profile, sign out) and the notification bell.
- **Admin** — sees one extra account-menu option that regular members do not see; its destination is still being decided.

## What They Do

1. A visitor opens any page and reads the header — the logo, the three main links, and the language switch.
2. A visitor picks a language from the switch, and the whole page immediately reads in that language from then on.
3. A signed-in Sunner opens the account menu from their avatar and either views their profile or signs out; signing out returns them to the homepage right away, with no extra confirmation step.
4. An admin sees one additional row in that same menu, marking them as a manager — clicking it does nothing yet, since where it should lead has not been decided.
5. Anyone signed in can open the small floating button in the corner to preview two upcoming actions (writing a kudos, reading the rules) — neither is wired up to anything yet, so clicking either currently does nothing.
6. A visitor reaches the footer at the bottom of any page and finds the same three links again, plus the copyright line and a button whose destination is still undecided.

## Unresolved Questions

- **Footer button destination**: nobody has said yet what the footer's "general standards" button should open when clicked.
- **Mobile layout**: nobody has said yet how the header should look on a small phone screen — the design only shows the desktop size.
