<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Business Rules

**Project**: SAA 2025 Web
**Generated**: 2026-08-31 · **Updated**: 2026-09-02 (round 2 — Kudos rules appended)
**Analysis Scope**: Wave 3 — derived from `behavior-logic.md`'s BL items (5 in round 1, 6 after round 2), plus the countdown
"reached" behavior and the EN-copy fallback behavior, both confirmed against source.

> Plain-language rules the system enforces. No `PERM###`/`BL###` codes here — see
> [permissions-matrix.md](./permissions-matrix.md) and [behavior-logic.md](./behavior-logic.md)
> for the technical detail behind each rule.

### Sun* Domain + Verified-Email Sign-In Restriction
**Applies when:** a visitor completes the Google sign-in flow and Google hands back a session.
**Says:** the system only keeps that session if the Google account's email domain is exactly `sun-asterisk.com` and Google has confirmed (verified) that email address. Otherwise it immediately signs the account back out and sends the visitor to Login with a domain error — even though Google itself accepted the sign-in.
**Source artifact:** [Behavior Logic — BL003_OAuthCallbackExchange](./behavior-logic.md)

---

### Sign-Out Requires a Same-Site Request
**Applies when:** the Logout button's request reaches the sign-out endpoint.
**Says:** the system checks where the request came from; a request from any origin other than the site itself is refused outright, and only a same-site request is allowed to actually end the session and clear the session cookies.
**Source artifact:** [Behavior Logic — BL002_SignOutSession](./behavior-logic.md)

---

### New Account Gets a Profile Automatically
**Applies when:** a new account is created through the Google sign-in flow.
**Says:** the system creates that account's profile record itself, immediately and atomically with account creation, using the name and avatar the account provided — no application code has to run afterward for the profile to exist. Every new account starts as a "member"; nothing in this automatic step ever creates an "admin."
**Source artifact:** [Behavior Logic — BL005_ProfileProvisioningTrigger](./behavior-logic.md)

---

### Event Countdown Locks at Zero
**Applies when:** the time remaining until the event's start reaches zero or goes negative.
**Says:** the countdown stops decreasing and shows `00 / 00 / 00` for days, hours, and minutes, and the "Coming soon" label disappears. The countdown never shows a negative or wrapped-around value.
**Source artifact:** [Behavior Logic — BL004_EventCountdownTick](./behavior-logic.md)

---

### Countdown Never Flashes a Wrong First Value
**Applies when:** the Homepage first loads, before the countdown has had a chance to start ticking in the visitor's browser.
**Says:** the very first thing shown to every visitor (and to search engines) is always the same `00 / 00 / 00` placeholder with "Coming soon" still visible, regardless of the actual time remaining. The real countdown value only appears a moment later, once the page has finished loading. This keeps the server-rendered page and the browser's first update from ever visibly disagreeing.
**Source artifact:** [Behavior Logic — BL004_EventCountdownTick](./behavior-logic.md)

---

### Countdown Never Breaks on a Bad Configuration Value
**Applies when:** the event's configured start time is missing or not a valid date.
**Says:** rather than crashing the page, the system treats a missing or invalid start time exactly like the event has already happened — the countdown shows `00 / 00 / 00` and "Coming soon" stays hidden.
**Source artifact:** [Behavior Logic — BL004_EventCountdownTick](./behavior-logic.md)

---

### English Pages Fall Back to Vietnamese Text When No Translation Exists
**Applies when:** a visitor views the site in English, and a piece of content has no confirmed English translation from the design source.
**Says:** rather than showing an empty string, an error, or a visible "untranslated" marker, the system displays the original Vietnamese text on the English page for that piece of content. This currently affects roughly 15 specific pieces of copy across the Login, Homepage, and Award System pages — subtitle/tagline text, event details, and several award descriptions.
**Source artifact:** [Test Traceability § EN copy gaps](../../../docs/test-traceability.md)

---

## Round 2 — Sun* Kudos rules (2026-09-02)

### A Kudos Always Has a Recipient, Content and 1–5 Hashtags
**Applies when:** a Sunner submits the Viết Kudo form.
**Says:** the system refuses to store a kudos missing a recipient, with empty content, or with fewer than 1 or more than 5 hashtags. This is enforced twice — in the server action before any write, and by the database function that inserts the kudos, its hashtag links and its images as one all-or-nothing transaction — so a half-written kudos can never exist at rest.
**Source artifact:** [Permissions § PERM016](../generated/permissions-matrix.md) · [Data Model § create_kudos](../data-model.md)

### You Cannot Send a Kudos to Yourself
**Applies when:** the chosen recipient is the signed-in sender.
**Says:** the server rejects the submission outright with a dedicated error; anonymity does not bypass this — the real sender identity is always resolved server-side.
**Source artifact:** [Permissions § PERM016](../generated/permissions-matrix.md)

### One Heart per Sunner per Kudos — Never Your Own
**Applies when:** a Sunner taps the heart on a kudos card.
**Says:** each Sunner can heart a given kudos at most once (a second tap withdraws it), and nobody can heart a kudos they sent themselves — blocked in the action and again by the database's own row rules.
**Source artifact:** [Permissions § PERM012/PERM017](../generated/permissions-matrix.md)

### Special Days Double the Heart — and the Withdrawal
**Applies when:** a heart is granted on a date listed in the special-days table (evaluated in Vietnam time, not UTC).
**Says:** the kudos SENDER is credited 2 hearts instead of 1; withdrawing that heart later takes back exactly what was granted (2, not 1), because the credit is read from the stored row, never recomputed.
**Source artifact:** [Behavior Logic — BL006](../generated/behavior-logic.md) · [Data Model § heart](../data-model.md)

### Kudos Content Is Allow-Listed, Not Trusted
**Applies when:** kudos rich-text content is written or rendered.
**Says:** only the sanctioned node and mark kinds (paragraphs, lists, quotes, bold/italic/strike, mentions, http/https links) survive; unknown shapes and unsafe link schemes are rejected on write and dropped on render, so a row written outside the app still cannot inject markup.
**Source artifact:** [Data Model § content discriminators](../data-model.md)

### Images: at Most 5, Image Types Only, Your Own Folder Only
**Applies when:** images are attached to a kudos.
**Says:** at most 5 files, jpg/png/webp only, ≤5MB each — checked before any upload starts — and the storage bucket itself only accepts writes under the uploader's own folder path, so one Sunner cannot overwrite another's images.
**Source artifact:** [Permissions § PERM015](../generated/permissions-matrix.md)

### Anonymity Hides the Name, Not the Accountability
**Applies when:** a kudos is sent with the anonymous toggle on.
**Says:** readers see the chosen display name instead of the sender, but the real sender is always recorded — anonymity is presentation-only and never changes who the system holds responsible or who receives heart credit.
**Source artifact:** [Data Model § kudos.is_anonymous](../data-model.md)
