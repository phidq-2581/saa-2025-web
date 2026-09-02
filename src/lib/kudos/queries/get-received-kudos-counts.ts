import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Phase 07 (F006): how many kudos each Sunner has RECEIVED, across the
 * whole table -- the exact count `deriveAsteriskTier` (Phase 02,
 * BR-008_AsteriskBadgeThresholds) needs to badge a card's sender/receiver.
 * Phase 04 explicitly deferred this to Phase 07 ("Thresholds are Phase
 * 07's job -- this phase only renders whatever tier the data carries").
 *
 * One full-table read, no filter -- same "accepted at this event's scale"
 * call `getLeaderboards()` already makes for the same reason (deriving a
 * per-user aggregate has no cheap partial-scan equivalent without a
 * dedicated counter column, which does not exist in this round's schema).
 */
export async function getReceivedKudosCounts(supabase: SupabaseServerClient): Promise<Map<string, number>> {
  const { data, error } = await supabase.from("kudos").select("receiver_id");

  if (error || !data) {
    console.error("getReceivedKudosCounts: failed to load kudos receiver ids", error);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data as { receiver_id: string }[]) {
    counts.set(row.receiver_id, (counts.get(row.receiver_id) ?? 0) + 1);
  }
  return counts;
}
