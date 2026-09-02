/**
 * Phase 02 (F006): BR-002_HighlightTop5ByHearts -- highest heart count
 * first. BR-002 only documents the `created_at desc` half of the tie-break
 * as `[INFERRED]`; a final `id desc` step guarantees a fully deterministic
 * order for the E2E to assert against.
 */

export interface HighlightComparable {
  id: string;
  heartCount: number;
  createdAt: string;
}

export function compareForHighlight(a: HighlightComparable, b: HighlightComparable): number {
  if (a.heartCount !== b.heartCount) {
    return b.heartCount - a.heartCount;
  }
  if (a.createdAt !== b.createdAt) {
    return b.createdAt.localeCompare(a.createdAt);
  }
  return b.id.localeCompare(a.id);
}

export function selectTop5(rows: HighlightComparable[]): HighlightComparable[] {
  return [...rows].sort(compareForHighlight).slice(0, 5);
}
