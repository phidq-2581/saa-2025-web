import { test, expect } from "./support/authenticated-fixture";
import { deleteSeededUser, seedSession } from "./support/seed-session";

/**
 * F1/A6: this spec IS the durable infra probe for the E2E session fixture
 * -- it proves the cookie name(s) `seedSession` produces, and that
 * `proxy.ts` (this phase) actually honors them end-to-end. A later phase
 * (05) owns the real `/he-thong-giai` page; until then, a non-redirect
 * response here still proves the guard let the authenticated request
 * through (a 404 body is fine -- the guard's job is only to not bounce it
 * to /login).
 */
test.describe("E2E session fixture", () => {
  test("produces a real sb-*-auth-token cookie, chunked or not", async () => {
    const seeded = await seedSession(`e2e-cookie-shape-${Date.now()}@sun-asterisk.com`, "member");
    try {
      expect(seeded.cookies.length).toBeGreaterThan(0);
      for (const cookie of seeded.cookies) {
        expect(cookie.name).toMatch(/^sb-.+-auth-token(\.\d+)?$/);
        expect(cookie.value.length).toBeGreaterThan(0);
      }
      // Cookie names only (never values) -- still gated behind an opt-in
      // flag so a routine CI run stays quiet.
      if (process.env.E2E_DEBUG) {
        console.log(
          "seed-session produced cookie name(s):",
          seeded.cookies.map((c) => c.name).join(", "),
        );
      }
    } finally {
      await deleteSeededUser(seeded.userId);
    }
  });

  test("seeded cookie lets an authenticated request through the guard (no redirect to /login)", async ({
    authenticatedPage,
  }) => {
    const response = await authenticatedPage.context().request.get("/he-thong-giai", {
      maxRedirects: 0,
    });

    expect([302, 307]).not.toContain(response.status());
    expect(response.url()).not.toContain("/login");
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
  });

  test("the same route without a session cookie redirects to /login?next=%2Fhe-thong-giai", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const response = await context.request.get("/he-thong-giai", { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(location).toBe("/login?next=%2Fhe-thong-giai");
    await context.close();
  });
});
