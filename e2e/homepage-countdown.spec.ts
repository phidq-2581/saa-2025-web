import { test, expect } from "@playwright/test";
import { isEventPast } from "./support/integration-helpers";

test.describe("Homepage Countdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  /**
   * BR-003, BR-005: countdown tiles display two-digit placeholder values with labels.
   * Server renders 00/00/00 placeholder; client updates after mount.
   */
  test("countdown tiles display two-digit placeholder values with labels (TC ID-12, ID-40, BR-005)", async ({
    page,
  }) => {
    const daysBlock = page.locator('[data-testid="countdown-days"]');
    const hoursBlock = page.locator('[data-testid="countdown-hours"]');
    const minutesBlock = page.locator('[data-testid="countdown-minutes"]');

    await expect(daysBlock).toBeVisible();
    await expect(hoursBlock).toBeVisible();
    await expect(minutesBlock).toBeVisible();

    await expect(daysBlock).toContainText("00");
    await expect(daysBlock).toContainText("DAYS");

    await expect(hoursBlock).toContainText("00");
    await expect(hoursBlock).toContainText("HOURS");

    await expect(minutesBlock).toContainText("00");
    await expect(minutesBlock).toContainText("MINUTES");
  });

  /**
   * BR-003, BR-005: coming-soon label visibility env-aware.
   * Reads NEXT_PUBLIC_EVENT_START_AT; if past: label hidden after mount, tiles 00.
   * If future: label visible, ≥1 tile non-00.
   */
  test("coming-soon label visibility env-aware: hidden when event reached, visible when future (TC ID-43, BR-003, BR-005)", async ({
    page,
  }) => {
    const comingSoonLabel = page.locator('[data-testid="coming-soon-label"]');
    const daysBlock = page.locator('[data-testid="countdown-days"]');
    const hoursBlock = page.locator('[data-testid="countdown-hours"]');
    const minutesBlock = page.locator('[data-testid="countdown-minutes"]');

    const eventStartAt = process.env.NEXT_PUBLIC_EVENT_START_AT;
    const isPast = isEventPast(eventStartAt || "");

    if (isPast) {
      await expect(comingSoonLabel).toBeHidden({ timeout: 5000 });
      await expect(daysBlock).toContainText("00");
      await expect(hoursBlock).toContainText("00");
      await expect(minutesBlock).toContainText("00");
    } else {
      await expect(comingSoonLabel).toBeVisible();
      await expect(comingSoonLabel).toHaveText("Coming soon");

      const daysText = await daysBlock.textContent();
      const hoursText = await hoursBlock.textContent();
      const minutesText = await minutesBlock.textContent();
      const hasNonZero =
        !daysText?.includes("00") ||
        !hoursText?.includes("00") ||
        !minutesText?.includes("00");
      expect(hasNonZero).toBeTruthy();
    }
  });

  /**
   * BR-005 a11y: countdown region must have aria-live="polite" to announce
   * changes as the countdown ticks (live region).
   */
  test("countdown region has aria-live polite for screen reader announcement (BR-005 a11y)", async ({
    page,
  }) => {
    const heroSection = page.locator('[data-testid="hero-section"]');
    // The countdown tiles container should have aria-live="polite"
    const countdownContainer = heroSection.locator(".flex.flex-wrap.items-center.gap-10");

    // Assert that aria-live is present and set to "polite"
    await expect(countdownContainer).toHaveAttribute("aria-live", "polite");
  });
});
