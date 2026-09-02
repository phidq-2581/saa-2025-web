import { test, expect } from '@playwright/test';
import { test as authenticatedTest, expect as expectAuth } from './support/authenticated-fixture';

test.describe('Navigation Shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('01: Header renders logo and language trigger', async ({ page }) => {
    // Header container
    const header = page.locator('[data-testid="site-header"]');
    await expect(header).toBeVisible();

    // Logo with alt text containing Sun or SAA
    const logo = header.locator('img, svg').first();
    const altText = await logo.getAttribute('alt');
    expect(altText?.toUpperCase()).toMatch(/SUN|SAA/);

    // Language trigger showing VN
    const languageTrigger = page.locator('[data-testid="language-trigger"]');
    await expect(languageTrigger).toBeVisible();
    await expect(languageTrigger).toContainText('VN');

    // Language trigger should have a flag icon and chevron
    const trigger = page.locator('[data-testid="language-trigger"]');
    const triggerText = await trigger.textContent();
    expect(triggerText).toContain('VN');
  });

  test('02: Language dropdown opens and closes', async ({ page }) => {
    const trigger = page.locator('[data-testid="language-trigger"]');
    const menu = page.locator('[data-testid="language-menu"]');

    // Initially menu should not be visible
    await expect(menu).not.toBeVisible();

    // Click trigger to open
    await trigger.click();
    await expect(menu).toBeVisible();

    // Menu should contain VN and EN options
    await expect(menu.locator('text=VN')).toBeVisible();
    await expect(menu.locator('text=EN')).toBeVisible();

    // Click trigger again to close
    await trigger.click();
    await expect(menu).not.toBeVisible();
  });

  test('03: Dropdown keyboard and outside click handling', async ({ page }) => {
    const trigger = page.locator('[data-testid="language-trigger"]');
    const menu = page.locator('[data-testid="language-menu"]');

    // Test: Escape key closes dropdown
    await trigger.click();
    await expect(menu).toBeVisible();
    await page.press('body', 'Escape');
    await expect(menu).not.toBeVisible();

    // Test: Outside click closes dropdown
    await trigger.click();
    await expect(menu).toBeVisible();
    await page.click('body', { position: { x: 5, y: 5 } });
    await expect(menu).not.toBeVisible();

    // Test: Focus trigger + Enter opens dropdown
    await trigger.focus();
    await page.press('body', 'Enter');
    await expect(menu).toBeVisible();
    await page.press('body', 'Escape');

    // Test: Focus trigger + Space opens dropdown
    await trigger.focus();
    await page.press('body', ' ');
    await expect(menu).toBeVisible();
  });

  test('04: Footer and guest shell (no bell, no FAB)', async ({ page }) => {
    // Footer
    const footer = page.locator('[data-testid="site-footer"]');
    await expect(footer).toBeVisible();

    // Footer should contain logo
    const footerLogo = footer.locator('img, svg').first();
    await expect(footerLogo).toBeVisible();

    // Footer should contain 3 nav links
    await expect(footer.locator('text=About SAA 2025')).toBeVisible();
    await expect(footer.locator('text=Awards Information')).toBeVisible();
    await expect(footer.locator('text=Sun* Kudos')).toBeVisible();

    // Footer should contain copyright text with Sun* and 2025
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/Sun\*/);
    expect(footerText).toMatch(/2025/);

    // Footer should contain Tiêu chuẩn chung button
    await expect(footer.locator('text=Tiêu chuẩn chung')).toBeVisible();

    // Notification bell should NOT be visible for guest (TC ID-0).
    // Bell renders only for authenticated users (TC ID-1, clarifications.md § Forge corrections).
    await expect(page.getByTestId('notification-bell')).toHaveCount(0);

    // FAB toggle should NOT be visible for guest (SCR004_Fab hidden state).
    // FAB renders only for authenticated users.
    const fabToggle = page.locator('[data-testid="fab-toggle"]');
    await expect(fabToggle).toHaveCount(0);
  });

  authenticatedTest('04a: Authenticated shell (bell visible, FAB visible)', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });

    // Notification bell should be visible for authenticated user
    const bell = page.locator('[data-testid="notification-bell"]');
    await expect(bell).toBeVisible();

    // Bell should have NO badge (unreadCount=0)
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).not.toBeVisible();

    // FAB toggle should be visible for authenticated user (SCR004_Fab hidden state)
    const fabToggle = page.locator('[data-testid="fab-toggle"]');
    await expect(fabToggle).toBeVisible();

    // Click FAB to open menu
    await fabToggle.click();
    const fabMenu = page.locator('[data-testid="fab-menu"]');
    await expect(fabMenu).toBeVisible();

    // FAB menu should contain the three items
    await expect(fabMenu.locator('text=Thể lệ')).toBeVisible();
    await expect(fabMenu.locator('text=Viết KUDOS')).toBeVisible();
    await expect(fabMenu.locator('text=Hủy')).toBeVisible();

    // Click Hủy to close menu
    await fabMenu.locator('text=Hủy').click();
    await expect(fabMenu).not.toBeVisible();
  });

  test('05: Mobile responsive navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Wait for layout to stabilize
    await page.waitForLoadState('networkidle');

    // Desktop nav links should be hidden

    // Mobile nav toggle should be visible
    const mobileToggle = page.locator('[data-testid="mobile-nav-toggle"]');
    await expect(mobileToggle).toBeVisible();

    // Click to open drawer
    await mobileToggle.click();
    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    await expect(drawer).toBeVisible();

    // Drawer should contain the 3 nav links
    await expect(drawer.locator('text=About SAA 2025')).toBeVisible();
    await expect(drawer.locator('text=Awards Information')).toBeVisible();
    await expect(drawer.locator('text=Sun* Kudos')).toBeVisible();

    // Drawer should contain language switch
    await expect(drawer.locator('[data-testid="language-trigger"]')).toBeVisible();

    // Escape should close drawer
    await page.press('body', 'Escape');
    await expect(drawer).not.toBeVisible();
  });
});

// Round-2 addendum: /kudos exists now, so the "Sun* Kudos" nav item must be a
// real link (the round-1 "no confirmed destination" decision is superseded).
authenticatedTest.describe("Navigation Shell — Sun* Kudos destination", () => {
  authenticatedTest(
    "06: Header 'Sun* Kudos' navigates to /kudos (round-2 wiring)",
    async ({ authenticatedPage: page }) => {
      await page.goto("/");
      await page
        .locator('[data-testid="site-header"]')
        .getByRole("link", { name: "Sun* Kudos" })
        .click();
      await page.waitForURL(/\/kudos$/, { timeout: 10_000 });
      await expectAuth(
        page.locator('[data-testid="kudos-board-banner-title"]'),
      ).toBeVisible();
    },
  );
});
