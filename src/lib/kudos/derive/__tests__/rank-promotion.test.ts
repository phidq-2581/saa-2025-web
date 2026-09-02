import { describe, expect, it } from "vitest";
import { deriveRankPromotions } from "../rank-promotion";
import type { ReceivedKudosRow } from "../rank-promotion";

function kudosAt(userId: string, createdAt: string): ReceivedKudosRow {
  return { userId, fullName: `User ${userId}`, avatarUrl: null, createdAt };
}

function daysOfKudos(userId: string, count: number, startDay = 1): ReceivedKudosRow[] {
  return Array.from({ length: count }, (_, i) =>
    kudosAt(userId, `2026-01-${String(startDay + i).padStart(2, "0")}T00:00:00Z`),
  );
}

// Phase 02 (F006): "Suy tu moc hoa thi" clarification -- a Sunner's
// 10th/20th/50th received kudos *is* the rank-promotion event; its
// `created_at` is the milestone timestamp. Leaderboard is desc by that
// timestamp, top 10.
describe("deriveRankPromotions", () => {
  it("emits no event for a user with fewer than 10 received kudos", () => {
    const rows = daysOfKudos("u1", 9);
    expect(deriveRankPromotions(rows)).toEqual([]);
  });

  it("emits exactly one event at the 10th received kudos, using its created_at", () => {
    const rows = daysOfKudos("u1", 10);
    const events = deriveRankPromotions(rows);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      userId: "u1",
      kudosReceivedCount: 10,
      milestoneReachedAt: "2026-01-10T00:00:00Z",
    });
  });

  it("emits both the 10th and 20th milestone for a user with exactly 20", () => {
    const rows = daysOfKudos("u1", 20);
    const events = deriveRankPromotions(rows);
    const milestones = events.filter((e) => e.userId === "u1").map((e) => e.kudosReceivedCount);
    expect(milestones.sort()).toEqual([10, 20]);
  });

  it("emits 10th, 20th and 50th for a user with 50+ received kudos", () => {
    const rows = daysOfKudos("u1", 55);
    const events = deriveRankPromotions(rows).filter((e) => e.userId === "u1");
    expect(events.map((e) => e.kudosReceivedCount).sort()).toEqual([10, 20, 50]);
  });

  it("is unaffected by input row order -- sorts each user's rows before milestone extraction", () => {
    const rows = [...daysOfKudos("u1", 10)].reverse();
    const events = deriveRankPromotions(rows);
    expect(events[0].milestoneReachedAt).toBe("2026-01-10T00:00:00Z");
  });

  it("orders the combined leaderboard by milestoneReachedAt desc, across users", () => {
    const rows = [...daysOfKudos("early", 10, 1), ...daysOfKudos("late", 10, 20)];
    const events = deriveRankPromotions(rows);
    expect(events.map((e) => e.userId)).toEqual(["late", "early"]);
  });

  it("caps the leaderboard at the 10 most recent milestone events", () => {
    const rows = Array.from({ length: 12 }, (_, i) => daysOfKudos(`u${i}`, 10, 1 + i)).flat();
    const events = deriveRankPromotions(rows);
    expect(events).toHaveLength(10);
  });

  it("breaks an exact milestone-timestamp tie deterministically by userId", () => {
    const rows = [...daysOfKudos("zeta", 10, 1), ...daysOfKudos("alpha", 10, 1)];
    const events = deriveRankPromotions(rows);
    expect(events.map((e) => e.userId)).toEqual(["alpha", "zeta"]);
  });

  it("returns an empty leaderboard for no rows", () => {
    expect(deriveRankPromotions([])).toEqual([]);
  });
});
