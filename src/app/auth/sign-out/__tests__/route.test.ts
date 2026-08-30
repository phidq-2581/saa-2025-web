import { beforeEach, describe, expect, it, vi } from "vitest";

// F002 FR-002 / BR-002_LogoutClearsSession: see route.ts's docblock for why
// this is a Route Handler (not the originally-planned Server Action) --
// Server Action cookie mutations did not reliably reach the browser in this
// Next.js 16 + Turbopack dev environment, verified empirically.
const signOut = vi.fn();
const cookieDelete = vi.fn();
let cookieList: Array<{ name: string; value: string }> = [];

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signOut } })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => cookieList,
    delete: cookieDelete,
  })),
}));

describe("POST /auth/sign-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    cookieList = [
      { name: "sb-127-auth-token", value: "session-jwt" },
      { name: "sb-127-auth-token-code-verifier", value: "verifier" },
      { name: "NEXT_LOCALE", value: "vi" },
    ];
  });

  it("signs out, deletes every sb-* cookie, and redirects to '/'", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const { POST } = await import("../route");
    const request = new Request("http://localhost:3000/auth/sign-out", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    const response = await POST(request);

    expect(signOut).toHaveBeenCalledOnce();
    expect(cookieDelete).toHaveBeenCalledWith("sb-127-auth-token");
    expect(cookieDelete).toHaveBeenCalledWith("sb-127-auth-token-code-verifier");
    expect(cookieDelete).not.toHaveBeenCalledWith("NEXT_LOCALE");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("still deletes cookies and redirects even when Supabase signOut reports an error", async () => {
    signOut.mockResolvedValueOnce({ error: { message: "network hiccup" } });
    const { POST } = await import("../route");
    const request = new Request("http://localhost:3000/auth/sign-out", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    const response = await POST(request);

    expect(cookieDelete).toHaveBeenCalledWith("sb-127-auth-token");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("allows a request with no Origin header (non-browser/legacy client)", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const { POST } = await import("../route");
    const request = new Request("http://localhost:3000/auth/sign-out", { method: "POST" });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("rejects a cross-origin POST with 403 and never touches the session (CSRF guard)", async () => {
    const { POST } = await import("../route");
    const request = new Request("http://localhost:3000/auth/sign-out", {
      method: "POST",
      headers: { origin: "https://evil.tld" },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(signOut).not.toHaveBeenCalled();
    expect(cookieDelete).not.toHaveBeenCalled();
  });

  it("redirects against NEXT_PUBLIC_SITE_URL, not a spoofed request Host (defense in depth)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://saa.sun-asterisk.com");
    signOut.mockResolvedValueOnce({ error: null });
    const { POST } = await import("../route");
    const request = new Request("http://evil-host.example:9999/auth/sign-out", {
      method: "POST",
      headers: { origin: "https://saa.sun-asterisk.com" },
    });

    const response = await POST(request);

    expect(response.headers.get("location")).toBe("https://saa.sun-asterisk.com/");
  });
});
