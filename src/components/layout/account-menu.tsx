"use client";

import { Dropdown } from "@/components/ui/dropdown";

export type AccountUser = {
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
};

export type AccountMenuProps = {
  user: AccountUser;
};

/**
 * F002 BR-002_LogoutClearsSession -- the actual sign-out endpoint. A plain
 * `<form method="post" action={SIGN_OUT_ACTION_PATH}>` (not a Server
 * Action prop) because a Server-Action-triggered redirect is a *soft*,
 * client-side navigation: Next.js updates the URL before the response's
 * Set-Cookie header is guaranteed to be applied to the browser's cookie
 * jar, so a check made right after the URL changes can race the cookie
 * clearing (verified empirically -- reproducible 0/3 with `signOutAction`
 * wired via `onSignOut`, restored to 3/3 only by adding an artificial
 * settle delay no real test should need). A plain `<form method="post">`
 * triggers a hard, full-page navigation instead, which is atomic from the
 * browser's perspective -- Set-Cookie always lands before the next page
 * starts loading, so there is no window for this race.
 * `src/app/auth/sign-out/route.ts`'s Route Handler is the actual endpoint.
 */
const SIGN_OUT_ACTION_PATH = "/auth/sign-out";

function initialsOf(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * Account avatar (A1.8, 40x40 square box, border #998C5F, radius 0px per
 * MCP -- not a circle) opening the role-aware Profile/Dashboard/Logout
 * dropdown (z4sCl3_Qtk member, 54rekaCHG1 admin). Both share this one
 * component and only differ by whether Dashboard renders (DISC-001).
 * `avatarUrl: null` renders initials (clarifications.md decision, mirrors
 * Profile TC GUI-009) instead of Figma's default silhouette icon.
 * Profile/Dashboard render only, no navigation this round (BR-004).
 */
export function AccountMenu({ user }: AccountMenuProps) {
  return (
    <Dropdown
      label="Account"
      triggerTestId="account-trigger"
      panelTestId="account-menu"
      triggerClassName="flex h-10 w-10 items-center justify-center border border-border-gold bg-transparent"
      panelClassName="absolute right-0 z-10 mt-1 flex w-[190px] flex-col gap-1 rounded-panel border border-border-gold bg-panel p-1.5"
      trigger={() =>
        user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            width={24}
            height={24}
            className="h-6 w-6 object-cover"
          />
        ) : (
          <span aria-label={user.fullName} className="font-body text-xs font-bold text-white">
            {initialsOf(user.fullName)}
          </span>
        )
      }
    >
      {({ close }) => (
        <>
          <button
            type="button"
            onClick={close}
            className="flex h-14 items-center justify-between gap-1 rounded-chip bg-gold-10 p-4 font-body text-base font-bold text-white [text-shadow:var(--shadow-glow-gold)]"
          >
            Profile
            <img src="/nav/account-icon.svg" alt="" width={24} height={24} aria-hidden="true" />
          </button>
          {user.role === "admin" && (
            <button
              type="button"
              onClick={close}
              className="flex h-14 items-center justify-between gap-1 rounded-chip p-4 font-body text-base font-bold text-white"
            >
              Dashboard
            </button>
          )}
          {/* No onSubmit-driven close() here: closing the dropdown (a state
              update/re-render) inside the same synchronous "submit" event
              dispatch risks unmounting this <form> before the browser's own
              native submission completes -- the page navigates away on
              success regardless, so there is nothing to close for. */}
          <form method="post" action={SIGN_OUT_ACTION_PATH}>
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-between gap-1 rounded-chip p-4 font-body text-base font-bold text-white"
            >
              Logout
              <img src="/nav/chevron-right.svg" alt="" width={24} height={24} aria-hidden="true" />
            </button>
          </form>
        </>
      )}
    </Dropdown>
  );
}
