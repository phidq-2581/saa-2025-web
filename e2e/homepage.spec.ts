import { test, expect } from "@playwright/test";

/**
 * Phase 05 — Homepage SAA (`/`) RED test
 * Durable screen-level E2E test covering 5 assertion groups from the design spec.
 * Test cases: ID-12, ID-40, ID-43, ID-14, ID-44, ID-45, ID-47, ID-48, ID-49, ID-50, ID-52, ID-53.
 * Runs against the server placeholder state (countdown 00/00/00, reached=false).
 *
 * Data-testid contract for UI agent:
 * - hero-section, countdown-days, countdown-hours, countdown-minutes
 * - coming-soon-label
 * - event-info
 * - cta-about-awards, cta-about-kudos
 * - root-further-block
 * - award-grid, award-card (with data-slug="<slug>")
 * - kudos-promo, kudos-promo-detail
 */

test.describe("Homepage SAA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("countdown tiles display two-digit placeholder values with labels (TC ID-12, ID-40, BR-005)", async ({
    page,
  }) => {
    const daysBlock = page.locator('[data-testid="countdown-days"]');
    const hoursBlock = page.locator('[data-testid="countdown-hours"]');
    const minutesBlock = page.locator('[data-testid="countdown-minutes"]');

    await expect(daysBlock).toBeVisible();
    await expect(hoursBlock).toBeVisible();
    await expect(minutesBlock).toBeVisible();

    // Each tile shows two digits (00 placeholder) with label
    await expect(daysBlock).toContainText("00");
    await expect(daysBlock).toContainText("DAYS");

    await expect(hoursBlock).toContainText("00");
    await expect(hoursBlock).toContainText("HOURS");

    await expect(minutesBlock).toContainText("00");
    await expect(minutesBlock).toContainText("MINUTES");
  });

  test("coming-soon label is visible when event not reached (TC ID-43)", async ({
    page,
  }) => {
    const comingSoonLabel = page.locator('[data-testid="coming-soon-label"]');
    await expect(comingSoonLabel).toBeVisible();
    await expect(comingSoonLabel).toHaveText("Coming soon");
  });

  test("hero shows ROOT FURTHER, event info, and CTAs (TC ID-14, ID-44, US002, BR-008)", async ({
    page,
  }) => {
    // Hero section with title
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();
    await expect(heroSection).toContainText("ROOT FURTHER");

    // Event info block
    const eventInfo = page.locator('[data-testid="event-info"]');
    await expect(eventInfo).toBeVisible();
    await expect(eventInfo).toContainText("18h30");
    await expect(eventInfo).toContainText("Nhà hát nghệ thuật quân đội");
    await expect(eventInfo).toContainText(
      "Tường thuật trực tiếp tại Group Facebook Sun* Family"
    );

    // ABOUT AWARDS CTA with href
    const ctaAboutAwards = page.locator('[data-testid="cta-about-awards"]');
    await expect(ctaAboutAwards).toBeVisible();
    await expect(ctaAboutAwards).toHaveText("ABOUT AWARDS");
    await expect(ctaAboutAwards).toHaveAttribute("href", "/he-thong-giai");

    // ABOUT KUDOS CTA without href (deferred, inert button)
    const ctaAboutKudos = page.locator('[data-testid="cta-about-kudos"]');
    await expect(ctaAboutKudos).toBeVisible();
    await expect(ctaAboutKudos).toHaveText("ABOUT KUDOS");
    await expect(ctaAboutKudos).not.toHaveAttribute("href");
    await expect(ctaAboutKudos).toHaveAttribute("aria-disabled", "true");
    await expect(ctaAboutKudos).toHaveAttribute("tabindex", "-1");
  });

  test("award grid displays six cards in fixed order with hashtag links (TC ID-15, ID-47, ID-48, ID-49, ID-50, ID-52, BR-006)", async ({
    page,
  }) => {
    const awardGrid = page.locator('[data-testid="award-grid"]');
    await expect(awardGrid).toBeVisible();

    const awardCards = page.locator('[data-testid="award-card"]');
    await expect(awardCards).toHaveCount(6);

    const expectedOrder = [
      { name: "Top Talent", slug: "top-talent" },
      { name: "Top Project", slug: "top-project" },
      { name: "Top Project Leader", slug: "top-project-leader" },
      { name: "Best Manager", slug: "best-manager" },
      { name: "Signature 2025 - Creator", slug: "signature-2025-creator" },
      { name: /MVP/, slug: "mvp" }, // MVP may render as MVP (Most Valuable Person)
    ];

    for (let i = 0; i < expectedOrder.length; i++) {
      const card = awardCards.nth(i);
      const { name, slug } = expectedOrder[i];

      // Verify card slug
      await expect(card).toHaveAttribute("data-slug", slug);

      // Card contains title (text or link)
      if (typeof name === "string") {
        await expect(card).toContainText(name);
      } else {
        await expect(card).toContainText(name);
      }

      // Thumbnail link carries href with hashtag
      const thumbnailLink = card.locator("a[href*='he-thong-giai#']").first();
      if (await thumbnailLink.count() > 0) {
        const href = await thumbnailLink.getAttribute("href");
        expect(href).toContain(`/he-thong-giai#${slug}`);
      }

      // Title link carries href with hashtag
      const titleLink = card.locator(`a[href="/he-thong-giai#${slug}"]`);
      await expect(titleLink).toHaveCount(1);

      // Chi tiết link carries href with hashtag
      const detailLink = card.locator(
        `a[href="/he-thong-giai#${slug}"]:has-text("Chi tiết")`
      );
      await expect(detailLink).toHaveCount(1);
    }
  });

  test("kudos promo renders label, title, description, image, and detail button (TC ID-53, BR-008, US005 AS2)", async ({
    page,
  }) => {
    const kudosPromo = page.locator('[data-testid="kudos-promo"]');
    await expect(kudosPromo).toBeVisible();

    // Label and title
    await expect(kudosPromo).toContainText("Phong trào ghi nhận");
    await expect(kudosPromo).toContainText("Sun* Kudos");

    // Description paragraph exists
    const description = kudosPromo.locator("p").first();
    await expect(description).toBeVisible();

    // Image exists
    const image = kudosPromo.locator("img").first();
    await expect(image).toBeVisible();

    // Detail button with no href (inert, deferred button)
    const detailButton = page.locator('[data-testid="kudos-promo-detail"]');
    await expect(detailButton).toBeVisible();
    await expect(detailButton).toContainText("Chi tiết");
    await expect(detailButton).not.toHaveAttribute("href");
    await expect(detailButton).toHaveAttribute("aria-disabled", "true");
    await expect(detailButton).toHaveAttribute("tabindex", "-1");

    // Clicking detail button does not navigate (use force: true to bypass aria-disabled check)
    const currentUrl = page.url();
    await detailButton.click({ force: true });
    expect(page.url()).toBe(currentUrl);
  });

  test("root-further block contains proverb quote (Spec B4)", async ({
    page,
  }) => {
    const rootFurtherBlock = page.locator('[data-testid="root-further-block"]');
    await expect(rootFurtherBlock).toBeVisible();
    await expect(rootFurtherBlock).toContainText(
      "A tree with deep roots fears no storm"
    );
  });
});
