import type { LeaderboardEntry } from "@/lib/kudos/types";

/**
 * D.3_10 SUNNER nhận quà (2940:13510) card shape shared by both sidebar
 * leaderboards (D.2 rank-promotion card reuses the same bordered/rounded
 * container per the phase-04 prompt -- it has no distinct MoMorph node of
 * its own, only the D section's quoted title strings). Entry row mirrors
 * D.3.2_Thông tin Sunner nhận quà (2940:13516): 64x64 white-bordered avatar
 * + bold gold name + a description line. `LeaderboardEntry` (Phase 01,
 * read-only) has no free-text description field, so the description
 * renders the data the entry actually carries ("{count} Kudos") instead of
 * inventing prose that has no translation key.
 */
export type LeaderboardListProps = {
  testId: string;
  title: string;
  entries: LeaderboardEntry[];
  emptyLabel: string;
};

export function LeaderboardList({ testId, title, entries, emptyLabel }: LeaderboardListProps) {
  return (
    // mm:2940:13510
    <div
      data-testid={testId}
      className="flex w-full flex-col items-start gap-2.5 rounded-[17px] border border-border-gold bg-panel py-6 pl-6 pr-4"
    >
      {/* mm:2940:13513 */}
      <h3 className="w-full text-center font-body text-[22px] font-bold leading-7 text-gold">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p
          data-testid="sidebar-leaderboard-empty"
          className="w-full py-4 text-center font-body text-base text-white"
        >
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-4">
          {entries.map((entry) => (
            // mm:2940:13516
            <li key={entry.userId} className="flex w-full items-center gap-2">
              {/* mm:I2940:13516;256:7460 */}
              <img
                src={entry.avatarUrl ?? "/kudos-board/avatar-placeholder.png"}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-full border-[1.87px] border-white object-cover"
              />
              {/* mm:I2940:13516;256:7461 */}
              <div className="flex flex-col gap-0.5">
                {/* mm:I2940:13516;256:7462 */}
                <span className="font-body text-[22px] font-bold leading-7 text-gold">
                  {entry.fullName}
                </span>
                {/* mm:I2940:13516;256:7472 */}
                <span className="font-body text-base font-bold tracking-[0.15px] text-white">
                  {entry.kudosReceivedCount} Kudos
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
