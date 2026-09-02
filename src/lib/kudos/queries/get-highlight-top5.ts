import { createClient } from "@/lib/supabase/server";
import type { KudosCardView } from "../types";
import { buildFeedFilter } from "../derive/feed-filter";
import { compareForHighlight } from "../derive/highlight-order";
import { mapKudosCardViewRow, type KudosCardViewRow } from "./map-kudos-card-view-row";
import { resolveDepartmentReceiverIds } from "./resolve-department-receivers";

export interface GetHighlightTop5Params {
  hashtagId?: string | null;
  departmentName?: string | null;
}

/**
 * Phase 02 (F006): BR-002_HighlightTop5ByHearts -- top 5 by heart count,
 * same predicate as the feed (DEC-002). One round trip when no department
 * filter is active. The SQL `order by` already encodes the heart-count ->
 * created_at -> id tie-break, then the fetched 5 rows are re-sorted with
 * the exact same pure comparator (`compareForHighlight`) as a deterministic
 * belt-and-suspenders -- one source of truth for the ordering rule, proven
 * once by unit test, applied both server- and client-side.
 */
export async function getHighlightTop5(params: GetHighlightTop5Params = {}): Promise<KudosCardView[]> {
  const supabase = await createClient();
  const filter = buildFeedFilter(params);

  let query = supabase
    .from("kudos_card_view")
    .select("*")
    .order("heart_count", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(5);

  if (filter.hashtagId) {
    query = query.contains("hashtag_ids", [filter.hashtagId]);
  }

  if (filter.departmentName) {
    const receiverIds = await resolveDepartmentReceiverIds(supabase, filter.departmentName);
    if (receiverIds.length === 0) {
      return [];
    }
    query = query.in("receiver_id", receiverIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("getHighlightTop5: failed to load highlight rows", error);
    return [];
  }

  return (data as KudosCardViewRow[])
    .map(mapKudosCardViewRow)
    .sort(compareForHighlight);
}
