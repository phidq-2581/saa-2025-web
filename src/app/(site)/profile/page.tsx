import { SAMPLE_PEOPLE } from "@/components/kudos/board/sample-reference-data";
import type { KudosAuthor } from "@/lib/kudos/types";
import { ProfileStub } from "@/components/profile/profile-stub";

type ProfilePageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * `/profile?id={uuid}` -- decision-sourced minimal stub (clarifications.md
 * 2026-08-31 "trang placeholder tối thiểu (avatar + tên + 'Đang phát
 * triển'); round 3 thay bằng màn thật"). This phase resolves `id` against
 * the same design-sourced sample people `/kudos` draws its cards from
 * (`SAMPLE_PEOPLE`); Phase 07 swaps this lookup for a real
 * `getProfileById` query without touching `ProfileStub` (BR-001: guarded
 * purely by absence from `PUBLIC_ROUTES`, no guard code added here). A
 * missing or unresolved `id` renders the same stub with `profile: null`
 * rather than throwing.
 */
export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const id = firstValue(params.id);
  const person = id ? SAMPLE_PEOPLE.find((sample) => sample.id === id) : undefined;
  const profile: KudosAuthor | null = person
    ? { id: person.id, fullName: person.fullName, avatarUrl: person.avatarUrl }
    : null;

  return (
    <main className="flex w-full flex-col">
      <ProfileStub profile={profile} />
    </main>
  );
}
