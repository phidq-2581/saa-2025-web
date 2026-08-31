# Test Traceability

Two logs live here: the MoMorph test-case ↔ implementation traceability table
(Phase 08, immediately below) and the EN-copy-gap log (Phase 07, further
down). Every MoMorph test case for the four in-scope screen sets is
accounted for as **covered** (exact test file + title), **deferred** (cites
the clarifications.md decision), or **not-covered** (states the concrete
reason) — a blank cell is never used.

## MoMorph Test Case Traceability (Phase 08)

Source CSVs: `docs/momorph/{login,homepage-saa,he-thong-giai,dropdown-ngon-ngu}/test-cases.csv`
(17 + 62 + 15 + 0 = 94 rows). Method: every row below was read from its CSV
and cross-checked against the actual test file cited — status was never
inferred from a test title alone without opening the file.

### Login (`docs/momorph/login/test-cases.csv`, 17 cases, UUID `TC_ID`)

| TC ID | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| 45278c06 | Access control / guest vs authed | Login shown to guests; authed user redirected to `/` | e2e/auth-guard.spec.ts: "'/login' is reachable for an unauthenticated visitor" + "a seeded session redirects GET /login to '/' (TC f62b0c97)" | covered |
| b9805e65 | GUI / header logo, top-left, non-interactive | Logo top-left, fixed across resizes, no click/hover effect | none (presence only via login.spec.ts "header shows logo…") | not-covered (reason: exact left-position, resize persistence and click-inertness are visual-only; no dedicated assertion this round — tracked as Phase 08 visual QA, not an executable test) |
| 8415b629 | GUI / language control, top-right | Language selector top-right across resizes | e2e/login.spec.ts: "header shows logo and language selector only, footer shows copyright (TC 8415b629, 33a1dacf)" | covered (partial: presence + VN text asserted; exact top-right position across resizes is visual-only) |
| 33a1dacf | GUI / footer, fixed, non-interactive | Footer visible, fixed on scroll, not interactive | e2e/login.spec.ts: "header shows logo and language selector only, footer shows copyright (TC 8415b629, 33a1dacf)" | covered (partial: presence + copyright text asserted; fixed-during-scroll and click-inertness are visual-only) |
| 5fbe2a18 | GUI / hero background artwork | Hero key visual covers the hero area | e2e/login.spec.ts: "hero keyvisual covers hero region (TC 5fbe2a18)" | covered |
| 42b82364 | GUI / hero title + description | "ROOT FURTHER" + two tagline lines, not interactive | e2e/login.spec.ts: "renders hero copy ROOT FURTHER with taglines (TC 42b82364)" | covered (partial: text presence asserted; non-interactivity/selectability not asserted) |
| 6ae76d15 | GUI / login button visibility+icon | "LOGIN With Google" centered below hero, Google icon visible | e2e/login.spec.ts: "displays enabled Google login button with icon below hero (TC 6ae76d15)"; google-sign-in-button.test.tsx: "renders the label and a visible Google icon… (TC 6ae76d15)" | covered |
| 20d87e28 | GUI / language dropdown opens on click/hover | Dropdown opens on click; trigger highlights + pointer on hover | e2e/navigation-shell.spec.ts: "02: Language dropdown opens and closes" (shared Dropdown primitive — login-header.tsx wraps the same LanguageDropdown/Dropdown component) | covered (via shared primitive; hover-highlight styling itself is visual-only) |
| 5f1cbabd | Initialize / language default VN | Language selector shows "VN" by default | e2e/login.spec.ts: "header shows logo and language selector only…" (asserts trigger contains "VN") | covered |
| 98e20775 | Initialize / flag + chevron display | VN flag icon left of "VN", chevron right | none | not-covered (reason: icon/chevron presence is a visual-only assertion; no test targets these specific child elements) |
| f62b0c97 | Access control / authenticated user redirected | Authenticated visitor to `/login` is redirected to the main app | e2e/auth-guard.spec.ts: "a seeded session redirects GET /login to '/' (C2, TC f62b0c97, BR-003)" | covered |
| 60bc5bbb | Component interaction / Google button click | Clicking the button starts the Google auth flow | e2e/integration-flows.spec.ts: "5. Google sign-in button reaches Google/GoTrue authorize URL (SC-1)" | covered |
| c18649fa | Component interaction / button hover shadow | Shadow/elevated effect while hovered | none | not-covered (reason: hover shadow/elevation is a CSS-only visual effect; no test asserts computed box-shadow on hover) |
| 37eae882 | Component interaction / disabled+loader while authenticating | Button disabled with loading indicator during auth | implemented via `useFormStatus` in google-sign-in-button.tsx (`disabled={pending}` + spinner); no test forces the pending state | not-covered (reason: the pending/disabled/spinner state exists in code but requires intercepting the OAuth redirect mid-flight to observe — not exercised by any unit or E2E test this round) |
| 4426635b | Component interaction / language button opens dropdown | Clicking the language selector opens the dropdown | e2e/navigation-shell.spec.ts: "02: Language dropdown opens and closes" (shared Dropdown primitive, see 20d87e28) | covered (via shared primitive) |
| cb42461d | Component interaction / language hover highlight | Selector highlighted + pointer cursor on hover | none | not-covered (reason: hover highlight/cursor is a CSS-only visual effect; no test asserts it) |
| e76aa170 | Business logic / auth success returns user info | Google account authenticates → user info returned, redirect to main app | src/app/auth/callback/__tests__/route.test.ts: "redirects to safeNext(next) on a domain-matching, verified sign-in" (mocked `exchangeCodeForSession`) | not-covered (reason: completing a real Google consent screen is not testable locally — clarifications.md: "Google consent leg not testable locally beyond the authorize URL"; the callback's own session-issuance/redirect logic is unit-tested with a mocked Google response, but that is not this TC's literal "authenticate with a valid Google account" step) |

