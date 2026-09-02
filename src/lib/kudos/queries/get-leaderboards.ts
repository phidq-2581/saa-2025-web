import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "../types";
import { deriveRankPromotions, type ReceivedKudosRow } from "../derive/rank-promotion";

export interface GetLeaderboardsResult {
  rankPromotions: LeaderboardEntry[];
  giftRecipients: LeaderboardEntry[];
}

interface ReceivedKudosQueryRow {
  receiver_id: string;
  receiver_full_name: string | null;
  receiver_avatar_url: string | null;
  created_at: string;
}

/**
 * Phase 02 (F006): D sidebar leaderboards.
 * - Rank promotions: clarifications.md "Suy tu moc hoa thi" -- read every
 *   kudos's (receiver, created_at) once, derive the 10th/20th/50th-kudos
 *   milestone events purely, take the 10 most recent. One round trip,
 *   scales with total kudos volume (accepted at this event's scale, same
 *   YAGNI call as feed offset-pagination -- spec § Assumptions).
 * - Gift recipients: BR-010/clarifications -- `secret_box_gift` has no
 *   redemption flow yet this round, so this leaderboard is legitimately
 *   always empty (`edge-cases.md` § Unresolved Questions item 1); no query
 *   needed, callers render "Chua co du lieu" (BR-011).
 */
export async function getLeaderboards(): Promise<GetLeaderboardsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kudos_card_view")
    .select("receiver_id, receiver_full_name, receiver_avatar_url, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("getLeaderboards: failed to load kudos for rank promotions", error);
    return { rankPromotions: [], giftRecipients: [] };
  }

  const rows: ReceivedKudosRow[] = (data as ReceivedKudosQueryRow[]).map((row) => ({
    userId: row.receiver_id,
    fullName: row.receiver_full_name,
    avatarUrl: row.receiver_avatar_url,
    createdAt: row.created_at,
  }));

  return {
    rankPromotions: deriveRankPromotions(rows),
    giftRecipients: [],
  };
}
