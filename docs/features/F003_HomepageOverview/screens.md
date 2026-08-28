---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

## Screen List

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Homepage (SAA 2025) | TBD (draft) — see [`screens/SCR005_Homepage/spec.md`](./screens/SCR005_Homepage/spec.md) | Hero keyvisual with the 'ROOT FURTHER' theme, live countdown, event time/venue info, Root Further description, 6-card award grid, Kudos promo block (header/footer/FAB owned by F002_NavigationShell, not shown here) | Watch the countdown tick; click 'ABOUT AWARDS', an award card, or its 'Chi tiết' link to jump to `/he-thong-giai#{slug}`; view the non-navigating 'ABOUT KUDOS' and Kudos 'Chi tiết' affordances |

## User Journey

1. Visitor arrives at Homepage (SAA 2025) and sees the ROOT FURTHER hero with a live countdown and the event's time/venue.
2. Visitor reads the Root Further description block just below the hero.
3. Visitor scrolls to the awards section and sees the six award-category cards.
4. Visitor clicks a card (or its 'Chi tiết' link) and is taken to the award-system page at the matching category anchor.
5. Visitor sees the Kudos promo block and may click 'Chi tiết' or the hero's 'ABOUT KUDOS' button — both are affordances only; the Kudos page is deferred this round.
