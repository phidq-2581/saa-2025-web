import { test, expect } from '@playwright/test';
import { getLocaleCookie } from './support/integration-helpers';
import { seedSession, deleteSeededUser } from './support/seed-session';

/**
 * Phase 07b — E2E body-copy i18n (e2e-red-first)
 * RED: body still imports messages/vi/*.json; EN NEXT_LOCALE=en doesn't switch copy.
 * GREEN: useTranslations + next-intl. Fallback: EN keys without Figma source → VN.
 */
test.describe('Phase 07b — Body-copy i18n', () => {
  test('1. Homepage body EN: NEXT_LOCALE=en → / → EN strings + VN fallback', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        url: 'http://localhost:3000',
      },
    ]);
    const page = await context.newPage();

    try {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 1280, height: 720 });

      expect(await getLocaleCookie(page)).toBe('en');

      // EN: "Awards System"
      await expect(page.getByRole('heading', { name: /Awards System/i })).toBeVisible();

      // EN: "Time:", "Venue:", "Recognition Movement", award description, "Details" links
      await expect(page.getByText(/^Time:$/)).toBeVisible();
      await expect(page.getByText(/^Venue:$/)).toBeVisible();
      await expect(page.getByText(/Recognition Movement/i)).toBeVisible();
      await expect(page.getByText(/Honoring top individuals across all aspects/i)).toBeVisible();
      // All 6 award cards show "Details" link; verify count and first card ends with "Details"
      await expect(
        page.locator('[data-testid="award-card"] a').filter({ hasText: 'Details' })
      ).toHaveCount(6);
      await expect(
        page.locator('[data-testid="award-card"] a').first()
      ).toContainText('Details');

      // VN fallback: home.eventInfo.place (no EN source)
      await expect(
        page.getByText(/Nhà hát nghệ thuật quân đội/)
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('2. Award page EN: member + NEXT_LOCALE=en → /he-thong-giai → EN strings + VN fallback', async ({
    browser,
  }) => {
    const memberSeeded = await seedSession(
      'e2e-member-i18n-' + Date.now() + '@sun-asterisk.com',
      'member'
    );

    const context = await browser.newContext();
    const seedCookies = memberSeeded.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost' as const,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: ('Lax' as const),
      expires: Math.floor(Date.now() / 1000) + (c.maxAge || 3600),
    }));
    await context.addCookies(seedCookies);
    await context.addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
      },
    ]);

    const page = await context.newPage();

    try {
      await page.goto('/he-thong-giai', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 1280, height: 720 });

      expect(await getLocaleCookie(page)).toBe('en');

      // EN: heading, labels, Individual unit, prize amount & qualifier, "Or"
      await expect(page.getByRole('heading', { name: /SAA 2025 Award System/i })).toBeVisible();

      // Scope labels to Top Talent card (avoid strict-mode violation from 6 card repetitions)
      const ttCard = page.locator('[data-testid="award-info-card"][data-slug="top-talent"]');
      await expect(ttCard).toContainText('Number of awards:');
      await expect(ttCard).toContainText('Prize value:');
      await expect(ttCard).toContainText('Individual');
      await expect(ttCard).toContainText('7,000,000 VND');
      await expect(ttCard).toContainText('per prize');

      // Scope "Or" and "Individual or Team" to Signature card
      const sigCard = page.locator('[data-testid="award-info-card"][data-slug="signature-2025-creator"]');
      await expect(sigCard).toContainText('Or');
      await expect(sigCard).toContainText('Individual or Team');

      // VN fallback: Signature description stays Vietnamese (no EN source)
      await expect(
        page.getByText(/Giải thưởng Signature vinh danh/)
      ).toBeVisible();
    } finally {
      await deleteSeededUser(memberSeeded.userId);
      await context.close();
    }
  });

  test('3. VN guard: no NEXT_LOCALE → VN on homepage & award page', async ({
    browser,
  }) => {
    const memberSeeded = await seedSession(
      'e2e-member-vn-guard-' + Date.now() + '@sun-asterisk.com',
      'member'
    );

    // Homepage (guest, no cookies)
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    try {
      await guestPage.goto('/', { waitUntil: 'networkidle' });
      await guestPage.setViewportSize({ width: 1280, height: 720 });

      expect(await getLocaleCookie(guestPage) ?? 'vi').toBe('vi');

      // VN: heading & timeLabel
      await expect(guestPage.getByRole('heading', { name: /Hệ thống giải thưởng/i })).toBeVisible();
      await expect(guestPage.getByText(/^Thời gian:$/)).toBeVisible();
    } finally {
      await guestContext.close();
    }

    // Award page (authenticated member, no locale cookie)
    const memberContext = await browser.newContext();
    const memberCookies = memberSeeded.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost' as const,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: ('Lax' as const),
      expires: Math.floor(Date.now() / 1000) + (c.maxAge || 3600),
    }));
    await memberContext.addCookies(memberCookies);

    const memberPage = await memberContext.newPage();

    try {
      await memberPage.goto('/he-thong-giai', { waitUntil: 'networkidle' });
      await memberPage.setViewportSize({ width: 1280, height: 720 });

      expect(await getLocaleCookie(memberPage) ?? 'vi').toBe('vi');

      // VN: quantityLabel
      await expect(memberPage.getByText(/^Số lượng giải thưởng:$/).first()).toBeVisible();
    } finally {
      await deleteSeededUser(memberSeeded.userId);
      await memberContext.close();
    }
  });
});
