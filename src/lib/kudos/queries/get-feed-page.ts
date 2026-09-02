import { createClient } from "@/lib/supabase/server";
import type { FeedPage } from "../types";
import { buildFeedFilter } from "../derive/feed-filter";
import { computeNextOffset } from "../derive/pagination";
import { mapKudosCardViewRow, type KudosCardViewRow } from "./map-kudos-card-view-row";
import { resolveDepartmentReceiverIds } from "./resolve-department-receivers";

const PAGE_SIZE = 10;

export interface GetFeedPageParams {
  offset: number;
  hashtagId?: string | null;
  departmentName?: string | null;
}

const EMPTY_PAGE: FeedPage = { items: [], nextOffset: null };

/**
 * Phase 02 (F006): C.2-C.7 All Kudos feed -- filtered (DEC-002), offset/
 * limit page of 10 (DEC-003). One round trip when no department filter is
 * active; a department filter costs one extra lookup because the view has
 * no department column (see `resolveDepartmentReceiverIds`). Degrades to
 * an empty page with a logged error rather than throwing -- BR-011's
 * "Hien tai chua co Kudos nao." empty state already covers a zero-item page.
 */
export async function getFeedPage(params: GetFeedPageParams): Promise<FeedPage> {
  const supabase = await createClient();
  const filter = buildFeedFilter({ hashtagId: params.hashtagId, departmentName: params.departmentName });

  let query = supabase
    .from("kudos_card_view")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(params.offset, params.offset + PAGE_SIZE - 1);

  if (filter.hashtagId) {
    query = query.contains("hashtag_ids", [filter.hashtagId]);
  }

  if (filter.departmentName) {
    const receiverIds = await resolveDepartmentReceiverIds(supabase, filter.departmentName);
    if (receiverIds.length === 0) {
      return EMPTY_PAGE;
    }
    query = query.in("receiver_id", receiverIds);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("getFeedPage: failed to load feed page", error);
    return EMPTY_PAGE;
  }

  const items = (data as KudosCardViewRow[]).map(mapKudosCardViewRow);

  return {
    items,
    nextOffset: computeNextOffset(params.offset, items.length, PAGE_SIZE),
  };
}
