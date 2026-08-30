import { test, expect } from "./support/authenticated-fixture";
import { openAccountMenu } from "./support/integration-helpers";

/**
 * Phase 07 — Integration wiring — session, header, menus, logout, OAuth
 * Tests 1–3, 5 from integration criteria (RED before, GREEN after).
 */

test.describe("Phase 07 Integration Flows", () => {
  /**
   * TC ID-6, SC-1: Seeded member session → header shows variant=authed with avatar or
   * initials placeholder (A4), bell visible with NO badge (unreadCount=0), account menu
   * lists exactly Profile and Logout, neither navigates.
   */
  test("1. Seeded member: header authed variant, avatar/initials, bell no badge, account menu Profile+Logout inert (TC ID-6, A4, SC-1)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 720 });

    const header = page.locator('[data-testid="site-header"]');
    await expect(header).toBeVisible();

    const bell = page.locator('[data-testid="notification-bell"]');
    await expect(bell).toBeVisible();
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).not.toBeVisible();

    const accountTrigger = page.locator('[data-testid="account-trigger"]');
    await expect(accountTrigger).toBeVisible();
    const avatarImg = accountTrigger.locator("img");
    const avatarInitials = accountTrigger.locator("span");
    const hasAvatar = await avatarImg.count();
    const hasInitials = await avatarInitials.count();
    expect(hasAvatar + hasInitials).toBeGreaterThan(0);

    const { accountMenu } = await openAccountMenu(page);
    await expect(accountMenu).toBeVisible();
    const menuItems = accountMenu.locator("button");
    await expect(menuItems).toHaveCount(2);
    await expect(menuItems.nth(0)).toHaveText("Profile");
    await expect(menuItems.nth(1)).toHaveText("Logout");

    const initialUrl = page.url();
    await menuItems.nth(0).click();
    await page.waitForTimeout(300);
    expect(page.url()).toBe(initialUrl);
  });

  /**
   * TC ID-5, DISC-001, SC-2: Seeded admin session → same as member +
   * Dashboard menu item renders and does not navigate.
   */
  test("2. Seeded admin: account menu Profile+Dashboard+Logout, Dashboard inert (TC ID-5, DISC-001)", async ({
    adminPage: page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 720 });

    const header = page.locator('[data-testid="site-header"]');
    await expect(header).toBeVisible();

    const bell = page.locator('[data-testid="notification-bell"]');
    await expect(bell).toBeVisible();
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).not.toBeVisible();

    const { accountMenu } = await openAccountMenu(page);
    await expect(accountMenu).toBeVisible();
    const menuItems = accountMenu.locator("button");
    await expect(menuItems).toHaveCount(3);
    await expect(menuItems.nth(0)).toHaveText("Profile");
    await expect(menuItems.nth(1)).toHaveText("Dashboard");
    await expect(menuItems.nth(2)).toHaveText("Logout");

    const initialUrl = page.url();
    await menuItems.nth(1).click();
    await page.waitForTimeout(300);
    expect(page.url()).toBe(initialUrl);
  });

  /**
   * BR-002, SC-002: Logout clears sb-* cookies and ends on /.
   */
  test("3. Logout clears session cookies and lands on / (BR-002, SC-002)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const cookiesBefore = await page.context().cookies();
    const sbCookieBefore = cookiesBefore.find((c) => c.name.startsWith("sb-"));
    expect(sbCookieBefore).toBeDefined();

    const { accountMenu } = await openAccountMenu(page);
    await expect(accountMenu).toBeVisible();
    const logoutButton = accountMenu.locator("button").last();
    await logoutButton.click();

    await page.waitForURL("/", { timeout: 5000 });

    const cookiesAfter = await page.context().cookies();
    const sbCookieAfter = cookiesAfter.find((c) => c.name.startsWith("sb-"));
    expect(sbCookieAfter).toBeUndefined();

    expect(page.url()).toMatch(/\/$/);
  });

  /**
   * Q4 research, SC-1: On /login, clicking Google Sign-In button navigates to
   * Google accounts or local GoTrue authorize endpoint. Asserts OAuth flow reaches
   * redirect_to callback (no external network required).
   */
  test("5. Google sign-in button reaches Google/GoTrue authorize URL (SC-1)", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to login page
      await page.goto("/login", { waitUntil: "networkidle" });

      // Locate the Google sign-in button (form submit button with text containing "Google")
      const googleButton = page.locator('button[type="submit"]').filter({
        hasText: /Google|LOGIN/i,
      }).first();
      await expect(googleButton).toBeVisible();

      // Wait for navigation to Google or GoTrue authorize URL, then click
      const navigationPromise = page.waitForURL(
        (url) =>
          url.hostname === "accounts.google.com" ||
          url.href.startsWith("http://127.0.0.1:54321/auth/v1/authorize"),
        { timeout: 15000 }
      );

      await googleButton.click();
      await navigationPromise;

      // Verify we reached an OAuth endpoint
      const finalUrl = page.url();
      const isGoogle = finalUrl.includes("accounts.google.com");
      const isGoTrue = finalUrl.includes("127.0.0.1:54321/auth/v1/authorize");

      expect(isGoogle || isGoTrue).toBeTruthy();

      // If GoTrue endpoint, assert provider=google and redirect_to parameters
      if (isGoTrue) {
        const url = new URL(finalUrl);
        expect(url.searchParams.get("provider")).toBe("google");
        const redirectTo = url.searchParams.get("redirect_to");
        expect(redirectTo).toContain("http://localhost:3000/auth/callback");
      }
    } finally {
      await context.close();
    }
  });
});
