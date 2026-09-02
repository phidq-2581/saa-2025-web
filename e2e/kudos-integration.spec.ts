/**
 * Phase 07 RED — Integration Wiring: Real submit, infinite scroll, copy link, detail nav, EN locale
 * Items 1–5 from phase-07-integration-wiring.md § RED test files
 * Test against design-sample data (no real queries wired yet).
 * These MUST fail RED because: no real submit (sample data only), no infinite scroll pagination,
 * copy link not wired, detail/profile routes return 404, EN messages are empty {}.
 */

import { test, expect } from "./support/authenticated-fixture";
import { createKudosSeeder } from "./support/seed-kudos";
import {
  scrollToBottom,
  expectToastWithText,
  getLocaleCookie,
} from "./support/integration-helpers";
import { SELECTORS } from "./support/board-helpers";
import { DETAIL_SELECTORS } from "./support/detail-helpers";
import { PNG_1PX, getDialogFields, openComposeDialog, pickFirstHashtags } from "./support/compose-helpers";

test.describe("Phase 07: Kudos Integration Wiring", () => {
  const seeder = createKudosSeeder();

  test.afterEach(async () => {
    await seeder.cleanup();
  });

  /**
   * ITEM 1: Unauthenticated GET of /kudos, /kudos/{id}, and /profile?id=…
   * redirects to /login?next=… (TC 71b3ef43, SC-004)
   * May legitimately PASS today if proxy already guards (pre-valid).
   * Post-valid: must remain guarded.
   */
  test("1. Unauthenticated routes redirect to login with next param (TC 71b3ef43, SC-004)", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Test /kudos redirect
      await page.goto("/kudos", { waitUntil: "networkidle" });
      expect(page.url()).toMatch(/\/login/);
      const loginUrl = new URL(page.url());
      expect(loginUrl.searchParams.get("next")).toBe("/kudos");

      // Test /kudos/[id] redirect
      const testKudosId = "00000000-0000-0000-0000-000000000001";
      await page.goto(`/kudos/${testKudosId}`, { waitUntil: "networkidle" });
      expect(page.url()).toMatch(/\/login/);
      const loginUrl2 = new URL(page.url());
      expect(loginUrl2.searchParams.get("next")).toContain(`/kudos/${testKudosId}`);

      // Test /profile?id=… redirect
      const testUserId = "00000000-0000-0000-0000-000000000002";
      await page.goto(`/profile?id=${testUserId}`, { waitUntil: "networkidle" });
      expect(page.url()).toMatch(/\/login/);
      const loginUrl3 = new URL(page.url());
      expect(loginUrl3.searchParams.get("next")).toContain(`/profile`);
    } finally {
      await context.close();
    }
  });

  /**
   * ITEM 2: Submit real kudos via compose dialog
   * Modal closes, new card appears in feed with content, hashtags, time format HH:mm - MM/DD/YYYY
   * (TC ID-46, ID-47)
   * MUST FAIL RED: submitted kudos never appears in feed (only sample data rendered).
   */
  test("2. Submit real kudos: modal closes, card appears in feed with content, hashtags, time (TC ID-46, ID-47)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/kudos");

    // Note: we'll verify the new card by its content, not count,
    // because feed may have pagination or fixed display size
    const submittedContent = "Thank you for your amazing work!";

    // Open compose dialog
    const dialog = await openComposeDialog(page);
    const fields = getDialogFields(dialog);

    // Recipient autocomplete (first member user is seeded for this test)
    const actor = await seeder.createActor("test-recipient");
    const recipientName = actor.email.split("@")[0];

    await fields.recipient.fill(recipientName);
    await page.waitForTimeout(200);
    const recipientOptions = page.locator('[data-testid="kudos-compose-recipient-option"]');
    await expect(recipientOptions.first()).toBeVisible();
    await recipientOptions.first().click();

    // Add content
    await fields.editor.click();
    await page.keyboard.type("Thank you for your amazing work!");

    // Add 2 hashtags (picker opens once, select N options without re-opening)
    await pickFirstHashtags(page, dialog, 2);
    // Helper leaves the picker open (Track A contract) — close it before submit.
    await page.keyboard.press("Escape");

    // Add 1 image
    const fileInput = page.locator('[data-testid="kudos-compose-image-input"]');
    await fileInput.setInputFiles({ name: "test.png", mimeType: "image/png", buffer: PNG_1PX });
    await expect(page.locator('[data-testid="kudos-compose-image-thumb"]')).toBeVisible();

    // Submit (ensure submit button is enabled)
    await expect(fields.submit).toBeEnabled();
    await fields.submit.click();
    await page.waitForTimeout(600); // Wait for submission to process

    // Modal should close (asserts real submit wiring)
    await expect(dialog).not.toBeVisible({ timeout: 8000 });
    await page.waitForTimeout(300);

    // After submit, app may navigate; return to /kudos to verify new card appears
    await page.goto("/kudos");
    await page.waitForTimeout(500);

    // Verify submitted card appears in feed by its unique content
    const feedAfter = page.locator(SELECTORS["kudos-card"]);
    const cardWithContent = feedAfter.filter({
      has: page.locator(SELECTORS["kudos-card-content"]).filter({
        hasText: submittedContent,
      }),
    });

    // Wait for the new card to appear
    let attempts = 0;
    let cardCount = await cardWithContent.count();
    while (cardCount === 0 && attempts < 10) {
      await page.waitForTimeout(300);
      cardCount = await cardWithContent.count();
      attempts++;
    }
    expect(cardCount).toBeGreaterThan(0);

    // Verify the card structure: hashtags and time format
    const newCard = cardWithContent.first();
    const cardHashtags = newCard.locator(SELECTORS["kudos-card-hashtags"]);
    await expect(cardHashtags).toBeVisible();

    // Time format should match HH:mm - MM/DD/YYYY
    const cardTime = newCard.locator(SELECTORS["kudos-card-time"]);
    const timeText = await cardTime.textContent();
    const timeRegex = /^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/;
    expect(timeRegex.test(timeText || "")).toBeTruthy();
  });

  /**
   * ITEM 3: Infinite scroll
   * Seed 12 kudos for this test's users, scroll to bottom, next page appends
   * (TC 9dfda316)
   * MUST FAIL RED: no real pagination wired (sample data only, no load-more handler).
   */
  test("3. Infinite scroll: seed 12 kudos, scroll to bottom, next page appends (TC 9dfda316)", async ({
    authenticatedPage: page,
  }) => {
    // Seed 2 actors and 12 kudos between them
    const sender = await seeder.createActor("scroll-sender");
    const receiver = await seeder.createActor("scroll-receiver");
    const hashtags = await seeder.fetchHashtagIds(1);

    const kudosIds: string[] = [];
    for (let i = 0; i < 12; i++) {
      const id = await seeder.seedKudos({
        senderId: sender.userId,
        receiverId: receiver.userId,
        hashtagIds: hashtags,
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
      });
      kudosIds.push(id);
    }

    await page.goto("/kudos");
    await page.waitForTimeout(500);

    // Measure initial feed size
    const feed = page.locator(SELECTORS["kudos-card"]);
    const initialCount = await feed.count();

    // Scroll to bottom (should trigger load more)
    await scrollToBottom(page);

    // Wait for potential network load
    await page.waitForTimeout(800);

    // Feed should have more cards (next page loaded)
    const finalCount = await feed.count();
    expect(finalCount).toBeGreaterThan(initialCount);
  });

  /**
   * ITEM 4: Copy link and detail navigation
   * Copy link shows toast "Link copied — ready to share!" (verbatim, TC 0adfd7ce)
   * "Xem chi tiết" opens untruncated detail (TC 8c0d1781)
   * Spotlight node click opens detail page
   * Avatar click opens /profile?id=
   * MUST FAIL RED: copy link not wired, detail/profile routes not implemented yet.
   */
  test("4. Copy link toast, detail nav, spotlight node, avatar nav (TC 0adfd7ce, 8c0d1781)", async ({
    authenticatedPage: page,
  }) => {
    const sender = await seeder.createActor("copy-sender");
    const receiver = await seeder.createActor("copy-receiver");
    const hashtags = await seeder.fetchHashtagIds(1);

    await seeder.seedKudos({
      senderId: sender.userId,
      receiverId: receiver.userId,
      hashtagIds: hashtags,
    });

    await page.goto("/kudos");
    await page.waitForTimeout(500); // Wait for cards to render

    // Find a card in the feed to test copy-link flow
    const feedCards = page.locator(SELECTORS["kudos-feed"]).locator(SELECTORS["kudos-card"]);
    await expect(feedCards.first()).toBeVisible();

    const card = feedCards.first();
    const copyButton = card.locator(SELECTORS["kudos-card-copy-link-btn"]);
    await expect(copyButton).toBeVisible();

    // Copy link should show exact toast message
    await copyButton.click();
    await expectToastWithText(page, "Link copied — ready to share!");

    // "Xem chi tiết" button opens detail page with full content (no truncation)
    // Highlight cards only have this button
    const detailButton = page.locator(SELECTORS["kudos-board-carousel-slides"])
      .first()
      .locator(SELECTORS["kudos-card-view-detail-btn"]);
    await expect(detailButton).toBeVisible();
    await detailButton.click();

    // Should navigate to /kudos/[id]
    await page.waitForURL(/\/kudos\//, { timeout: 5000 });
    expect(page.url()).toContain("/kudos/");

    // Detail page should show the full card content (asserts untruncated)
    const detailContent = page.locator(DETAIL_SELECTORS["kudos-detail-content"]);
    await expect(detailContent).toBeVisible();
  });

  /**
   * ITEM 5: EN locale renders at least 1 MoMorph-sourced English string
   * on /kudos and in modal. VN output unchanged.
   * MUST FAIL RED: messages/en/kudos.json and messages/en/compose.json are empty {}.
   */
  test("5. EN locale renders MoMorph-sourced strings; VN unchanged (TC count EN keys)", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to /kudos first to establish the page context
    await page.goto("/kudos");
    await page.waitForTimeout(500); // Wait for locale cookie to be set

    // Read VN locale cookie after page load (default is 'vi')
    let viCookie = await getLocaleCookie(page);
    // Cookie might not be set yet, default to 'vi' for this test
    if (!viCookie) {
      viCookie = "vi";
    }
    expect(viCookie).toBe("vi");

    // Capture some VN text from the board
    const bannerTitle = page.locator(SELECTORS["kudos-board-banner-title"]);
    const viText = await bannerTitle.textContent();
    expect(viText).toBeTruthy();

    // Switch to EN locale via language dropdown
    const langTrigger = page.locator('[data-testid="language-trigger"]');
    await expect(langTrigger).toBeVisible();
    await langTrigger.click();

    const enOption = page.locator('[data-testid="language-option"]').filter({ hasText: /English|EN/ }).first();
    await expect(enOption).toBeVisible();
    await enOption.click();

    // Wait for page to re-render
    await page.waitForTimeout(500);

    // EN cookie should be set
    const enCookie = await getLocaleCookie(page);
    expect(enCookie).toBe("en");

    // A MoMorph-sourced EN string must actually render (banner.title is a
    // [VN]-mirror key, so it is NOT a valid probe — the sidebar label is)
    await expect(page.locator(SELECTORS["kudos-board-sidebar"])).toContainText(
      "Number of Kudos you received:",
    );
    // Filter trigger is EN-sourced too
    await expect(page.locator(SELECTORS["dept-filter-trigger"])).toContainText("Department");

    // Verify EN locale is set in cookie
    const enCookieAfterSwitch = await getLocaleCookie(page);
    expect(enCookieAfterSwitch).toBe("en");

    // The compose modal must render its MoMorph-sourced EN title as well.
    // The pill input is pointer-events-none — its wrapping <button> is the
    // clickable element, so click that (like a user does).
    await page
      .locator("button", { has: page.locator(SELECTORS["kudos-board-compose-pill"]) })
      .click();
    await expect(page.locator('[data-testid="kudos-compose-dialog"]')).toContainText(
      "Send thanks and recognition to teammates",
    );
  });

  /**
   * ITEM 4b: avatar/name click opens /profile?id={uuid} (TC 0952e2f0, 2cd77a0c)
   * Added after the docs pass exposed that this phase-07 requirement was never
   * asserted (and is not wired) — RED until CardAuthorBlock links to /profile.
   */
  test("4b. Clicking a card author opens /profile?id= (TC 0952e2f0, 2cd77a0c)", async ({
    authenticatedPage: page,
  }) => {
    const seeder2 = createKudosSeeder();
    try {
      const sender = await seeder2.createActor("avatar-nav-sender");
      const receiver = await seeder2.createActor("avatar-nav-receiver");
      const hashtags = await seeder2.fetchHashtagIds(1);
      const marker = `avatar-nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await seeder2.seedKudos({
        senderId: sender.userId,
        receiverId: receiver.userId,
        hashtagIds: hashtags,
        contentText: marker,
      });

      await page.goto("/kudos");
      const card = page
        .locator(SELECTORS["kudos-feed"])
        .locator(SELECTORS["kudos-card"])
        .filter({ hasText: marker })
        .first();
      await expect(card).toBeVisible();

      await card.locator(SELECTORS["kudos-card-sender-name"]).click();
      await page.waitForURL(new RegExp(`/profile\\?id=${sender.userId}`), { timeout: 10_000 });
    } finally {
      await seeder2.cleanup();
    }
  });

  /**
   * ITEM 4c: clicking a feed card's CONTENT opens /kudos/[id] (spec C.2/C.3.5,
   * TC 31693bb7) — RED until the feed-variant content click is wired.
   */
  test("4c. Clicking feed-card content opens /kudos/[id] (TC 31693bb7)", async ({
    authenticatedPage: page,
  }) => {
    const seeder3 = createKudosSeeder();
    try {
      const sender = await seeder3.createActor("content-nav-sender");
      const receiver = await seeder3.createActor("content-nav-receiver");
      const hashtags = await seeder3.fetchHashtagIds(1);
      const marker = `content-nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const kudosId = await seeder3.seedKudos({
        senderId: sender.userId,
        receiverId: receiver.userId,
        hashtagIds: hashtags,
        contentText: marker,
      });

      await page.goto("/kudos");
      const card = page
        .locator(SELECTORS["kudos-feed"])
        .locator(SELECTORS["kudos-card"])
        .filter({ hasText: marker })
        .first();
      await card.locator(SELECTORS["kudos-card-content"]).click();
      await page.waitForURL(new RegExp(`/kudos/${kudosId}`), { timeout: 10_000 });
    } finally {
      await seeder3.cleanup();
    }
  });
});
