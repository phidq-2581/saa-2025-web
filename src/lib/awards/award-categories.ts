/**
 * Fixed, design-sourced award category list (6 rows, no DB table this round).
 * Names come from the MoMorph award-page nav items C.1–C.6 (screen zFYDgyj_pD).
 * Slugs per clarifications.md "Award anchor slugs" decision -- shared with
 * the Homepage award cards and the Hệ thống giải page section ids.
 * Per-card quantity/prize copy lives in messages/vi/awards.json (read from the
 * Figma `character` fields), not here.
 */
export type AwardCategory = {
  name: string;
  slug: string;
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  { name: "Top Talent", slug: "top-talent" },
  { name: "Top Project", slug: "top-project" },
  { name: "Top Project Leader", slug: "top-project-leader" },
  { name: "Best Manager", slug: "best-manager" },
  { name: "Signature 2025 - Creator", slug: "signature-2025-creator" },
  { name: "MVP", slug: "mvp" },
];
