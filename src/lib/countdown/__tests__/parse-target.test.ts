import { describe, expect, it } from "vitest";
import { parseTarget } from "../parse-target";

// BR-004_CountdownEnvFallback (TC ID-60): must never throw at module scope --
// research-02's sketch throws; this is the softened, safe-fallback version.
// `null` is the fallback sentinel; callers (useCountdown) treat it as
// "already reached" so the UI clamps to 00/00/00 instead of crashing.
describe("parseTarget", () => {
  it("parses a valid ISO-8601 datetime with an explicit UTC offset", () => {
    const expected = Date.parse("2025-12-31T18:30:00+07:00");
    expect(parseTarget("2025-12-31T18:30:00+07:00")).toBe(expected);
  });

  it("returns null for a missing value", () => {
    expect(parseTarget(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseTarget("")).toBeNull();
  });

  it("returns null for a malformed date string", () => {
    expect(parseTarget("not-a-date")).toBeNull();
  });

  it("never throws on malformed input", () => {
    expect(() => parseTarget("also-not-a-date")).not.toThrow();
  });
});
