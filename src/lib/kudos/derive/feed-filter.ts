/**
 * Phase 02 (F006): DEC-002_FilterApplyFlow -- one predicate shared by the
 * Highlight carousel and the All Kudos feed. Pure normalization only; no DB
 * access. `null`/blank on both fields means "no predicate" (every kudos
 * matches) -- BR-003.
 */

export interface FeedFilterInput {
  hashtagId?: string | null;
  departmentName?: string | null;
}

export interface FeedFilter {
  hashtagId: string | null;
  departmentName: string | null;
}

function normalize(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function buildFeedFilter(input: FeedFilterInput): FeedFilter {
  return {
    hashtagId: normalize(input.hashtagId),
    departmentName: normalize(input.departmentName),
  };
}

export function isFilterEmpty(filter: FeedFilter): boolean {
  return filter.hashtagId === null && filter.departmentName === null;
}
