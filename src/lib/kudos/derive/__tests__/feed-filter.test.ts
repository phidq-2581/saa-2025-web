import { describe, expect, it } from "vitest";
import { buildFeedFilter, isFilterEmpty } from "../feed-filter";

// Phase 02 (F006): DEC-002_FilterApplyFlow -- Highlight and the feed share
// one predicate. A null/blank hashtag AND a null/blank department means "no
// predicate" (every kudos matches); a non-null value on either side means a
// predicate is active.
describe("buildFeedFilter", () => {
  it("normalizes an empty input to an all-null, empty predicate", () => {
    const filter = buildFeedFilter({});
    expect(filter).toEqual({ hashtagId: null, departmentName: null });
    expect(isFilterEmpty(filter)).toBe(true);
  });

  it("normalizes explicit null hashtag + null department to an empty predicate", () => {
    const filter = buildFeedFilter({ hashtagId: null, departmentName: null });
    expect(isFilterEmpty(filter)).toBe(true);
  });

  it("coerces a blank/whitespace-only string to null on both fields", () => {
    const filter = buildFeedFilter({ hashtagId: "   ", departmentName: "" });
    expect(filter).toEqual({ hashtagId: null, departmentName: null });
    expect(isFilterEmpty(filter)).toBe(true);
  });

  it("keeps a non-empty hashtagId and reports the predicate as active", () => {
    const filter = buildFeedFilter({ hashtagId: "hashtag-1", departmentName: null });
    expect(filter).toEqual({ hashtagId: "hashtag-1", departmentName: null });
    expect(isFilterEmpty(filter)).toBe(false);
  });

  it("keeps a non-empty departmentName and reports the predicate as active", () => {
    const filter = buildFeedFilter({ hashtagId: null, departmentName: "CTO" });
    expect(filter).toEqual({ hashtagId: null, departmentName: "CTO" });
    expect(isFilterEmpty(filter)).toBe(false);
  });

  it("trims surrounding whitespace from a real value instead of discarding it", () => {
    const filter = buildFeedFilter({ hashtagId: "  hashtag-1  ", departmentName: " CTO " });
    expect(filter).toEqual({ hashtagId: "hashtag-1", departmentName: "CTO" });
  });
});
