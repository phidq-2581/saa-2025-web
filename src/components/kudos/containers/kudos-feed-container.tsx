"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LeaderboardEntry, KudosAuthor, SpotlightNode } from "@/lib/kudos/types";
import type { FilterOptions } from "@/lib/kudos/queries/get-filter-options";
import type { KudosCardSample, SidebarStatsView, SpotlightTickerItem } from "@/components/kudos/board/kudos-board-types";
import { FilterBar, type KudosFilterValue } from "@/components/kudos/board/filter-bar";
import { ComposePill } from "@/components/kudos/board/compose-pill";
import { HighlightCarousel } from "@/components/kudos/board/highlight-carousel";
import { SpotlightBoard } from "@/components/kudos/board/spotlight-board";
import { KudosFeed } from "@/components/kudos/board/kudos-feed";
import { BoardSidebar } from "@/components/kudos/board/board-sidebar";
import { ComposeDialogContainer } from "./compose-dialog-container";
import { useInfiniteFeed } from "./use-infinite-feed";
import { useHeartToggle } from "./use-heart-toggle";

export interface SampleFeedPage {
  items: KudosCardSample[];
  nextOffset: number | null;
}

export interface KudosFeedContainerProps {
  currentViewerId: string;
  filterValue: KudosFilterValue;
  filterOptions: FilterOptions;
  highlightSlides: KudosCardSample[];
  spotlightNodes: SpotlightNode[];
  spotlightTotal: number;
  spotlightTicker?: SpotlightTickerItem[];
  initialFeedPage: SampleFeedPage;
  sidebarStats: SidebarStatsView;
  rankPromotions: LeaderboardEntry[];
  giftRecipients: LeaderboardEntry[];
  recipients: KudosAuthor[];
  /** The server action backing "load more" -- passed as a prop (not a
   * sibling import) so this client module never imports from the server
   * component that renders it (`kudos-board-container.tsx` already imports
   * THIS module, so a mutual import would be circular). */
  loadMoreAction: (params: {
    offset: number;
    hashtagId: string | null;
    department: string | null;
  }) => Promise<SampleFeedPage>;
}

function buildKudosUrl(value: KudosFilterValue): string {
  const params = new URLSearchParams();
  if (value.hashtagId) params.set("hashtag", value.hashtagId);
  if (value.department) params.set("department", value.department);
  const query = params.toString();
  return query ? `/kudos?${query}` : "/kudos";
}

/**
 * The single client boundary for everything below `KvBanner` on `/kudos`
 * (Phase 07): filter navigation, the shared compose dialog's pill entry
 * point, highlight/feed heart toggling with a copy-link toast, and
 * infinite scroll. `kudos-board-container.tsx` remounts this component
 * (via `key`) whenever the filter changes, so every hook below starts
 * fresh per filter -- no manual state-diffing against a re-filtered
 * dataset.
 */
export function KudosFeedContainer({
  currentViewerId,
  filterValue,
  filterOptions,
  highlightSlides,
  spotlightNodes,
  spotlightTotal,
  spotlightTicker,
  initialFeedPage,
  sidebarStats,
  rankPromotions,
  giftRecipients,
  recipients,
  loadMoreAction,
}: KudosFeedContainerProps) {
  const t = useTranslations("kudos");
  const router = useRouter();

  const { feedItems, nextOffset, loadingMore, handleLoadMore } = useInfiniteFeed({
    initialFeedPage,
    filterValue,
    loadMoreAction,
  });
  const { handleToggleHeart, heartCountOf, likedIds } = useHeartToggle();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  function handleCopyLink() {
    setToastMessage(t("card.copyLinkToast"));
  }

  function handleHashtagClick(hashtagId: string) {
    router.push(buildKudosUrl({ ...filterValue, hashtagId }));
  }

  function withHeartOverride(item: KudosCardSample): KudosCardSample {
    return { ...item, heartCount: heartCountOf(item.id, item.heartCount) };
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1152px] justify-center px-4">
        <ComposePill onClick={() => setComposeOpen(true)} />
      </div>

      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-4">
        <FilterBar
          hashtags={filterOptions.hashtags}
          departments={filterOptions.departments}
          value={filterValue}
          onChange={(next) => router.push(buildKudosUrl(next))}
        />
      </div>

      <HighlightCarousel
        items={highlightSlides.map(withHeartOverride)}
        currentViewerId={currentViewerId}
        onToggleHeart={handleToggleHeart}
        onCopyLink={handleCopyLink}
        onHashtagClick={handleHashtagClick}
        likedIds={likedIds}
      />

      <SpotlightBoard
        nodes={spotlightNodes}
        totalKudos={spotlightTotal}
        onNodeClick={(kudosId) => router.push(`/kudos/${kudosId}`)}
        ticker={spotlightTicker}
      />

      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <KudosFeed
            pages={[{ items: feedItems.map(withHeartOverride), nextOffset }]}
            hasMore={nextOffset !== null}
            onLoadMore={handleLoadMore}
            loading={loadingMore}
            currentViewerId={currentViewerId}
            onToggleHeart={handleToggleHeart}
            onCopyLink={handleCopyLink}
            onHashtagClick={handleHashtagClick}
            likedIds={likedIds}
          />
        </div>
        <BoardSidebar stats={sidebarStats} rankPromotions={rankPromotions} giftRecipients={giftRecipients} />
      </div>

      {toastMessage ? (
        <div
          data-testid="toast"
          role="status"
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-chip border border-border-gold bg-panel px-4 py-2 font-body text-sm font-bold text-white"
        >
          {toastMessage}
        </div>
      ) : null}

      <ComposeDialogContainer
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        recipients={recipients}
        hashtags={filterOptions.hashtags}
        currentViewerId={currentViewerId}
        onSubmitted={() => setComposeOpen(false)}
      />
    </>
  );
}
