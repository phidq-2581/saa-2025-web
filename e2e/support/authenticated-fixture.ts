import { test as base, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { deleteSeededUser, seedSession, type SeededCookie } from "./seed-session";

type Fixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  /** Same seeded member session as `authenticatedPage`, but also exposes
   *  the seeded user's id — for tests that must seed rows AS the viewer
   *  (e.g. "heart disabled on the viewer's own kudos"). */
  memberSession: { page: Page; userId: string };
};

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@sun-asterisk.com`;
}

function toPlaywrightSameSite(value: string | undefined): "Strict" | "Lax" | "None" {
  const normalized = (value ?? "lax").toLowerCase();
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";
  return "Lax";
}

function toPlaywrightCookies(cookies: SeededCookie[], domain: string) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return cookies.map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    domain,
    path: cookie.path,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: toPlaywrightSameSite(cookie.sameSite),
    expires: cookie.maxAge ? nowSeconds + cookie.maxAge : -1,
  }));
}

async function seededContext(
  browser: Browser,
  emailPrefix: string,
  role: "admin" | "member",
): Promise<{ context: BrowserContext; userId: string }> {
  const email = uniqueEmail(emailPrefix);
  const seeded = await seedSession(email, role);
  const context = await browser.newContext();
  await context.addCookies(toPlaywrightCookies(seeded.cookies, "localhost"));
  return { context, userId: seeded.userId };
}

/**
 * `authenticatedPage` (member) and `adminPage` (admin) -- real local
 * Supabase sessions seeded via `seedSession`, not faked cookies. Each
 * fixture gets its own browser context and its own throwaway user, deleted
 * after the test.
 */
export const test = base.extend<Fixtures>({
  // Playwright's second fixture-callback parameter is conventionally named
  // `use`, but `eslint-plugin-react-hooks` (bundled by eslint-config-next)
  // treats any `use*`-named function call as a React Hook call and flags
  // this factory as an invalid hook host. Renamed to `provideFixture` --
  // same Playwright API, no behavior change, no lint suppression needed.
  authenticatedPage: async ({ browser }, provideFixture) => {
    const { context, userId } = await seededContext(browser, "e2e-member", "member");
    const page = await context.newPage();
    await provideFixture(page);
    await context.close();
    await deleteSeededUser(userId);
  },
  adminPage: async ({ browser }, provideFixture) => {
    const { context, userId } = await seededContext(browser, "e2e-admin", "admin");
    const page = await context.newPage();
    await provideFixture(page);
    await context.close();
    await deleteSeededUser(userId);
  },
  memberSession: async ({ browser }, provideFixture) => {
    const { context, userId } = await seededContext(browser, "e2e-member", "member");
    const page = await context.newPage();
    await provideFixture({ page, userId });
    await context.close();
    await deleteSeededUser(userId);
  },
});

export { expect };
