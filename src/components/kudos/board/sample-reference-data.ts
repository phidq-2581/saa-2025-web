import type { HashtagRef, KudosAuthor } from "@/lib/kudos/types";
import type { AuthorPresentation } from "./kudos-board-types";

/**
 * Phase 04 (F006) design-sourced reference data: filter hashtags,
 * departments, and the author pool cards/leaderboards draw from. Deleted by
 * Phase 07 alongside `design-sample-data.ts` once real queries land.
 */

/** 13 Vietnamese filter hashtags (JWpsISMAaM node text + clarifications.md
 * "Seed 13 tag tiếng Việt" -- filter-dropdown seed, distinct from the EN
 * placeholder tags shown inside card content). */
export const FILTER_HASHTAGS: HashtagRef[] = [
  "Toàn diện",
  "Giỏi chuyên môn",
  "Hiệu suất cao",
  "Truyền cảm hứng",
  "Cống hiến",
  "Aim High",
  "Be Agile",
  "Wasshoi",
  "Hướng mục tiêu",
  "Hướng khách hàng",
  "Chuẩn quy trình",
  "Giải pháp sáng tạo",
  "Quản lý xuất sắc",
].map((name, index) => ({ id: `hashtag-${index + 1}`, name }));

/** Card-content hashtags as they literally appear in the design mockup
 * (B.4.3/C.3.7 character values) -- EN placeholders per clarifications.md
 * ("tag EN trong mẫu là placeholder design"), reused verbatim as sample
 * card content only (never used to seed the filter dropdown above). */
export const CARD_CONTENT_HASHTAGS: HashtagRef[] = [
  { id: "content-tag-1", name: "Dedicated" },
  { id: "content-tag-2", name: "Inspring" },
];

/** ~50 department codes, parsed from docs/momorph/dropdown-phong-ban and
 * approved verbatim at the blueprint checkpoint
 * (plans/260831-2303-saa-2025-web-kudos-round-2/spec/department-seed-candidate.md). */
export const DEPARTMENTS: string[] = [
  "CTO", "SPD", "FCOV", "CEVC1", "CEVC2", "STVC - R&D", "CEVC2 - CySS",
  "FCOV - LRM", "CEVC2 - System", "OPDC - HRF", "CEVC1 - DSV - UI/UX 1",
  "CEVC1 - DSV", "CEVEC", "OPDC - HRD - C&C", "STVC", "FCOV - F&A",
  "CEVC1 - DSV - UI/UX 2", "CEVC1 - AIE", "OPDC - HRF - C&B", "FCOV - GA",
  "FCOV - ISO", "STVC - EE", "GEU - HUST", "CEVEC - SAPD", "OPDC - HRF - OD",
  "CEVEC - GSD", "GEU - TM", "STVC - R&D - DTR", "STVC - R&D - DPS",
  "CEVC3", "STVC - R&D - AIR", "CEVC4", "PAO", "GEU", "GEU - DUT",
  "OPDC - HRD - L&D", "OPDC - HRD - TI", "OPDC - HRF - TA", "GEU - UET",
  "STVC - R&D - SDX", "OPDC - HRD - HRBP", "PAO - PEC", "IAV",
  "STVC - Infra", "CPV - CGP", "GEU - UIT", "OPDC - HRD", "BDV", "CPV",
  "PAO - PAO",
];

/** One Sunner: base author + card-presentation metadata. Names are the only
 * distinct people the MoMorph frame shows (2940:14174 Spotlight word cloud
 * + B.3/C.3 card mockups + D.3 gift list) -- reused across samples rather
 * than inventing new identities. `avatarUrl: null` because every avatar in
 * the design is a Google-profile placeholder fill with no exportable asset. */
export interface SamplePerson extends KudosAuthor {
  meta: AuthorPresentation;
}

export const SAMPLE_PEOPLE: SamplePerson[] = [
  { id: "u-hiep", fullName: "Đỗ Hoàng Hiệp", avatarUrl: null, meta: { department: "CEVC1", heroTier: "legend", asteriskTier: 3 } },
  { id: "u-an", fullName: "Dương Thúy An", avatarUrl: null, meta: { department: "CEVC2", heroTier: "super", asteriskTier: 3 } },
  { id: "u-thuy", fullName: "Mai Phương Thúy", avatarUrl: null, meta: { department: "STVC", heroTier: "rising", asteriskTier: 2 } },
  { id: "u-trang", fullName: "Lê Kiều Trang", avatarUrl: null, meta: { department: "OPDC - HRF", heroTier: "new", asteriskTier: 1 } },
  { id: "u-quy", fullName: "Nguyễn Văn Quy", avatarUrl: null, meta: { department: "FCOV", heroTier: "rising", asteriskTier: 2 } },
  { id: "u-chuc", fullName: "Nguyễn Bá Chức", avatarUrl: null, meta: { department: "GEU", heroTier: "super", asteriskTier: 3 } },
  { id: "u-linh", fullName: "Nguyễn Hoàng Linh", avatarUrl: null, meta: { department: "PAO", heroTier: "new", asteriskTier: 1 } },
  { id: "u-xuan", fullName: "Huỳnh Dương Xuân Nhật", avatarUrl: null, meta: { department: "CEVC1", heroTier: "legend", asteriskTier: 3 } },
  { id: "u-viewer", fullName: "Phạm Minh Đức", avatarUrl: null, meta: { department: "CEVC2", heroTier: "new", asteriskTier: 1 } },
];

/** Sample "current viewer" -- the account whose own kudos get a disabled
 * heart button (spec B.3.2/C.4.1: "Người gửi kudos sẽ bị disable nút tim"). */
export const CURRENT_VIEWER_ID = "u-viewer";

export function findPerson(id: string): SamplePerson {
  const person = SAMPLE_PEOPLE.find((p) => p.id === id);
  if (!person) throw new Error(`sample person not found: ${id}`);
  return person;
}
