import { beforeEach, describe, expect, it, vi } from "vitest";

// F002 FR-002 / BR-002_LogoutClearsSession: clears the session and lands on
// `/`, no confirmation step.
const signOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signOut } })),
}));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Supabase signOut then redirects to '/'", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const { signOutAction } = await import("../sign-out");

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(signOut).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("still redirects to '/' even if Supabase signOut reports an error", async () => {
    signOut.mockResolvedValueOnce({ error: { message: "network hiccup" } });
    const { signOutAction } = await import("../sign-out");

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
