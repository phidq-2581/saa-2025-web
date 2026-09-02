import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Phase 02 (F006): `kudos_card_view` (Phase 01) has no `department` column
 * (data-model.md § profile widening note -- `profile.department` is free
 * text, not FK-linked to the new `department` reference table), so a
 * department-name filter cannot be applied to the view directly. This
 * resolves the department's current member ids first so callers can filter
 * `kudos_card_view` with `.in("receiver_id", ids)` -- one extra round trip,
 * only when a department filter is active.
 */
export async function resolveDepartmentReceiverIds(
  supabase: SupabaseServerClient,
  departmentName: string,
): Promise<string[]> {
  const { data, error } = await supabase.from("profile").select("id").eq("department", departmentName);

  if (error || !data) {
    console.error("resolveDepartmentReceiverIds: failed to resolve department members", error);
    return [];
  }

  return data.map((row) => row.id as string);
}
