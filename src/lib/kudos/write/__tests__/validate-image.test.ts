import { describe, expect, it } from "vitest";
import { MAX_IMAGE_COUNT, MAX_IMAGE_SIZE_BYTES, validateImages } from "../validate-image";

// Phase 05 (F005 BR-004): jpg/png/webp, <=5MB each, <=5 files -- checked
// client-side (submit-kudos.ts) before any upload starts.
function image(overrides: Partial<{ name: string; type: string; size: number }> = {}) {
  return { name: "photo.jpg", type: "image/jpeg", size: 1024, ...overrides };
}

describe("validateImages", () => {
  it("accepts an empty list -- images are optional", () => {
    expect(validateImages([])).toEqual({ ok: true });
  });

  it("accepts up to 5 valid images of jpg/png/webp", () => {
    const files = [
      image({ type: "image/jpeg" }),
      image({ type: "image/png" }),
      image({ type: "image/webp" }),
      image(),
      image(),
    ];

    expect(validateImages(files)).toEqual({ ok: true });
  });

  it("rejects a 6th image without inspecting file contents", () => {
    const files = Array.from({ length: 6 }, () => image());

    expect(validateImages(files)).toEqual({ ok: false, reason: "too-many-images" });
  });

  it("rejects an unsupported mime type and names the failing index", () => {
    const files = [image(), image({ type: "image/gif" })];

    expect(validateImages(files)).toEqual({ ok: false, reason: "unsupported-type", index: 1 });
  });

  it("rejects a file over 5MB and names the failing index", () => {
    const files = [image({ size: MAX_IMAGE_SIZE_BYTES + 1 })];

    expect(validateImages(files)).toEqual({ ok: false, reason: "too-large", index: 0 });
  });

  it("accepts a file at exactly the 5MB ceiling", () => {
    expect(validateImages([image({ size: MAX_IMAGE_SIZE_BYTES })])).toEqual({ ok: true });
  });

  it("exposes its limits as named constants", () => {
    expect(MAX_IMAGE_COUNT).toBe(5);
    expect(MAX_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });
});
