# Permissions

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 3 — auth/authorization surface

> **Curated, plain-language view.** This document is for PM, BA, and client audiences who
> need to understand access without reading raw codes. The raw PERM### matrix lives at
> [permissions-matrix.md](./permissions-matrix.md). This prose is derived FROM that matrix.

## Authorization System Type

**System Type**: `hybrid` — a role check (`admin` vs `member`) layered on top of session-based route gating, plus a database ownership rule (Row Level Security) for profile data.

| System Type | Description |
|-------------|-------------|
| `hybrid` | Mixed — roles combined with ownership checks |

**Identified Roles**:
- **Guest** — no session; can only reach the public pages.
- **Member** — signed in with a `@sun-asterisk.com` Google account; the default role for every new account.
- **Admin** — a signed-in member promoted to `admin` by a developer running a manual, opt-in database seed. No self-service or in-app promotion path exists.
- **System** — the database itself, acting through a privileged trigger. It is not a person and is never reachable over HTTP; it exists solely to create a Member's profile row the instant their account is created.

## Curated View

- **A Guest** can view the Homepage and the Login screen. Trying to open anything else (currently only the Award System page) bounces them to Login, which remembers where they were headed so they land back there after signing in.
- **A Guest** can start signing in with Google, but only a `@sun-asterisk.com` work account with a verified Google email is actually let in — any other account is signed straight back out and sent to Login with an error, even though Google itself accepted the login. There is no visible difference in the UI between "wrong domain" and "unverified email"; both produce the same rejection.
- **A Member** can do everything a Guest can, plus: see the Award System page, see the notification bell and their own account avatar in the header, see a floating action button in the corner of the page, and read their own profile (name, avatar, role) — nobody else's.
- **A Member** cannot edit their own profile anywhere in the app today — not their name, not their avatar, not their role. The only thing that can write to a profile is the system itself, once, at account creation.
- **An Admin** can do everything a Member can, plus see an extra "Dashboard" item in their account menu. That item does not go anywhere yet — it is a placeholder with no page behind it, and nothing outside a manual database update currently makes anyone an Admin.
- **Signing out** works for a Member or an Admin from any page that has the header; it only refuses a sign-out request that did not originate from the site itself (a basic anti-forgery check), regardless of role.

## Access Boundaries

The core boundary is **signed-in vs. not** — a Guest cannot see anything beyond Homepage and Login, full stop, and the guard defaults to "require a session" for every page that isn't explicitly listed as public. Today that only bites on the Award System page, but the rule is written to cover any page added later, not just that one.

Within "signed-in," Admin vs. Member is a much thinner boundary: it currently only changes one thing a user can see (an inert "Dashboard" menu item), not what they can do or which data they can reach. The profile-ownership boundary is stricter than the role boundary: even an Admin can only read their *own* profile row — there is no admin override that lets anyone read someone else's profile, and nobody (Admin included) can write to a profile through the app at all.

Becoming an Admin is entirely outside the application: a developer runs a manual, opt-in seed script against a specific email address. There is no UI, API, or self-service flow that changes a user's role.

## Special Conditions

- **Domain + verified-email gate at sign-in**: the `@sun-asterisk.com`-only restriction is enforced once, right after Google hands back a signed-in session — not earlier, and not by trusting Google's own "log in with your work account" hint. A rejected account has its brand-new session torn down immediately, so it never keeps access even briefly.
- **No self-service role change**: promoting a Member to Admin is a manual, developer-run, opt-in database operation, not something exposed anywhere in the product.
- **No profile self-editing**: neither role can currently change their own display name, avatar, or department through the app — the profile row is written exactly once, automatically, at account creation, and is otherwise read-only for everyone including its owner.
- **Cross-origin sign-out is blocked**: a sign-out request that did not come from the site's own pages is rejected outright, independent of who is signed in.

No feature flags, A/B experiments, environment-based gates, or locale-based gates were found controlling access anywhere in this codebase (raw detail in [permissions-matrix.md](./permissions-matrix.md) § Client-Side Gate Types).
