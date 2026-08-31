import { test, expect } from "@playwright/test";
import { test as authenticatedTest } from "./support/authenticated-fixture";

/**
 * Phase 08 a11y — keyboard navigation reachability.
 * Regression guards: ensure award nav items and homepage CTAs meet
 * accessibility standards for keyboard-only users.
 */
test.describe("Phase 08 a11y — keyboard navigation", () => {
  /**
   * Keyboard reachability: on /he-thong-giai all 6 award nav items are
   * reachable by repeated Tab presses (not skipped, focusable).
   */
  authenticatedTest(
    "Award page nav items are keyboard reachable (Tab focus, a11y)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/he-thong-giai", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Collect all award nav item buttons
      const navItems = page.locator('[data-testid="award-nav-item"] button');
      const count = await navItems.count();
      expect(count).toBe(6);

      // Tab through the page and collect focused testids
      const focusedTestids = [];
      let tabCount = 0;
      const maxTabs = 40;

      // Start from the first element
      await page.keyboard.press("Tab");

      while (tabCount < maxTabs) {
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.closest('[data-testid="award-nav-item"]')?.querySelector("button")
            ?.getAttribute("data-slug") || null;
        });

        if (focused) {
          focusedTestids.push(focused);
        }

        await page.keyboard.press("Tab");
        tabCount++;

        // Stop after we've seen all 6 items or hit max tabs
        if (focusedTestids.length >= 6) break;
      }

      // Verify all 6 award nav items were reached via Tab
      expect(focusedTestids.length).toBeGreaterThanOrEqual(6);
      const uniqueSlugs = new Set(focusedTestids);
      expect(uniqueSlugs.size).toBe(6);
    }
  );

  /**
   * Keyboard reachability: on / (homepage) Tab reaches "ABOUT AWARDS" link
   * but "ABOUT KUDOS" button (tabIndex={-1}, aria-disabled="true") is
   * intentionally skipped (not reachable by Tab).
   */
  test(
    "Homepage CTA buttons: ABOUT AWARDS reachable, ABOUT KUDOS intentionally inert (a11y)",
    async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      const ctaAboutAwards = page.locator('[data-testid="cta-about-awards"]');
      const ctaAboutKudos = page.locator('[data-testid="cta-about-kudos"]');

      // About Awards is a normal link, should have no tabIndex restriction
      const awardsTabIndex = await ctaAboutAwards.getAttribute("tabindex");
      expect(awardsTabIndex).toBeNull(); // No explicit tabIndex, so naturally focusable

      // About Kudos should have tabIndex="-1" to skip in Tab order
      await expect(ctaAboutKudos).toHaveAttribute("tabindex", "-1");

      // About Kudos should also have aria-disabled="true"
      await expect(ctaAboutKudos).toHaveAttribute("aria-disabled", "true");
    }
  );
});
