import { describe, expect, it } from "vitest";
import { computeRemaining } from "../compute-remaining";

// ALG-001_CountdownRemainingTime / BR-001 (zero-padding) / BR-002 (clamp at
// or after target). Epoch-ms diff math -- see docs/features/
// F003_HomepageOverview/technical-spec.md § Algorithms.
describe("computeRemaining", () => {
  it("computes and zero-pads days/hours/minutes when the target is ahead", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    const target = Date.parse("2026-09-03T02:05:00+07:00");
    expect(computeRemaining(now, target)).toEqual({
      days: "02",
      hours: "02",
      minutes: "05",
      reached: false,
    });
  });

  it("pads single-digit values to 2 digits (BR-001)", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    const target = Date.parse("2026-09-01T05:09:00+07:00");
    expect(computeRemaining(now, target)).toEqual({
      days: "00",
      hours: "05",
      minutes: "09",
      reached: false,
    });
  });

  it("floors partial minutes rather than rounding", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    const target = Date.parse("2026-09-01T00:01:59.999+07:00");
    expect(computeRemaining(now, target)).toMatchObject({ minutes: "01" });
  });

  it("clamps to 00/00/00 with reached:true exactly at the target (BR-002)", () => {
    const t = Date.parse("2026-09-01T00:00:00+07:00");
    expect(computeRemaining(t, t)).toEqual({
      days: "00",
      hours: "00",
      minutes: "00",
      reached: true,
    });
  });

  it("clamps to 00/00/00 with reached:true past the target, never negative (BR-002)", () => {
    const t = Date.parse("2026-09-01T00:00:00+07:00");
    expect(computeRemaining(t + 60_000, t)).toEqual({
      days: "00",
      hours: "00",
      minutes: "00",
      reached: true,
    });
  });

  it("carries days across a 24h boundary", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    const target = Date.parse("2026-09-11T12:30:00+07:00");
    expect(computeRemaining(now, target)).toEqual({
      days: "10",
      hours: "12",
      minutes: "30",
      reached: false,
    });
  });
});
