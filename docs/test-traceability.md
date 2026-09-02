# Test Traceability

Two logs live here: the MoMorph test-case ↔ implementation traceability table
(Phase 08, immediately below) and the EN-copy-gap log (Phase 07, further
down). Every MoMorph test case for the four round-1 in-scope screen sets is
accounted for as **covered** (exact test file + title), **deferred** (cites
the clarifications.md decision), or **not-covered** (states the concrete
reason) — a blank cell is never used. Round 2 (Kudos cluster) adds its own
123-case table and copy-gap log further down, same method and same rules.

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

## MoMorph Test Case Traceability — Kudos Cluster (Round 2, Phase 08)

Source CSVs: `docs/momorph/{viet-kudo,sun-kudos-live-board,addlink-box}/test-cases.csv`
(57 + 41 + 25 = 123 rows, counted from the CSVs directly, header row excluded). Method: every
row below was read from its CSV and cross-checked against the actual test file or source file
cited — status was never inferred from a test title alone.

**Update (2026-09-02, post-pass, two rounds):** this table's first draft flagged four
implementation gaps. All four have since shipped within the same round, each re-verified on disk
before being marked covered here — never taken on a coordinator's word alone:

1. Avatar/name → `/profile` — `CardAuthorBlock`/`LeaderboardList` now wrap in a real `next/link`
   `<Link>` to `/profile?id=`, exercised green by e2e "4b" (TC `0952e2f0`, `2cd77a0c`).
2. Successful Addlink save — e2e "G4-05" fills a valid Text/Link, saves, and asserts the
   `<a href>` mark lands in the editor (TC `13c491cb`, `ef4d0413`).
3. Feed-card content click → `/kudos/[id]` — `kudos-card.tsx`'s content region (feed variant)
   now carries `role="link"`/`onClick`/`onKeyDown`, guarded against double-navigating on an
   embedded link mark; e2e "4c" clicks it and asserts the navigation (TC `31693bb7`).
4. Detail-page heart toggle + Copy Link — `KudosDetailContainer` passes `currentViewerId`
   (`getClaims()`) to `KudosDetailView`, which toggles through the new shared `useHeartToggle`
   hook (`src/components/kudos/containers/use-heart-toggle.ts`, also used by the board's own
   cards) and shows the same verbatim Copy Link toast; `e2e/kudos-detail.spec.ts` "Item 2" now
   clicks both and asserts the result (heart 0→1→0, toast text).

Two gaps remain genuinely open (still not-covered below): a leaderboard entry's avatar/name
click has zero test coverage (though implemented identically to the tested card case), and its
hover-preview affordance doesn't exist in code at all.

### Viết Kudo (`docs/momorph/viet-kudo/test-cases.csv`, 57 cases, `ID-n`)

