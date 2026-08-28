"use client";

import { Dropdown } from "@/components/ui/dropdown";

export type AccountUser = {
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
};

export type AccountMenuProps = {
  user: AccountUser;
  onSignOut?: () => void;
};

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
export function AccountMenu({ user, onSignOut }: AccountMenuProps) {
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
          <button
            type="button"
            onClick={() => {
              onSignOut?.();
              close();
            }}
            className="flex h-14 items-center justify-between gap-1 rounded-chip p-4 font-body text-base font-bold text-white"
          >
            Logout
            <img src="/nav/chevron-right.svg" alt="" width={24} height={24} aria-hidden="true" />
          </button>
        </>
      )}
    </Dropdown>
  );
}
