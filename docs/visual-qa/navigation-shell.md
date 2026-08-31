# Navigation Shell — Visual QA (SCR002_Header, SCR003_Footer, SCR004_Fab)

Shared header, footer, account/language dropdowns, and FAB mounted on every in-scope page. Evidence
from Phase 02 (Group 1, guest-only shell) and Phase 07 (session-aware header, after auth wiring).
Pixel-level shell probes were captured in the Phase 08 GREEN pass (`plans/260828-1257-saa-2025-web-login-homepage-awards/evidence/green-phase-08.json` → `shellProbes`, viewport 1512×900): header 1512×80 @ (0,0); logo 52×48 @ (144,16) — left edge = md:px-36 (144px) per the MoMorph header node; language trigger 108×56 @ (1260,12); footer 1512×144; guest renders no bell/avatar/FAB; member adds bell + avatar and FAB 106×64 @ (1387,812). All deltas vs the MoMorph node values: none detected. Structural behavior evidence remains `e2e/navigation-shell.spec.ts`.

## Reference frames

| Frame | Size | File |
|---|---|---|
| Homepage SAA (header/footer source, `i87tDx10uM`) | 1512×4480 | [img/ref-homepage.jpg](img/ref-homepage.jpg) |
| Dropdown-ngôn ngữ (`hUyaaugye2`) | 215×304 | [img/ref-dropdown-language.png](img/ref-dropdown-language.png) |
| Dropdown-profile (`z4sCl3_Qtk`) | 215×304 | [img/ref-dropdown-profile.png](img/ref-dropdown-profile.png) |
| Dropdown-profile Admin (`54rekaCHG1`) | 215×304 | [img/ref-dropdown-profile-admin.png](img/ref-dropdown-profile-admin.png) |
| FAB collapsed (`_hphd32jN2`) | 1440×1024 | [img/ref-fab-collapsed.png](img/ref-fab-collapsed.png) |
| FAB expanded (`Sv7DFwBw1h`) | 1440×1024 | [img/ref-fab-expanded.png](img/ref-fab-expanded.png) |

## Header

| State | Screenshot | Source | Verdict |
|---|---|---|---|
| Guest | [img/shell-header-guest.png](img/shell-header-guest.png) | `evidence/screenshots/phase-02/01-header-desktop.png` (1280×800) | MATCH — logo left, language trigger (VN + flag + chevron) right, no bell/avatar |
| Member (authed) | [img/homepage-member-header.jpg](img/homepage-member-header.jpg) | `evidence/screenshots/phase-07/home-member.png` (1512×1080) | MATCH — bell (no badge, `unreadCount=0`) + avatar/initials + FAB visible |
| Admin (authed) | see [homepage.md](homepage.md) account-menu screenshot | `evidence/screenshots/phase-07/home-admin-menu.png` | MATCH — same header as member; role only changes the account-menu contents |

## Account menus

| Role | Screenshot | Items | Verdict |
|---|---|---|---|
| Member | [img/account-menu-member.jpg](img/account-menu-member.jpg) | Profile (render-only), Logout | MATCH — matches reference `z4sCl3_Qtk`, right-aligned |
| Admin | [img/account-menu-admin.jpg](img/account-menu-admin.jpg) | Profile, Dashboard (render-only), Logout | MATCH — matches reference `54rekaCHG1`; Dashboard renders inert per clarifications |

## Language dropdown

[img/shell-language-dropdown-open.png](img/shell-language-dropdown-open.png)
(`evidence/screenshots/phase-02/02-language-dropdown-open.png`) — MATCH. Opens on click, closes on a
second click, `Escape`, or an outside click; `Enter`/`Space` opens a focused closed trigger (TC ID-30
through ID-35). All three dropdowns (language, profile, profile-admin) share one `Dropdown`
primitive — the same assertions run against each.

## FAB

| State | Screenshot | Source |
|---|---|---|
| Collapsed | [img/shell-fab-collapsed.png](img/shell-fab-collapsed.png) | `evidence/screenshots/phase-02/04-fab-collapsed.png` |
| Expanded | [img/shell-fab-expanded.png](img/shell-fab-expanded.png) | `evidence/screenshots/phase-02/05-fab-expanded.png` |

MATCH after a recertification fix recorded in `reports/evidence-group-1/green-phase-02.json`:
the collapsed pill no longer renders underneath the expanded state, and the red close button is
icon-only with an `sr-only` label. Expands to `Thể lệ` / `Viết KUDOS` / `Hủy`, collapses on `Hủy`
(TC 33a1dacf). Visible only for authenticated sessions (Phase 07 wires `visible`).

## Footer

[img/shell-footer.png](img/shell-footer.png) (`evidence/screenshots/phase-02/03-footer.png`) — MATCH.
Logo + 3 nav links + copyright + "Tiêu chuẩn chung" (render-only, no destination this round).

## Bell / guest correction

`plans/clarifications.md` § Forge corrections (2026-08-28, Group 1): Phase 02's first RED test
asserted the notification bell visible even on the guest-mounted shell, citing a test case whose
precondition is actually "authenticated". Corrected — bell and account trigger render only for
`variant='authed'`; nav links stay public. Confirmed in the guest/member screenshots above.

## Mobile (provisional)

| State | Screenshot | Source |
|---|---|---|
| Mobile header (375×812) | [img/shell-mobile-header.png](img/shell-mobile-header.png) | `evidence/screenshots/phase-02/06-mobile-header.png` |
| Mobile drawer open | [img/shell-mobile-drawer-open.png](img/shell-mobile-drawer-open.png) | `evidence/screenshots/phase-02/07-mobile-drawer-open.png` |

**No Figma frame — provisional by clarification.** No MoMorph row covers the header below the `md`
breakpoint; `plans/clarifications.md` § 2026-08-28 Spec-stage gaps [F002] authorised a hamburger
menu (logo + bell + avatar + ≡ button opening a drawer with the 3 nav links and the language switch)
built from existing design tokens only, "same class as the minimal 404". Not compared against a
reference frame — there is none.

## 404 / 403 (provisional)

**No Figma frame — provisional by clarification.** `plans/clarifications.md` § 2026-08-28 Error
state authorised a minimal 404/403 built from design tokens already pulled from MCP (colors, fonts),
with the layout marked provisional. The pages exist in code (`src/app/not-found.tsx`, `src/app/forbidden.tsx`). The 404 page was
captured in the Phase 08 GREEN pass: [img/not-found-1440.png](img/not-found-1440.png) (1440 wide,
tokens-only rendering — provisional, no reference frame to compare against). No route currently
renders `forbidden.tsx` (guarded routes redirect to /login instead), so 403 remains unpictured —
recorded, not fabricated.