### Homepage SAA (`docs/momorph/homepage-saa/test-cases.csv`, 62 cases, `ID-n`)

| TC ID | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| ID-0 | Access / guest, direct URL | Homepage displayed with all public content | e2e/auth-guard.spec.ts: "'/' loads for an unauthenticated visitor"; navigation-shell.spec.ts: "04: Footer and guest shell (no bell, no FAB)"; site-header.test.tsx: "renders no notification bell or account trigger for the guest variant… (TC ID-0/ID-1/ID-11)" | covered |
| ID-1 | Access / authenticated, direct URL | Homepage displayed with bell, account menu, personalized options | navigation-shell.spec.ts: "04a: Authenticated shell (bell visible, FAB visible)"; integration-flows.spec.ts: "1. Seeded member: header authed variant… (TC ID-6, A4, SC-1)" | covered |
| ID-2 | Navigation / logo click, any page | Homepage displayed, scrolled to top | none | not-covered (reason: header logo is a plain `<Link href="/">`; no test clicks it to confirm navigation+scroll-to-top) |
| ID-3 | Navigation / header "About SAA 2025" link | Homepage displayed, About section visible | none | not-covered (reason: NAV_LINKS' "About SAA 2025" hrefs to `/` itself — no distinct About-section anchor exists, and no test clicks the link) |
| ID-4 | Navigation / footer "About SAA 2025" link | Homepage displayed, scrolled to top | none | not-covered (reason: footer link presence is asserted by navigation-shell.spec.ts 04, but no test clicks it) |
| ID-5 | Access / admin menu option | Account menu shows Admin Dashboard for admin | integration-flows.spec.ts: "2. Seeded admin: account menu Profile+Dashboard+Logout, Dashboard inert (TC ID-5, DISC-001)"; site-header.test.tsx: "shows a Dashboard item for admin but not for member" | covered |
| ID-6 | Access / regular user, no admin option | Account menu has no Admin Dashboard for member | integration-flows.spec.ts: "1. Seeded member: header authed variant… (TC ID-6, A4, SC-1)" | covered |
| ID-7 | GUI / screen-wide layout structure | Header/hero/countdown/awards/kudos/widget/footer in the described order | none | not-covered (reason: sections are tested in isolation; no single test asserts the whole-page order the way award-system.spec.ts does for /he-thong-giai — a visual QA matter) |
| ID-8 | GUI / header logo size 64x60px | Logo 64×60px, alt text present | navigation-shell.spec.ts: "01: Header renders logo and language trigger" (alt text); MoMorph node `mms_A1.1_LOGO` (`I2167:9091;178:1033`) = 52×48 | covered with documented deviation (the test-case text says 64×60 but the design node is 52×48 — visual values come from MoMorph MCP per CLAUDE.md, so the build follows the node; TC text is stale) |
| ID-9 | GUI / active nav link styling | "About SAA 2025" highlighted yellow/underline when active | none | not-covered (reason: `site-header.tsx` implements the active class via `usePathname()`, but no test renders the header at a matching pathname and asserts the gold/underline class) |
| ID-10 | GUI / language button default value | Language button shows "VN" | navigation-shell.spec.ts: "01: Header renders logo and language trigger" | covered |
| ID-11 | GUI / notification button default state | Icon 40×40px, badge visible if unread | navigation-shell.spec.ts: "04a: Authenticated shell…" (badge hidden at 0); notification-bell.test.tsx (both tests) | covered (partial: badge visibility asserted; exact 40×40px icon dimension not asserted) |
| ID-12 | GUI / countdown initial values | Three 2-digit units with DAYS/HOURS/MINUTES labels | homepage-countdown.spec.ts: "countdown tiles display two-digit placeholder values with labels (TC ID-12, ID-40, BR-005)"; event-countdown.test.tsx: "renders the 00/00/00 server placeholder… (BR-005)" | covered |
| ID-13 | GUI / coming-soon label initial visibility | Label visible below ROOT FURTHER title | homepage-countdown.spec.ts: "coming-soon label visibility env-aware… (TC ID-43, BR-003, BR-005)"; event-countdown.test.tsx: "renders the 00/00/00 server placeholder… and Coming soon (BR-005)" | covered |
| ID-14 | GUI / event info default content | Time/venue/livestream lines displayed | homepage.spec.ts: "hero shows ROOT FURTHER, event info, and CTAs (TC ID-14, ID-44, US002, BR-008)" | covered |
| ID-15 | GUI / award cards 3-col grid (desktop) | 3-column grid, each card: thumbnail/title/desc/Chi tiết | homepage.spec.ts: "award grid displays six cards in fixed order with hashtag links (TC ID-15, ID-47, ID-48, ID-49, ID-50, ID-52, BR-006)" | covered (partial: card content/count/links asserted; exact 3-column CSS grid not asserted — visual-only) |
| ID-16 | GUI / award cards 2-col grid (tablet/mobile) | 2-column grid at narrower viewports | none | not-covered (reason: no test resizes the viewport and asserts the grid's column count) |
| ID-17 | GUI / footer default content | Logo, nav links, copyright text | navigation-shell.spec.ts: "04: Footer and guest shell…" | covered |
| ID-18 | Interaction / header logo click | Navigates home, scrolls to top | none | not-covered (reason: same as ID-2 — plain Link, not click-tested) |
| ID-19 | Interaction / footer logo click | Navigates home, scrolls to top | none | not-covered (reason: same as ID-4 — plain Link, not click-tested) |
| ID-20 | Interaction / header nav link click behavior | Scrolls to About section or reloads homepage | none | not-covered (reason: same as ID-3) |
| ID-21 | Interaction / "Awards Information" nav click | Navigates to Awards Information page | none | not-covered (reason: href="/he-thong-giai" is implemented in site-header.tsx/site-footer.tsx; only presence, never a click, is asserted) |
| ID-22 | Interaction / "Sun* Kudos" nav click | Navigates to Sun* Kudos page | site-header.tsx / site-footer.tsx render "Sun* Kudos" as a non-navigating `<span role="link">` | deferred (clarifications.md § Navigation: "Kudos detail page… Out of scope. Keep the affordances visible, do not navigate") |
| ID-23 | Interaction / nav link hover state | Bright background highlight | none | not-covered (reason: CSS-only hover effect, not asserted) |
| ID-24 | Interaction / language button menu toggle | Opens VN/EN menu | navigation-shell.spec.ts: "02: Language dropdown opens and closes" | covered |
| ID-25 | Interaction / select EN | Interface switches to English | integration-locale-countdown.spec.ts: "4. Language selection EN… (BR-001, SC-001)"; locale-body-copy.spec.ts (tests 1–2) | covered |
| ID-26 | Interaction / select VN (from EN) | Interface switches back to Vietnamese | locale-body-copy.spec.ts: "3. VN guard: no NEXT_LOCALE → VN on homepage & award page" (tests the VN default/fallback, not a live EN→VN click) | not-covered (reason: only the VN→EN click direction is exercised end-to-end; the reverse EN→VN *click* is not — the mechanism is symmetric and already unit-tested for both values via setLocale, but no E2E clicks VN from an EN-active state) |
| ID-27 | Interaction / notification panel open | Panel opens on click | bell renders (see ID-11); no panel exists | deferred (clarifications.md § Red-team resolutions: "The notification data source is deferred together with the panel") |
| ID-28 | Interaction / unread badge shows red | Badge visible when unreadCount>0 | notification-bell.test.tsx: "shows the badge when unreadCount is above 0 (TC ID-28)" | covered |
| ID-29 | Interaction / no badge when read | No badge when unreadCount=0 | notification-bell.test.tsx: "hides the badge when unreadCount is 0 (TC ID-29)" | covered |
| ID-30 | Interaction / dropdown opens | Generic dropdown opens on click | navigation-shell.spec.ts: "02: Language dropdown opens and closes" (shared Dropdown primitive, all 3 dropdowns per clarifications.md) | covered |
| ID-31 | Interaction / dropdown closes (toggle) | Second click closes it | navigation-shell.spec.ts: "02: Language dropdown opens and closes" | covered |
| ID-32 | Interaction / dropdown closes on outside click | Clicking outside closes it | navigation-shell.spec.ts: "03: Dropdown keyboard and outside click handling" | covered |
| ID-33 | Interaction / dropdown keyboard Enter | Enter opens the dropdown | navigation-shell.spec.ts: "03: Dropdown keyboard and outside click handling" | covered |
| ID-34 | Interaction / dropdown keyboard Space | Space opens the dropdown | navigation-shell.spec.ts: "03: Dropdown keyboard and outside click handling" | covered |
| ID-35 | Interaction / dropdown keyboard Esc | Esc closes the dropdown | navigation-shell.spec.ts: "03: Dropdown keyboard and outside click handling" | covered |
| ID-36 | Interaction / account menu display | Opens with Profile + Sign out | integration-flows.spec.ts: "1. Seeded member… account menu Profile+Logout inert (TC ID-6, A4, SC-1)" | covered |
| ID-37 | Interaction / admin role menu options | Menu shows Profile, Sign out, Admin Dashboard | integration-flows.spec.ts: "2. Seeded admin… (TC ID-5, DISC-001)"; site-header.test.tsx admin/member test | covered |
| ID-38 | Interaction / member role menu options | Menu shows Profile and Sign out only | integration-flows.spec.ts: "1. Seeded member… (TC ID-6, A4, SC-1)" | covered |
| ID-39 | Interaction / countdown auto-update | Minutes value decreases over time | use-countdown.test.ts: "ticks the minute value down after 60s (TC ID-39)" | covered |
| ID-40 | Interaction / leading-zero display | Single digits render as 05, 09, etc. | homepage-countdown.spec.ts (TC ID-12, ID-40); event-countdown.test.tsx: "zero-pads single-digit values (BR-001)"; compute-remaining.test.ts: "pads single-digit values to 2 digits (BR-001)" | covered |
| ID-41 | Data validation / zero state | 00/00/00, Coming soon hidden at event start | compute-remaining.test.ts: "clamps to 00/00/00 with reached:true exactly at the target (BR-002)"; event-countdown.test.tsx: "hides the Coming soon label once the event is reached (BR-002, BR-003)" | covered |
| ID-42 | Interaction / coming-soon hidden after event | Label not displayed post-event | event-countdown.test.tsx: "hides the Coming soon label once the event is reached (BR-002, BR-003)" | covered |
| ID-43 | Interaction / coming-soon shown before event | Label displayed pre-event | homepage-countdown.spec.ts: "coming-soon label visibility env-aware… (TC ID-43, BR-003, BR-005)"; home-page.test.tsx: "shows a live not-reached countdown with Coming soon visible before the event (BR-003)" | covered |
| ID-44 | Interaction / ABOUT AWARDS CTA | Navigates to Awards Information page | homepage.spec.ts (TC ID-14, ID-44…, asserts href="/he-thong-giai"); home-page.test.tsx: "renders the deferred CTA/detail affordances" | covered (via href assertion; no test clicks-and-follows the navigation) |
| ID-45 | Interaction / ABOUT KUDOS CTA | Navigates to Sun* Kudos page | homepage.spec.ts (TC ID-14 test asserts no href, aria-disabled=true, tabindex=-1) | deferred (clarifications.md § Navigation: Kudos detail out of scope; CTA intentionally inert) |
| ID-46 | Interaction / CTA hover state | Button shows hover styling | none | not-covered (reason: CSS-only hover effect, not asserted) |
| ID-47 | Interaction / award card thumbnail click | Navigates with hashtag, scrolls to section | homepage.spec.ts: "award grid displays six cards… (TC ID-15, ID-47, ID-48, ID-49, ID-50, ID-52, BR-006)" | covered |
| ID-48 | Interaction / award card title click | Navigates with hashtag, scrolls to section | homepage.spec.ts (same test as ID-47) | covered |
| ID-49 | Interaction / Chi tiết link click | Navigates with hashtag, scrolls to section | homepage.spec.ts (same test as ID-47) | covered |
| ID-50 | Interaction / every award card navigates correctly | Each card → correct hashtag section | homepage.spec.ts (same test as ID-47, iterates all 6 cards) | covered |
| ID-51 | Interaction / award card hover effect | Card elevates with border/lighting | none | not-covered (reason: CSS-only hover effect, not asserted) |
| ID-52 | Interaction / hashtag navigation scroll | Award page scrolls to the matching section | integration-locale-countdown.spec.ts: "6. Award card click: navigates to /he-thong-giai#slug, scrolls section in view, nav item active (BR-006, BR-002)" | covered |
| ID-53 | Interaction / Sun* Kudos detail button | Navigates to Sun* Kudos detail page | homepage.spec.ts: "kudos promo renders label, title, description, image, and detail button (TC ID-53, BR-008, US005 AS2)" (asserts no href, aria-disabled, click does not navigate); kudos-promo.test.tsx (BR-008) | deferred (clarifications.md § Navigation: Kudos detail out of scope; test explicitly proves the button is inert) |
| ID-54 | Interaction / widget (FAB) quick action menu | Menu opens with available options | navigation-shell.spec.ts: "04a: Authenticated shell…" (open/close + item labels); a11y-fab.spec.ts + a11y-gaps.spec.ts (aria-expanded/aria-controls, VN/EN labels — in-progress a11y hardening, see Notes) | covered |
| ID-55 | Interaction / footer links each navigate correctly | Each footer link → its page | navigation-shell.spec.ts: "04: Footer and guest shell…" (presence only) | not-covered (reason: only text presence is asserted for the 3 footer nav links; no test clicks each and confirms the resulting URL) |
| ID-56 | Data validation / countdown env var format | Countdown reflects `NEXT_PUBLIC_EVENT_START_AT` | parse-target.test.ts: "parses a valid ISO-8601 datetime with an explicit UTC offset"; integration-locale-countdown.spec.ts: "7. Countdown client-side mount, env-aware… (BR-005, SC-002)" | covered |
| ID-57 | Data validation / ISO-8601 datetime | Countdown calculates and displays correctly | same as ID-56 | covered |
| ID-58 | Data validation / language options | Only VN and EN options shown | navigation-shell.spec.ts: "02: Language dropdown opens and closes" (VN/EN presence; `language-dropdown.tsx` hardcodes only these two) | covered (partial: VN/EN presence asserted; no explicit "exactly these two, nothing else" count assertion) |
| ID-59 | Error handling / broken links crawl | No broken links site-wide | none | not-covered (reason: originally a manual browser-extension crawl ("Check My Links"); no equivalent automated link-crawl test exists in this repo) |
| ID-60 | Error handling / invalid countdown datetime | Fallback without crashing | parse-target.test.ts: "returns null for a malformed date string" + "never throws on malformed input"; use-countdown.test.ts: "returns a safe 00/00/00 fallback for a null target, without throwing (BR-004)" | covered |
| ID-62 | Error handling / award card missing hashtag | Navigates to Awards Information without auto-scroll | none — AWARD_CATEGORIES always supplies a slug per card | not-covered (reason: the fixed AWARD_CATEGORIES data model gives every card a valid slug; a card with a missing hashtag cannot occur in the current build, so the scenario is untestable as specified) |

### Hệ thống giải / Award System (`docs/momorph/he-thong-giai/test-cases.csv`, 15 cases, `ID-n`)

| TC ID | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| ID-0 | Access / authenticated, direct URL | Award page displays successfully | award-system.spec.ts: "with a seeded session /he-thong-giai renders hero → section title → 6 cards → Kudos banner in order (TC ID-0, ID-3)" | covered |
| ID-1 | Access / unauthenticated, direct URL | Redirected to the login page | auth-guard.spec.ts: "unauthenticated GET /he-thong-giai redirects to /login?next=…"; session-fixture.spec.ts: "the same route without a session cookie redirects to /login?next=%2Fhe-thong-giai" | covered |
| ID-2 | Navigation / via main menu item | Award page displays successfully | none | not-covered (reason: all award-system.spec.ts tests use `.goto('/he-thong-giai')` directly; no test clicks the header/footer "Awards Information" link to arrive there) |
| ID-3 | GUI / overall layout structure | Title top, menu left, content center, Kudos banner bottom | award-system.spec.ts (TC ID-0, ID-3 — asserts hero→title→cards→kudos Y-order via boundingBox) | covered (partial: vertical section order asserted; "menu on the left" specifically is not measured) |
| ID-4 | GUI / title default display | Sub-heading small/pale + main heading large/yellow | award-system.spec.ts (TC ID-0, ID-3 test asserts both text lines) | covered (partial: text content asserted; color/size styling is visual-only) |
| ID-5 | GUI / menu list, 6 items in order | Top Talent…MVP, in that order | award-system.spec.ts: "award-category-nav lists exactly 6 award-nav-item in order with names… (TC ID-5, ID-6, ID-7)"; award-category-nav.test.tsx: "renders exactly 6 award-nav-item, one per category, in order" | covered |
| ID-6 | GUI / award info blocks, all 6 complete | Quantity + prize value shown per category | award-system.spec.ts (TC ID-5, ID-6, ID-7 test); locale-body-copy.spec.ts test 2 (EN quantity/prize values) | covered |
| ID-7 | GUI / award picture 336x336px | Each card shows a 336×336 image | none | not-covered (reason: no test asserts the award-info-card image's pixel dimensions; only the nav-item icon (24×24) is dimension-checked) |
| ID-8 | GUI / Sun* Kudos banner default display | Title, tagline, description, Chi tiết button | award-system.spec.ts (TC ID-0, ID-3 test asserts kudosBanner text) | covered |
| ID-9 | Interaction / menu click scrolls + activates | Section scrolls into view; item marked active; previous loses active | award-system.spec.ts: "clicking a menu item scrolls its section into view and marks only that item active (TC ID-9, ID-11, BR-001)"; award-category-nav.test.tsx: "marks only the clicked item active (BR-001)" | covered |
| ID-10 | Interaction / menu item hover highlight | Item highlighted on hover | none | not-covered (reason: CSS-only hover effect, not asserted) |
| ID-11 | Interaction / active state, single item only | Only the just-clicked item is active | award-system.spec.ts (TC ID-9, ID-11, BR-001 test — asserts exactly 1 `aria-current=true` after each click) | covered |
| ID-12 | Interaction / Chi tiết button opens Kudos detail | Sun* Kudos tab/page opens with details | award-system.spec.ts: "loading /he-thong-giai#does-not-exist…" (asserts the Kudos detail link, if present, carries no href) | deferred (clarifications.md § Navigation + phase-08 plan § Key Insights: "TC ID-12/ID-14 on the award page are deferred") |
| ID-13 | Error handling / invalid section hash | No JS error; page stays put or shows a friendly message | award-system.spec.ts: "loading /he-thong-giai#does-not-exist produces no error, stays at top, activates nothing (TC ID-13, BR-003)"; resolve-active-slug.test.ts: "returns null for an unknown hash (BR-003)"; award-category-nav.test.tsx: "activates nothing when no section id… matches (BR-003)" | covered |
| ID-14 | Error handling / Chi tiết button failed navigation | Friendly error message or 404 page | auth-guard.spec.ts: "GET /does-not-exist returns 404 with the tokenized not-found page (F8)" covers the app's general 404 — not this TC's literal Kudos-button-failure scenario | deferred (clarifications.md + phase-08 plan § Key Insights: "TC ID-12/ID-14 on the award page are deferred" — the button itself is inert, so a "failed navigation" case does not arise; the app's general minimal 404 page is covered separately, not as this TC) |

### Dropdown ngôn ngữ (`docs/momorph/dropdown-ngon-ngu/test-cases.csv`)

No test cases published for this screen — the CSV has a header row only, 0
data rows. The screen itself is deferred per clarifications.md § Scope
("Deferred, not cancelled... for a later round").

### Summary

| Screen | Total | Covered | Deferred | Not-covered |
|---|---|---|---|---|
| Login | 17 | 11 | 0 | 6 |
| Homepage SAA | 62 | 41 | 4 | 17 |
| Hệ thống giải | 15 | 10 | 2 | 3 |
| Dropdown ngôn ngữ | 0 | – | – | – |
| **Total** | **94** | **62** | **6** | **26** |

### Gaps to close (candidates for this round's a11y/tester follow-up)

Ranked by how cheaply each could be closed without new infrastructure:

1. **Homepage header logo dimension (ID-8) — RESOLVED 2026-08-30:** the MoMorph node `mms_A1.1_LOGO` measures 52×48 (`get_node` on `I2167:9091;178:1033`), matching `site-header.tsx`; the 64×60 in the test-case text is stale. No code change; row marked covered-with-deviation.
2. **Click-then-navigate assertions for plain `<Link>` nav items** (Homepage
   ID-2, ID-3, ID-4, ID-18, ID-19, ID-20, ID-21, ID-55; Award System ID-2) —
   logo and header/footer nav links currently only get presence assertions.
   Cheap to add: click each, assert the resulting URL.
3. **Reverse locale switch, EN→VN (Homepage ID-26)** — only VN→EN is
   E2E-tested; the mechanism (`setLocale`) is already symmetric and
   unit-tested for both values, so this is a one-test addition to
   `integration-locale-countdown.spec.ts`.
4. **Exact "only VN/EN, nothing else" assertion (Homepage ID-58)** —
   currently only presence of VN and EN is checked; add a `toHaveCount(2)`
   on the menu's option list.
5. **Google button pending/disabled state (Login TC 37eae882)** —
   implemented via `useFormStatus`, never exercised. Needs a way to hold the
   Server Action pending (e.g. a slow-resolving mock) to observe `disabled`
   + spinner.
6. **Broken-link crawl (Homepage ID-59)** — originally a manual
   browser-extension check; a lightweight internal-link crawl (fetch every
   same-origin href, assert 2xx/3xx) would cover it cheaply.

Left out of this list on purpose: every CSS-only hover/highlight claim
(Login b9805e65/c18649fa/cb42461d/98e20775; Homepage ID-9/ID-23/ID-46/ID-51;
Award System ID-10) and the whole-screen layout-order claims (Homepage
ID-7, Award System ID-3/ID-4 partial) — these belong to Phase 08's visual
QA screenshots, not a new executable assertion, matching the phase plan's
own split between traceability (this document) and visual QA (tester).

**Note on `e2e/a11y-fab.spec.ts` and `e2e/a11y-gaps.spec.ts`:** written concurrently by the Phase 08 tester and split on purpose — `a11y-fab.spec.ts` holds the FAB `aria-expanded`/`aria-controls`/label assertions (VN default + `NEXT_LOCALE=en`), `a11y-gaps.spec.ts` holds only the keyboard-reachability guards. An earlier snapshot showed overlapping tests mid-edit; the committed files do not duplicate each other.

## EN copy gaps (Phase 07)

Per the EN copy rule (clarifications.md, phase-07 Requirements): every
`messages/en/*.json` key is either (a) already-English design copy, copied
through unchanged, (b) a genuine Vietnamese string with a MoMorph
`list_file_localizations` English translation, used verbatim, or (c) a
Vietnamese string with **no** confirmed English source, mirrored as
`[VN] <original Vietnamese text>` — never hand-translated.

**Tooling constraint this session:** the implementer session that authored
these catalogs had no MoMorph MCP tool available (`list_file_localizations`
was not in its exposed tool set). Only the 9 translations and 2 confirmed
absences the orchestrator had already queried and passed in the task prompt
were used as case (b)/known-absent; every other Vietnamese string below is
case (c) — not because MoMorph lacks a translation, but because this session
could not query it. Phase 08 (or any session with MCP access) should query
every path below via `list_file_localizations` before finalizing.

### Confirmed via MoMorph (used verbatim)

| Vietnamese | English | Used at |
|---|---|---|
| Bản quyền thuộc về Sun* © 2025 | Copyright © Sun* 2025 | `common.footer.copyright`, `login.footerCopyright` |
| Chi tiết | Details | `home.awards.detailLink`, `awards.kudos.detailLabel` |
| Địa điểm: | Venue: | `home.eventInfo.placeLabel` |
| Giá trị giải thưởng: | Prize value: | `awards.card.prizeLabel` |
| Hệ thống giải thưởng | Awards System | `home.awards.heading` |
| Phong trào ghi nhận | Recognition Movement | `home.kudos.label`, `awards.kudos.eyebrow` |
| Số lượng giải thưởng: | Number of awards: | `awards.card.quantityLabel` |
| Thời gian: | Time: | `home.eventInfo.timeLabel` |
| Tiêu chuẩn chung | General standards | `common.footer.generalStandards` |

### `messages/en/login.json` — 3 gaps

- `heroSubtitle` — confirmed absent from Figma EN text (orchestrator query)
- `heroTagline` — confirmed absent from Figma EN text (orchestrator query)
- `errorMessage` — not queried this session (tooling constraint)

### `messages/en/home.json` — 13 gaps

- `eventInfo.place`, `eventInfo.livestreamNote`
- `rootFurther.paragraph1`, `rootFurther.quoteTranslation`, `rootFurther.paragraph2`
- `awards.subDescription`
- `awards.cards.{top-talent,top-project,top-project-leader,best-manager,signature-2025-creator,mvp}.description` (6 keys)
- `kudos.description`

### `messages/en/awards.json` — 30 gaps

- `sectionTitle.heading`, `nav.ariaLabel`, `card.orConnector`
- `cardContent.*.description` (6 keys, one per award category)
- `cardContent.*.quantityUnit` (6 keys)
- `cardContent.*.prizes[].amount` (7 keys — `signature-2025-creator` has 2 prizes)
- `cardContent.*.prizes[].qualifier` (5 keys — `best-manager`/`mvp` have a single `null` qualifier each, not a gap)
- `kudos.description`
- `meta.title`, `meta.description`

### Body copy wiring — resolved in Phase 07b

All 13 body components read the catalogues via next-intl since Phase 07b
(2026-08-30). Each converts to `useTranslations` (they stay non-async Server
Components — see `docs/system-architecture.md` § Content scaffolds); unit
tests render through `src/test-utils/render-with-intl.tsx`'s `renderWithIntl()`
(real `NextIntlClientProvider` + the real catalogues); `e2e/locale-body-copy.spec.ts`
covers the Homepage and Award System routes end to end.

### Resolved by orchestrator MoMorph query (2026-08-28 23:40)
`list_file_localizations` returned EN entries for these keys; applied verbatim to `messages/en/*.json` (supersedes the gap lists above for these keys).

| Key | English (MoMorph) |
|---|---|
| `home.awards.cards.top-talent.description` | Honoring top individuals across all aspects |
| `home.awards.cards.top-project.description` | Honoring top projects across all aspects, especially those with outstanding revenue |
| `home.awards.cards.top-project-leader.description` | Honoring inspiring managers who lead innovative project breakthroughs |
| `home.awards.cards.best-manager.description` | Honoring managers with strong management skills leading their teams |
| `home.awards.cards.signature-2025-creator.description` | Honoring managers with strong management skills leading their teams |
| `home.awards.cards.mvp.description` | Honoring managers with strong management skills leading their teams |
| `awards.sectionTitle.heading` | SAA 2025 Award System |
| `awards.card.orConnector` | Or |
| `awards.cardContent.top-talent.description` | Top Talent Award recognizing individuals who excel comprehensively – those who constantly … |
| `awards.cardContent.top-talent.quantityUnit` | Individual |
| `awards.cardContent.top-talent.prizes[0].amount` | 7,000,000 VND |
| `awards.cardContent.top-talent.prizes[0].qualifier` | per prize |
| `awards.cardContent.top-project.description` | Top Project Award honoring excellent project teams with business results exceeding expecta… |
| `awards.cardContent.top-project.quantityUnit` | Team |
| `awards.cardContent.top-project.prizes[0].amount` | 15,000,000 VND |
| `awards.cardContent.top-project.prizes[0].qualifier` | per prize |
| `awards.cardContent.top-project-leader.description` | Top Project Leader Award honoring excellent project managers – those who possess strong ma… |
| `awards.cardContent.top-project-leader.quantityUnit` | Individual |
| `awards.cardContent.top-project-leader.prizes[0].amount` | 7,000,000 VND |
| `awards.cardContent.top-project-leader.prizes[0].qualifier` | per prize |
| `awards.cardContent.best-manager.description` | Best Manager Award honoring outstanding leaders who lead their teams to achieve results be… |
| `awards.cardContent.best-manager.quantityUnit` | Individual |
| `awards.cardContent.best-manager.prizes[0].amount` | 10,000,000 VND |
| `awards.cardContent.signature-2025-creator.quantityUnit` | Individual or Team |
| `awards.cardContent.signature-2025-creator.prizes[0].amount` | 5,000,000 VND |
| `awards.cardContent.signature-2025-creator.prizes[0].qualifier` | for individual award |
| `awards.cardContent.signature-2025-creator.prizes[1].amount` | 8,000,000 VND |
| `awards.cardContent.signature-2025-creator.prizes[1].qualifier` | for team award |
| `awards.cardContent.mvp.quantityUnit` | Individual |
| `awards.cardContent.mvp.prizes[0].amount` | 15,000,000 VND |
| `awards.meta.title` | SAA 2025 Award System |

### Genuine gaps remaining (15 keys — no Figma EN source; EN catalogue falls back to the Vietnamese text at runtime, reviewer H2: the former `[VN] ` marker leaked to English-locale visitors)
- `login.heroSubtitle`
- `login.heroTagline`
- `login.errorMessage`
- `home.eventInfo.place`
- `home.eventInfo.livestreamNote`
- `home.rootFurther.paragraph1`
- `home.rootFurther.quoteTranslation`
- `home.rootFurther.paragraph2`
- `home.awards.subDescription`
- `home.kudos.description`
- `awards.nav.ariaLabel`
- `awards.cardContent.signature-2025-creator.description`
- `awards.cardContent.mvp.description`
- `awards.kudos.description`
- `awards.meta.description`

### Removed hand-written EN copy (2026-08-30, Phase 07b review)
- `common.auth.loginError` — EN value "Sign-in failed. Please try again." had no MoMorph source (authored in Phase 03 before the EN copy rule) and no consumer; removed from `messages/vi/common.json` and `messages/en/common.json`. The login failure notice reads `login.errorMessage` (Vietnamese in both locales — no Figma EN source).
