import type { Locator } from "@playwright/test";
/**
 * Kudos Detail E2E test helpers — selector contract for /kudos/[id] and /profile.
 * Selector prefixes: `kudos-detail-*` (detail card), `profile-stub-*` (profile).
 */

export const DETAIL_SELECTORS = {
  // Kudos detail page (routes /kudos/[id])
  "kudos-detail-view": '[data-testid="kudos-detail-view"]',
  "kudos-detail-content": '[data-testid="kudos-detail-content"]',
  "kudos-detail-gallery": '[data-testid="kudos-detail-gallery"]',
  "kudos-detail-gallery-image": '[data-testid="kudos-detail-gallery-image"]',
  "kudos-detail-notfound": '[data-testid="kudos-detail-notfound"]',
  // Reused from board helpers (card is reused without truncation)
  "kudos-card-sender-name": '[data-testid="kudos-card-sender-name"]',
  "kudos-card-receiver-name": '[data-testid="kudos-card-receiver-name"]',
  "kudos-card-time": '[data-testid="kudos-card-time"]',
  "kudos-card-hashtags": '[data-testid="kudos-card-hashtags"]',
  "kudos-card-heart-btn": '[data-testid="kudos-card-heart-btn"]',
  "kudos-card-copy-link-btn": '[data-testid="kudos-card-copy-link-btn"]',
  // Profile stub page (route /profile?id={uuid})
  "profile-stub": '[data-testid="profile-stub"]',
  "profile-stub-avatar": '[data-testid="profile-stub-avatar"]',
  "profile-stub-name": '[data-testid="profile-stub-name"]',
  "profile-stub-message": '[data-testid="profile-stub-message"]',
};

export const DETAIL_VERBOSE_STRINGS = {
  developingMessage: "Đang phát triển",
};

export const TIME_FORMAT_REGEX = /^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/;

/**
 * Validate that content element has no line clamp and renders full text.
 * Checks that scrollHeight equals clientHeight (no overflow).
 */
export async function assertContentNotTruncated(element: Locator): Promise<void> {
  const scrollHeight = await element.evaluate((el: HTMLElement) => el.scrollHeight);
  const clientHeight = await element.evaluate((el: HTMLElement) => el.clientHeight);
  if (scrollHeight !== clientHeight) {
    throw new Error(`Content is truncated: scrollHeight=${scrollHeight}, clientHeight=${clientHeight}`);
  }
}

/**
 * Validate time format matches expected regex.
 */
export function isValidTimeFormat(text: string): boolean {
  return TIME_FORMAT_REGEX.test(text);
}
