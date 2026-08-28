import { beforeEach, describe, expect, it, vi } from "vitest";

// FR-001: signInWithGoogle MUST run as a Server Action ("use server" at the
// top of actions.ts) -- called from a Server Component the PKCE verifier
// cookie silently fails to write (src/lib/supabase/server.ts swallows the
// setAll throw). This test proves the call shape (redirectTo, hd param),
// not the PKCE cookie write itself (that needs a real browser, covered by
// the auth-guard/session-fixture E2E specs).
const signInWithOAuth = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signInWithOAuth } })),
}));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe("signInWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts signInWithOAuth with the google provider, hd hint, and callback redirectTo", async () => {
    signInWithOAuth.mockResolvedValueOnce({
      data: { url: "https://accounts.google.com/o/oauth2/auth?..." },
      error: null,
    });
    const { signInWithGoogle } = await import("../actions");

    await expect(signInWithGoogle("/he-thong-giai")).rejects.toThrow("NEXT_REDIRECT");

    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
        options: expect.objectContaining({
          queryParams: expect.objectContaining({ hd: "sun-asterisk.com" }),
          redirectTo: expect.stringContaining(
            "/auth/callback?next=" + encodeURIComponent("/he-thong-giai"),
          ),
        }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("https://accounts.google.com/o/oauth2/auth?...");
  });

  it("defaults next to '/' when omitted", async () => {
    signInWithOAuth.mockResolvedValueOnce({
      data: { url: "https://accounts.google.com/o/oauth2/auth?..." },
      error: null,
    });
    const { signInWithGoogle } = await import("../actions");

    await expect(signInWithGoogle()).rejects.toThrow("NEXT_REDIRECT");

    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback?next=%2F"),
        }),
      }),
    );
  });

  it("redirects to /login?error=oauth_init_failed when Supabase returns an error", async () => {
    signInWithOAuth.mockResolvedValueOnce({ data: { url: null }, error: { message: "boom" } });
    const { signInWithGoogle } = await import("../actions");

    await expect(signInWithGoogle()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login?error=oauth_init_failed");
  });
});
