import { test, expect } from "./support/authenticated-fixture";
import {
  DETAIL_SELECTORS,
  DETAIL_VERBOSE_STRINGS,
  assertContentNotTruncated,
  isValidTimeFormat,
} from "./support/detail-helpers";

/**
 * Phase 06 RED: Kudos detail /kudos/[id] and profile stub /profile routes
 * (5 test items from phase file: detail renders full content untruncated + full gallery,
 * shows sender+receiver+time+hashtags+heart+copy-link, not-found state,
 * profile stub with id, profile stub without id).
 */

const SAMPLE_KUDOS_ID = "sample-kudos-1";
const SAMPLE_PROFILE_ID = "u-hiep"; // sender id from first sample card
const UNKNOWN_KUDOS_ID = "unknown-kudos-9999";

test.describe("Kudos Detail and Profile Stub (Phase 06, RED test)", () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 800 });
  });

  test("Item 1: /kudos/{id} renders full untruncated content + full-size gallery (TC 8c0d1781, 31693bb7)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/kudos/${SAMPLE_KUDOS_ID}`);
    const detailView = page.locator(DETAIL_SELECTORS["kudos-detail-view"]);
    await expect(detailView).toBeVisible();

    const contentElement = page.locator(DETAIL_SELECTORS["kudos-detail-content"]);
    await expect(contentElement).toBeVisible();
    await assertContentNotTruncated(contentElement);

    // Gallery must render FULL-SIZE images — asserted on sample-kudos-6,
    // which carries 5 images in the sample data (sample-kudos-1 has none)
    await page.goto("/kudos/sample-kudos-6");
    const gallery = page.locator(DETAIL_SELECTORS["kudos-detail-gallery"]);
    await expect(gallery).toBeVisible();
    const galleryImages = page.locator(DETAIL_SELECTORS["kudos-detail-gallery-image"]);
    await expect(galleryImages).toHaveCount(5);
    await expect(galleryImages.first()).toBeVisible();
  });

  test("Item 2: Detail shows sender+receiver names, time format HH:mm - MM/DD/YYYY, hashtags, heart + Copy Link", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/kudos/${SAMPLE_KUDOS_ID}`);
    const detailView = page.locator(DETAIL_SELECTORS["kudos-detail-view"]);
    await expect(detailView).toBeVisible();

    // Sender and receiver names must be present
    const senderName = page.locator(DETAIL_SELECTORS["kudos-card-sender-name"]);
    await expect(senderName).toBeVisible();
    const senderText = await senderName.textContent();
    expect(senderText).toBeTruthy();

    const receiverName = page.locator(DETAIL_SELECTORS["kudos-card-receiver-name"]);
    await expect(receiverName).toBeVisible();
    const receiverText = await receiverName.textContent();
    expect(receiverText).toBeTruthy();

    // Time must match format HH:mm - MM/DD/YYYY
    const timeElement = page.locator(DETAIL_SELECTORS["kudos-card-time"]);
    await expect(timeElement).toBeVisible();
    const timeText = await timeElement.textContent();
    expect(isValidTimeFormat(timeText || "")).toBe(true);

    // Hashtag chips must be present
    const hashtagsElement = page.locator(DETAIL_SELECTORS["kudos-card-hashtags"]);
    await expect(hashtagsElement).toBeVisible();

    // Heart button must be present
    const heartBtn = page.locator(DETAIL_SELECTORS["kudos-card-heart-btn"]);
    await expect(heartBtn).toBeVisible();

    // Copy Link button must be present
    const copyLinkBtn = page.locator(DETAIL_SELECTORS["kudos-card-copy-link-btn"]);
    await expect(copyLinkBtn).toBeVisible();
  });

  test("Item 3: /kudos/{unknownId} renders not-found state (not crash)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/kudos/${UNKNOWN_KUDOS_ID}`);
    const notFoundElement = page.locator(DETAIL_SELECTORS["kudos-detail-notfound"]);
    await expect(notFoundElement).toBeVisible();
  });

  test("Item 4: /profile?id={uuid} renders avatar + name + 'Đang phát triển' and nothing more", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/profile?id=${SAMPLE_PROFILE_ID}`);
    const profileStub = page.locator(DETAIL_SELECTORS["profile-stub"]);
    await expect(profileStub).toBeVisible();

    const avatar = page.locator(DETAIL_SELECTORS["profile-stub-avatar"]);
    await expect(avatar).toBeVisible();

    const name = page.locator(DETAIL_SELECTORS["profile-stub-name"]);
    await expect(name).toBeVisible();
    const nameText = await name.textContent();
    expect(nameText).toBeTruthy();

    const message = page.locator(DETAIL_SELECTORS["profile-stub-message"]);
    await expect(message).toBeVisible();
    await expect(message).toContainText(DETAIL_VERBOSE_STRINGS.developingMessage);
  });

  test("Item 5: /profile without id renders placeholder without throwing", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/profile");
    const profileStub = page.locator(DETAIL_SELECTORS["profile-stub"]);
    await expect(profileStub).toBeVisible();

    const avatar = page.locator(DETAIL_SELECTORS["profile-stub-avatar"]);
    await expect(avatar).toBeVisible();

    const message = page.locator(DETAIL_SELECTORS["profile-stub-message"]);
    await expect(message).toBeVisible();
    await expect(message).toContainText(DETAIL_VERBOSE_STRINGS.developingMessage);
  });
});
