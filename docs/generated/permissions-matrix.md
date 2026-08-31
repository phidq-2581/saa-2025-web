# Permissions Matrix

**Project**: SAA 2025 Web
**Generated**: 2026-08-31
**Analysis Scope**: Wave 3 — auth/authorization surface (`src/proxy.ts`, `src/app/auth/callback/route.ts`, `src/app/auth/sign-out/route.ts`, `src/lib/auth/*`, `src/lib/profile/get-current-profile.ts`, RLS on `public.profile`, shared header/FAB/account-menu shell)

> **Raw PERM### matrix.** Machine-generated inventory of every permission item with full
> per-permission detail. The plain-language curated view lives at
> [permissions.md](./permissions.md). This file is written FIRST; the curated view is derived
> from it.

**Code Format**: All codes follow `PERM###_NameSlug` format.

**Actors in this system**: `guest` (no session), `member` (authenticated, `profile.role = 'member'`), `admin` (authenticated, `profile.role = 'admin'`), `system` (the `security definer` DB trigger — not an HTTP-reachable role).

---

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_PrivateRouteAuthGuard | PrivateRouteAuthGuard | route-guard | `src/proxy.ts:64-70` |
| PERM002_AuthedLoginRouteRedirect | AuthedLoginRouteRedirect | route-guard | `src/proxy.ts:72-77` |
| PERM003_SunAsteriskDomainSignInGate | SunAsteriskDomainSignInGate | route-guard | `src/app/auth/callback/route.ts:39-42` |
| PERM004_ProfileSelectOwnRLS | ProfileSelectOwnRLS | resource-ownership | `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:22-26` |
| PERM005_ProfileWriteRestrictedToSystemTrigger | ProfileWriteRestrictedToSystemTrigger | data-permission | `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:17-21,34-52` |
| PERM006_SignOutOriginCheck | SignOutOriginCheck | route-guard | `src/app/auth/sign-out/route.ts:26-31` |
| PERM007_AccountMenuDashboardVisibility | AccountMenuDashboardVisibility | screen-permission | `src/components/layout/account-menu.tsx:82-90` |
| PERM008_FabWidgetAuthenticatedVisibility | FabWidgetAuthenticatedVisibility | screen-permission | `src/components/layout/fab-widget-container.tsx:10-13` |
| PERM009_HeaderAuthedVariant | HeaderAuthedVariant | screen-permission | `src/components/layout/site-header-container.tsx:24-36` |

---

## PERM001_PrivateRouteAuthGuard

**Type**: route-guard
**Enforced At**: `src/proxy.ts:64-70`

### Description

Next.js 16's route guard (`proxy.ts`, replaces `middleware.ts`) calls `supabase.auth.getClaims()` on every matched request. `isPublicRoute()` (`src/proxy.ts:14-16`) allows exactly `/` and `/login` (equality, never `startsWith` — the file's own docblock at `:4-11` calls out that a `startsWith` match against this list would make every route public and must never be reintroduced) plus any path prefixed `/auth/`. Any other path, when unauthenticated, redirects to `/login?next=<pathname>`; `redirectWithCookies()` (`:26-30`) copies any rotated/cleared session cookie from the in-flight response onto the redirect so a session rotation mid-request is never lost. This is a default-deny allow-list — it applies to any future non-public path, not only the one below.

### Related Routes

- (GET) /he-thong-giai — the only private frontend route today (`route-list.md:50`: "Guarded — unauthed redirects to `/login?next=/he-thong-giai`")

### Related Screens

- SCR003_AwardSystem - AwardSystem

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | redirected to `/login?next=<original pathname>` |
| member | ✓ | - |
| admin | ✓ | - |

### Related Modules

- `src/proxy.ts`

---

## PERM002_AuthedLoginRouteRedirect

**Type**: route-guard
**Enforced At**: `src/proxy.ts:72-77`

### Description

The inverse guard: when `getClaims()` resolves a valid session AND the pathname is exactly `/login`, the request is redirected to `/` before the Login screen ever renders. An authenticated visitor can never see `SCR002_Login`.

### Related Routes

- (GET) /login

### Related Screens

- SCR002_Login - Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✓ | - |
| member | ✗ | redirected to `/` |
| admin | ✗ | redirected to `/` |

