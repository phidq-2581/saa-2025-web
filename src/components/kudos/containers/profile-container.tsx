import { getProfileById } from "@/lib/kudos/queries/get-profile-by-id";
import { ProfileStub } from "@/components/profile/profile-stub";

export interface ProfileContainerProps {
  id?: string;
}

/**
 * `/profile?id={uuid}` (F006, clarifications.md 2026-08-31 "Stub
 * `/profile?id={uuid}`"). A missing or unresolved `id` renders the same
 * stub with `profile: null` rather than throwing (BR-001: guarded purely
 * by absence from `PUBLIC_ROUTES`, no guard code added here).
 */
export async function ProfileContainer({ id }: ProfileContainerProps) {
  const profile = id ? await getProfileById(id) : null;
  return <ProfileStub profile={profile} />;
}
