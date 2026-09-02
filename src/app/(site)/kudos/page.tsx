import { KudosBoardContainer } from "@/components/kudos/containers/kudos-board-container";

type KudosBoardPageProps = {
  searchParams: Promise<{ hashtag?: string | string[]; department?: string | string[] }>;
};

function firstValue(value: string | string[] | undefined): string | null {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved ?? null;
}

/**
 * Sun* Kudos Live board (MoMorph MaZUn5xHXZ). Phase 07: filter state lives
 * in the URL (`?hashtag=&department=`) so this server component reads
 * `searchParams` and hands the resolved filter straight to
 * `KudosBoardContainer`, which re-fetches Highlight and the feed together
 * from that single source of truth (clarifications.md: one shareable-link
 * filter, no component-local state to keep in sync).
 *
 * `(site)` route group layout supplies the header/footer/FAB shell -- this
 * file owns only the route-param resolution, matching every other page in
 * this route group.
 */
export default async function KudosBoardPage({ searchParams }: KudosBoardPageProps) {
  const params = await searchParams;
  const hashtagId = firstValue(params.hashtag);
  const department = firstValue(params.department);

  return <KudosBoardContainer hashtagId={hashtagId} department={department} />;
}
