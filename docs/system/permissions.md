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
- **A Member** can do everything a Guest can, plus: see the Award System page, see the notification bell and their own account avatar in the header, see a floating action button that opens a "Viết Kudo" compose modal, browse the `/kudos` live board, and read **every** Sunner's profile (name, avatar, department, role) — not just their own (widened in round 2; see § Access Boundaries).
- **A Member** cannot edit their own profile anywhere in the app today — not their name, not their avatar, not their role. The only thing that can write to a profile is the system itself, once, at account creation.
- **A Member** can write a kudos (as the real sender, always — anonymity is display-only, never blocks who is recorded), attach up to 5 images, tag 1–5 hashtags, and heart/unheart any kudos except one they sent themselves. A Member cannot send a kudos to themselves — that request is rejected server-side even though nothing at the database layer blocks it.
- **A Member** still cannot write to `hashtag`, `department`, or `special_days` — these three tables stay admin/seed-managed (SQL/Studio), with no insert/update/delete policy for a signed-in user at all.
- **An Admin** can do everything a Member can, plus see an extra "Dashboard" item in their account menu. That item does not go anywhere yet — it is a placeholder with no page behind it, and nothing outside a manual database update currently makes anyone an Admin.
- **Signing out** works for a Member or an Admin from any page that has the header; it only refuses a sign-out request that did not originate from the site itself (a basic anti-forgery check), regardless of role.

## Access Boundaries

The core boundary is **signed-in vs. not** — a Guest cannot see anything beyond Homepage and Login, full stop, and the guard defaults to "require a session" for every page that isn't explicitly listed as public. Today that only bites on the Award System page, but the rule is written to cover any page added later, not just that one.

Within "signed-in," Admin vs. Member is a much thinner boundary: it currently only changes one thing a user can see (an inert "Dashboard" menu item), not what they can do or which data they can reach. As of round 2, **profile-read is the widest boundary in the system**: any authenticated user — Member or Admin, no distinction — can read any other user's profile row (name, avatar, department, role). This reverses the round-1 framing, where the profile-ownership boundary was described as stricter than the role boundary; it was widened because the Kudos feature's recipient search, `@mention` autocomplete, sender/receiver display, and profile stub all need to look up an arbitrary Sunner by id, and `profile` carries no sensitive column to protect. Nobody (Admin included) can *write* to a profile through the app — that boundary is unchanged.

`/kudos`, `/kudos/[id]`, and `/profile` fall under the same default boundary as every other page not explicitly public — a session is required, with no new guard code (they simply are not added to `PUBLIC_ROUTES`).

Becoming an Admin is entirely outside the application: a developer runs a manual, opt-in seed script against a specific email address. There is no UI, API, or self-service flow that changes a user's role.

## Special Conditions

- **Domain + verified-email gate at sign-in**: the `@sun-asterisk.com`-only restriction is enforced once, right after Google hands back a signed-in session — not earlier, and not by trusting Google's own "log in with your work account" hint. A rejected account has its brand-new session torn down immediately, so it never keeps access even briefly.
- **No self-service role change**: promoting a Member to Admin is a manual, developer-run, opt-in database operation, not something exposed anywhere in the product.
- **No profile self-editing**: neither role can currently change their own display name, avatar, or department through the app — the profile row is written exactly once, automatically, at account creation, and is otherwise read-only for everyone including its owner.
- **Cross-origin sign-out is blocked**: a sign-out request that did not come from the site's own pages is rejected outright, independent of who is signed in.
- **Self-kudos is blocked, application-side only**: a Member selecting themselves as a kudos recipient is rejected by the compose Server Action; nothing at the database layer enforces it, so this is a single, deliberate choke point, not defense-in-depth.
- **Self-heart is blocked at two layers**: the UI disables the heart button on a Sunner's own kudos, and the `heart` table's insert RLS policy independently rejects `user_id = kudos.sender_id` — a direct API call bypassing the UI still cannot self-heart.
- **Special-day heart multiplier is a server-side-only decision**: the client never supplies `heart.granted_amount`; it is computed from `special_days` inside the same write path as the insert. No client-writable path may ever set this value directly.
- **Kudos image uploads are scoped to the uploader's own folder**: `storage.objects`' insert policy for the `images` bucket requires the object path to start with the caller's own `kudos/{auth.uid()}/` segment — tightened in round 2 after a review found the original policy only checked the bucket name, letting any signed-in user write into another Sunner's folder. Reads stay bucket-wide by design (every Sunner must see every kudos's images in the feed).
- **No self-service hashtag/department/special-day management**: identical shape to "no self-service role change" above — these are manual, developer/admin-run database operations, not exposed anywhere in the product this round.

No feature flags, A/B experiments, environment-based gates, or locale-based gates were found controlling access anywhere in this codebase (raw detail in [permissions-matrix.md](./permissions-matrix.md) § Client-Side Gate Types).
