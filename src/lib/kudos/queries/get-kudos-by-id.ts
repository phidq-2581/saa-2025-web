import { createClient } from "@/lib/supabase/server";
import type { KudosCardView } from "../types";
import { mapKudosCardViewRow, type KudosCardViewRow } from "./map-kudos-card-view-row";

/**
 * Phase 07 (F006): `/kudos/[id]` detail lookup -- single row from
 * `kudos_card_view` by primary key, same mapper every other view-reading
 * query uses (DRY). Mirrors `getFeedPage`/`getHighlightTop5`'s degrade
 * convention: any read failure (including "no such row", PostgREST's
 * `PGRST116` on `.single()`) returns `null` rather than throwing, so the
 * page can render its own "not found" state instead of a 500.
 */
export async function getKudosById(id: string): Promise<KudosCardView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("kudos_card_view").select("*").eq("id", id).single();

  if (error || !data) {
    console.error("getKudosById: failed to load kudos row", error);
    return null;
  }

  return mapKudosCardViewRow(data as KudosCardViewRow);
}
