import { expect, test } from "@playwright/test";

test.describe("Home page (smoke)", () => {
  test("loads and renders main content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
