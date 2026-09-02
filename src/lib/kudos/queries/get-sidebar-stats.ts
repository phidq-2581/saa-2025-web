import { createClient } from "@/lib/supabase/server";
import type { SidebarStats } from "../types";
import { deriveAsteriskTier } from "../derive/asterisk-tier";

/**
 * Phase 02 (F006): US011's 6-line sidebar stats block, plus the asterisk
 * tier the header/card avatars need. Returns the shared `SidebarStats`
 * contract from `../types.ts` (widened by the plan-owner ruling to carry
 * all 6 lines -- see `types.ts`'s own field-level BR-006/BR-010 comments).
 */
const FAILED_COUNT = 0;

async function headCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  column: string,
  userId: string,
  label: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, userId);

  if (error || count == null) {
    console.error(`getSidebarStats: failed to count ${label}`, error);
    return FAILED_COUNT;
  }
  return count;
}

async function heartsReceivedOnSentKudos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("heart")
    .select("granted_amount, kudos!inner(sender_id)")
    .eq("kudos.sender_id", userId);

  if (error || !data) {
    console.error("getSidebarStats: failed to sum hearts received on sent kudos", error);
    return FAILED_COUNT;
  }
  return data.reduce((sum, row) => sum + (row.granted_amount as number), 0);
}

/**
 * Returns `null` only when there is no authenticated session -- a genuine
 * read failure on any single aggregate degrades that one field to 0 (logged)
 * rather than blanking the whole sidebar, since the other counts are still
 * trustworthy.
 */
export async function getSidebarStats(): Promise<SidebarStats | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (claimsError || !userId) {
    return null;
  }

  const [kudosReceivedCount, kudosSentCount, heartsReceivedCount, secretBoxOpenedCount] = await Promise.all([
    headCount(supabase, "kudos", "receiver_id", userId, "kudos received"),
    headCount(supabase, "kudos", "sender_id", userId, "kudos sent"),
    heartsReceivedOnSentKudos(supabase, userId),
    headCount(supabase, "secret_box_gift", "recipient_id", userId, "secret box gifts"),
  ]);

  return {
    kudosReceivedCount,
    kudosSentCount,
    heartsReceivedCount,
    secretBoxOpenedCount,
    secretBoxUnopenedCount: 0,
    asteriskTier: deriveAsteriskTier(kudosReceivedCount),
  };
}
