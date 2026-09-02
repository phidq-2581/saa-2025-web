import type { LeaderboardEntry } from "@/lib/kudos/types";
import type { SidebarStatsView, SpotlightNode, SpotlightTickerItem } from "./kudos-board-types";
import { SAMPLE_PEOPLE } from "./sample-reference-data";

/**
 * Phase 04 (F006) sample data for the Spotlight word cloud, the two
 * sidebar leaderboards, and the sidebar stat block.
 */

/** Word-cloud nodes: one node PER KUDOS (shared `SpotlightNode` shape:
 * `{ kudosId, recipientName, receivedAt }` -- 2940:14174 node evidence,
 * spec B.7 "hiển thị tên người nhận Kudos dưới dạng word cloud"). There is
 * no pre-aggregated weight field; `SpotlightBoard` derives each label's
 * visual size from how often its `recipientName` recurs across nodes, the
 * same way the design mockup repeats a name multiple times to imply
 * higher volume. Two nodes per sample person, receivedAt staggered. */
export const SPOTLIGHT_NODES: SpotlightNode[] = SAMPLE_PEOPLE.filter((p) => p.id !== "u-viewer").flatMap(
  (person, personIndex) =>
    Array.from({ length: 2 }, (_, occurrence) => ({
      kudosId: `spotlight-${person.id}-${occurrence}`,
      recipientName: person.fullName,
      receivedAt: new Date(
        Date.UTC(2025, 9, 30, 20, 30) - (personIndex * 2 + occurrence) * 900_000,
      ).toISOString(),
    })),
);

/** Total shown in the Spotlight header ("N KUDOS", spec B.7.1: "388 là
 * tổng số KUDOS của hệ thống được query từ DB"). Sample total is the
 * sample node count -- never the design's placeholder 388
 * (clarifications.md "real Spotlight kudos count ... is a placeholder"). */
export const SPOTLIGHT_TOTAL_KUDOS = SPOTLIGHT_NODES.length;

/** Ticker lines (3004:15999 `character`, frame discovery, clarifications.md
 * 2026-08-31 "Ticker trong Spotlight"). */
export const SPOTLIGHT_TICKER: SpotlightTickerItem[] = [
  { recipientName: "Nguyễn Bá Chức", time: "08:30PM" },
  { recipientName: "Đỗ Hoàng Hiệp", time: "08:12PM" },
  { recipientName: "Dương Thúy An", time: "07:58PM" },
];

/** 10 real rank-promotion entries (clarifications.md "Suy từ mốc hoa thị":
 * a promotion event = crossing the 10/20/50 kudos-received milestone).
 * Cycles the design-sourced people since the frame names only ~8 distinct
 * Sunners; Phase 07 replaces this with the real DB-derived list. */
const MILESTONES = [10, 20, 50] as const;
export const RANK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 10 }, (_, index) => {
  const person = SAMPLE_PEOPLE[index % SAMPLE_PEOPLE.length];
  const milestone = MILESTONES[index % MILESTONES.length];
  return {
    userId: `${person.id}-promo-${index}`,
    fullName: person.fullName,
    avatarUrl: person.avatarUrl,
    kudosReceivedCount: milestone,
    milestoneReachedAt: new Date(Date.UTC(2025, 9, 30 - index, 9, 0)).toISOString(),
  };
});

/** Gift leaderboard renders "Chưa có dữ liệu" this round (clarifications.md
 * "gift leaderboard renders 'Chưa có dữ liệu'"; spec D.3 sample names like
 * "Huỳnh Dương Xuân" describe the eventual real shape, not this round's
 * data source). */
export const GIFT_LEADERBOARD: LeaderboardEntry[] = [];

/** Sidebar stat block (2940:13488 node evidence: 5 concrete `D.1.x`
 * rows -- received/sent/hearts/secret-opened/secret-unopened; `x2` marker
 * on hearts is the special-day discovery). `asteriskTier` matches
 * `CURRENT_VIEWER_ID`'s own tier (sample-reference-data.ts) for internal
 * consistency. RED spec (corrected) asserts `sidebar-stat-line` count === 5. */
export const SIDEBAR_STATS: SidebarStatsView = {
  kudosReceivedCount: 25,
  kudosSentCount: 18,
  heartsReceivedCount: 342,
  heartsDoubled: true,
  secretBoxOpenedCount: 3,
  secretBoxUnopenedCount: 2,
  asteriskTier: 1,
};
