import { beforeEach, describe, expect, it, vi } from "vitest";

// F002 DISC-001 / getCurrentProfile: server-only session + profile.role
// lookup backing SiteHeaderContainer/FabWidgetContainer. Uses getClaims()
// (never getSession()/getUser() server-side, docs/code-standards.md §
// "Auth & i18n conventions") to resolve the authenticated user id, then
// reads exactly the columns the header needs from `public.profile`.
const getClaims = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getClaims }, from })),
}));

describe("getCurrentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no session", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: null }, error: null });
    const { getCurrentProfile } = await import("../get-current-profile");

    await expect(getCurrentProfile()).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns null when getClaims reports an error", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: null }, error: { message: "expired" } });
    const { getCurrentProfile } = await import("../get-current-profile");

    await expect(getCurrentProfile()).resolves.toBeNull();
  });

  it("returns fullName/avatarUrl/role for a signed-in member, never email", async () => {
    getClaims.mockResolvedValueOnce({
      data: { claims: { sub: "user-1" } },
      error: null,
    });
    single.mockResolvedValueOnce({
      data: { full_name: "Nguyen Van A", avatar_url: "https://example.com/a.png", role: "member" },
      error: null,
    });
    const { getCurrentProfile } = await import("../get-current-profile");

    const profile = await getCurrentProfile();

    expect(profile).toEqual({
      fullName: "Nguyen Van A",
      avatarUrl: "https://example.com/a.png",
      role: "member",
    });
    expect(profile).not.toHaveProperty("email");
    expect(from).toHaveBeenCalledWith("profile");
    expect(select).toHaveBeenCalledWith("full_name, avatar_url, role");
    expect(eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("returns role: admin for an admin profile row", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-2" } }, error: null });
    single.mockResolvedValueOnce({
      data: { full_name: "Admin Sunner", avatar_url: null, role: "admin" },
      error: null,
    });
    const { getCurrentProfile } = await import("../get-current-profile");

    const profile = await getCurrentProfile();

    expect(profile?.role).toBe("admin");
    expect(profile?.avatarUrl).toBeNull();
  });

  it("returns null when the profile row lookup fails (degrade to guest, never throw)", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-3" } }, error: null });
    single.mockResolvedValueOnce({ data: null, error: { message: "row not found" } });
    const { getCurrentProfile } = await import("../get-current-profile");

    await expect(getCurrentProfile()).resolves.toBeNull();
  });

  it("falls back to role: member for an unexpected DB value (defense in depth at the boundary)", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-4" } }, error: null });
    single.mockResolvedValueOnce({
      data: { full_name: "Weird Row", avatar_url: null, role: "superuser" },
      error: null,
    });
    const { getCurrentProfile } = await import("../get-current-profile");

    const profile = await getCurrentProfile();

    expect(profile?.role).toBe("member");
  });
});
