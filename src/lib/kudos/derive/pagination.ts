/**
 * Phase 02 (F006): DEC-003_InfiniteScrollLoad -- offset/limit pagination,
 * page size 10 (clarifications.md logged assumption). `hasMore` is exactly
 * "did the page come back full"; no separate total-count query.
 */

const DEFAULT_PAGE_SIZE = 10;

export function computeHasMore(pageLength: number, pageSize: number = DEFAULT_PAGE_SIZE): boolean {
  return pageLength === pageSize;
}

export function computeNextOffset(
  currentOffset: number,
  pageLength: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): number | null {
  return computeHasMore(pageLength, pageSize) ? currentOffset + pageLength : null;
}
