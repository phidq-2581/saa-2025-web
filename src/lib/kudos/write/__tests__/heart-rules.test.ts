import { describe, expect, it } from "vitest";
import { computeGrantAmount, resolveRevokedAmount } from "../heart-rules";

// Phase 05 (F006 BR-006/BR-007): grant amount is decided server-side from
// `special_days` read in Asia/Ho_Chi_Minh, never UTC (a naive UTC compare
// is 7h out of phase around VN midnight); a revoke always returns the
// deleted row's own `granted_amount`, never a literal 1 -- there is no
// stored heart_total to keep in sync (data-model.md). Kept as pure,
// synchronous rules so a "use server" file exports only async actions.
describe("computeGrantAmount", () => {
  it("grants 2 when the Ho Chi Minh date is in special_days, at the 23:30 UTC boundary", () => {
    // 2026-09-01T23:30Z -> 2026-09-02T06:30+07:00 -- already the next VN day.
    expect(computeGrantAmount(new Date("2026-09-01T23:30:00.000Z"), ["2026-09-02"])).toBe(2);
  });

  it("does NOT grant 2 off a naive UTC-date match at the 23:30 UTC boundary", () => {
    // A UTC-date compare would wrongly match "2026-09-01"; the VN date is
    // already "2026-09-02", which is not special here.
    expect(computeGrantAmount(new Date("2026-09-01T23:30:00.000Z"), ["2026-09-01"])).toBe(1);
  });

  it("grants 2 when the Ho Chi Minh date is in special_days, at the 00:30 UTC boundary", () => {
    // 2026-09-02T00:30Z -> 2026-09-02T07:30+07:00 -- same VN day.
    expect(computeGrantAmount(new Date("2026-09-02T00:30:00.000Z"), ["2026-09-02"])).toBe(2);
  });

  it("grants 1 (default) when the Ho Chi Minh date is not in special_days, at the 00:30 UTC boundary", () => {
    expect(computeGrantAmount(new Date("2026-09-02T00:30:00.000Z"), ["2026-09-01"])).toBe(1);
  });

  it("grants 1 when special_days is empty", () => {
    expect(computeGrantAmount(new Date("2026-09-02T12:00:00.000Z"), [])).toBe(1);
  });
});

describe("resolveRevokedAmount", () => {
  it("returns the row's own granted_amount, never a literal 1", () => {
    expect(resolveRevokedAmount({ grantedAmount: 2 })).toBe(2);
    expect(resolveRevokedAmount({ grantedAmount: 1 })).toBe(1);
  });
});
