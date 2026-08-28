---
status: draft
authored_by: takumi
created: 2026-08-28
lang: en
---

## Why It Matters

SAA 2025 is an internal award programme, so the site must know who is signing in before showing anything beyond the public homepage. Restricting sign-in to Sun* Asterisk Google accounts keeps the site company-only without asking anyone to remember a separate password.

## Who Uses It

- **Sunner** — any Sun* Asterisk employee with a company Google account; signs in once to browse the SAA 2025 site.
- **Admin** — a Sunner whose account is additionally marked as an administrator; signs in the same way, and that marking is what later lets the navigation menu show them extra options.
- **Anonymous visitor** — anyone without a session; can only see the Homepage and the Login page until they sign in.

## What They Do

1. A visitor opens the Login page and reads the SAA 2025 intro copy.
2. The visitor selects "Login With Google" and completes Google's own sign-in screen.
3. The system confirms the Google account belongs to Sun* Asterisk; a company account continues, any other account is turned away and shown an error on the Login page.
4. Once confirmed, the person arrives on the Homepage already signed in, and every page they visit afterward trusts that same sign-in without asking again.
5. Anyone who tries to open a members-only page without having signed in first is sent to the Login page, then carried on to the page they wanted right after they sign in.

## Unresolved Questions

- **Session length policy**: no product guidance yet on whether a signed-in Sunner should ever be asked to sign in again beyond the underlying token's technical lifetime; not raised in `clarifications.md`.
