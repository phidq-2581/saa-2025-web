"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * F002 FR-002 / BR-002_LogoutClearsSession: clears the session and lands the
 * user on Homepage SAA with no confirmation step. Redirects to `/` even if
 * Supabase's own `signOut` reports an error -- from the user's point of
 * view logout must never appear to hang or fail silently on the same page.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
