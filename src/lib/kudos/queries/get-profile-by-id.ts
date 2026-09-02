import { createClient } from "@/lib/supabase/server";
import type { KudosAuthor } from "../types";

/**
 * Phase 07 (F006): `/profile?id=` stub lookup (clarifications.md 2026-08-31
 * "Stub `/profile?id={uuid}`"). Selects only the columns the stub renders --
 * `email` stays withheld from every payload (docs/data-model.md), same rule
 * `getCurrentProfile` already follows. Degrades to `null` on any read
 * failure or missing row so the page can render its own "not found"-shaped
 * stub instead of throwing (mirrors `getKudosById`).
 */
export async function getProfileById(id: string): Promise<KudosAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getProfileById: failed to load profile row", error);
    return null;
  }

  return {
    id: data.id as string,
    fullName: data.full_name as string | null,
    avatarUrl: data.avatar_url as string | null,
  };
}
