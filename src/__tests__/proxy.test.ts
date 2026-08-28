import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * HIGH (inspection finding, 2026-08-28): both redirect branches used to
 * return a *fresh* `NextResponse.redirect(url)`, dropping whatever
 * `getClaims()` wrote through the `setAll` callback into the local
 * `response` (rotated tokens, or a cookie-clear on a dead refresh token).
 * Mocking only `@supabase/ssr`'s `createServerClient` (as in
 * `route.test.ts`) and driving its `setAll` callback from inside the mocked
 * `getClaims()` reproduces the real refresh-then-redirect sequence without
 * needing a live Supabase instance.
 */
const getClaims = vi.fn();
let capturedSetAll:
  | ((cookies: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => void)
  | null = null;

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: { cookies: { setAll: typeof capturedSetAll } }) => {
    capturedSetAll = options.cookies.setAll;
    return { auth: { getClaims } };
  }),
}));

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSetAll = null;
  });

  it("copies a rotated/cleared cookie from getClaims onto the unauthenticated redirect", async () => {
    getClaims.mockImplementation(async () => {
      // Simulates @supabase/ssr's own setAll firing during getClaims (a
      // dead refresh token gets cleared, or a session gets rotated) before
      // the guard decides to redirect.
      capturedSetAll?.([
        { name: "sb-127-auth-token", value: "", options: { path: "/", maxAge: 0 } },
      ]);
      return { data: null, error: { message: "no session" } };
    });

    const { default: proxy } = await import("../proxy");
    const request = new NextRequest("http://localhost:3000/he-thong-giai");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    const cookie = response.cookies.get("sb-127-auth-token");
    expect(cookie?.value).toBe("");
  });

  it("copies a refreshed cookie from getClaims onto the authenticated /login -> / redirect", async () => {
    getClaims.mockImplementation(async () => {
      capturedSetAll?.([
        { name: "sb-127-auth-token", value: "refreshed-token-value", options: { path: "/", sameSite: "lax" } },
      ]);
      return { data: { claims: { sub: "user-1" } }, error: null };
    });

    const { default: proxy } = await import("../proxy");
    const request = new NextRequest("http://localhost:3000/login");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    const cookie = response.cookies.get("sb-127-auth-token");
    expect(cookie?.value).toBe("refreshed-token-value");
  });

  it("still redirects correctly when getClaims writes no cookies at all", async () => {
    getClaims.mockResolvedValue({ data: null, error: { message: "no session" } });

    const { default: proxy } = await import("../proxy");
    const request = new NextRequest("http://localhost:3000/he-thong-giai");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fhe-thong-giai");
  });
});
