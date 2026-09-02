/**
 * Shared helpers for integration E2E tests (locale, countdown, session, Phase 07 kudos).
 */

import { Page, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

// ========== Phase 07 Integration Helpers ==========

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`integration-helpers: missing env var ${name}`);
  }
  return value;
}

export function createAdminClient(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Seed a special_days row for today (Asia/Ho_Chi_Minh).
 * Returns the seeded date for cleanup.
 */
export async function seedSpecialDayToday(): Promise<string> {
  const admin = createAdminClient();
  const now = new Date();
  // Adjust to Asia/Ho_Chi_Minh (UTC+7)
  const hochiminh = new Date(now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60000);
  const day = hochiminh.toISOString().split("T")[0]; // YYYY-MM-DD

  const { error } = await admin.from("special_days").insert({ day });
  if (error) {
    throw new Error(`integration-helpers: failed to seed special_days for ${day}: ${error.message}`);
  }
  return day;
}

/**
 * Delete a special_days row.
 */
export async function deleteSpecialDay(day: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("special_days").delete().eq("day", day);
  if (error) {
    console.warn(`integration-helpers: cleanup failed for special_days ${day}: ${error.message}`);
  }
}

/**
 * Wait for a toast notification with exact text.
 */
export async function expectToastWithText(page: Page, text: string): Promise<void> {
  const toastLocator = page.locator('[data-testid="toast"], [role="status"]').first();
  await expect(toastLocator).toContainText(text);
}

/**
 * Scroll page to bottom and wait for potential infinite-scroll load.
 */
export async function scrollToBottom(page: Page, waitMs: number = 500): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(waitMs);
}

/**
 * Get the current viewport scroll position.
 */
export async function getScrollPosition(page: Page): Promise<number> {
  return await page.evaluate(() => window.scrollY);
}

/**
 * Format a date as "HH:mm - MM/DD/YYYY" for assertion against card timestamps.
 */
export function formatTimeForAssertion(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes} - ${month}/${day}/${year}`;
}

/**
 * Read the sidebar stat "Số tim bạn nhận được" value.
 * Returns the parsed integer or 0 if not found.
 */
export async function readSidebarHeartStat(page: Page): Promise<number> {
  const statLine = page.locator('[data-testid="sidebar-stat-line"]').filter({
    has: page.locator("text=/Số tim bạn nhận được/"),
  });
  const text = await statLine.textContent();
  if (!text) return 0;
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get the spotlight total count from "N KUDOS" header.
 * Returns the parsed integer or null if not found.
 */
export async function readSpotlightTotal(page: Page): Promise<number | null> {
  const header = page.locator('[data-testid="spotlight-total-label"]');
  const text = await header.textContent();
  if (!text) return null;
  const match = text.match(/(\d+)\s*KUDOS/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Read sender's total heart credit via service-role DB query.
 * Returns sum of granted_amount from heart table for kudos sent by user.
 */
export async function readSenderHeartTotal(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("heart")
    .select("granted_amount")
    .in("kudos_id", await getKudosIdsBySender(admin, userId));
  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.granted_amount || 0), 0);
}

/**
 * Helper: get all kudos IDs sent by a user.
 */
async function getKudosIdsBySender(client: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await client
    .from("kudos")
    .select("id")
    .eq("sender_id", userId);
  if (error || !data) return [];
  return data.map((row) => row.id as string);
}
