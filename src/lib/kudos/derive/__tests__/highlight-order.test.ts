import { describe, expect, it } from "vitest";
import { compareForHighlight, selectTop5 } from "../highlight-order";
import type { HighlightComparable } from "../highlight-order";

function row(id: string, heartCount: number, createdAt: string): HighlightComparable {
  return { id, heartCount, createdAt };
}

// Phase 02 (F006): BR-002_HighlightTop5ByHearts -- highest hearts first;
// ties break on `created_at desc`, then `id desc` for full determinism (the
// orchestrator's explicit rule -- BR-002 only documents the createdAt half
// as `[INFERRED]`).
describe("compareForHighlight", () => {
  it("orders the higher heart count first", () => {
    const a = row("a", 5, "2026-01-01T00:00:00Z");
    const b = row("b", 3, "2026-01-01T00:00:00Z");
    expect(compareForHighlight(a, b)).toBeLessThan(0);
    expect(compareForHighlight(b, a)).toBeGreaterThan(0);
  });

  it("breaks a heart-count tie by the more recent createdAt first", () => {
    const older = row("a", 5, "2026-01-01T00:00:00Z");
    const newer = row("b", 5, "2026-01-02T00:00:00Z");
    expect(compareForHighlight(newer, older)).toBeLessThan(0);
    expect(compareForHighlight(older, newer)).toBeGreaterThan(0);
  });

  it("breaks a heart-count + createdAt tie by id desc", () => {
    const a = row("aaa", 5, "2026-01-01T00:00:00Z");
    const b = row("bbb", 5, "2026-01-01T00:00:00Z");
    expect(compareForHighlight(b, a)).toBeLessThan(0);
    expect(compareForHighlight(a, b)).toBeGreaterThan(0);
  });

  it("treats two fully identical rows as equal", () => {
    const a = row("a", 5, "2026-01-01T00:00:00Z");
    expect(compareForHighlight(a, { ...a })).toBe(0);
  });
});

describe("selectTop5", () => {
  it("returns exactly the 5 highest-hearted rows, correctly ordered", () => {
    const rows = [
      row("a", 1, "2026-01-01T00:00:00Z"),
      row("b", 9, "2026-01-01T00:00:00Z"),
      row("c", 5, "2026-01-01T00:00:00Z"),
      row("d", 7, "2026-01-01T00:00:00Z"),
      row("e", 3, "2026-01-01T00:00:00Z"),
      row("f", 8, "2026-01-01T00:00:00Z"),
      row("g", 2, "2026-01-01T00:00:00Z"),
    ];
    expect(selectTop5(rows).map((r) => r.id)).toEqual(["b", "f", "d", "c", "e"]);
  });

  it("returns fewer than 5 rows when fewer than 5 are given", () => {
    const rows = [row("a", 1, "2026-01-01T00:00:00Z"), row("b", 2, "2026-01-01T00:00:00Z")];
    expect(selectTop5(rows)).toHaveLength(2);
  });

  it("returns an empty array for an empty input", () => {
    expect(selectTop5([])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const rows = [row("a", 1, "2026-01-01T00:00:00Z"), row("b", 2, "2026-01-01T00:00:00Z")];
    const copy = [...rows];
    selectTop5(rows);
    expect(rows).toEqual(copy);
  });
});
