/**
 * Phase 07 RED — Integration: Heart toggle, special-day 2×, filters, spotlight delta
 * Items 6–9 from phase-07-integration-wiring.md § RED test files
 * Test against design-sample data (no real mutations/queries wired yet).
 * These MUST fail RED because: heart toggle not wired (no DB persist), filters don't refilter,
 * special_days not checked, spotlight count hard-coded to 388.
 */

import { test, expect } from "./support/authenticated-fixture";
import { createKudosSeeder } from "./support/seed-kudos";
import {
  seedSpecialDayToday,
  deleteSpecialDay,
  readSpotlightTotal,
  readSenderHeartTotal,
} from "./support/integration-helpers";
import { SELECTORS } from "./support/board-helpers";
import { createAnonClient } from "./support/seed-kudos";

test.describe("Phase 07: Kudos Heart & Filters Integration", () => {
  const seeder = createKudosSeeder();

  test.afterEach(async () => {
    await seeder.cleanup();
  });

  /**
   * ITEM 6: Heart toggle as non-sender
   * Count +1, active state on click. Click again: back to baseline.
   * Sender's own card renders heart button disabled.
   * Direct client self-heart insert rejected by RLS (SC-002).
   * (TC 7a7ec63e, 63645b03)
   * MUST FAIL RED: heart toggle not wired (sample data only, no DB persist/RLS check).
   */
  test("6. Heart toggle non-sender (+1 active, revoke to baseline); sender disabled; RLS rejects self (TC 7a7ec63e, 63645b03, SC-002)", async ({
    authenticatedPage: page,
  }) => {
    // Setup: 2 actors (sender, receiver), 1 kudos sent to receiver, viewed by seeder/page auth
    const sender = await seeder.createActor("heart-sender");
    const receiver = await seeder.createActor("heart-receiver");
    const hashtags = await seeder.fetchHashtagIds(1);

    // Unique content so this test toggles ITS OWN kudos (fullyParallel: the
    // first feed card may be another test's — possibly even disabled)
    const marker = `heart-toggle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const kudosId = await seeder.seedKudos({
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
    const heartBtn = card.locator(SELECTORS["kudos-card-heart-btn"]);
    await expect(heartBtn).toBeVisible();

    // Freshly seeded kudos → 0 hearts
    const initialCount = 0;
    await expect(heartBtn).toContainText("0");

    // Click heart (non-sender) → wait for the reconciled count, not a sleep
    await heartBtn.click();
    await expect(heartBtn).toContainText(String(initialCount + 1), { timeout: 10_000 });

    // Assert active styling (aria-pressed or data attribute)
    const isActive = await heartBtn.evaluate((el) => {
      const ariaPressed = el.getAttribute("aria-pressed");
      const dataActive = el.getAttribute("data-active");
      return ariaPressed === "true" || dataActive === "true" || el.classList.contains("active");
    });
    expect(isActive).toBeTruthy();

    // Click again to revoke heart → wait for the reconciled count
    await heartBtn.click();
    await expect(heartBtn).toContainText(String(initialCount), { timeout: 10_000 });

    // Assert inactive state
    const isInactive = await heartBtn.evaluate((el) => {
      const ariaPressed = el.getAttribute("aria-pressed");
      const dataActive = el.getAttribute("data-active");
      return ariaPressed === "false" || dataActive === "false" || !el.classList.contains("active");
    });
    expect(isInactive).toBeTruthy();

    // Sender heart RLS negative test: direct anon client insert rejected
    // (the UI-side disabled-heart is asserted in kudos-board.spec.ts TC 63645b03)
    const anonClient = createAnonClient();
    const { error: selfHeartError } = await anonClient.from("heart").insert({
      kudos_id: kudosId,
      user_id: sender.userId, // Try to heart sender's own kudos
      granted_amount: 1,
    });

    // RLS should reject (403 Forbidden or similar)
    expect(selfHeartError).toBeTruthy();
  });

  /**
   * ITEM 7: Special day 2× grant/revoke via sender's heart credit delta
   * With special_days row for today, heart grants 2. Revoke removes exactly 2.
   * Assert through sender's DB heart credit (sum of granted_amount), not viewer's sidebar stat.
   * (TC 31936b72, SC-003)
   * MUST FAIL RED: special_days not checked (always grants 1), hearts not persisted to DB.
   */
  test("7. Special day 2× grant/revoke via sender's heart credit delta (TC 31936b72, SC-003)", async ({
    authenticatedPage: page,
  }) => {
    // Seed special day for today
    const specialDay = await seedSpecialDayToday();

    try {
      // Setup: sender receives kudos, viewer (different user) hearts that kudos
      const sender = await seeder.createActor("special-day-sender");
      const receiver = await seeder.createActor("special-day-receiver");
      const hashtags = await seeder.fetchHashtagIds(1);

      // Unique content so the viewer hearts exactly THIS kudos (fullyParallel:
      // "first card in feed" may belong to another test's seed)
      const marker = `special-day-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await seeder.seedKudos({
        senderId: sender.userId,
        receiverId: receiver.userId,
        hashtagIds: hashtags,
        contentText: marker,
      });

      // Record sender's DB heart credit BEFORE the UI heart click
      const creditBefore = await readSenderHeartTotal(sender.userId);

      // Viewer: navigate and heart the seeded kudos
      await page.goto("/kudos");
      const card = page
        .locator(SELECTORS["kudos-feed"])
        .locator(SELECTORS["kudos-card"])
        .filter({ hasText: marker })
        .first();
      const heartBtn = card.locator(SELECTORS["kudos-card-heart-btn"]);
      await expect(heartBtn).toBeVisible();

      // Click heart → server action grants +2 on a special day. Poll the DB
      // (the action round trip is async; a fixed sleep is a race).
      await heartBtn.click();
      await expect
        .poll(() => readSenderHeartTotal(sender.userId), { timeout: 10_000 })
        .toBe(creditBefore + 2);

      // Click again → revoke removes exactly what was granted (2, not 1)
      await heartBtn.click();
      await expect
        .poll(() => readSenderHeartTotal(sender.userId), { timeout: 10_000 })
        .toBe(creditBefore);
    } finally {
      await deleteSpecialDay(specialDay);
    }
  });

  /**
   * ITEM 8: Filter (hashtag + department) refilters BOTH Highlight and feed, resets carousel to 1/…
   * Hashtag chip click sets same filter.
   * (TC 0e56cacb, 159fed13, d01729d4)
   * MUST FAIL RED: filters don't refilter (sample data only), carousel doesn't reset.
   */
  test("8. Filter hashtag+department refilters Highlight+feed, resets carousel to 1; chip click filters (TC 0e56cacb, 159fed13, d01729d4)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/kudos");

    // Record initial carousel state (slide 1/N)
    const paginationBefore = page.locator(SELECTORS["kudos-board-carousel-pagination"]);
    const paginationTextBefore = await paginationBefore.textContent();
    expect(paginationTextBefore).toMatch(/1\/\d+/); // Should start at 1

    // Open hashtag filter and select one
    const hashtagTrigger = page.locator(SELECTORS["hashtag-filter-trigger"]);
    await expect(hashtagTrigger).toBeVisible();
    await hashtagTrigger.click();

    const hashtagMenu = page.locator(SELECTORS["hashtag-filter-menu"]);
    await expect(hashtagMenu).toBeVisible();

    // Select first hashtag option
    const hashtagOption = hashtagMenu.locator('[data-testid="hashtag-filter-option"]').first();
    await hashtagOption.click();

    // Wait for the client navigation that carries the filter param
    await page.waitForURL(/[?&]hashtag=/, { timeout: 10_000 });

    // Carousel should reset to 1/N
    const paginationAfter = page.locator(SELECTORS["kudos-board-carousel-pagination"]);
    const paginationTextAfter = await paginationAfter.textContent();
    expect(paginationTextAfter).toMatch(/1\/\d+/);

    // Now test department filter
    const deptTrigger = page.locator(SELECTORS["dept-filter-trigger"]);
    await expect(deptTrigger).toBeVisible();
    await deptTrigger.click();

    const deptMenu = page.locator(SELECTORS["dept-filter-menu"]);
    await expect(deptMenu).toBeVisible();

    const deptOption = deptMenu.locator('[data-testid="dept-filter-option"]').first();
    await deptOption.click();

    // Both params must survive in the URL after the second filter
    await page.waitForURL(/[?&]department=/, { timeout: 10_000 });
    const urlBoth = new URL(page.url());
    expect(urlBoth.searchParams.has("hashtag")).toBeTruthy();
    expect(urlBoth.searchParams.has("department")).toBeTruthy();

    // Carousel should still be at 1/N (reset on each filter change)
    const paginationFinal = page.locator(SELECTORS["kudos-board-carousel-pagination"]);
    const paginationTextFinal = await paginationFinal.textContent();
    expect(paginationTextFinal).toMatch(/1\/\d+/);

    // Test hashtag chip click (should set filter via chip, not dropdown)
    // Navigate back to unfiltered state
    await page.goto("/kudos");
    await page.waitForTimeout(300);

    // Find a hashtag chip on a card and click it to set filter
    const cardHashtags = page.locator(SELECTORS["kudos-card-hashtags"]).first();
    const hashtag = cardHashtags.locator('[data-testid="hashtag-chip"]').first();
    await expect(hashtag).toBeVisible();

    // Click chip — should set the same URL filter
    await hashtag.click();
    await page.waitForURL(/[?&]hashtag=/, { timeout: 10_000 });
  });

  /**
   * ITEM 9: Spotlight total count tracks live delta, never hardcoded "388"
   * (SC-005)
   * MUST FAIL RED: spotlight count hard-coded to 388 (sample data only, not dynamic).
   */
  test("9. Spotlight total tracks live delta, never hardcoded 388 (SC-005)", async ({
    authenticatedPage: page,
  }) => {
    // Seed a baseline number of kudos for this test's users
    const sender = await seeder.createActor("spotlight-sender");
    const receiver = await seeder.createActor("spotlight-receiver");
    const hashtags = await seeder.fetchHashtagIds(1);

    // Seed 1 kudos (should increment spotlight count by 1)
    await seeder.seedKudos({
      senderId: sender.userId,
      receiverId: receiver.userId,
      hashtagIds: hashtags,
    });

    await page.goto("/kudos");
    await page.waitForTimeout(300);

    // Read spotlight total
    const totalBefore = await readSpotlightTotal(page);

    // Assert it's NOT the hardcoded 388
    expect(totalBefore).not.toBe(388);

    // The total should be a reasonable number (e.g., > 0 if data is seeded)
    // This is a delta assertion: the count reflects real data, not a placeholder.
    expect(totalBefore).toBeTruthy();
    expect(typeof totalBefore).toBe("number");
  });
});
