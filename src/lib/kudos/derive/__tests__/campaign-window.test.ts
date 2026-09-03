import { describe, expect, it } from "vitest";
import { formatCampaignBoundary, resolveCampaignWindow } from "../campaign-window";

// `special_days` stores whole Asia/Ho_Chi_Minh calendar days (heart-rules.ts doubles any
// heart granted on such a day), so a campaign window is the contiguous run of special days
// that contains today: 00:00 on its first day to 23:59 on its last (clarifications.md
// 2026-09-03 evening). 2026-12-25T10:00Z is 17:00 on 25/12 in Ho Chi Minh.
const NOW = new Date("2026-12-25T10:00:00Z");

describe("resolveCampaignWindow", () => {
  it("returns null when today is not a special day", () => {
    expect(resolveCampaignWindow(NOW, ["2026-12-24", "2026-12-26"])).toBeNull();
  });

  it("returns a single-day window when today is an isolated special day", () => {
    expect(resolveCampaignWindow(NOW, ["2026-12-25"])).toEqual({ start: "2026-12-25", end: "2026-12-25" });
  });

  it("extends the window across the contiguous run of special days around today", () => {
    expect(resolveCampaignWindow(NOW, ["2026-12-27", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-30"])).toEqual({
      start: "2026-12-24",
      end: "2026-12-27",
    });
  });

  it("does not bridge a gap in the run", () => {
    expect(resolveCampaignWindow(NOW, ["2026-12-23", "2026-12-25", "2026-12-26"])).toEqual({
      start: "2026-12-25",
      end: "2026-12-26",
    });
  });

  it("uses the Ho Chi Minh calendar day, not UTC", () => {
    // 2026-12-25T18:30Z is already 01:30 on 26/12 in Ho Chi Minh
    expect(resolveCampaignWindow(new Date("2026-12-25T18:30:00Z"), ["2026-12-26"])).toEqual({
      start: "2026-12-26",
      end: "2026-12-26",
    });
  });
});

describe("formatCampaignBoundary", () => {
  it("formats the window edges as 'HH:MM ngày DD/MM' (canvas placeholder 'XX:XX ngày XX/12')", () => {
    expect(formatCampaignBoundary("2026-12-24", "start")).toBe("00:00 ngày 24/12");
    expect(formatCampaignBoundary("2026-12-27", "end")).toBe("23:59 ngày 27/12");
    expect(formatCampaignBoundary("2027-01-05", "start")).toBe("00:00 ngày 05/01");
  });
});
