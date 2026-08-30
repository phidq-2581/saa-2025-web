import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
};

/**
 * F002 DISC-001: server-only session + `profile.role` lookup backing
 * `SiteHeaderContainer`/`FabWidgetContainer`. Uses `getClaims()` -- never
 * `getSession()`/`getUser()` server-side (docs/code-standards.md, mirrors
 * `src/proxy.ts`'s own guidance) -- to resolve the authenticated user id,
 * then selects exactly `full_name, avatar_url, role` from `public.profile`.
 * `email` is never selected: docs/data-model.md marks it withheld from
 * payloads.
 *
 * Returns `null` both when there is no session AND when the profile row
 * lookup itself fails -- a transient read failure must degrade the header
 * to the guest variant, not throw and break every page (Risk Assessment,
 * "Header container makes every page dynamic").
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (claimsError || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profile")
    .select("full_name, avatar_url, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("getCurrentProfile: failed to load profile row", error);
    return null;
  }

  return {
    fullName: data.full_name ?? "",
    avatarUrl: data.avatar_url,
    role: data.role === "admin" ? "admin" : "member",
  };
}
