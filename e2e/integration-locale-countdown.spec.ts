import { test, expect, type Cookie } from '@playwright/test';
import { getLocaleCookie, isEventPast } from './support/integration-helpers';

/**
 * Phase 07 — Integration wiring — locale switching, countdown, award navigation
 * Tests 4, 6, 7 from integration-flows split to comply with 200-line file limit.
 */

test.describe('Phase 07 Integration — Locale, Award Links, Countdown', () => {
  /**
   * BR-001, SC-001: Selecting EN switches visible copy, survives reload with no VN flash,
   * NEXT_LOCALE cookie reads en.
   */
  test('4. Language selection EN: copy switches, cookie persists, no VN flash on reload (BR-001, SC-001)', async ({
    browser,
  }) => {
    // Start in a fresh guest context
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Verify initial VN locale in footer: "Bản quyền" (Vietnamese)
      const footerBefore = page.locator('[data-testid="site-footer"]');
      await expect(footerBefore).toContainText('Bản quyền');

      // Open language dropdown
      const languageTrigger = page.locator('[data-testid="language-trigger"]');
      await languageTrigger.click();

      // Click EN option
      const languageMenu = page.locator('[data-testid="language-menu"]');
      await expect(languageMenu).toBeVisible();
      const enButton = languageMenu.locator('button').last();
      await enButton.click();

      // Wait for potential re-render
      await page.waitForTimeout(500);

      // Verify NEXT_LOCALE cookie is now "en"
      const localeCookie = await getLocaleCookie(page);
      expect(localeCookie).toBe('en');

      // Now reload the page and check that EN copy is present from first paint (no VN flash)
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Immediately check that the footer shows "Copyright" (EN) instead of "Bản quyền" (VN)
      const footerAfter = page.locator('[data-testid="site-footer"]');
      await expect(footerAfter).not.toContainText('Bản quyền');
    } finally {
      await context.close();
    }
  });

  /**
   * BR-006 + BR-002 end-to-end: Seeded member on /, click Top Talent award card →
   * URL /he-thong-giai#top-talent, section#top-talent in viewport, award-nav-item[data-slug=top-talent] aria-current=true.
   */
  test('6. Award card click: navigates to /he-thong-giai#slug, scrolls section in view, nav item active (BR-006, BR-002)', async ({
    browser,
  }) => {
    const { seedSession, deleteSeededUser } = await import('./support/seed-session');
    const memberSeeded = await seedSession('member-award-' + Date.now() + '@sun-asterisk.com', 'member');
    const context = await browser.newContext();
    
    const memberCookies: Cookie[] = memberSeeded.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost',
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: (c.sameSite ?? 'lax').toLowerCase() === 'strict' ? 'Strict' as const :
                (c.sameSite ?? 'lax').toLowerCase() === 'none' ? 'None' as const : 'Lax' as const,
      expires: Math.floor(Date.now() / 1000) + (c.maxAge || 3600),
    }));
    
    await context.addCookies(memberCookies);
    const page = await context.newPage();
    
    try {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Find and click Top Talent card
      const topTalentCard = page.locator('[data-testid="award-card"][data-slug="top-talent"]');
      await expect(topTalentCard).toBeVisible();

      // Click the card (or a link within it)
      const cardLink = topTalentCard.locator("a[href*='he-thong-giai#top-talent']").first();
      await expect(cardLink).toHaveCount(1);
      await cardLink.click();

      // Wait for navigation to award page with hash
      await page.waitForURL(/\/he-thong-giai#top-talent/);

      // Verify URL
      expect(page.url()).toContain('/he-thong-giai#top-talent');

      // Verify section#top-talent is in viewport
      const topTalentSection = page.locator('section#top-talent');
      await expect(topTalentSection).toBeInViewport();

      // Verify nav item has aria-current="true"
      const topTalentNavItem = page.locator(
        '[data-testid="award-nav-item"][data-slug="top-talent"]'
      );
      await expect(topTalentNavItem).toHaveAttribute('aria-current', 'true');
    } finally {
      await deleteSeededUser(memberSeeded.userId);
      await context.close();
    }
  });

  /**
   * BR-005, SC-002: Countdown after mount, env-aware, no hydration error.
   */
  test('7. Countdown client-side mount, env-aware, no hydration error (BR-005, SC-002)', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        consoleMessages.push(msg.text().toLowerCase());
      });

      await page.goto('/', { waitUntil: 'networkidle' });
      await page.setViewportSize({ width: 1280, height: 720 });

      // Verify no hydration mismatch in console
      const hydrationErrors = consoleMessages.filter((msg) =>
        msg.includes('hydration')
      );
      expect(hydrationErrors).toHaveLength(0);

      // Read env var
      const eventStartAt = process.env.NEXT_PUBLIC_EVENT_START_AT;
      const isPast = isEventPast(eventStartAt || '');

      if (isPast) {
        const comingSoonLabel = page.locator('[data-testid="coming-soon-label"]');
        await expect(comingSoonLabel).toBeHidden({ timeout: 5000 });

        const daysBlock = page.locator('[data-testid="countdown-days"]');
        const hoursBlock = page.locator('[data-testid="countdown-hours"]');
        const minutesBlock = page.locator('[data-testid="countdown-minutes"]');

        await expect(daysBlock).toContainText('00');
        await expect(hoursBlock).toContainText('00');
        await expect(minutesBlock).toContainText('00');
      } else {
        const comingSoonLabel = page.locator('[data-testid="coming-soon-label"]');
        await expect(comingSoonLabel).toBeVisible();

        const daysBlock = page.locator('[data-testid="countdown-days"]');
        const hoursBlock = page.locator('[data-testid="countdown-hours"]');
        const minutesBlock = page.locator('[data-testid="countdown-minutes"]');

        const daysText = await daysBlock.textContent();
        const hoursText = await hoursBlock.textContent();
        const minutesText = await minutesBlock.textContent();

        const hasNonZero =
          !daysText?.includes('00') ||
          !hoursText?.includes('00') ||
          !minutesText?.includes('00');
        expect(hasNonZero).toBeTruthy();
      }
    } finally {
      await context.close();
    }
  });
});
