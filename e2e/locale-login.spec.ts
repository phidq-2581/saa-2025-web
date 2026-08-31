import { test, expect } from "@playwright/test";
import { getLocaleCookie } from "./support/integration-helpers";

/**
 * Phase 08b — Login language dropdown (e2e-red-first)
 * RED: LoginHeader doesn't pass onSelectLocale to LanguageDropdown (line 29).
 * Guest clicks EN on /login → NEXT_LOCALE cookie not set → footer stays VN after reload.
 * GREEN: LoginHeader passes setLocale server action → cookie set → footer respects locale.
 */
test.describe("Phase 08b — Login language dropdown", () => {
  test("language dropdown on /login sets NEXT_LOCALE and switches copy (TC W4)", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Guest, no cookies — navigate to /login
      await page.goto("/login", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Verify we start with VN (no locale cookie set)
      expect(await getLocaleCookie(page) ?? "vi").toBe("vi");

      // Footer should show VN text
      await expect(
        page.getByText(/^Bản quyền thuộc về Sun\* © 2025$/i)
      ).toBeVisible();

      // Open the language dropdown by clicking the trigger
      const langTrigger = page.locator('[data-testid="login-language-trigger"]');
      await expect(langTrigger).toBeVisible();

      // Click the trigger to open the dropdown menu
      await langTrigger.click();

      // Find the EN button in the language menu and click it
      // The language menu contains buttons with text EN and VN
      const langMenu = page.locator('[data-testid="language-menu"]');
      await expect(langMenu).toBeVisible();

      const enButton = langMenu.getByRole("button", { name: /^EN$/ });
      await expect(enButton).toBeVisible();
      await enButton.click();

      // Wait for the menu to close
      await expect(langMenu).not.toBeVisible();

      // Wait for the footer to switch to EN text — this indicates the
      // setLocale server action completed and revalidatePath finished
      await expect(
        page.getByText(/^Copyright © Sun\* 2025$/i)
      ).toBeVisible();

      // Now that the server action has completed, assert the cookie is set
      expect(await getLocaleCookie(page)).toBe("en");

      // VN text should NOT be visible after the action completes
      await expect(
        page.getByText(/^Bản quyền thuộc về Sun\* © 2025$/i)
      ).not.toBeVisible();

      // Reload the page to verify the locale persists
      await page.reload({ waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      // After reload, NEXT_LOCALE should still be "en"
      expect(await getLocaleCookie(page)).toBe("en");

      // Footer should still show EN text after reload
      await expect(
        page.getByText(/^Copyright © Sun\* 2025$/i)
      ).toBeVisible();

      // VN text should still NOT be visible
      await expect(
        page.getByText(/^Bản quyền thuộc về Sun\* © 2025$/i)
      ).not.toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("2. VN guard: no language interaction → NEXT_LOCALE stays unset → footer stays VN", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Guest, no cookies — navigate to /login
      await page.goto("/login", { waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      // No interaction with the dropdown
      // Verify no locale cookie is set
      expect(await getLocaleCookie(page) ?? "vi").toBe("vi");

      // Footer should show VN text
      await expect(
        page.getByText(/^Bản quyền thuộc về Sun\* © 2025$/i)
      ).toBeVisible();

      // Reload to confirm it persists
      await page.reload({ waitUntil: "networkidle" });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Still no locale cookie
      expect(await getLocaleCookie(page) ?? "vi").toBe("vi");

      // Footer still shows VN text
      await expect(
        page.getByText(/^Bản quyền thuộc về Sun\* © 2025$/i)
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
