import { describe, expect, it } from "vitest";
import { resolveActiveSlug } from "../resolve-active-slug";

const SLUGS = ["top-talent", "top-project", "mvp"];

describe("resolveActiveSlug", () => {
  it("returns the matching slug for a known hash", () => {
    expect(resolveActiveSlug("#mvp", SLUGS)).toBe("mvp");
  });

  it("accepts a hash without the leading #", () => {
    expect(resolveActiveSlug("top-project", SLUGS)).toBe("top-project");
  });

  it("returns null for an unknown hash (BR-003)", () => {
    expect(resolveActiveSlug("#does-not-exist", SLUGS)).toBeNull();
  });

  it("returns null for an empty or missing hash", () => {
    expect(resolveActiveSlug("", SLUGS)).toBeNull();
    expect(resolveActiveSlug("#", SLUGS)).toBeNull();
    expect(resolveActiveSlug(null, SLUGS)).toBeNull();
    expect(resolveActiveSlug(undefined, SLUGS)).toBeNull();
  });
});
