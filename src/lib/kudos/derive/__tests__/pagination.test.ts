import { describe, expect, it } from "vitest";
import { computeHasMore, computeNextOffset } from "../pagination";

// Phase 02 (F006): DEC-003_InfiniteScrollLoad -- page size 10, hasMore is
// literally "did the page come back full" (BR/clarifications assumption:
// offset pagination, no cursor). A short page always means the feed ended.
describe("computeHasMore", () => {
  it("is true when the page is exactly a full page (10)", () => {
    expect(computeHasMore(10)).toBe(true);
  });

  it("is false when the page is short (< 10)", () => {
    expect(computeHasMore(9)).toBe(false);
    expect(computeHasMore(0)).toBe(false);
  });

  it("supports a custom page size", () => {
    expect(computeHasMore(5, 5)).toBe(true);
    expect(computeHasMore(4, 5)).toBe(false);
  });
});

describe("computeNextOffset", () => {
  it("advances the offset by the page length when the page is full", () => {
    expect(computeNextOffset(0, 10)).toBe(10);
    expect(computeNextOffset(10, 10)).toBe(20);
  });

  it("returns null when the page is short -- there is nothing more to load", () => {
    expect(computeNextOffset(20, 7)).toBeNull();
    expect(computeNextOffset(0, 0)).toBeNull();
  });
});
