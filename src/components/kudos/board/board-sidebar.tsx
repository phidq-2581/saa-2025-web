"use client";

import { useTranslations } from "next-intl";
import type { LeaderboardEntry } from "@/lib/kudos/types";
import type { SidebarStatsView } from "./kudos-board-types";
import { SidebarStats } from "./sidebar-stats";
import { LeaderboardList } from "./leaderboard-list";

/**
 * D_Thống menu phải (2940:13488, MaZUn5xHXZ): the stats card + the two
 * leaderboard cards, stacked with the frame's 24px gap. Composes
 * `SidebarStats` and `LeaderboardList` from props only per the phase-04
 * integration contract -- `page.tsx` (a different section owner) supplies
 * `stats`/`rankPromotions`/`giftRecipients` from the sample data module.
 */
export type BoardSidebarProps = {
  stats: SidebarStatsView;
  rankPromotions: LeaderboardEntry[];
  giftRecipients: LeaderboardEntry[];
};

export function BoardSidebar({ stats, rankPromotions, giftRecipients }: BoardSidebarProps) {
  const t = useTranslations("kudos");

  return (
    // mm:2940:13488
    <aside data-testid="kudos-board-sidebar" className="flex w-[422px] flex-col gap-6">
      <SidebarStats stats={stats} />
      <LeaderboardList
        testId="sidebar-rank-leaderboard"
        title={t("sidebar.rankLeaderboardTitle")}
        entries={rankPromotions}
        emptyLabel={t("sidebar.leaderboardEmpty")}
      />
      <LeaderboardList
        testId="sidebar-gift-leaderboard"
        title={t("sidebar.giftLeaderboardTitle")}
        entries={giftRecipients}
        emptyLabel={t("sidebar.leaderboardEmpty")}
      />
    </aside>
  );
}
