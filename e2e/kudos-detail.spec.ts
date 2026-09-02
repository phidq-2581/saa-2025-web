import { randomUUID } from "node:crypto";
import { test, expect } from "./support/authenticated-fixture";
import { createKudosSeeder } from "./support/seed-kudos";
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

test.describe("Kudos Detail and Profile Stub (Phase 06, RED test)", () => {
  const seeder = createKudosSeeder();
  let sampleKudosId: string;
  let sampleKudosWithImagesId: string;
  let sampleProfileId: string;

  test.beforeAll(async () => {
    // Seed test data
    const sender = await seeder.createActor("detail-sender");
    const receiver = await seeder.createActor("detail-receiver");
    const hashtags = await seeder.fetchHashtagIds(2);

    sampleKudosId = await seeder.seedKudos({
      senderId: sender.userId,
      receiverId: receiver.userId,
      hashtagIds: hashtags,
    });

    // Kudos WITH a real 5-image gallery: upload 5 tiny PNGs to the private
    // bucket (service role), then link them as kudos_image rows so the page's
    // signed-URL resolution finds real objects.
    const imagePaths = [0, 1, 2, 3, 4].map(
      (i) => `kudos/${sender.userId}/detail-spec/${Date.now()}-${i}.png`,
    );
    for (const p of imagePaths) {
      await seeder.uploadTestImage(p);
    }
    sampleKudosWithImagesId = await seeder.seedKudos({
      senderId: sender.userId,
      receiverId: receiver.userId,
      hashtagIds: hashtags,
      imagePaths,
    });

    sampleProfileId = sender.userId;
  });

  test.afterAll(async () => {
    await seeder.cleanup();
  });

  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 800 });
  });

  test("Item 1: /kudos/{id} renders full untruncated content + full-size gallery (TC 8c0d1781, 31693bb7)", async ({
    authenticatedPage: page,
  }) => {
    // Test content on the seeded kudos
    await page.goto(`/kudos/${sampleKudosId}`);
    const detailView = page.locator(DETAIL_SELECTORS["kudos-detail-view"]);
    await expect(detailView).toBeVisible();

    const contentElement = page.locator(DETAIL_SELECTORS["kudos-detail-content"]);
    await expect(contentElement).toBeVisible();
    await assertContentNotTruncated(contentElement);

    // Gallery must render FULL-SIZE images — the seeded kudos carries 5 real
    // uploaded objects, so these assertions are unconditional.
    await page.goto(`/kudos/${sampleKudosWithImagesId}`);
    const detailView2 = page.locator(DETAIL_SELECTORS["kudos-detail-view"]);
    await expect(detailView2).toBeVisible();

    const gallery = page.locator(DETAIL_SELECTORS["kudos-detail-gallery"]);
    await expect(gallery).toBeVisible();
    const galleryImages = page.locator(DETAIL_SELECTORS["kudos-detail-gallery-image"]);
    await expect(galleryImages).toHaveCount(5);
    await expect(galleryImages.first()).toBeVisible();
  });

  test("Item 2: Detail shows sender+receiver names, time format HH:mm - MM/DD/YYYY, hashtags, heart + Copy Link", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/kudos/${sampleKudosId}`);
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

    // Heart is WIRED on the detail page: viewer (not the sender) toggles
    // 0 → 1 → 0 with a reconciled count (behavior owned by Phase 07)
    const heartBtn = page.locator(DETAIL_SELECTORS["kudos-card-heart-btn"]);
    await expect(heartBtn).toBeVisible();
    await expect(heartBtn).toBeEnabled();
    await expect(heartBtn).toContainText("0");
    await heartBtn.click();
    await expect(heartBtn).toContainText("1", { timeout: 10_000 });
    await heartBtn.click();
    await expect(heartBtn).toContainText("0", { timeout: 10_000 });

    // Copy Link is wired: click copies the kudos URL and shows the verbatim toast
    const copyLinkBtn = page.locator(DETAIL_SELECTORS["kudos-card-copy-link-btn"]);
    await expect(copyLinkBtn).toBeVisible();
    await copyLinkBtn.click();
    await expect(page.getByText("Link copied — ready to share!")).toBeVisible({ timeout: 5_000 });
  });

  test("Item 3: /kudos/{unknownId} renders not-found state (not crash)", async ({
    authenticatedPage: page,
  }) => {
    // Use a real UUID that doesn't exist
    const unknownId = randomUUID();
    await page.goto(`/kudos/${unknownId}`);
    const notFoundElement = page.locator(DETAIL_SELECTORS["kudos-detail-notfound"]);
    await expect(notFoundElement).toBeVisible();
  });

  test("Item 4: /profile?id={uuid} renders avatar + name + 'Đang phát triển' and nothing more", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/profile?id=${sampleProfileId}`);
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
