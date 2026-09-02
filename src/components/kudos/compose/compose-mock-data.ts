import type { HashtagRef, KudosAuthor } from "@/lib/kudos/types";

/**
 * Phase 03 (F005) design-sourced mock data for the Viết Kudo compose modal.
 * Track A only -- Phase 07 swaps these for real `profile`/hashtag queries
 * without touching component internals (integration contract in the phase
 * file). Kept local to `compose/**` rather than importing the concurrently
 * edited `kudos/board/**` sample files (file-ownership boundary), even
 * though both draw from the same MoMorph fileKey's design content.
 *
 * Recipient names: the Viết Kudo screen's own recipient field renders empty
 * (`mms_B.2_Search`, no options visible in the frame). Reused as the same
 * design-sourced Sunner pool already verified elsewhere in this fileKey
 * (clarifications.md 2026-08-31: node 2940:14174 Spotlight word cloud +
 * B.3/C.3 card mockups + D.3 gift list) -- genuine Figma content, not
 * invented.
 */
export const MOCK_RECIPIENTS: KudosAuthor[] = [
  { id: "u-hiep", fullName: "Đỗ Hoàng Hiệp", avatarUrl: null },
  { id: "u-an", fullName: "Dương Thúy An", avatarUrl: null },
  { id: "u-thuy", fullName: "Mai Phương Thúy", avatarUrl: null },
  { id: "u-trang", fullName: "Lê Kiều Trang", avatarUrl: null },
  { id: "u-quy", fullName: "Nguyễn Văn Quy", avatarUrl: null },
  { id: "u-chuc", fullName: "Nguyễn Bá Chức", avatarUrl: null },
  { id: "u-linh", fullName: "Nguyễn Hoàng Linh", avatarUrl: null },
  { id: "u-xuan", fullName: "Huỳnh Dương Xuân Nhật", avatarUrl: null },
  { id: "u-duc", fullName: "Phạm Minh Đức", avatarUrl: null },
];

/**
 * 13 Vietnamese hashtag seed (clarifications.md "Seed 13 tag tiếng Việt") --
 * the picker shows this list, never the English placeholder chips rendered
 * inside `p9zO-c4a4x` (Dropdown list hashtag), which are sample card
 * content, not the filter seed.
 */
export const MOCK_HASHTAGS: HashtagRef[] = [
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
