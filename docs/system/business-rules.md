<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Business Rules (DRAFT)

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 3 — derived from `behavior-logic.md`'s 5 BL items, plus the countdown
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
