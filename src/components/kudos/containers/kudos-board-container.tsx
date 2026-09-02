import { createClient } from "@/lib/supabase/server";
import type { KudosCardView } from "@/lib/kudos/types";
import type { AuthorPresentation, HeroTier, SidebarStatsView, SpotlightTickerItem } from "@/components/kudos/board/kudos-board-types";
import { getFilterOptions } from "@/lib/kudos/queries/get-filter-options";
import { getHighlightTop5 } from "@/lib/kudos/queries/get-highlight-top5";
import { getFeedPage } from "@/lib/kudos/queries/get-feed-page";
import { getSpotlight } from "@/lib/kudos/queries/get-spotlight";
import { getSidebarStats } from "@/lib/kudos/queries/get-sidebar-stats";
import { getLeaderboards } from "@/lib/kudos/queries/get-leaderboards";
import { getRecipients } from "@/lib/kudos/queries/get-recipients";
import { getReceivedKudosCounts } from "@/lib/kudos/queries/get-received-kudos-counts";
import { resolveImageUrls } from "@/lib/kudos/queries/resolve-image-urls";
import { computeHoChiMinhDateString } from "@/lib/kudos/write/heart-rules";
import { deriveAsteriskTier, type AsteriskTier } from "@/lib/kudos/derive/asterisk-tier";
import { KvBanner } from "@/components/kudos/board/kv-banner";
import { KudosFeedContainer, type SampleFeedPage } from "./kudos-feed-container";

export interface KudosBoardContainerProps {
  hashtagId: string | null;
  department: string | null;
}

/** No separate hero-tier threshold rule was ever defined this round
 * (clarifications.md logs it "still open, non-blocking") -- unlike
 * `asteriskTier`, which DOES have an approved rule (10/20/50 kudos
 * received, BR-008). Reusing the same already-approved milestone tier for
 * the hero-tier badge (rather than inventing a second, undefined threshold
 * scale) is the only non-arbitrary choice available; flagged in the
 * delivery report for a design checkpoint to override if wrong. */
const HERO_TIER_BY_ASTERISK: Record<AsteriskTier, HeroTier> = {
  0: "new",
  1: "rising",
  2: "super",
  3: "legend",
};

/** `profile.department` lookup for arbitrary feed authors has no query
 * this round (Phase 04's delivery report: "Thresholds are Phase 07's job"
 * covers tiers; department was never in scope for any query) -- rendered
 * as this honest, documented default rather than an extra per-card round
 * trip for a field no RED assertion checks. Same pattern as
 * `secretBoxUnopenedCount`'s "fixed at 0" (Phase 02). */
const DEFAULT_DEPARTMENT = "";

