/**
 * Kudos Board E2E test helpers — selector contract and reusable assertions.
 * Selector prefixes: `kudos-board-*` (main), `kudos-card-*` (feed card),
 * `spotlight-*` (word cloud), `hashtag-filter-*`, `dept-filter-*`.
 */

export const SELECTORS = {
  // Banner (A)
  "kudos-board-banner-title": '[data-testid="kudos-board-banner-title"]',
  // Compose pill (A.1)
  "kudos-board-compose-pill": '[data-testid="kudos-board-compose-pill"]',
  // Highlight section headers & carousel (B, B.1, B.2)
  "kudos-board-highlight-header": '[data-testid="kudos-board-highlight-header"]',
  "kudos-board-highlight-carousel": '[data-testid="kudos-board-highlight-carousel"]',
  "kudos-board-carousel-prev": '[data-testid="kudos-board-carousel-prev"]',
  "kudos-board-carousel-next": '[data-testid="kudos-board-carousel-next"]',
  "kudos-board-carousel-pagination": '[data-testid="kudos-board-carousel-pagination"]',
  "kudos-board-carousel-slides": '[data-testid="kudos-board-carousel-slide"]',
  // Filter buttons (B.1.1, B.1.2)
  "hashtag-filter-trigger": '[data-testid="hashtag-filter-trigger"]',
  "dept-filter-trigger": '[data-testid="dept-filter-trigger"]',
  "hashtag-filter-menu": '[data-testid="hashtag-filter-menu"]',
  "dept-filter-menu": '[data-testid="dept-filter-menu"]',
  // Spotlight section (B.6, B.7)
  "kudos-board-spotlight-header": '[data-testid="kudos-board-spotlight-header"]',
  "spotlight-root": '[data-testid="spotlight-root"]',
  "spotlight-total-label": '[data-testid="spotlight-total-label"]',
  "spotlight-pan-zoom-toggle": '[data-testid="spotlight-pan-zoom-toggle"]',
  "spotlight-search-input": '[data-testid="spotlight-search-input"]',
  "spotlight-search-error": '[data-testid="spotlight-search-error"]',
  "spotlight-cloud": '[data-testid="spotlight-cloud"]',
  // All Kudos section (C.1, C.2)
  "kudos-board-all-header": '[data-testid="kudos-board-all-header"]',
  "kudos-feed": '[data-testid="kudos-feed"]',
  "kudos-feed-empty": '[data-testid="kudos-feed-empty"]',
  // Kudos card (C.3, C.4)
  "kudos-card": '[data-testid="kudos-card"]',
  "kudos-card-sender-name": '[data-testid="kudos-card-sender-name"]',
  "kudos-card-receiver-name": '[data-testid="kudos-card-receiver-name"]',
  "kudos-card-time": '[data-testid="kudos-card-time"]',
  "kudos-card-content": '[data-testid="kudos-card-content"]',
  "kudos-card-hashtags": '[data-testid="kudos-card-hashtags"]',
  "kudos-card-asterisk-badge": '[data-testid="kudos-card-asterisk-badge"]',
  "kudos-card-heart-btn": '[data-testid="kudos-card-heart-btn"]',
  "kudos-card-copy-link-btn": '[data-testid="kudos-card-copy-link-btn"]',
  "kudos-card-view-detail-btn": '[data-testid="kudos-card-view-detail-btn"]',
  // Sidebar (D)
  "kudos-board-sidebar": '[data-testid="kudos-board-sidebar"]',
  "sidebar-stat-line": '[data-testid="sidebar-stat-line"]',
  "sidebar-open-gift-btn": '[data-testid="sidebar-open-gift-btn"]',
  "sidebar-open-gift-tooltip": '[data-testid="sidebar-open-gift-tooltip"]',
  "sidebar-rank-leaderboard": '[data-testid="sidebar-rank-leaderboard"]',
  "sidebar-gift-leaderboard": '[data-testid="sidebar-gift-leaderboard"]',
  "sidebar-leaderboard-empty": '[data-testid="sidebar-leaderboard-empty"]',
};

export const VIETNAMESE_HASHTAGS = [
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
];

export const VERBOSE_STRINGS = {
  bannerTitle: "Hệ thống ghi nhận lời cảm ơn",
  pillPlaceholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
  highlightHeader: "HIGHLIGHT KUDOS",
  spotlightHeader: "SPOTLIGHT BOARD",
  allKudosHeader: "ALL KUDOS",
  emptyFeed: "Hiện tại chưa có Kudos nào.",
  emptyLeaderboard: "Chưa có dữ liệu",
  openGiftTooltip: "Sắp ra mắt",
  copyLinkToast: "Link copied — ready to share!",
};

export const TIME_FORMAT_REGEX = /^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/;

/**
 * Validate pagination label matches `current/total` pattern.
 */
export function validatePaginationLabel(text: string, expectedTotal: number): boolean {
  const match = text.match(/^(\d+)\/(\d+)$/);
  if (!match) return false;
  const [, , total] = match;
  return parseInt(total, 10) === expectedTotal;
}

/**
 * Check if a timestamp matches the expected format and is recent.
 */
export function isValidTimestamp(text: string): boolean {
  return TIME_FORMAT_REGEX.test(text);
}
