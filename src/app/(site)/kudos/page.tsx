"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KvBanner } from "@/components/kudos/board/kv-banner";
import { ComposePill } from "@/components/kudos/board/compose-pill";
import { HighlightCarousel } from "@/components/kudos/board/highlight-carousel";
import { FilterBar, type KudosFilterValue } from "@/components/kudos/board/filter-bar";
import { SpotlightBoard } from "@/components/kudos/board/spotlight-board";
import { KudosFeed } from "@/components/kudos/board/kudos-feed";
import { BoardSidebar } from "@/components/kudos/board/board-sidebar";
import {
  CURRENT_VIEWER_ID,
  DEPARTMENTS,
  FEED_PAGES,
  FILTER_HASHTAGS,
  GIFT_LEADERBOARD,
  HIGHLIGHT_SLIDES,
  RANK_LEADERBOARD,
  SIDEBAR_STATS,
  SPOTLIGHT_NODES,
  SPOTLIGHT_TICKER,
  SPOTLIGHT_TOTAL_KUDOS,
} from "@/components/kudos/board/design-sample-data";

/**
 * Sun* Kudos Live board (MoMorph MaZUn5xHXZ). Composes the 4 section
 * groups per the phase's integration contract -- every region component
 * receives design-sourced sample data through props only; only this file
 * imports `design-sample-data.ts` (Phase 07 deletes that module once real
 * Supabase queries replace it, this file's imports are the only edit that
 * round needs downstream of the section components).
 *
 * `(site)` route group layout supplies the header/footer/FAB shell -- this
 * file owns only the `<main>` landmark and its content, matching
 * `src/app/(site)/page.tsx`'s pattern.
 *
 * Client component: `FilterBar` requires controlled `value`/`onChange`
 * (mutual-exclusivity between the two dropdowns lives in `FilterBar`
 * itself, but which tag/department is selected is this page's state), and
 * `SpotlightBoard.onNodeClick` navigates via `useRouter`. No DB reads this
 * phase (design sample data only) so losing static rendering here costs
 * nothing this round.
 */
export default function KudosBoardPage() {
  const router = useRouter();
  const [filterValue, setFilterValue] = useState<KudosFilterValue>({
    hashtagId: null,
    department: null,
  });

  return (
    <main className="flex w-full flex-col gap-16 pb-24">
      {/* mm:2940:13437 */}
      <KvBanner />

      {/* mm:2940:13448 -- centered on the same 1152px content column as
          the rest of the board */}
      <div className="mx-auto flex w-full max-w-[1152px] justify-center px-4">
        <ComposePill />
      </div>

      {/* mm:2940:13451 -- caption/heading from HighlightCarousel, filters
          composed alongside per B.1's "header kèm bộ lọc" grouping */}
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-4">
        <FilterBar
          hashtags={FILTER_HASHTAGS}
          departments={DEPARTMENTS}
          value={filterValue}
          onChange={setFilterValue}
        />
      </div>
      <HighlightCarousel items={HIGHLIGHT_SLIDES} currentViewerId={CURRENT_VIEWER_ID} />

      {/* mm:2940:14170 (Frame 552) */}
      <SpotlightBoard
        nodes={SPOTLIGHT_NODES}
        totalKudos={SPOTLIGHT_TOTAL_KUDOS}
        onNodeClick={(kudosId) => router.push(`/kudos/${kudosId}`)}
        ticker={SPOTLIGHT_TICKER}
      />

      {/* mm:2940:13481 (Frame 502) -- feed + sidebar side by side */}
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <KudosFeed pages={FEED_PAGES} hasMore={false} currentViewerId={CURRENT_VIEWER_ID} />
        </div>
        <BoardSidebar stats={SIDEBAR_STATS} rankPromotions={RANK_LEADERBOARD} giftRecipients={GIFT_LEADERBOARD} />
      </div>
    </main>
  );
}