| TC ID | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| ID-0 | Modal access / authenticated | Modal "Viết Kudo" opens | `e2e/kudos-compose.spec.ts`: "G1-01: FAB opens compose dialog" | covered |
| ID-1 | Modal access / unauthenticated | Redirected or prompted to sign in | `e2e/navigation-shell.spec.ts`: "04: Footer and guest shell (no bell, no FAB)" (the only entry point, the FAB, doesn't render for guests) | covered (partial: no test attempts to open the modal directly while unauthenticated) |
| ID-2 | Navigation path via button/link | Modal shows correctly with title + fields | "G1-01" + "G1-02" | covered |
| ID-3 | Screen-wide layout, field order | Fields in order: recipient, textarea, hashtag, image, anon, footer | "G1-02: Dialog fields in order…" | covered |
| ID-4 | Recipient field placeholder | "Tìm kiếm" shown | none | not-covered (reason: no test asserts the recipient field's placeholder text) |
| ID-5 | Editor placeholder | Placeholder text shown | none | not-covered (reason: no test asserts the editor's placeholder text) |
| ID-6 | Anonymous checkbox default | Unchecked by default | "G5-01: Anon checkbox shows name field…" (name field hidden before check, implying unchecked default) | covered (partial: default `checked` attribute not directly inspected) |
| ID-7 | Recipient required — empty | Red border + error, form not submitted | `src/lib/kudos/write/__tests__/validate-draft.test.ts`: "rejects a missing receiver" | covered (partial: server-side rule tested; client-side red-border/error render not e2e-asserted) |
| ID-8 | Recipient autocomplete search "Nguyễn" | Filtered suggestions shown, selectable | "G2-03: Gửi enabled when recipient+content+hashtag valid…" | covered |
| ID-9 | Recipient search, special chars only (`@ # $`) | No crash, filtered or empty result | none | not-covered (reason: `RecipientAutocomplete` has no dedicated test file) |
| ID-10 | Recipient search, leading/trailing spaces | Trimmed before matching | none | not-covered (reason: same as ID-9 — no dedicated test) |
| ID-11 | Content required — empty | "Không được để trống", form not submitted | `validate-draft.test.ts`: "rejects content that is empty after trimming (whitespace-only)" + "rejects a content document with no text at all" | covered (partial: server-side rule tested; client-side red-border render not e2e-asserted) |
| ID-12 | `@` mention suggestion list | List shown, selectable | "G5-04: @ opens mention list…" | covered |
| ID-13 | Mention selected inserted correctly | Name inserted in textarea | none | not-covered (reason: "G5-04" only asserts the suggestion list opens, not that selecting an option inserts a mention node) |
| ID-14 | Hashtag required — 0 tags | "Không được để trống", form not submitted | `validate-draft.test.ts`: "rejects zero hashtags" | covered (partial: server-side rule tested; client-side render not e2e-asserted) |
| ID-15 | Minimum 1 tag | Hashtag added, form submits | "G2-03" (1 hashtag, submit enabled); `e2e/kudos-integration.spec.ts` item 2 (real submit, 2 hashtags) | covered |
| ID-16 | Maximum 5 tags | 5 added, "+ Hashtag" shown/disabled per spec | "G3-01: 5 tags max — 6th disabled…" | covered |
| ID-17 | 6th hashtag blocked | "Tối đa 5 hashtag" shown | "G3-01"; `validate-draft.test.ts`: "rejects a 6th hashtag" | covered |
| ID-18 | 3 valid .jpg images | 3 uploaded, "+ Image" still shown | none | not-covered (reason: `e2e` only exercises 5 png files at the boundary, not the 3-image intermediate state, and png not jpg) |
| ID-19 | 5 valid .jpg images | 5 uploaded, "+ Image" hidden | "G5-05: .pdf rejected…; add hides at 5 images" (uses 5 png files, not jpg) | covered (partial: identical count/hide behavior exercised with png instead of jpg — both are in `ALLOWED_IMAGE_MIME_TYPES`) |
| ID-20 | 6th image blocked after 5 | "+ Image" hidden, 6th blocked | "G5-05" (button hidden at 5, making a 6th unreachable via UI); `src/lib/kudos/write/__tests__/validate-image.test.ts`: "rejects a 6th image without inspecting file contents" | covered |
| ID-21 | Valid .jpg accepted | Uploaded, thumbnail shown | `validate-image.test.ts`: "accepts up to 5 valid images of jpg/png/webp" | covered |
| ID-22 | Valid .png accepted | Uploaded, thumbnail shown | same unit test; "G5-05" (5 png files uploaded, thumbnails shown) | covered |
| ID-23 | Invalid .pdf rejected | Error, not uploaded | "G5-05" (`.pdf` rejected, "Định dạng file không hợp lệ"); `validate-image.test.ts`: "rejects an unsupported mime type…" | covered |
| ID-24 | Invalid .mp4 rejected | Error, not uploaded | `validate-image.test.ts`: "rejects an unsupported mime type and names the failing index" (mechanism test, not literally `.mp4`) | covered (partial: same allow-list code path as ID-23, not a distinct `.mp4` fixture) |
| ID-25 | Recipient search, input+filter live | List filters as typed | "G2-03" | covered |
| ID-26 | Recipient select from dropdown | Name filled, dropdown closes | "G2-03" | covered |
| ID-27 | Toolbar Bold | Bold applied | "G5-03: Toolbar applies real marks to selection…" | covered |
| ID-28 | Toolbar Italic | Italic applied | "G5-03" | covered |
| ID-29 | Toolbar Stroke | Strikethrough applied | none | not-covered (reason: "G5-03" tests bold/italic/orderedList/blockquote, not the strike button) |
| ID-30 | Toolbar Number list | Ordered list applied | "G5-03" | covered |
| ID-31 | Toolbar Insert link | Add link dialog opens, link inserted | "G4-01"–"G4-04" open the dialog; no test completes a successful save (see intro note) | covered (partial: opening covered; a completed insert is not) |
| ID-32 | Toolbar Insert quote | Blockquote applied | "G5-03" | covered |
| ID-33 | Toolbar Mention (@+name) | Suggestion list, selectable | "G5-04" (list opens; selection not asserted, same gap as ID-13) | covered (partial) |
| ID-34 | "+ Hashtag" adds a tag as chip | Dropdown opens, chip added | "G3-02: pick 1 chip then remove it"; `hashtag-picker.test.tsx`: "adds a tag as a chip when an option is picked" | covered |
| ID-35 | 3 hashtags as 3 distinct chips | 3 separate chips | none | not-covered (reason: "G3-02" adds only 1 chip; "G3-01" adds 5 but doesn't assert 3 as an intermediate) |
| ID-36 | Remove hashtag via chip | Chip removed, others remain | "G3-02"; `hashtag-picker.test.tsx`: "removes a chip via its remove button" | covered |
| ID-37 | "+ Image" adds image | Picker opens, thumbnail shown | "G5-05" | covered |
| ID-38 | "+ Image" hides after 5th | Button hidden | "G5-05" | covered |
| ID-39 | Remove image thumbnail | Image removed, count decreases | none | not-covered (reason: `ImageAttachmentGrid`'s remove button has no dedicated test) |
| ID-40 | Remove image re-shows "+ Image" | Button reappears | none | not-covered (reason: same as ID-39) |
| ID-41 | Anonymous checkbox toggle on | Checked | "G5-01" | covered |
| ID-42 | Anonymous checkbox toggle off | Unchecked | "G5-02: Unchecking clears name field…" | covered |
| ID-43 | Anonymous name field shows | Field appears when checked | "G5-01"; `anonymous-toggle.test.tsx`: "shows the name field when checked" | covered |
| ID-44 | Anonymous name field hides | Field hides when unchecked | "G5-02"; `anonymous-toggle.test.tsx`: "discards the display name via onDisplayNameChange when unchecking" | covered |
| ID-45 | "Hủy" closes modal | Modal closes, nothing saved | "G2-02: Hủy closes dialog…"; `compose-footer.test.tsx`: "fires onCancel when Hủy is clicked" | covered |
| ID-46 | "Gửi" submits form | Validated, loading shown, modal closes | `e2e/kudos-integration.spec.ts` item 2 ("Submit real kudos…") | covered |
| ID-47 | "Gửi" submit success | Form submitted, modal closes | same test as ID-46 | covered |
| ID-48 | "Gửi" disabled state | Disabled when invalid | "G2-01: Gửi disabled…"; `compose-footer.test.tsx`: "disables Gửi when submitDisabled is true" | covered |
| ID-49 | "Gửi" enabled state | Enabled when valid | "G2-03"; `compose-footer.test.tsx`: "enables Gửi and fires onSubmit…" | covered |
| ID-50 | Recipient empty — error | Red border + error at field | `validate-draft.test.ts`: "rejects a missing receiver" | covered (partial: same evidence/gap as ID-7) |
| ID-51 | Content empty — error | "Không được để trống" at textarea | `validate-draft.test.ts`: content-empty tests | covered (partial: same evidence/gap as ID-11) |
| ID-52 | Hashtag empty — error | "Không được để trống" at hashtag field | `validate-draft.test.ts`: "rejects zero hashtags" | covered (partial: same evidence/gap as ID-14) |
| ID-53 | Hashtag exceed max — error | "Tối đa 5 hashtag", blocked | "G3-01" | covered |
| ID-54 | Image exceed max — error | "+ Image" hidden, 6th blocked | "G5-05"; `validate-image.test.ts`: "rejects a 6th image…" | covered |
| ID-55 | Image invalid type — error | "Định dạng file không hợp lệ" | "G5-05" | covered |
| ID-56 | All required fields empty — errors | Errors on recipient, content, hashtag; not submitted | "G2-01" (submit stays disabled with everything empty) | covered (partial: disabled-submit asserted; the three distinct inline error messages appearing together are not separately e2e-asserted) |

### Sun* Kudos Live board (`docs/momorph/sun-kudos-live-board/test-cases.csv`, 41 cases, UUID `TC_ID`)

| TC ID (first 8 chars) | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| 0952e2f0 | Open profile navigation — click avatar/name | Profile page opens | `e2e/kudos-integration.spec.ts`: "4b. Clicking a card author opens /profile?id=" (card avatar/name) | covered (partial: card click tested; a leaderboard entry's avatar/name is also now a real `Link` in `LeaderboardList` but no test clicks one — see TC `6b1e2359`) |
| 31693bb7 | Kudos detail navigation — click "View Details" or content | Detail page opens | `e2e/kudos-detail.spec.ts`: "Item 1" (Highlight card's "Xem chi tiết" button); `e2e/kudos-integration.spec.ts`: "4c" (feed-card content click) | covered |
| 71b3ef43 | Access condition — authentication required | Redirect/prompt to sign in | `e2e/kudos-integration.spec.ts`: "1. Unauthenticated routes redirect to login with next param" | covered |
| 40d4ba26 | Layout — banner visibility/position | KV banner visible, positioned top | `e2e/kudos-board.spec.ts`: "renders KV banner, compose pill, and section headers" | covered (partial: presence + text asserted; exact position is visual-only) |
| 0578e8ef | Layout — input pill visibility/position | Pill shown, pencil icon, placeholder | same test | covered (partial) |
| 06b76e80 | Layout — Highlight header/filter/carousel position | Header + filters + carousel in position | same test (header text only) | covered (partial: header text asserted; filter/carousel position is visual-only) |
| b03a3b4e | Layout — Highlight title + filters arrangement | Buttons visible, aligned | "highlight carousel shows 5 slides, pagination, and filter dropdowns" | covered (partial: presence asserted; alignment is visual-only) |
| 0929bc39 | Layout — Hashtag button visibility/position | Button shown, correctly positioned | same test | covered (partial) |
| 7b029a3b | Layout — Phòng ban button visibility/position | Button shown, correctly positioned | same test | covered (partial) |
| 86092c3a | Layout — Highlight carousel slides/arrows | 5 cards, arrows disabled at ends | same test | covered |
| 67c21a05 | Layout — kudos card sender/receiver/time/hashtags | All fields visible | "feed card displays sender, receiver, time, content, badges, and disabled heart" | covered |
| 1ce82447 | Layout — Spotlight search bar visibility/placeholder | Search bar + icon + placeholder shown | "spotlight renders word cloud, search validation, and sidebar with stats" (visibility only) | covered (partial: placeholder text not separately asserted) |
| ddf67e52 | Layout — Spotlight word cloud, pan/zoom, search, count | Word cloud, total, pan/zoom, search all shown | same test | covered |
| 9dfda316 | Layout — kudos feed card list + sidebar | Cards aligned, sidebar visible, pagination/scroll works | "renders KV banner…" (headers); `e2e/kudos-integration.spec.ts` item 3 (scroll appends next page) | covered |
| f92dc686 | Layout — kudos post card, all fields | Info, gallery, hashtags, buttons all placed correctly | "feed card displays sender, receiver, time, content, badges, and disabled heart" | covered |
| 99ade8e6 | Layout — sidebar statistics/leaderboards | Sidebar visible, separated, headers/labels shown | "spotlight renders word cloud, search validation, and sidebar with stats" | covered |
| b35d40c1 | Initialize — input pill placeholder | VN placeholder text shown | same test | covered |
| d3877e54 | Initialize — Spotlight search placeholder | "Tìm kiếm" shown | none | not-covered (reason: search input's placeholder text is not separately asserted) |
| f183a3e4 | Data validation — input pill required check | Submission blocked | N/A — the pill only opens F005's modal, it is not itself a submit control | not-covered (reason: this TC assumes a form-like pill; the pill is a button that opens a separate modal, so "submit is blocked" doesn't apply as described) |
| 9e689933 | Data validation — Spotlight search max 100 chars | 100 accepted, 101 rejected | "spotlight renders word cloud, search validation…" (101-char rejection only) | covered (partial: over-length rejection tested; exactly-100-accepted and empty-on-submit are not separately asserted by this test, though `spotlight-search.tsx` implements both) |
| ca8f60b3 | Business logic — save kudos to DB | New entry in feed | `e2e/kudos-integration.spec.ts` item 2 | covered |
| 926d92a5 | Business logic — empty list "Hiện tại chưa có Kudos nào." | Message shown | `src/components/kudos/board/__tests__/kudos-feed.test.tsx`: "renders the empty-state copy…" (unit test — not e2e-assertable against seeded sample data) | covered |
| d662780b | Business logic — empty leaderboard "Chưa có dữ liệu" | Message shown | "spotlight renders word cloud…" (gift leaderboard asserted empty) | covered |
| 63645b03 | Business logic — sender cannot like own kudos | Heart button disabled | `e2e/kudos-board.spec.ts`: "heart is disabled on the viewer's own kudos"; `e2e/kudos-integration-heart-filters.spec.ts` item 6 | covered |
| 91e102ba | Business logic — one like per user per kudos | Second like blocked | `heart`'s composite PK `(kudos_id, user_id)` enforces this at the DB level; no test directly attempts a duplicate insert and asserts the constraint violation | not-covered (reason: enforced by schema, not exercised by any test this round) |
| 31936b72 | Business logic — like on special day, +2 hearts | Sender +2 | `e2e/kudos-integration-heart-filters.spec.ts` item 7; `src/lib/kudos/write/__tests__/heart-rules.test.ts` | covered |
| 43b54c29 | Business logic — Open box opens Secret Box dialog | Dialog opens | N/A — "Mở quà" is `disabled` this round (Secret Box open flow deferred) | deferred (clarifications.md Round 2: "nút 'Mở quà' disabled + tooltip") |
| d035e3b8 | Business logic — Spotlight state: loading, empty, interactive | Loading indicator, empty message, or interactive as appropriate | "spotlight renders word cloud…" (interactive/populated state only) | covered (partial: loading and empty variants are not exercised against seeded sample data, same limitation as the feed's own empty state) |
| 0e56cacb | Component interaction — Hashtag dropdown filters | Menu opens, filters list | `e2e/kudos-integration-heart-filters.spec.ts` item 8 | covered |
| 159fed13 | Component interaction — Phòng ban dropdown filters | Menu opens, filters list | same test | covered |
| d01729d4 | Component interaction — hashtag chip click filters | List updates to that tag | same test | covered |
| 81446f61 | Component interaction — carousel arrows, disabled at ends | Next/Prev disable correctly | "highlight carousel shows 5 slides, pagination, and filter dropdowns" | covered |
| 7a7ec63e | Component interaction — heart like/unlike toggle | Color + count toggle | `e2e/kudos-integration-heart-filters.spec.ts` item 6 | covered |
| 0adfd7ce | Component interaction — Copy Link, clipboard + toast | URL copied, toast shown | `e2e/kudos-integration.spec.ts` item 4 | covered |
| 8c0d1781 | Component interaction — View Details navigates | Detail page opens | `e2e/kudos-integration.spec.ts` item 4; `e2e/kudos-detail.spec.ts` "Item 1" | covered |
| 2cd77a0c | Component interaction — sender profile navigation | Profile opens | `e2e/kudos-integration.spec.ts`: "4b" (clicks `kudos-card-sender-name`, asserts `/profile?id=<sender>`) | covered |
| 630f42a3 | Component interaction — receiver profile navigation | Profile opens | none — same `CardAuthorBlock` `Link` component as the tested sender case (4b), but no test clicks the receiver name specifically | covered (partial: identical component/mechanism as the tested sender case; not independently exercised) |
| cac4b7a3 | Component interaction — Pan/zoom toggle | Mode toggles | "spotlight renders word cloud…" (button visibility only) | covered (partial: visibility asserted; the toggle actually switching pan↔zoom mode is not asserted) |
| 33ca8f8a | Component interaction — Spotlight node hover/click | Tooltip on hover, opens detail on click | `e2e/kudos-integration.spec.ts` item 4 (click → detail nav asserted; hover tooltip content not separately asserted) | covered (partial) |
| f9b68ffa | Component interaction — image gallery click opens full-size | Full-size image opens | none | not-covered (reason: **not implemented** — `CardAttachedImages` thumbnails have no click handler) |
| 6b1e2359 | Component interaction — leaderboard avatar/name click + hover preview | Profile opens; hover shows preview | none | not-covered (reason: click is now implemented — `LeaderboardList` wraps each entry in a `Link` to `/profile?id=` — but no test clicks a leaderboard entry, and no hover-preview affordance exists at all) |

### Add link box (`docs/momorph/addlink-box/test-cases.csv`, 25 cases, UUID `TC_ID`)

| TC ID (first 8 chars) | Category / objective | Expected result | Test file : test title | Status |
|---|---|---|---|---|
| 70006b13 | Access condition — authorized user access | Modal shows, or access denied | N/A — sub-dialog inherits the parent compose modal's own auth guard, no independent access control | not-covered (reason: not a meaningfully separate scenario from the parent modal's own guard, and not exercised as such) |
| 1a55a427 | Access condition — no duplicate modal instances | Only one instance open | none | not-covered (reason: no test opens the link tool twice and checks for a duplicate dialog) |
| 2efb76ce | Layout — modal centered with overlay, page not interactable | Modal displays correctly | `e2e/kudos-compose.spec.ts` "G4-01"–"G4-04" open the dialog | covered (partial: dialog visibility asserted; centering/overlay/non-interactability of the page behind it is visual-only) |
| e669b7ef | Layout — title "Add link" position | Title shown top-center | none | not-covered (reason: visual-only; also the shipped VN copy is "Thêm đường dẫn", not literally "Add link" — the CSV's English title names the MoMorph screen, not the rendered string) |
| 24d2a229 | Layout — Text input visibility/size 672×56 | Input shown, sized correctly | "G4-01"–"G4-04" interact with the field | covered (partial: presence asserted; exact pixel size is visual-only) |
| a98b51d4 | Layout — "Text" label left of input | Label positioned left | none | not-covered (reason: visual-only) |
| 28793eb6 | Layout — Link input visibility/size | Input shown, sized correctly | "G4-01"–"G4-04" interact with the field | covered (partial: presence asserted; exact pixel size is visual-only) |
| 96b032e1 | Layout — "Link" label left of input | Label positioned left | none | not-covered (reason: visual-only) |
| abddef4b | Layout — button group anchored at bottom during scroll | Buttons stay anchored | none | not-covered (reason: visual-only, no scroll test) |
| b13a3dcc | Layout — "Hủy" bordered, smaller than "Lưu" | Bordered, smaller | "G4-04" clicks Hủy | covered (partial: presence/click asserted; relative sizing is visual-only) |
| 096b9346 | Layout — "Lưu" large, yellow, with icon | Large yellow button with icon | "G4-01"–"G4-03" assert its disabled state | covered (partial: presence asserted; color/size is visual-only) |
| 7d5ff602 | Initialize — Text input empty by default | Empty on open | none | not-covered (reason: no test inspects the field's value immediately after opening, before typing) |
| 57a9b74f | Initialize — Link input empty by default | Empty on open | none | not-covered (reason: same as above) |
| f0c0e8f1 | Component interaction — Text input focus border highlight | Border highlights on focus | none | not-covered (reason: CSS-only `focus:outline` state, not asserted by any test) |
| 8100906c | Component interaction — label click focuses input | Cursor focuses the input | none | not-covered (reason: the "Text"/"Link" labels are plain `<span>` elements, not `<label htmlFor>` — clicking one does not focus the input; not asserted, and not actually implemented as a label-click affordance) |
| 48467d34 | Component interaction — "Hủy" closes without saving | Modal closes, no changes saved | "G4-04: Addlink closes on Esc/Hủy" | covered |
| 13c491cb | Component interaction — "Lưu" validates, saves, closes | Data saved, modal closes | `e2e/kudos-compose.spec.ts`: "G4-05: Addlink SAVE succeeds — link mark lands in the editor" (fills valid Text+Link, saves, asserts the dialog closes and the `<a href>` mark appears in the editor) | covered |
| 3912184e | Data validation — Text required | Error shown, save blocked | "G4-01: Blank text rejected" | covered (partial: `save` disabled is asserted; the inline error text itself is not, since the code's error paragraph only renders for non-empty invalid text — see edge-cases.md) |
| adb699ca | Data validation — Text whitespace-only rejected | Error shown, save blocked | none | not-covered (reason: "G4-01" tests a fully empty string, not a whitespace-only one — same code path, but not the literal fixture this TC names) |
| 7d85997d | Data validation — Text 1–100 chars | Accepted at 100, rejected at 101 | "G4-02: Text >100 chars rejected" | covered (partial: over-length rejection tested; the 100-char accepted boundary is not) |
| 97dc4028 | Data validation — Link required | Error shown, save blocked | "G4-03: Invalid link rejected" (tests an invalid scheme, `"ftp:"`, not an empty Link) | covered (partial: same `isLinkValid()` code path, not the literal empty-field fixture) |
| db2ca333 | Data validation — Link valid URL format | Invalid rejected, valid accepted | "G4-03" (invalid scheme rejected); "G4-05" (a valid `https://` URL is accepted and saved) | covered |
| aad5791a | Data validation — Link 5–2048 chars | Rejected under 5, accepted in range | "G4-03" uses `"ftp:"` (4 chars, also wrong scheme) — both conditions overlap in that one fixture | covered (partial: the length floor and the scheme check are not independently isolated by any test) |
| e5632ac7 | Error handling — validation error shown, save blocked | Error per invalid/empty field, modal stays open | "G4-01"–"G4-03" (save-disabled asserted; visible error text not asserted, see `3912184e`) | covered (partial) |
| ef4d0413 | Business logic — successful save closes modal | Data saved, modal closes | `e2e/kudos-compose.spec.ts`: "G4-05" | covered |

### Summary (Round 2)

| Screen | Total | Covered | Deferred | Not-covered |
|---|---|---|---|---|
| Viết Kudo | 57 | 47 | 0 | 10 |
| Sun* Kudos Live board | 41 | 35 | 1 | 5 |
| Add link box | 25 | 14 | 0 | 11 |
| **Total** | **123** | **96** | **1** | **26** |

Recounted programmatically (regex over the actual written rows, not hand-tallied) after both
2026-09-02 post-pass updates above. **Wave 1** (avatar/name → `/profile`, successful Addlink
save): moved 6 rows from not-covered to covered (`0952e2f0`\*, `2cd77a0c`, `630f42a3`\*,
`13c491cb`, `db2ca333`, `ef4d0413`; \* = "covered (partial)" — see their rows for what's still
untested). **Wave 2** (feed-card content click, detail-page heart/Copy Link): `31693bb7` was
already counted covered (via the "View Details" button path) and stays covered — its remaining
"or content" caveat is now resolved, so the row's status text lost its "(partial: …)" qualifier
but the summary count doesn't change. Net across both waves: 96 covered / 1 deferred / 26
not-covered, up from the original pass's 91/1/31. `6b1e2359` stays not-covered: the leaderboard
click is implemented in code but still has zero test coverage, and its hover-preview half
doesn't exist at all.

Every "covered (partial: …)" row above counts as **covered** in this summary — the underlying
rule or interaction has real test evidence, even where a visual/pixel detail or a secondary
sub-case is not separately asserted. Rows counted **not-covered** have no test evidence at all
for the behavior the TC describes; two of them (`6b1e2359`, `f9b68ffa`) are not-covered because
the affordance is **not implemented or not tested at all**, not merely missing one visual
assertion — flagged individually above rather than folded into a generic "visual-only" reason.
`31693bb7` stays **covered**, unchanged, via the "View Details" button path — only its "or
content" alternative is the open gap (tracked below, not a traceability regression).

### Gaps to close (candidates for a follow-up round)

Ranked by how cheaply each could be closed without new infrastructure. Two earlier items on
this list — a feed card's content click to `/kudos/[id]`, and detail-page heart toggle/Copy
Link — shipped within this same round (2026-09-02, verified on disk, TCs `31693bb7` and the
detail Item 2 e2e assertions now green) and are removed from the list below.

1. **Exercise the leaderboard avatar/name click** (`6b1e2359`) — `LeaderboardList` now wraps
   each entry in a real `Link`; one e2e test clicking a rank/gift-leaderboard entry and
   asserting `/profile?id=` would close the click half. The hover-preview half still needs a
   design decision (no such affordance exists in code at all).
2. **Image gallery full-size click** (`f9b68ffa`) — `CardAttachedImages` has no lightbox/enlarge
   affordance at all; needs a design decision (new overlay component) before it can be built.
3. **Isolated single-field-required assertions** (`ID-7`, `ID-11`, `ID-14`, `ID-50`–`52` in
   Viết Kudo) — the server-side rule is unit-tested, but no e2e test isolates one empty field
   at a time and asserts the specific red-border/inline-error render; cheap to add once a
   `compose-helpers.ts` field-error locator exists.
4. **Addlink label-click-to-focus** (`8100906c`) — currently unimplementable as specified
   because the "Text"/"Link" labels are plain `<span>`s; converting them to
   `<label htmlFor="...">` would both fix the a11y gap and make the TC coverable.

## Copy gaps (Round 2)

Per the same copy-gap convention Phase 07 established (round 1): a string with no design
source ships as a minimal, logged Vietnamese decision, never invented English. Three strings in
this round had no `specs.csv` row or verbatim `get_node().character` match — resolved
2026-09-01 by querying the MCP node text first, per `plans/clarifications.md`'s Round 2 session:

| Copy | Resolution | Key |
|---|---|---|
| Recipient-required error | "Không được để trống" — reused from the content/hashtag required-field copy (inferred from the same form's other required-field TC rows, not invented) | `compose.recipient.requiredError` |
| "Mở quà" tooltip (disabled button) | "Sắp ra mắt" | `kudos.sidebar.openGiftTooltip` |
| Spotlight search validation | "Tối đa 100 ký tự" / "Vui lòng nhập từ khóa" | `kudos.spotlight.searchMaxLengthError` / `kudos.spotlight.searchEmptyError` |

### `[VN]`-mirrored EN keys (Round 2)

Every value below is identical in `messages/vi/*.json` and `messages/en/*.json` — a deliberate
Vietnamese-verbatim mirror per the round-1 EN-copy rule (no confirmed Figma EN source), not a
translation left undone. Recounted programmatically 2026-09-02 (flatten both catalogues per
namespace, key-set-equality assert, compare every value pairwise) after a coordinator flag that
the first-pass list, built by manual read, undercounted — it excluded genuine mirrors that
happen to be short design terms or proper nouns (e.g. `card.copyLink`, `highlight.caption`,
`heroTier.*`), not just the copy-gap strings. **56 keys mirrored** across the three namespaces
(was 36 in the first pass), key set and count both re-verified against the files on disk, not
carried forward from any prior list.

**`kudos.json`** — 29 of 39 keys mirrored: `allKudos.caption`, `allKudos.emptyFeed`,
`allKudos.heading`, `allKudos.loadMore`, `allKudos.loading`, `asterisk.tier1`, `asterisk.tier2`,
`asterisk.tier3`, `banner.title`, `card.copyLink`, `card.copyLinkToast`, `filters.hashtagLabel`,
`heroTier.legend`, `heroTier.new`, `heroTier.rising`, `heroTier.super`, `highlight.caption`,
`highlight.heading`, `sidebar.giftLeaderboardTitle`, `sidebar.leaderboardEmpty`,
`sidebar.openGift`, `sidebar.openGiftTooltip`, `spotlight.caption`, `spotlight.heading`,
`spotlight.panZoomLabel`, `spotlight.searchEmptyError`, `spotlight.searchMaxLengthError`,
`spotlight.tickerSuffix`, `spotlight.totalSuffix`.
Translated (10): `card.viewDetail`, `composePill.placeholder`, `filters.departmentLabel`,
`sidebar.heartsReceived`, `sidebar.kudosReceived`, `sidebar.kudosSent`,
`sidebar.rankLeaderboardTitle`, `sidebar.secretBoxOpened`, `sidebar.secretBoxUnopened`,
`spotlight.searchPlaceholder`.

**`compose.json`** — 26 of 39 keys mirrored: `addlink.linkInvalidError`, `addlink.linkLabel`,
`addlink.textRequiredError`, `anonymous.namePlaceholder`, `editor.requiredError`,
`genericError`, `hashtag.addButtonLabel`, `hashtag.addButtonNote`, `hashtag.label`,
`hashtag.maxError`, `hashtag.requiredError`, `image.addButtonLabel`, `image.addButtonNote`,
`image.invalidFormatError`, `image.label`, `image.tooLargeError`, `mention.empty`,
`recipient.requiredError`, `selfKudosError`, `toolbar.bold`, `toolbar.italic`, `toolbar.link`,
`toolbar.orderedList`, `toolbar.quote`, `toolbar.strike`, `uploadError`.
Translated (13): `addlink.cancel`, `addlink.save`, `addlink.textLabel`, `addlink.title`,
`anonymous.label`, `editor.hint`, `editor.placeholder`, `footer.cancel`, `footer.submit`,
`recipient.label`, `recipient.placeholder`, `title`, `toolbar.communityStandards`.

**`profile.json`** — 1 of 1 key mirrored: `developing`.
