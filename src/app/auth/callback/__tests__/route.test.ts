import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

// Unit-testing our own route handler's branch logic, not Supabase's
// behavior -- mocking the Supabase client here is the one legitimate mock
// per research-01 § Q4. `exchangeCodeForSession`/`signOut` are the only
// methods the route calls.
const exchangeCodeForSession = vi.fn();
const signOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, signOut },
  })),
}));

function buildUser(overrides: {
  email: string;
  emailConfirmedAt: string | null;
  identityEmailVerified: boolean;
}): User {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    email: overrides.email,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
    email_confirmed_at: overrides.emailConfirmedAt ?? undefined,
    identities: [
      {
        id: "identity-1",
        user_id: "00000000-0000-0000-0000-000000000000",
        identity_id: "identity-1",
        provider: "google",
        identity_data: { email_verified: overrides.identityEmailVerified },
        created_at: "2026-01-01T00:00:00Z",
        last_sign_in_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
  } as unknown as User;
}

const VERIFIED_ALLOWED_USER = buildUser({
  email: "sunner@sun-asterisk.com",
  emailConfirmedAt: "2026-01-01T00:00:00Z",
  identityEmailVerified: true,
});

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("redirects to /login?error=missing_code when no code is present", async () => {
    const { GET } = await import("../route");
    const request = new Request("http://localhost:3000/auth/callback");

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_code");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("redirects to /login?error=exchange_failed when the code exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: "invalid code" },
    });
    const { GET } = await import("../route");
    const request = new Request("http://localhost:3000/auth/callback?code=bad-code");

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=exchange_failed",
    );
  });

  it("signs out and redirects to /login?error=domain for an off-domain email", async () => {
    const user = buildUser({
      email: "someone@gmail.com",
      emailConfirmedAt: "2026-01-01T00:00:00Z",
      identityEmailVerified: true,
    });
    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { user }, user },
      error: null,
    });
    const { GET } = await import("../route");
    const request = new Request("http://localhost:3000/auth/callback?code=abc");

    const response = await GET(request);

    expect(signOut).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=domain");
  });

  it("signs out and redirects to /login?error=domain for an unverified identity (S3)", async () => {
    const user = buildUser({
      email: "sunner@sun-asterisk.com",
      emailConfirmedAt: "2026-01-01T00:00:00Z",
      identityEmailVerified: false,
    });
    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { user }, user },
      error: null,
    });
    const { GET } = await import("../route");
    const request = new Request("http://localhost:3000/auth/callback?code=abc");

    const response = await GET(request);

    expect(signOut).toHaveBeenCalledOnce();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=domain");
  });

  it("redirects to safeNext(next) on a domain-matching, verified sign-in", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { user: VERIFIED_ALLOWED_USER }, user: VERIFIED_ALLOWED_USER },
      error: null,
    });
    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=" + encodeURIComponent("/he-thong-giai"),
    );

    const response = await GET(request);

    expect(signOut).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/he-thong-giai");
  });

  it("ignores a hostile next value and redirects to '/' instead (S2)", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { user: VERIFIED_ALLOWED_USER }, user: VERIFIED_ALLOWED_USER },
      error: null,
    });
    const { GET } = await import("../route");
    const request = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=" +
        encodeURIComponent("https://evil.tld"),
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects against NEXT_PUBLIC_SITE_URL, not a spoofed request Host (defense in depth)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://saa.sun-asterisk.com");
    const { GET } = await import("../route");
    // Simulates a request whose resolved URL carries an attacker-controlled
    // Host -- the trusted env value must win, matching actions.ts's own
    // origin resolution.
    const request = new Request("http://evil-host.example:9999/auth/callback");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://saa.sun-asterisk.com/login?error=missing_code",
    );
  });

  it("falls back to the request's own origin when NEXT_PUBLIC_SITE_URL is unset", async () => {
    const { GET } = await import("../route");
    const request = new Request("http://localhost:3000/auth/callback");

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_code");
  });
});
