"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * FR-001: starts Supabase's OAuth flow for Google sign-in.
 *
 * MUST be invoked as a Server Action (never rendered directly inside a
 * Server Component) -- `signInWithOAuth` writes a `code_verifier` cookie
 * via `createClient()`'s `setAll`, and `src/lib/supabase/server.ts` wraps
 * that write in a try/catch that silently no-ops when called outside an
 * action/route-handler context. Calling this from a Server Component would
 * make the verifier cookie silently fail to persist, and the later
 * `exchangeCodeForSession` failure would look like an unrelated error.
 *
 * `next` is round-tripped through the callback's `next` query param and
 * validated there by `safeNext` -- this action does not need to validate
 * it itself, only pass it along.
 */
export async function signInWithGoogle(next?: string): Promise<never> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { hd: "sun-asterisk.com" },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_init_failed");
  }

  // signInWithOAuth on the server returns a URL, it does NOT auto-navigate.
  redirect(data.url);
}
