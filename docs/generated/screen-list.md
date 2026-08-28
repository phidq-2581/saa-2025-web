# Screen List

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Login | Login | page | — | — |
| SCR002_Header | Header | region | `site-header.tsx`, `language-dropdown.tsx`, `account-menu.tsx`, `notification-bell.tsx`, `mobile-nav-drawer.tsx`, `ui/dropdown.tsx` | — |
| SCR003_Footer | Footer | region | `site-footer.tsx` | — |
| SCR004_Fab | Fab | region | `fab-widget.tsx` | — |
| SCR005_Homepage | Homepage | page | — | — |
| SCR006_AwardSystem | AwardSystem | page | — | — |

---

## SCR001_Login

**Feature:** F001 — Google OAuth Login & Session Guard
**Route:** /login
**Description:** A visitor who is not yet signed in lands here to start Google sign-in before reaching any other SAA 2025 page.
**States:** per `docs/screens/SCR001_Login/spec.md` § UI States

## SCR002_Header

**Feature:** F002 — Global Navigation Shell (Header/Footer/Language/Account Menu/FAB)
**Route:** (shared region — every page)
**Description:** Gives every in-scope page the same top navigation, language switch, and (once signed in) a role-aware account menu, so a user never loses their bearings moving 
**States:** per `docs/screens/SCR002_Header/spec.md` § UI States

## SCR003_Footer

**Feature:** F002 — Global Navigation Shell (Header/Footer/Language/Account Menu/FAB)
**Route:** (shared region — every page)
**Description:** Repeats the main navigation at the bottom of every page along with copyright and a secondary "general standards" link, so a user who has scrolled past the heade
**States:** per `docs/screens/SCR003_Footer/spec.md` § UI States

## SCR004_Fab

**Feature:** F002 — Global Navigation Shell (Header/Footer/Language/Account Menu/FAB)
**Route:** (shared region — Homepage, Award page)
**Description:** Gives a signed-in user quick access to two upcoming actions — writing a kudos and reading the rules — from a single floating button, without leaving the current
**States:** per `docs/screens/SCR004_Fab/spec.md` § UI States

## SCR005_Homepage

**Feature:** F003 — Homepage Overview (Hero, Countdown, Award Grid, Kudos Promo)
**Route:** /
**Description:** A visitor or Sunner arrives here first to learn what SAA 2025 is, watch the live countdown to the event, and find a way into the award categories or the Kudos c
**States:** per `docs/screens/SCR005_Homepage/spec.md` § UI States

## SCR006_AwardSystem

**Feature:** F004 — Award System Browsing (Scroll-Spy Categories)
**Route:** /he-thong-giai
**Description:** A signed-in Sunner reads the SAA 2025 keyvisual hero and section title, browses all six award categories via a scroll-spy left menu, and sees the Sun* Kudos pro
**States:** per `docs/screens/SCR006_AwardSystem/spec.md` § UI States
