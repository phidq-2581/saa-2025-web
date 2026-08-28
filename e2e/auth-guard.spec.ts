import { test, expect } from "./support/authenticated-fixture";

/**
 * S1 / C2 / F8 (red-team). PUBLIC_ROUTES in proxy.ts must be matched by
 * EXACT equality -- a `startsWith` regression (the superseded research
 * sketch) would make every route public, so the negative assertion below
 * checks not just the redirect but that the award page's own content never
 * leaks into the response.
 */
test.describe("Auth guard (proxy.ts)", () => {
  test("unauthenticated GET /he-thong-giai redirects to /login?next=... and never serves the private body", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/he-thong-giai");
    await expect(page).toHaveURL(/\/login\?next=%2Fhe-thong-giai$/);

    // S1 negative assertion: the private route's own main content must
    // never be observable, redirect or not.
    const body = await page.content();
    expect(body).not.toContain('data-testid="award-system-main"');

    await context.close();
  });

  test("'/' loads for an unauthenticated visitor", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);

    await context.close();
  });

  test("'/login' is reachable for an unauthenticated visitor (no guard bounce)", async ({
    browser,
  }) => {
    // No `src/app/login/page.tsx` exists yet (Phase 04's scope) -- this
    // phase only proves the guard's PUBLIC_ROUTES allow-list does not
    // bounce an unauthenticated visitor away from /login. A 404 body is
    // expected and correct until Phase 04 lands; a redirect elsewhere
    // (307) would mean the allow-list regressed.
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.goto("/login");
    expect([302, 307]).not.toContain(response?.status());
    await expect(page).toHaveURL(/\/login$/);

    await context.close();
  });

  test("a seeded session redirects GET /login to '/' (C2, TC f62b0c97, BR-003)", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/login");
    await expect(authenticatedPage).toHaveURL(/\/$/);
  });

  test("GET /does-not-exist returns 404 with the tokenized not-found page (F8)", async ({
    authenticatedPage,
  }) => {
    // Authenticated context: an unknown path is also outside PUBLIC_ROUTES,
    // so an unauthenticated request to it is indistinguishable from a
    // private-route request and is redirected to /login by design (no
    // route-enumeration signal). A session is required to actually reach
    // Next's own not-found rendering, which is what F8 is testing here.
    const response = await authenticatedPage.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
