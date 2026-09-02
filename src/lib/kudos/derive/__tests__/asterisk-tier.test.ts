import { describe, expect, it } from "vitest";
import { deriveAsteriskTier } from "../asterisk-tier";

// Phase 02 (F006): BR-008_AsteriskBadgeThresholds, clarifications-resolved
// reading -- tier counts kudos RECEIVED (not hearts): >=10 -> 1, >=20 -> 2,
// >=50 -> 3. Every boundary (9/10, 19/20, 49/50) gets its own assertion so a
// naive `>` instead of `>=` is caught immediately.
describe("deriveAsteriskTier", () => {
  it("is 0 below the first threshold", () => {
    expect(deriveAsteriskTier(0)).toBe(0);
    expect(deriveAsteriskTier(9)).toBe(0);
  });

  it("is 1 at and above 10, below 20", () => {
    expect(deriveAsteriskTier(10)).toBe(1);
    expect(deriveAsteriskTier(19)).toBe(1);
  });

  it("is 2 at and above 20, below 50", () => {
    expect(deriveAsteriskTier(20)).toBe(2);
    expect(deriveAsteriskTier(49)).toBe(2);
  });

  it("is 3 at and above 50", () => {
    expect(deriveAsteriskTier(50)).toBe(3);
    expect(deriveAsteriskTier(500)).toBe(3);
  });
});
