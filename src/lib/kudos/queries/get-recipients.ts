import { createClient } from "@/lib/supabase/server";
import type { KudosAuthor } from "../types";

/**
 * Phase 07 (F006): the Viết Kudo compose modal's recipient-autocomplete
 * pool. No dedicated "recipients" query existed before this phase (checked
 * `queries/` first, per the phase brief) -- `profile` RLS was widened in
 * Phase 01 specifically so every authenticated Sunner can be searched as a
 * recipient. `email` stays withheld (docs/data-model.md), same convention
 * as `getCurrentProfile`/`getProfileById`. Ordered by name for a stable,
 * scan-friendly dropdown; degrades to an empty list on failure rather than
 * throwing, so a transient read error blocks composing but not the rest of
 * the page.
 */
export async function getRecipients(): Promise<KudosAuthor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile")
    .select("id, full_name, avatar_url")
    .order("full_name", { ascending: true });

  if (error || !data) {
    console.error("getRecipients: failed to load recipient pool", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    fullName: row.full_name as string | null,
    avatarUrl: row.avatar_url as string | null,
  }));
}
