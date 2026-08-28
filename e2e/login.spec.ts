import { test, expect } from '@playwright/test';

test.describe('Login screen', () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 1280, height: 800 });
  });

  test('renders hero copy ROOT FURTHER with taglines (TC 42b82364)', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /ROOT FURTHER/i })).toBeVisible();
    await expect(page.getByText('Bắt đầu hành trình của bạn cùng SAA 2025.')).toBeVisible();
    await expect(page.getByText('Đăng nhập để khám phá!')).toBeVisible();
  });

  test('displays enabled Google login button with icon below hero (TC 6ae76d15)', async ({
    page,
  }) => {
    await page.goto('/login');

    const button = page.getByRole('button', { name: /LOGIN With Google/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    // Button must contain a Google icon (img or svg)
    const icon = button.locator('img, svg').first();
    await expect(icon).toBeVisible();

    // Button positioned below hero tagline
    const tagline = page.getByText('Đăng nhập để khám phá!');
    const taglineBox = await tagline.boundingBox();
    const buttonBox = await button.boundingBox();

    if (taglineBox && buttonBox) {
      expect(buttonBox.y).toBeGreaterThan(taglineBox.y + taglineBox.height);
    }
  });

  test('hero keyvisual covers hero region (TC 5fbe2a18)', async ({ page }) => {
    await page.goto('/login');

    const keyvisual = page.locator('[data-testid="login-keyvisual"]');
    await expect(keyvisual).toBeVisible();

    const keyvisualBox = await keyvisual.boundingBox();
    expect(keyvisualBox).toBeTruthy();

    if (keyvisualBox) {
      // Keyvisual width should be at least 50% of viewport
      const minWidth = 1280 * 0.5;
      expect(keyvisualBox.width).toBeGreaterThanOrEqual(minWidth);
    }
  });

  test('header shows logo and language selector only, footer shows copyright (TC 8415b629, 33a1dacf)', async ({
    page,
  }) => {
    await page.goto('/login');

    // Header: logo + language selector
    const loginHeader = page.locator('[data-testid="login-header"]');
    await expect(loginHeader).toBeVisible();

    const logo = loginHeader.locator('img[alt*="Sun"], img[alt*="SAA"]').first();
    await expect(logo).toBeVisible();

    const langTrigger = page.locator('[data-testid="login-language-trigger"]');
    await expect(langTrigger).toBeVisible();
    await expect(langTrigger).toContainText('VN');

    // Site header elements must NOT be present
    await expect(page.locator('[data-testid="site-header"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="notification-bell"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="account-trigger"]')).not.toBeVisible();
    await expect(page.getByText('Awards Information')).not.toBeVisible();

    // Footer: copyright
    const footer = page.locator('[data-testid="login-footer"]');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Bản quyền thuộc về Sun* © 2025');
  });

  test('error and next query params render identical screen (TC US002, AS1)', async ({
    page,
  }) => {
    // Error query param shows error notice
    await page.goto('/login?error=domain');
    const errorNotice = page.locator('[data-testid="login-error-notice"]');
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(
      'Đăng nhập không thành công. Vui lòng thử lại.'
    );

    // Button stays enabled for retry
    const button = page.getByRole('button', { name: /LOGIN With Google/i });
    await expect(button).toBeEnabled();

    // Next query param renders identical screen with no special banner
    await page.goto('/login?next=%2Fhe-thong-giai');
    const heroRoot = page.getByRole('heading', { name: /ROOT FURTHER/i });
    await expect(heroRoot).toBeVisible();

    // Verify no error banner is added
    const errorNoticeOnNext = page.locator('[data-testid="login-error-notice"]');
    await expect(errorNoticeOnNext).not.toBeVisible();

    // Google button still visible and enabled
    const googleButtonOnNext = page.getByRole('button', { name: /LOGIN With Google/i });
    await expect(googleButtonOnNext).toBeVisible();
    await expect(googleButtonOnNext).toBeEnabled();
  });
});
