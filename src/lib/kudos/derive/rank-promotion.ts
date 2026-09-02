import type { LeaderboardEntry } from "../types";

/**
 * Phase 02 (F006): clarifications.md "Suy tu moc hoa thi" -- a Sunner's
 * 10th/20th/50th received kudos *is* the rank-promotion event; its
 * `created_at` is the milestone timestamp. No new table -- this reads a
 * flat list of received-kudos rows (one per kudos, any order) and derives
 * the leaderboard: desc by `milestoneReachedAt`, top 10, tie-break by
 * `userId` asc for determinism (unspecified by the spec, so fixed here).
 */

export interface ReceivedKudosRow {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

const MILESTONES = [10, 20, 50] as const;
const LEADERBOARD_SIZE = 10;

export function deriveRankPromotions(rows: ReceivedKudosRow[]): LeaderboardEntry[] {
  const byUser = new Map<string, ReceivedKudosRow[]>();
  for (const row of rows) {
    const existing = byUser.get(row.userId);
    if (existing) {
      existing.push(row);
    } else {
      byUser.set(row.userId, [row]);
    }
  }

  const events: LeaderboardEntry[] = [];
  for (const [userId, userRows] of byUser) {
    const sorted = [...userRows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const milestone of MILESTONES) {
      if (sorted.length < milestone) {
        break;
      }
      const milestoneRow = sorted[milestone - 1];
      events.push({
        userId,
        fullName: milestoneRow.fullName,
        avatarUrl: milestoneRow.avatarUrl,
        kudosReceivedCount: milestone,
        milestoneReachedAt: milestoneRow.createdAt,
      });
    }
  }

  return events
    .sort((a, b) => {
      if (a.milestoneReachedAt !== b.milestoneReachedAt) {
        return b.milestoneReachedAt.localeCompare(a.milestoneReachedAt);
      }
      return a.userId.localeCompare(b.userId);
    })
    .slice(0, LEADERBOARD_SIZE);
}
