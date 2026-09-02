import { getTranslations } from "next-intl/server";
import type { KudosAuthor } from "@/lib/kudos/types";

export interface ProfileStubProps {
  /** `null` when `/profile` has no `id` (or an id nothing resolves to) --
   * item 5 of the RED spec: renders the same placeholder without throwing. */
  profile: KudosAuthor | null;
}

function initialsOf(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * `/profile?id={uuid}` minimal stub (decision-sourced, clarifications.md
 * 2026-08-31 "trang placeholder tối thiểu (avatar + tên + 'Đang phát
 * triển')") -- round 3 replaces this with the real profile screen. Avatar
 * fallback (initials on a null `avatarUrl`) mirrors `CardAuthorBlock`'s own
 * pattern rather than inventing a new one.
 */
export async function ProfileStub({ profile }: ProfileStubProps) {
  const t = await getTranslations("profile");
  const fullName = profile?.fullName ?? null;

  return (
    <section
      data-testid="profile-stub"
      className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 px-4 py-24 text-center"
    >
      <span
        data-testid="profile-stub-avatar"
        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white bg-[#EEE]"
      >
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-body text-2xl font-bold text-canvas">{initialsOf(fullName)}</span>
        )}
      </span>

      <span data-testid="profile-stub-name" className="font-body text-xl font-bold text-white">
        {fullName ?? ""}
      </span>

      <p data-testid="profile-stub-message" className="font-body text-base text-[#999999]">
        {t("developing")}
      </p>
    </section>
  );
}
