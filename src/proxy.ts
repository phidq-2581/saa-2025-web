import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * FR-003 / BR-002_PublicRouteAllowList / S1 (red-team security-adversary):
 * matched by EXACT equality only. Every path starts with `/`, so a
 * `startsWith` check against this list (the superseded research sketch,
 * research-01 § Key Insights) makes every route public -- a `startsWith`
 * on this list must never be reintroduced. `/auth/` is the single
 * prefix-matched exception, handled separately below.
 */
const PUBLIC_ROUTES = ["/", "/login"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth/");
}

/**
 * A redirect built via `NextResponse.redirect(url)` is a brand-new
 * response object -- it does NOT inherit cookies set on `source` (the
 * `response` that `getClaims()`'s `setAll` callback wrote through, e.g. a
 * rotated session or a cookie-clear on a dead refresh token). Copying them
 * across is required, or a user bounced through a redirect during the same
 * request that rotated/cleared their session keeps a stale cookie.
 */
function redirectWithCookies(url: URL, source: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

/**
 * Next.js 16's route guard (replaces `middleware.ts`). Re-validates every
 * request via `getClaims()` -- never `getSession()`/`getUser()` server-side
 * (Supabase's current guidance; getSession() is not safe to trust in
 * proxy/server code). Session refresh cookies are relayed back through
 * both the incoming request (so downstream reads see the refreshed value)
 * and the outgoing response.
 */
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const isAuthed = !error && !!data?.claims;
  const pathname = request.nextUrl.pathname;

  if (!isAuthed && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return redirectWithCookies(url, response);
  }

  if (isAuthed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)"],
};