### Related Modules

- `src/proxy.ts`

---

## PERM003_SunAsteriskDomainSignInGate

**Type**: route-guard
**Enforced At**: `src/app/auth/callback/route.ts:39-42`

### Description

After `exchangeCodeForSession(code)` (`:32`) creates a session, the callback rejects it unless **both** hold: `isAllowedEmail(user.email)` (`src/lib/auth/allowed-email.ts:24-37` — exactly one `@`, non-empty local part, domain equals `sun-asterisk.com` case-insensitive) **and** `emailVerified(user)` (`src/lib/auth/email-verified.ts:9-20` — `user.email_confirmed_at` is set AND the first/Google identity's `identity_data.email_verified === true`). On failure it calls `supabase.auth.signOut()` then redirects to `/login?error=domain` (`:40-41`) — the session `exchangeCodeForSession` just created is torn down immediately, never left live even momentarily. The `hd: "sun-asterisk.com"` query param set on the outbound OAuth request (`BL001_GoogleOAuthSignIn`, `src/app/login/actions.ts:30`) is a UI pre-fill hint only; this callback is the sole enforcement point and is re-checked regardless of how the OAuth flow was entered. `role` (member/admin) does not exist yet at this point in the flow — it is assigned only once `BL005_ProfileProvisioningTrigger` provisions the `profile` row after this gate passes.

### Related Routes

- (GET) /auth/callback — ROUTE001

### Related Screens

- SCR002_Login - Login (rejection returns the visitor here with `?error=domain`)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest (any Google account attempting sign-in) | ✓/✗ (conditional) | ✓ only if `@sun-asterisk.com` domain AND Google `email_verified: true`; else ✗ (session revoked, redirected to `/login?error=domain`) |
| member | n/a | role is assigned only after this gate passes and the profile row is provisioned |
| admin | n/a | role is assigned only after this gate passes and the profile row is provisioned |

### Related Modules

- `src/lib/auth/allowed-email.ts` (`isAllowedEmail`)
- `src/lib/auth/email-verified.ts` (`emailVerified`)
- `src/lib/auth/safe-next.ts` (`safeNext` — post-success redirect target validation, not part of the gate itself)
- `src/lib/supabase/server.ts`

---

## PERM004_ProfileSelectOwnRLS

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:22-26`

### Description

Row Level Security is enabled on `public.profile` (`:17`). The only policy, `profile_select_own`, is `for select to authenticated using (auth.uid() = id)` — a signed-in Postgres role may `SELECT` exclusively the row whose `id` equals their own `auth.uid()`. No policy grants read of any other user's row, at any role, including `admin` — the RLS layer makes no admin exception. `grant select on public.profile to authenticated` (`:28`) is what actually lets the `authenticated` Postgres role query the table at all; the policy then narrows which rows.

### Related Routes

N/A — enforced at the database layer, invoked via `src/lib/profile/get-current-profile.ts` wherever the app reads a profile.

### Related Screens

- SCR001_Home - Home
- SCR003_AwardSystem - AwardSystem

(both use the shared header/FAB/account-menu shell that calls `getCurrentProfile()`)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no authenticated Postgres role bound; `auth.uid()` is null, no row matches |
| member | ✓ | own row only (`auth.uid() = id`) |
| admin | ✓ | own row only (`auth.uid() = id`) |

### Related Modules

- `src/lib/profile/get-current-profile.ts`

---

## PERM005_ProfileWriteRestrictedToSystemTrigger

**Type**: data-permission
**Enforced At**: `supabase/migrations/20260828000000_create_profile_table_and_trigger.sql:17-21` (RLS enabled, no write policy declared), `:34-52` (security-definer trigger)

### Description

Because RLS is enabled and only a `SELECT` policy exists, no client role — including the row's own owner — can `INSERT`, `UPDATE`, or `DELETE` a `public.profile` row through the Supabase API. The migration's own comment (`:19-21`) states this is deliberate (YAGNI: "there is no self-service profile edit yet"). The only write path is `handle_new_user()` (`:34-48`), declared `security definer set search_path = public`, fired by `on_auth_user_created` `after insert on auth.users` (`:50-52`). It writes `id`, `full_name`, `avatar_url` from `raw_user_meta_data` using the definer's elevated rights — the calling (`authenticated`/`anon`) role otherwise has no insert grant on the table (`:30-33` docblock). This is the same mechanism documented as `BL005_ProfileProvisioningTrigger` in `behavior-logic.md`.

### Related Routes

N/A — fires on `auth.users` insert regardless of HTTP route (currently only reachable via `BL001_GoogleOAuthSignIn` → `BL003_OAuthCallbackExchange`, i.e. Google OAuth).

### Related Screens

N/A — no screen initiates a profile write directly.

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | no write access |
| member | ✗ | no self-service write access, not even to own row |
| admin | ✗ | no self-service write access, not even to own row |
| system (`handle_new_user()`, security definer) | ✓ | sole writer; fires once per new `auth.users` row, independent of application code |

### Related Modules

N/A — pure SQL trigger + function, no application module. Role promotion (`member` → `admin`) is a separate, out-of-band operation: `supabase/seeds/dev/promote-admin.sql` is an opt-in dev-only seed (not auto-applied by `supabase db reset`) that directly `UPDATE`s a named developer's row — there is no in-app self-service or admin-driven role-change UI.

---

## PERM006_SignOutOriginCheck

**Type**: route-guard
**Enforced At**: `src/app/auth/sign-out/route.ts:26-31`

### Description

`POST /auth/sign-out` reads the incoming `Origin` header; when present and it does not equal the resolved origin (`NEXT_PUBLIC_SITE_URL`, falling back to the request URL's own origin), the handler returns `403 {"error":"invalid_origin"}` immediately, before calling `supabase.auth.signOut()` (`:29-31`). The route is a plain `<form method="post">` target (not a Server Action) precisely so the browser performs a hard, full-page navigation — verified empirically to avoid a Set-Cookie/redirect race a Server Action redirect would otherwise lose (route docblock `:5-24`). A same-origin form POST always carries a same-origin `Origin` header in evergreen browsers; a *missing* header is tolerated (not rejected) because sign-out is idempotent and exposes nothing on success.

### Related Routes

- (POST) /auth/sign-out — ROUTE002

### Related Screens

- SCR001_Home - Home
- SCR003_AwardSystem - AwardSystem

(wherever the shared `AccountMenu`'s Logout form is rendered)

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | n/a | route is reachable with no session to clear; the same-origin check still applies regardless |
| member | ✓ | same-origin POST only; cross-origin POST rejected (403) regardless of role |
| admin | ✓ | same-origin POST only; cross-origin POST rejected (403) regardless of role |

### Related Modules

- `src/lib/supabase/server.ts`
- `src/components/layout/account-menu.tsx` (caller)

---

## PERM007_AccountMenuDashboardVisibility

**Type**: screen-permission
**Enforced At**: `src/components/layout/account-menu.tsx:82-90`

### Description

Inside the shared `AccountMenu` dropdown (rendered only for an authenticated visitor — see PERM009), the "Dashboard" row renders only when `user.role === "admin"`; a `member` sees Profile + Logout only. This is a client-side React conditional (`&&` short-circuit) — there is no `/dashboard` route today (`route-list.md` § Special Files: `forbidden.tsx` exists "ready for the first admin-gated route" but nothing currently calls `forbidden()`), and the row does not navigate anywhere (render-only per the component's own docblock: "Profile/Dashboard render only, no navigation this round"). **No server-side enforcement backs this today** — it is UI-hiding only.

### Related Routes

N/A — no `/dashboard` route exists yet.

### Related Screens

- SCR001_Home - Home
- SCR003_AwardSystem - AwardSystem

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | `AccountMenu` itself is not rendered for guests (see PERM009) |
| member | ✗ | Dashboard row not rendered |
| admin | ✓ | Dashboard row rendered; render-only, no navigation wired |

### Related Modules

- `src/lib/profile/get-current-profile.ts` (role source)

---

## PERM008_FabWidgetAuthenticatedVisibility

**Type**: screen-permission
**Enforced At**: `src/components/layout/fab-widget-container.tsx:10-13`

### Description

`FabWidgetContainer` calls `getCurrentProfile()` and passes `visible={!!profile}` to `FabWidget`, which returns `null` (unmounted, not merely visually hidden) when no profile resolves (`src/components/layout/fab-widget.tsx:35`). `getCurrentProfile()` returns `null` both when there is no session **and** when the profile row lookup itself errors (`get-current-profile.ts:28-30,38-41`) — a transient DB read failure degrades to the guest/hidden state rather than throwing and breaking the page.

### Related Routes

N/A

### Related Screens

- SCR001_Home - Home
- SCR003_AwardSystem - AwardSystem

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | FAB not rendered (returns `null`) |
| member | ✓ | FAB rendered |
| admin | ✓ | FAB rendered |

### Related Modules

- `src/lib/profile/get-current-profile.ts`
- `src/components/layout/fab-widget.tsx`

---

## PERM009_HeaderAuthedVariant

**Type**: screen-permission
**Enforced At**: `src/components/layout/site-header-container.tsx:24-36`, `src/components/layout/site-header.tsx:75,79`

### Description

`SiteHeaderContainer` resolves `variant={profile ? "authed" : "guest"}` and passes `user={profile ?? undefined}` into the client `SiteHeader`. `SiteHeader` renders `NotificationBell` only when `variant === "authed"` (`site-header.tsx:75`), and `AccountMenu` only when `variant === "authed"` **and** `user` is present (`:79`, both conditions). Nav links (About SAA 2025 / Awards Information / Sun* Kudos) and the language dropdown render regardless of `variant` — the bell and account trigger are the only authenticated-only delta (component docblock `:25-36`).

### Related Routes

N/A

### Related Screens

- SCR001_Home - Home
- SCR003_AwardSystem - AwardSystem

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| guest | ✗ | bell + account trigger hidden; logo/nav/language still shown |
| member | ✓ | bell + account trigger shown |
| admin | ✓ | bell + account trigger shown |

### Related Modules

- `src/lib/profile/get-current-profile.ts`
- `src/components/layout/account-menu.tsx`
- `src/components/layout/notification-bell.tsx`

---

## Summary

- **Total Permission Items**: 9
- **By Type**: route-guard: 4, screen-permission: 3, action-permission: 0, data-permission: 1, role-based: 0, resource-ownership: 1, field-permission: 0, api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 0, locale-gate: 0

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [x] All PERM### codes are referenced in FeatureList.md — confirmed no orphans (`feature-list.md` § Cross-Reference Validation: PERM001–PERM006→F001; PERM007–PERM009→F002)
- [x] All related route references are valid — `ROUTE001`/`ROUTE002` confirmed against `route-list.md`; frontend paths (`/login`, `/he-thong-giai`) cited by path only, matching `route-list.md`'s own convention of not assigning codes to frontend pages
- [x] All related screen references are valid (`SCR001_Home`, `SCR002_Login`, `SCR003_AwardSystem` confirmed in `screen-list.md`)
- [x] All related module references are valid
- [x] No orphaned permission references

---

## Client-Side Gate Types

None of the four client-side gate types below (`feature-flag`, `experiment`, `env-gate`, `locale-gate`) were found gating access/authorization anywhere in this codebase. Verified by targeted search, not by omission:

- **feature-flag / experiment**: `grep -rnE "useFlag|useFeature|isEnabled|featureFlag\(|checkFlag|useExperiment|getVariant|abTest\(|experiment\.variant|useAbTest" src` — zero matches.
- **env-gate**: every `process.env.*` reference in `src/**` (excluding tests) is either a Supabase/site-URL config value (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) or `NEXT_PUBLIC_EVENT_START_AT` (the countdown target — a business-logic value, not an access gate; see `business-rules.md`) or `src/lib/i18n/set-locale.ts:25`'s `process.env.NODE_ENV === "production"`, which only toggles the `secure` flag on the locale cookie (cookie-transport hardening, not an authorization gate). None branch route/screen/action access on an env var.
- **locale-gate**: the only `locale ===` comparisons found (`src/components/layout/language-dropdown.tsx:33,51,66`) select which tab styling is bold in the language switcher UI — cosmetic, not a behavioral/access branch.

No `PERM###` item of these four types is emitted in this matrix.
