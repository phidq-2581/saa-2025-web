import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/auth/allowed-email";
import { emailVerified } from "@/lib/auth/email-verified";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * FR-002 / BR-001 / FR-008 (S3) / FR-009 (S2): exchanges the OAuth code for
 * a session, then rejects on either a non-`sun-asterisk.com` domain OR an
 * unverified Google identity -- `signOut()` + `/login?error=domain` in both
 * cases, so the two checks never blur together. On success, redirects to
 * `safeNext(next)` so the `next` round-trip can never bounce a user off-site.
 *
 * `origin` prefers `NEXT_PUBLIC_SITE_URL` over the request URL's own
 * origin (defense in depth against a spoofed/forwarded Host header --
 * `src/app/login/actions.ts` resolves its origin the same way). Every
 * redirect is built via `new URL(path, origin)` rather than string
 * concatenation, so a malformed `path` can never be mis-joined into the
 * origin.
 */
export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const user = data?.session?.user;

  if (error || !user) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", origin));
  }

  if (!isAllowedEmail(user.email ?? "") || !emailVerified(user)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=domain", origin));
  }

  return NextResponse.redirect(new URL(safeNext(next), origin));
}
