import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "../use-countdown";

// F4 (red-team failure-mode): fake timers -- minute value decrements after
// 60s (TC ID-39), `reached` flips at the target, an invalid target yields
// 00/00/00 without throwing (BR-004, TC ID-60).
describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks the minute value down after 60s (TC ID-39)", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    vi.setSystemTime(now);
    const target = Date.parse("2026-09-01T00:10:00+07:00");

    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.minutes).toBe("10");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.minutes).toBe("09");
  });

  it("flips reached to true once the target passes", () => {
    const now = Date.parse("2026-09-01T00:00:00+07:00");
    vi.setSystemTime(now);
    const target = now + 30_000;

    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.reached).toBe(false);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.reached).toBe(true);
    expect(result.current).toMatchObject({ days: "00", hours: "00", minutes: "00" });
  });

  it("returns a safe 00/00/00 fallback for a null target, without throwing (BR-004)", () => {
    expect(() => renderHook(() => useCountdown(null))).not.toThrow();
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toEqual({
      days: "00",
      hours: "00",
      minutes: "00",
      reached: true,
    });
  });
});