const DEFAULT_SIDEBAR_STATS: SidebarStatsView = {
  kudosReceivedCount: 0,
  kudosSentCount: 0,
  heartsReceivedCount: 0,
  secretBoxOpenedCount: 0,
  secretBoxUnopenedCount: 0,
  asteriskTier: 0,
  heartsDoubled: false,
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function buildAuthorMeta(userId: string, receivedCounts: ReadonlyMap<string, number>): AuthorPresentation {
  const asteriskTier = deriveAsteriskTier(receivedCounts.get(userId) ?? 0);
  return { department: DEFAULT_DEPARTMENT, heroTier: HERO_TIER_BY_ASTERISK[asteriskTier], asteriskTier };
}

async function toCardSample(
  supabase: SupabaseServerClient,
  view: KudosCardView,
  receivedCounts: ReadonlyMap<string, number>,
) {
  const imagePaths = await resolveImageUrls(supabase, view.imagePaths);
  return {
    ...view,
    imagePaths,
    senderMeta: buildAuthorMeta(view.sender.id, receivedCounts),
    receiverMeta: buildAuthorMeta(view.receiver.id, receivedCounts),
  };
}

function formatTickerTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}${period}`;
}

async function isSpecialDayToday(supabase: SupabaseServerClient): Promise<boolean> {
  const { data, error } = await supabase.from("special_days").select("day");
  if (error || !data) {
    console.error("KudosBoardContainer: failed to read special_days", error);
    return false;
  }
  const today = computeHoChiMinhDateString(new Date());
  return data.some((row) => (row.day as string) === today);
}

/**
 * Inline server action (Next.js allows a `"use server"` function declared
 * inside an otherwise-ordinary Server Component module, then passed down
 * as a plain prop) backing the feed's "load more" -- `getFeedPage`'s own
 * client (`@/lib/supabase/server`) reads request cookies via
 * `next/headers`, so it cannot be imported directly into
 * `kudos-feed-container.tsx`'s "use client" code. Passing it as a prop
 * (rather than a sibling import in both files) also avoids a circular
 * import between the two container modules.
 */
async function loadMoreFeedAction(params: {
  offset: number;
  hashtagId: string | null;
  department: string | null;
}): Promise<SampleFeedPage> {
  "use server";
  const supabase = await createClient();
  const [page, receivedCounts] = await Promise.all([
    getFeedPage({ offset: params.offset, hashtagId: params.hashtagId, departmentName: params.department }),
    getReceivedKudosCounts(supabase),
  ]);
  const items = await Promise.all(page.items.map((row) => toCardSample(supabase, row, receivedCounts)));
  return { items, nextOffset: page.nextOffset };
}

/**
 * Server data-fetching root for `/kudos` (F006). Resolves every Phase 02
 * query plus the viewer's own id in parallel, converts the shared
 * `KudosCardView` rows into the presentational `KudosCardSample` shape
 * Track A's components require, and hands everything to
 * `KudosFeedContainer` -- the single client boundary for the interactive
 * region below the banner (filters, highlight, spotlight, feed, sidebar).
 * `key={filterKey}` forces a full remount of that client shell on every
 * filter change, which is what actually resets the highlight carousel to
 * slide 1 and clears any locally-accumulated "load more" pages (DEC:
 * simpler and more correct than manually diffing/merging stale client
 * state against a freshly filtered dataset).
 */
export async function KudosBoardContainer({ hashtagId, department }: KudosBoardContainerProps) {
  const supabase = await createClient();
  const filter = { hashtagId, departmentName: department };

  const [
    claimsResult,
    filterOptions,
    highlightRows,
    feedPage,
    spotlight,
    sidebarStats,
    leaderboards,
    recipients,
    heartsDoubled,
    receivedCounts,
  ] = await Promise.all([
    supabase.auth.getClaims(),
    getFilterOptions(),
    getHighlightTop5(filter),
    getFeedPage({ offset: 0, ...filter }),
    getSpotlight(filter),
    getSidebarStats(),
    getLeaderboards(),
    getRecipients(),
    isSpecialDayToday(supabase),
    getReceivedKudosCounts(supabase),
  ]);

  const currentViewerId = (claimsResult.data?.claims?.sub as string | undefined) ?? "";

  const [highlightSlides, feedItems] = await Promise.all([
    Promise.all(highlightRows.map((row) => toCardSample(supabase, row, receivedCounts))),
    Promise.all(feedPage.items.map((row) => toCardSample(supabase, row, receivedCounts))),
  ]);

  const initialFeedPage: SampleFeedPage = { items: feedItems, nextOffset: feedPage.nextOffset };
  const sidebarStatsView: SidebarStatsView = sidebarStats
    ? { ...sidebarStats, heartsDoubled }
    : DEFAULT_SIDEBAR_STATS;
  const spotlightTicker: SpotlightTickerItem[] | undefined = spotlight.nodes[0]
    ? [{ recipientName: spotlight.nodes[0].recipientName ?? "", time: formatTickerTime(spotlight.nodes[0].receivedAt) }]
    : undefined;

  return (
    <main className="flex w-full flex-col gap-16 pb-24">
      {/* mm:2940:13437 */}
      <KvBanner />

      <KudosFeedContainer
        key={`${hashtagId ?? ""}::${department ?? ""}`}
        currentViewerId={currentViewerId}
        filterValue={{ hashtagId, department }}
        filterOptions={filterOptions}
        highlightSlides={highlightSlides}
        spotlightNodes={spotlight.nodes}
        spotlightTotal={spotlight.totalKudosCount}
        spotlightTicker={spotlightTicker}
        initialFeedPage={initialFeedPage}
        sidebarStats={sidebarStatsView}
        rankPromotions={leaderboards.rankPromotions}
        giftRecipients={leaderboards.giftRecipients}
        recipients={recipients}
        loadMoreAction={loadMoreFeedAction}
      />
    </main>
  );
}
