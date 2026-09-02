import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeQueryBuilder } from "./support/fake-supabase-query-builder";

// Phase 05 (F006 BR-006/BR-007, DEC-001_HeartToggleFlow): grant amount is
// decided server-side from `special_days` read in Asia/Ho_Chi_Minh, never
// UTC (a naive UTC compare is 7h out of phase around VN midnight); a
// revoke always returns the deleted row's own `granted_amount`, never a
// literal 1 -- there is no stored heart_total to keep in sync (data-model.md).

const getClaims = vi.fn();
const fromMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims },
    from: fromMock,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("toggleHeart", () => {
  it("rejects an invalid kudosId without any Supabase round trip", async () => {
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("")).resolves.toEqual({ ok: false, code: "invalid-input" });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when getClaims has no sub", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: {} }, error: null });
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({ ok: false, code: "unauthenticated" });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns kudos-not-found when the kudos row cannot be read", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock.mockReturnValueOnce(fakeQueryBuilder({ data: null, error: { message: "no rows" } }));
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({ ok: false, code: "kudos-not-found" });
  });

  it("rejects hearting your own kudos even if the disabled UI button were bypassed", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock.mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "user-1" }, error: null }));
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({ ok: false, code: "self-heart" });
  });

  it("revokes an existing heart atomically, returning the row's own granted_amount (2), not a literal 1", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null })) // kudos
      .mockReturnValueOnce(fakeQueryBuilder({ data: { granted_amount: 2 }, error: null })) // existing heart (branch decision)
      .mockReturnValueOnce(fakeQueryBuilder({ data: [{ granted_amount: 2 }], error: null })) // atomic delete().select()
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null, count: 3 })); // count
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({
      ok: true,
      liked: false,
      revokedAmount: 2,
      heartCount: 3,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/kudos");
  });

  it("race: a losing revoke whose atomic delete returns no rows reports current state, never claiming a phantom revoke", async () => {
    // Two concurrent revoke clicks: both read an existing heart, one wins
    // the delete; this request's own delete().select() then finds nothing
    // left to remove. It must not fabricate a revokedAmount from its
    // earlier (now stale) read, and must not fall through to granting a
    // new heart -- the end state ("not liked") is already correct.
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null })) // kudos
      .mockReturnValueOnce(fakeQueryBuilder({ data: { granted_amount: 2 }, error: null })) // stale existing-heart read
      .mockReturnValueOnce(fakeQueryBuilder({ data: [], error: null })) // atomic delete found nothing -- race
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null, count: 4 })); // count reflects reality
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({
      ok: true,
      liked: false,
      revokedAmount: 0,
      heartCount: 4,
    });
  });

  it("grants a new heart reading special_days server-side, never trusting a client amount", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-02T10:00:00.000Z")); // VN date 2026-09-02

    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null })) // kudos
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null })) // no existing heart
      .mockReturnValueOnce(fakeQueryBuilder({ data: [{ day: "2026-09-02" }], error: null })) // special_days
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null })) // insert
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null, count: 5 })); // count
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({
      ok: true,
      liked: true,
      grantedAmount: 2,
      heartCount: 5,
    });
  });

  it("grants 1 on a non-special day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-02T10:00:00.000Z"));

    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: [], error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null, count: 1 }));
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({
      ok: true,
      liked: true,
      grantedAmount: 1,
      heartCount: 1,
    });
  });

  it("returns toggle-failed when the insert fails", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: [], error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: { message: "insert failed" } }));
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({ ok: false, code: "toggle-failed" });
  });

  it("returns toggle-failed when the delete fails", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: "user-1" } }, error: null });
    fromMock
      .mockReturnValueOnce(fakeQueryBuilder({ data: { sender_id: "sender-1" }, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: { granted_amount: 1 }, error: null }))
      .mockReturnValueOnce(fakeQueryBuilder({ data: null, error: { message: "delete failed" } }));
    const { toggleHeart } = await import("../toggle-heart-action");

    await expect(toggleHeart("kudos-1")).resolves.toEqual({ ok: false, code: "toggle-failed" });
  });
});
