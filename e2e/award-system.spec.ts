import { test, expect } from "./support/authenticated-fixture";
import { AWARD_DESIGN } from "./support/award-design";

test(
  "with a seeded session /he-thong-giai renders hero → section title → 6 cards → Kudos banner in order (TC ID-0, ID-3)",
  async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/he-thong-giai");

    const mainElement = authenticatedPage.locator("[data-testid=award-system-main]");
    await expect(mainElement).toBeVisible();

    const hero = authenticatedPage.locator("[data-testid=award-hero]");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText("ROOT FURTHER");
    await expect(hero).toContainText("Sun* Annual Award 2025");

    const sectionTitle = authenticatedPage.locator("[data-testid=award-section-title]");
    await expect(sectionTitle).toBeVisible();
    await expect(sectionTitle).toContainText("Sun* annual awards 2025");
    await expect(sectionTitle).toContainText("Hệ thống giải thưởng SAA 2025");

    const cards = authenticatedPage.locator("[data-testid=award-info-card]");
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
    }

    const kudosBanner = authenticatedPage.locator("[data-testid=award-kudos-banner]");
    await expect(kudosBanner).toBeVisible();
    await expect(kudosBanner).toContainText("Phong trào ghi nhận");
    await expect(kudosBanner).toContainText("Sun* Kudos");

    const heroBox = await hero.boundingBox();
    const titleBox = await sectionTitle.boundingBox();
    const firstCardBox = await cards.nth(0).boundingBox();
    const kudosBox = await kudosBanner.boundingBox();

    expect(heroBox?.y).toBeLessThan(titleBox?.y || Infinity);
    expect(titleBox?.y).toBeLessThan(firstCardBox?.y || Infinity);
    expect(firstCardBox?.y).toBeLessThan(kudosBox?.y || Infinity);
  }
);

test(
  "award-category-nav lists exactly 6 award-nav-item in order with names; award-info-card shows quantity and prize (TC ID-5, ID-6, ID-7)",
  async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/he-thong-giai");

    const nav = authenticatedPage.locator("[data-testid=award-category-nav]");
    await expect(nav).toBeVisible();

    const navItems = authenticatedPage.locator("[data-testid=award-nav-item]");
    await expect(navItems).toHaveCount(6);

    // Verify nav items: 6 items in order with names, slugs, and icons
    for (let i = 0; i < AWARD_DESIGN.length; i++) {
      const award = AWARD_DESIGN[i];
      const item = navItems.nth(i);

      await expect(item).toHaveAttribute("data-slug", award.slug);
      await expect(item).toContainText(award.name);

      // Each nav item carries an icon (24×24) per MCP node tree
      const img = item.locator("img");
      await expect(img).toHaveCount(1);
    }

    // Verify award cards: each card shows exact quantity/unit and prizes from Figma character fields
    for (let i = 0; i < AWARD_DESIGN.length; i++) {
      const award = AWARD_DESIGN[i];
      const card = authenticatedPage.locator(`[data-testid=award-info-card][data-slug="${award.slug}"]`);

      await expect(card).toBeVisible();

      // Assert labels
      await expect(card).toContainText("Số lượng giải thưởng:");
      await expect(card).toContainText("Giá trị giải thưởng:");

      // Assert exact quantity and unit text
      await expect(card).toContainText(award.quantity);
      await expect(card).toContainText(award.unit);

      // Assert all prize text portions
      for (const prizeText of award.prizes) {
        await expect(card).toContainText(prizeText);
      }
    }
  }
);

test(
  "clicking a menu item scrolls its section into view and marks only that item active (TC ID-9, ID-11, BR-001)",
  async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/he-thong-giai");

    const navItems = authenticatedPage.locator("[data-testid=award-nav-item]");

    await navItems.locator('[data-slug="best-manager"]').click();
    await authenticatedPage.waitForTimeout(500);

    const bestManagerSection = authenticatedPage.locator('section#best-manager');
    await expect(bestManagerSection).toBeInViewport();

    const bestManagerNavItem = navItems.locator('[data-slug="best-manager"]');
    await expect(bestManagerNavItem).toHaveAttribute("aria-current", "true");

    const ariaCurrentItems = navItems.filter({ has: authenticatedPage.locator('[aria-current="true"]') });
    await expect(ariaCurrentItems).toHaveCount(1);

    await navItems.locator('[data-slug="mvp"]').click();
    await authenticatedPage.waitForTimeout(500);

    const mvpSection = authenticatedPage.locator('section#mvp');
    await expect(mvpSection).toBeInViewport();

    const mvpNavItem = navItems.locator('[data-slug="mvp"]');
    await expect(mvpNavItem).toHaveAttribute("aria-current", "true");

    await expect(bestManagerNavItem).not.toHaveAttribute("aria-current", "true");

    const ariaCurrentItems2 = navItems.filter({ has: authenticatedPage.locator('[aria-current="true"]') });
    await expect(ariaCurrentItems2).toHaveCount(1);
  }
);

test(
  "loading /he-thong-giai#mvp opens already scrolled to MVP section with nav item active (BR-002)",
  async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/he-thong-giai#mvp");

    const mvpSection = authenticatedPage.locator('section#mvp');
    await expect(mvpSection).toBeInViewport();

    const mvpNavItem = authenticatedPage.locator("[data-testid=award-nav-item]").locator('[data-slug="mvp"]');
    await expect(mvpNavItem).toHaveAttribute("aria-current", "true");
  }
);

test(
  "loading /he-thong-giai#does-not-exist produces no error, stays at top, activates nothing (TC ID-13, BR-003)",
  async ({ authenticatedPage }) => {
    const errorMessages: string[] = [];
    authenticatedPage.on("console", (msg) => {
      if (msg.type() === "error") {
        errorMessages.push(msg.text());
      }
    });

    await authenticatedPage.goto("/he-thong-giai#does-not-exist");

    expect(errorMessages).toHaveLength(0);

    expect(await authenticatedPage.evaluate(() => window.scrollY)).toBe(0);

    const navItems = authenticatedPage.locator("[data-testid=award-nav-item]");
    const ariaCurrentItems = navItems.filter({ has: authenticatedPage.locator('[aria-current="true"]') });
    await expect(ariaCurrentItems).toHaveCount(0);

    const kudosDetail = authenticatedPage.locator("[data-testid=award-kudos-detail]");
    const kudosLink = kudosDetail.locator("a");
    const linkCount = await kudosLink.count();
    if (linkCount > 0) {
      const href = await kudosLink.getAttribute("href");
      expect(href).toBeFalsy();
    }
  }
);
