/**
 * Fixed, design-sourced award category list. Values copied verbatim from
 * docs/data-model.md § award_category (6 rows, no DB table this round).
 * Slugs per clarifications.md "Award anchor slugs" decision -- shared with
 * the Homepage award cards and the Hệ thống giải page section ids.
 */
export type AwardCategory = {
  name: string;
  slug: string;
  quantity: string;
  prize: string;
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  {
    name: "Top Talent",
    slug: "top-talent",
    quantity: "10 Đơn vị",
    prize: "7.000.000 VNĐ each",
  },
  {
    name: "Top Project",
    slug: "top-project",
    quantity: "02 Tập thể",
    prize: "15.000.000 VNĐ each",
  },
  {
    name: "Top Project Leader",
    slug: "top-project-leader",
    quantity: "03 Cá nhân",
    prize: "7.000.000 VNĐ",
  },
  {
    name: "Best Manager",
    slug: "best-manager",
    quantity: "01 Cá nhân",
    prize: "10.000.000 VNĐ",
  },
  {
    name: "Signature 2025 - Creator",
    slug: "signature-2025-creator",
    quantity: "01",
    prize: "5.000.000 (cá nhân) / 8.000.000 (tập thể)",
  },
  {
    name: "MVP",
    slug: "mvp",
    quantity: "01",
    prize: "15.000.000 VNĐ",
  },
];
