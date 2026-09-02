import { KudosDetailContainer } from "@/components/kudos/containers/kudos-detail-container";

type KudosDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * `/kudos/[id]` -- decision-sourced detail screen, no MoMorph frame of its
 * own (clarifications.md 2026-08-31 "trang detail tối thiểu ... tái dùng
 * component card"). Phase 07: a thin route-param pass-through --
 * `KudosDetailContainer` owns the real `getKudosById` lookup and both the
 * found/not-found root markup (BR-001: this route is guarded purely by its
 * absence from `PUBLIC_ROUTES`, no guard code added here).
 */
export default async function KudosDetailPage({ params }: KudosDetailPageProps) {
  const { id } = await params;
  return <KudosDetailContainer id={id} />;
}
