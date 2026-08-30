import { getLocale } from "next-intl/server";
import { selectLocaleAction } from "@/lib/i18n/select-locale-action";
import { getCurrentProfile } from "@/lib/profile/get-current-profile";
import type { Locale } from "./language-dropdown";
import { SiteHeader } from "./site-header";

/**
 * Server container for `SiteHeader` (F002 DISC-001). Loads the session +
 * `profile.role` server-side and passes plain props into Phase 02's client
 * `SiteHeader` -- the header itself cannot read the session directly
 * (Key Insights: "The header cannot be a client component that reads the
 * session"). `unreadCount={0}` is fixed this round (clarifications.md:
 * "Bell renders; badge is prop-driven... stays hidden this round"); the
 * notification data source is deferred with the panel. `onSelectLocale` is
 * a Server Action reference, never an inline closure, so the `"use server"`
 * boundary is crossed exactly once, at the action module. Sign-out is not
 * injected here: `AccountMenu` submits a plain `<form method="post"
 * action="/auth/sign-out">` to `src/app/auth/sign-out/route.ts` directly
 * (see that route's docblock -- a Server-Action-triggered redirect races
 * the Set-Cookie header against the client-side URL update; verified
 * empirically, reproducibly 0/3, restored to 3/3 only with an artificial
 * settle delay no real request should need).
 */
export async function SiteHeaderContainer() {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()]);

  return (
    <SiteHeader
      variant={profile ? "authed" : "guest"}
      locale={locale as Locale}
      user={profile ?? undefined}
      unreadCount={0}
      onSelectLocale={selectLocaleAction}
    />
  );
}
