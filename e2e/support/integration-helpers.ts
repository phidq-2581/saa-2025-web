/**
 * Shared helpers for integration E2E tests (locale, countdown, session).
 */

import { Page } from '@playwright/test';

/**
 * Opens the account menu and returns the trigger and menu locators.
 */
export async function openAccountMenu(page: Page) {
  const accountTrigger = page.locator('[data-testid="account-trigger"]');
  await accountTrigger.click();
  const accountMenu = page.locator('[data-testid="account-menu"]');
  return { accountTrigger, accountMenu };
}

/**
 * Reads NEXT_LOCALE cookie and returns its value.
 */
export async function getLocaleCookie(page: Page): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === 'NEXT_LOCALE')?.value;
}

/**
 * Checks if event date is in the past.
 */
export function isEventPast(eventStartAt: string): boolean {
  const eventDate = new Date(eventStartAt || '');
  return eventDate <= new Date();
}
