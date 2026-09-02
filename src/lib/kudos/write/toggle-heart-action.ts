"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeGrantAmount, resolveRevokedAmount } from "./heart-rules";

/**
 * Phase 05 (F006 BR-004..007, DEC-001_HeartToggleFlow). `granted_amount`
 * has no client-writable path: this action reads `special_days` itself,
 * server-side, via the pure rules in `heart-rules.ts`. There is no stored
 * `heart_total` column (data-model.md) -- the revoke path deletes and
 * reads its own amount back from the row(s) actually removed, in one
 * atomic round trip, so a losing request in a double-toggle race can never
 * report an amount for a delete it did not itself perform.
 */

const KUDOS_PATH = "/kudos";

export type ToggleHeartErrorCode =
  | "invalid-input"
  | "unauthenticated"
  | "kudos-not-found"
  | "self-heart"
  | "toggle-failed";

export type ToggleHeartResult =
  | { ok: true; liked: true; heartCount: number; grantedAmount: number }
  | { ok: true; liked: false; heartCount: number; revokedAmount: number }
  | { ok: false; code: ToggleHeartErrorCode };

export async function toggleHeart(kudosId: string): Promise<ToggleHeartResult> {
  if (typeof kudosId !== "string" || kudosId.length === 0) {
    return { ok: false, code: "invalid-input" };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (claimsError || !userId) {
    return { ok: false, code: "unauthenticated" };
  }

  const { data: kudosRow, error: kudosError } = await supabase
    .from("kudos")
    .select("sender_id")
    .eq("id", kudosId)
    .single();

  if (kudosError || !kudosRow) {
    return { ok: false, code: "kudos-not-found" };
  }

  // Belt and suspenders: the heart_insert_not_self RLS policy is the
  // second, DB-enforced layer of BR-005_SenderCannotHeartOwnKudo.
  if (kudosRow.sender_id === userId) {
    return { ok: false, code: "self-heart" };
  }

  const { data: existingHeart, error: existingHeartError } = await supabase
    .from("heart")
    .select("granted_amount")
    .eq("kudos_id", kudosId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingHeartError) {
    console.error("toggleHeart: failed to read existing heart", existingHeartError);
    return { ok: false, code: "toggle-failed" };
  }

  let liked: boolean;
  let grantedAmount = 0;
  let revokedAmount = 0;

  if (existingHeart) {
    // Atomic delete-and-return: a losing request in a double-toggle race
    // (two revoke clicks for the same user/kudos) must never report an
    // amount for a delete it did not itself perform. The amount always
    // comes from the row(s) THIS delete actually removed, never from the
    // `existingHeart` read above, which can already be stale by now.
    const { data: deletedRows, error: deleteError } = await supabase
      .from("heart")
      .delete()
      .eq("kudos_id", kudosId)
      .eq("user_id", userId)
      .select("granted_amount");

    if (deleteError) {
      console.error("toggleHeart: failed to delete heart", deleteError);
      return { ok: false, code: "toggle-failed" };
    }

    const deletedRow = deletedRows?.[0];
    // Empty result: another request already removed this row first. The
    // desired end state (unliked) already holds -- report it plainly
    // rather than claiming a revoke this call did not perform.
    revokedAmount = deletedRow ? resolveRevokedAmount({ grantedAmount: deletedRow.granted_amount }) : 0;
    liked = false;
  } else {
    const { data: specialDaysRows, error: specialDaysError } = await supabase
      .from("special_days")
      .select("day");

    if (specialDaysError) {
      console.error("toggleHeart: failed to read special_days", specialDaysError);
      return { ok: false, code: "toggle-failed" };
    }

    const specialDays = (specialDaysRows ?? []).map((row) => row.day as string);
    grantedAmount = computeGrantAmount(new Date(), specialDays);

    const { error: insertError } = await supabase
      .from("heart")
      .insert({ kudos_id: kudosId, user_id: userId, granted_amount: grantedAmount });

    if (insertError) {
      console.error("toggleHeart: failed to insert heart", insertError);
      return { ok: false, code: "toggle-failed" };
    }

    liked = true;
  }

  const { count, error: countError } = await supabase
    .from("heart")
    .select("*", { count: "exact", head: true })
    .eq("kudos_id", kudosId);

  if (countError) {
    console.error("toggleHeart: failed to read heart count", countError);
    return { ok: false, code: "toggle-failed" };
  }

  revalidatePath(KUDOS_PATH);

  return liked
    ? { ok: true, liked: true, heartCount: count ?? 0, grantedAmount }
    : { ok: true, liked: false, heartCount: count ?? 0, revokedAmount };
}
