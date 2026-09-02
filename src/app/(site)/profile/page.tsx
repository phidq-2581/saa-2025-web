import { ProfileContainer } from "@/components/kudos/containers/profile-container";

type ProfilePageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * `/profile?id={uuid}` -- decision-sourced minimal stub (clarifications.md
 * 2026-08-31 "trang placeholder tối thiểu (avatar + tên + 'Đang phát
 * triển'); round 3 thay bằng màn thật"). Phase 07: a thin route-param
 * pass-through -- `ProfileContainer` owns the real `getProfileById` lookup
 * (BR-001: guarded purely by absence from `PUBLIC_ROUTES`, no guard code
 * added here).
 */
export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const id = firstValue(params.id);

  return (
    <main className="flex w-full flex-col">
      <ProfileContainer id={id} />
    </main>
  );
}
