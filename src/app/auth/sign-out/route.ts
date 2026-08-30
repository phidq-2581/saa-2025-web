import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * F002 FR-002 / BR-002_LogoutClearsSession (Phase 07 integration finding).
 * The plan wired Logout to the Phase 03 Server Action. Verified against the
 * real dev server: the action does clear the cookies, but its redirect() is
 * a soft client-side navigation, so the URL flips to "/" before the browser
 * has applied the response Set-Cookie headers — the screen-level E2E
 * (cookies read right after waitForURL) lost that race 0/3, and passed 3/3
 * only with an artificial 500ms settle. A plain <form method="post"> to this
 * Route Handler triggers a hard, full-page navigation instead, which is
 * atomic for the browser (3/3), so account-menu.tsx submits here.
 *
 * CSRF: Server Actions get Next.js same-origin checks for free; a Route
 * Handler does not, so a cross-origin Origin header is rejected. Same-origin
 * form POSTs always carry a same-origin Origin header in evergreen browsers;
 * a missing header is tolerated because sign-out is idempotent and exposes
 * nothing on success.
 *
 * 303 See Other: after a POST the browser must follow with GET / (a default
 * 307 would re-POST the form body to the homepage).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && requestOrigin !== origin) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.delete(cookie.name);
    }
  }

  return NextResponse.redirect(new URL("/", origin), 303);
}
