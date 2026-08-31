import { test as authenticatedTest } from "./support/authenticated-fixture";
import { expect } from "@playwright/test";

/**
 * Phase 08 a11y — FAB (Floating Action Button) accessibility gaps.
 * RED assertions for aria-expanded, aria-controls, and localization.
 */
authenticatedTest.describe("Phase 08 a11y — FAB accessibility", () => {
  /**
   * FAB a11y: toggle button must have aria-expanded and aria-controls.
   * When closed: aria-expanded="false", no menu visible.
   * When open: aria-expanded="true", menu visible.
   * aria-controls must point to the id of [data-testid="fab-menu"].
   */
  authenticatedTest(
    "FAB toggle has aria-expanded and aria-controls (a11y BR-004)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      const fabToggle = page.locator('[data-testid="fab-toggle"]');
      const fabMenu = page.locator('[data-testid="fab-menu"]');

      // Initially closed: aria-expanded="false"
      await expect(fabToggle).toHaveAttribute("aria-expanded", "false");

      // Menu should not be visible
      await expect(fabMenu).not.toBeVisible();

      // aria-controls should reference fab-menu's id
      const ariaControls = await fabToggle.getAttribute("aria-controls");
      expect(ariaControls).toBeTruthy();
      const controlledElement = page.locator(`#${ariaControls}`);
      await expect(controlledElement).toHaveCount(1);

      // Click to open
      await fabToggle.click();

      // After open: aria-expanded="true"
      await expect(fabToggle).toHaveAttribute("aria-expanded", "true");

      // Menu should be visible
      await expect(fabMenu).toBeVisible();

      // Click cancel to close
      const cancelBtn = fabMenu.locator('text=Hủy').first();
      await cancelBtn.click();

      // After close: aria-expanded="false" again
      await expect(fabToggle).toHaveAttribute("aria-expanded", "false");
      await expect(fabMenu).not.toBeVisible();
    }
  );

  /**
   * FAB a11y: toggle button label must be localized.
   * VN: "Hành động nhanh" (currently hardcoded "Quick actions" → RED)
   */
  authenticatedTest(
    "FAB toggle has localized accessible name (a11y BR-004)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      const fabToggle = page.locator('[data-testid="fab-toggle"]');

      // VN: aria-label should be "Hành động nhanh"
      const ariaLabel = await fabToggle.getAttribute("aria-label");
      expect(ariaLabel).toBe("Hành động nhanh");
    }
  );

  /**
   * FAB a11y: expanded menu VN labels.
   * VN (default): "Thể lệ", "Viết KUDOS", "Hủy" from MoMorph design.
   * Toggle label: "Hành động nhanh" (VN-only, no EN source).
   */
  authenticatedTest(
    "FAB expanded menu VN: shows Thể lệ, Viết KUDOS, Hủy (a11y BR-004)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      const fabToggle = page.locator('[data-testid="fab-toggle"]');
      await fabToggle.click();

      const fabMenu = page.locator('[data-testid="fab-menu"]');

      // VN labels from MoMorph design
      await expect(fabMenu.locator('text=Thể lệ')).toBeVisible();
      await expect(fabMenu.locator('text=Viết KUDOS')).toBeVisible();
      await expect(fabMenu.locator('text=Hủy')).toBeVisible();

      // Toggle label must be "Hành động nhanh" (VN-only, no EN source)
      await expect(fabToggle).toHaveAttribute("aria-label", "Hành động nhanh");

      // Close for next test
      await fabMenu.locator('text=Hủy').first().click();
    }
  );

  /**
   * FAB a11y: expanded menu EN localization.
   * EN (NEXT_LOCALE=en cookie): "Rules", "Write KUDOS", "Cancel" from MoMorph EN.
   * Toggle label: still "Hành động nhanh" (no EN source, stays VN always).
   * CURRENTLY RED: menu labels are hardcoded Vietnamese in fab-widget.tsx.
   */
  authenticatedTest(
    "FAB expanded menu EN: shows Rules, Write KUDOS, Cancel with NEXT_LOCALE=en (RED a11y BR-004)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      // Set EN locale cookie and reload
      await page.context().addCookies([
        {
          name: "NEXT_LOCALE",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ]);

      await page.goto("/", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      const fabToggle = page.locator('[data-testid="fab-toggle"]');
      await fabToggle.click();

      const fabMenu = page.locator('[data-testid="fab-menu"]');

      // EN labels from MoMorph localization (CURRENTLY RED: hardcoded VN)
      await expect(fabMenu.locator('text=Rules')).toBeVisible();
      await expect(fabMenu.locator('text=Write KUDOS')).toBeVisible();
      await expect(fabMenu.locator('text=Cancel')).toBeVisible();

      // Toggle label stays "Hành động nhanh" (no EN source in MoMorph, VN only)
      await expect(fabToggle).toHaveAttribute("aria-label", "Hành động nhanh");
    }
  );
});
