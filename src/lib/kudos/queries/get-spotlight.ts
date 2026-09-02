import { createClient } from "@/lib/supabase/server";
import type { SpotlightNode } from "../types";
import { buildFeedFilter } from "../derive/feed-filter";
import { deriveSpotlightNodes, type SpotlightKudosRow } from "../derive/spotlight-nodes";
import { resolveDepartmentReceiverIds } from "./resolve-department-receivers";

export interface GetSpotlightParams {
  hashtagId?: string | null;
  departmentName?: string | null;
}

export interface GetSpotlightResult {
  nodes: SpotlightNode[];
  totalKudosCount: number;
}

const EMPTY_RESULT: GetSpotlightResult = { nodes: [], totalKudosCount: 0 };

interface SpotlightQueryRow {
  id: string;
  receiver_full_name: string | null;
  created_at: string;
}

/**
 * Phase 02 rework (F006): BR-012_SpotlightTotalFromDB / US004 -- MoMorph
 * B.7 reads as a RECIPIENT word cloud: one node per kudos, labeled by its
 * recipient (plan-owner ruling over the Phase 01 hashtag-shaped stub).
 * Nodes and the "N KUDOS" header total are two independent reads: the
 * header is always the live, unfiltered `count(*) from kudos`, never the
 * design's `388` placeholder.
 */
export async function getSpotlight(params: GetSpotlightParams = {}): Promise<GetSpotlightResult> {
  const supabase = await createClient();
  const filter = buildFeedFilter(params);

  let nodesQuery = supabase
    .from("kudos_card_view")
    .select("id, receiver_full_name, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (filter.hashtagId) {
    nodesQuery = nodesQuery.contains("hashtag_ids", [filter.hashtagId]);
  }

  if (filter.departmentName) {
    const receiverIds = await resolveDepartmentReceiverIds(supabase, filter.departmentName);
    if (receiverIds.length === 0) {
      return EMPTY_RESULT;
    }
    nodesQuery = nodesQuery.in("receiver_id", receiverIds);
  }

  const [{ data: rows, error: rowsError }, { count, error: countError }] = await Promise.all([
    nodesQuery,
    supabase.from("kudos").select("*", { count: "exact", head: true }),
  ]);

  if (countError) {
    console.error("getSpotlight: failed to load the live kudos total", countError);
  }
  const totalKudosCount = countError || count == null ? 0 : count;

  if (rowsError || !rows) {
    console.error("getSpotlight: failed to load spotlight kudos rows", rowsError);
    return { nodes: [], totalKudosCount };
  }

  const spotlightRows: SpotlightKudosRow[] = (rows as SpotlightQueryRow[]).map((row) => ({
    kudosId: row.id,
    recipientName: row.receiver_full_name,
    receivedAt: row.created_at,
  }));

  return { nodes: deriveSpotlightNodes(spotlightRows), totalKudosCount };
}
