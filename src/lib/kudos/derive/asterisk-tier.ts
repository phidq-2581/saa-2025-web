/**
 * Phase 02 (F006): BR-008_AsteriskBadgeThresholds, resolved by
 * clarifications.md over the spec's ambiguous "count(heart received)"
 * phrasing -- the asterisk tier counts kudos RECEIVED, not hearts.
 * >=10 -> 1 star, >=20 -> 2 stars, >=50 -> 3 stars.
 */

export type AsteriskTier = 0 | 1 | 2 | 3;

const THRESHOLDS: ReadonlyArray<{ min: number; tier: AsteriskTier }> = [
  { min: 50, tier: 3 },
  { min: 20, tier: 2 },
  { min: 10, tier: 1 },
];

export function deriveAsteriskTier(kudosReceivedCount: number): AsteriskTier {
  for (const { min, tier } of THRESHOLDS) {
    if (kudosReceivedCount >= min) {
      return tier;
    }
  }
  return 0;
}
