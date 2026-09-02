import { createClient } from "@/lib/supabase/server";
import type { HashtagRef } from "../types";

export interface FilterOptions {
  hashtags: HashtagRef[];
  departments: string[];
}

const EMPTY_OPTIONS: FilterOptions = { hashtags: [], departments: [] };

/**
 * Phase 02 (F006): dropdown option sources for the Hashtag/Phong ban
 * filters -- 13 seeded hashtags, the seeded department reference list
 * (data-model.md § department; not FK-linked to `profile.department`).
 *
 * Neither `hashtag` nor `department` (Phase 01 schema) carries a seed-order
 * column, so "ordered as seeded" cannot be reproduced deterministically
 * (`department` has no `created_at` at all, and a single-statement INSERT
 * gives every `hashtag` row the same transaction timestamp). Ordering by
 * `name asc` is the deterministic choice available within this phase's
 * scope; adding a `position` column is a Phase 01 migration follow-up, not
 * invented here.
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createClient();

  const [hashtagsRes, departmentsRes] = await Promise.all([
    supabase.from("hashtag").select("id, name").order("name", { ascending: true }),
    supabase.from("department").select("name").order("name", { ascending: true }),
  ]);

  if (hashtagsRes.error) {
    console.error("getFilterOptions: failed to load hashtags", hashtagsRes.error);
  }
  if (departmentsRes.error) {
    console.error("getFilterOptions: failed to load departments", departmentsRes.error);
  }

  if (hashtagsRes.error || departmentsRes.error || !hashtagsRes.data || !departmentsRes.data) {
    return EMPTY_OPTIONS;
  }

  return {
    hashtags: hashtagsRes.data.map((row) => ({ id: row.id as string, name: row.name as string })),
    departments: departmentsRes.data.map((row) => row.name as string),
  };
}
