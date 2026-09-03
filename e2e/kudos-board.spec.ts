/**
 * Phase 04 RED test: Sun* Kudos Live board (/kudos route)
 * Maps test assertions to TC IDs and spec sections.
 * Assertion 1-4 per phase file § RED test file.
 *
 * Test must run against design-sourced sample data (no DB queries).
 * All selector contracts use data-testid with kebab-case prefix.
 */

import { test, expect } from "./support/authenticated-fixture";
import { createKudosSeeder } from "./support/seed-kudos";
import {
  SELECTORS,
  VERBOSE_STRINGS,
  VIETNAMESE_HASHTAGS,
  validatePaginationLabel,
  isValidTimestamp,
} from "./support/board-helpers";

test.describe("Phase 04: Kudos Live Board UI", () => {
  const seeder = createKudosSeeder();

  test.beforeAll(async () => {
    // Seed data for this test: ≥5 kudos, ≥2 authors
    // - One author receiving ≥10 kudos (for asterisk badge, leaderboard entry)
    // - One kudos with hearts (for highlight ordering)
    // - One kudos sent BY the authenticated viewer (for disabled heart)
    // Note: authenticated viewer is the "app" user from authenticated-fixture.ts

    const author1 = await seeder.createUser("board-author-1");
    const author2 = await seeder.createUser("board-author-2");
    const receiver = await seeder.createUser("board-receiver-tiered"); // Will receive 10+ kudos
    const hashtags = await seeder.fetchHashtagIds(5);

    // Seed 5 kudos from author1 to receiver
    const kudosIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const id = await seeder.seedKudos({
        senderId: author1,
        receiverId: receiver,
        hashtagIds: [hashtags[i % hashtags.length]],
      });
      kudosIds.push(id);
    }

    // Seed 6 more kudos from author2 to receiver (total 11, triggers asterisk badge)
    for (let i = 0; i < 6; i++) {
      const id = await seeder.seedKudos({
        senderId: author2,
        receiverId: receiver,
        hashtagIds: [hashtags[(i + 1) % hashtags.length]],
      });
      kudosIds.push(id);
    }

    // Add hearts to the first kudos (for deterministic highlight ordering)
    const likerIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const liker = await seeder.createUser(`board-liker-${i}`);
      likerIds.push(liker);
      await seeder.seedHeart({
        kudosId: kudosIds[0],
        userId: liker,
        grantedAmount: 1,
      });
    }
  });

  test.afterAll(async () => {
    await seeder.cleanup();
  });

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Dev server auto-starts via npm run test:e2e
    await page.goto("/kudos");
  });

  // ASSERTION 1 (spec A, A.1, B.1, B.6, C.1)
  // TC: 40d4ba26, 0578e8ef, 06b76e80, ddf67e52, 9dfda316
  test("renders KV banner, compose pill, and section headers", async ({ authenticatedPage: page }) => {
    // Banner title
    const bannerTitle = page.locator(SELECTORS["kudos-board-banner-title"]);
    await expect(bannerTitle).toContainText(VERBOSE_STRINGS.bannerTitle);

    // Compose pill with exact placeholder
    const composePill = page.locator(SELECTORS["kudos-board-compose-pill"]);
    await expect(composePill).toHaveAttribute(
      "placeholder",
      VERBOSE_STRINGS.pillPlaceholder
    );

    // Highlight section header
    const highlightHeader = page.locator(SELECTORS["kudos-board-highlight-header"]);
    await expect(highlightHeader).toContainText(VERBOSE_STRINGS.highlightHeader);

    // Spotlight section header
    const spotlightHeader = page.locator(SELECTORS["kudos-board-spotlight-header"]);
    await expect(spotlightHeader).toContainText(VERBOSE_STRINGS.spotlightHeader);

    // All Kudos section header
    const allKudosHeader = page.locator(SELECTORS["kudos-board-all-header"]);
    await expect(allKudosHeader).toContainText(VERBOSE_STRINGS.allKudosHeader);
  });

  // ASSERTION 2 (spec B.2, B.5, B.1.1, B.1.2)
  // TC: 86092c3a, 81446f61, 0929bc39, 7b029a3b
  test("highlight carousel shows 5 slides, pagination, and filter dropdowns", async ({ authenticatedPage: page }) => {
    // Check carousel slides (exactly 5)
    const slides = page.locator(SELECTORS["kudos-board-carousel-slides"]);
    await expect(slides).toHaveCount(5);

    // Pagination label reads "n/5"
    const pagination = page.locator(SELECTORS["kudos-board-carousel-pagination"]);
    const paginationText = await pagination.textContent();
    expect(validatePaginationLabel(paginationText || "", 5)).toBeTruthy();

    // Prev button disabled on slide 1
    const prevBtn = page.locator(SELECTORS["kudos-board-carousel-prev"]);
    await expect(prevBtn).toBeDisabled();

    // Next enabled on slide 1; after 4 clicks we are on 5/5 and next disables
    const nextBtn = page.locator(SELECTORS["kudos-board-carousel-next"]);
    await expect(nextBtn).toBeEnabled();
    for (let i = 0; i < 4; i++) {
      await nextBtn.click();
    }
    await expect(pagination).toContainText("5/5");
    await expect(nextBtn).toBeDisabled();
    await expect(prevBtn).toBeEnabled();

    // Hashtag filter trigger visible
    const hashtagTrigger = page.locator(SELECTORS["hashtag-filter-trigger"]);
    await expect(hashtagTrigger).toBeVisible();

    // Department filter trigger visible
    const deptTrigger = page.locator(SELECTORS["dept-filter-trigger"]);
    await expect(deptTrigger).toBeVisible();

    // Click hashtag dropdown and verify 13 tags
    await hashtagTrigger.click();
    const hashtagMenu = page.locator(SELECTORS["hashtag-filter-menu"]);
    for (const tag of VIETNAMESE_HASHTAGS) {
      await expect(hashtagMenu).toContainText(tag);
    }

    // Close hashtag menu by clicking trigger again
    await hashtagTrigger.click();

    // Click department dropdown and verify structure
    await deptTrigger.click();
    const deptMenu = page.locator(SELECTORS["dept-filter-menu"]);
    await expect(deptMenu).toBeVisible();
  });

  // ASSERTION 3 (spec B.3, C.3, C.4)
  // TC: 63645b03, 67c21a05, f92dc686
  test("feed card displays sender, receiver, time, content, badges, and disabled heart", async ({ authenticatedPage: page }) => {
    // First card in the FEED (carousel slides reuse the same kudos-card
    // component/testid, so the locator must be scoped to the feed region)
    const card = page
      .locator(SELECTORS["kudos-feed"])
      .locator(SELECTORS["kudos-card"])
      .first();
    await expect(card).toBeVisible();

    // Sender info
    const senderName = card.locator(SELECTORS["kudos-card-sender-name"]);
    await expect(senderName).toBeVisible();

    // Receiver info
    const receiverName = card.locator(SELECTORS["kudos-card-receiver-name"]);
    await expect(receiverName).toBeVisible();

    // Time format HH:mm - MM/DD/YYYY
    const timeEl = card.locator(SELECTORS["kudos-card-time"]);
    const timeText = await timeEl.textContent();
    expect(isValidTimestamp(timeText || "")).toBeTruthy();

    // Content (up to 5 lines, truncated with "…")
    const content = card.locator(SELECTORS["kudos-card-content"]);
    await expect(content).toBeVisible();

    // Hashtag chips (truncated to one line)
    const hashtags = card.locator(SELECTORS["kudos-card-hashtags"]);
    await expect(hashtags).toBeVisible();

    // Asterisk badge: seeded receiver has 11 kudos → a NON-EMPTY (starred)
    // badge must be visible somewhere on the board (tier-0 authors render an
    // empty hidden span, so `.first()` alone is not the tiered one)
    await expect(
      page.locator(`${SELECTORS["kudos-card-asterisk-badge"]}:not(:empty)`).first(),
    ).toBeVisible();

    // Heart button visible on every card
    const heartBtn = card.locator(SELECTORS["kudos-card-heart-btn"]);
    await expect(heartBtn).toBeVisible();

    // Copy Link button on feed cards
    const copyLinkBtn = card.locator(SELECTORS["kudos-card-copy-link-btn"]);
    await expect(copyLinkBtn).toBeVisible();

    // "Xem chi tiết" lives on HIGHLIGHT cards only (spec B.4.4 vs C.4 — feed
    // cards navigate via content click, their action bar is heart + Copy Link)
    await expect(
      page
        .locator(SELECTORS["kudos-board-carousel-slides"])
        .first()
        .locator(SELECTORS["kudos-card-view-detail-btn"]),
    ).toBeVisible();
    await expect(card.locator(SELECTORS["kudos-card-view-detail-btn"])).toHaveCount(0);
  });

  // TC 63645b03: the heart is DISABLED on the viewer's own kudos. Uses the
  // memberSession fixture (exposes the seeded viewer's userId) so this test
  // can seed a kudos SENT BY the viewer and find it by its unique content.
  test("heart is disabled on the viewer's own kudos (TC 63645b03)", async ({ memberSession }) => {
    const { page, userId } = memberSession;
    const ownContent = `own-kudos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const receiver = await seeder.createUser("board-own-receiver");
    const hashtags = await seeder.fetchHashtagIds(1);
    await seeder.seedKudos({
      senderId: userId,
      receiverId: receiver,
      hashtagIds: hashtags,
      contentText: ownContent,
    });

    await page.goto("/kudos");
    const ownCard = page
      .locator(SELECTORS["kudos-feed"])
      .locator(SELECTORS["kudos-card"])
      .filter({ hasText: ownContent })
      .first();
    await expect(ownCard).toBeVisible();
    await expect(ownCard.locator(SELECTORS["kudos-card-heart-btn"])).toBeDisabled();
  });

  // ASSERTION 4 (spec B.6, B.7, D, D.1)
  // TC: ddf67e52, 9e689933, 926d92a5, d662780b, d035e3b8
  test("spotlight renders word cloud, search validation, and sidebar with stats", async ({ authenticatedPage: page }) => {
    // Spotlight root visible
    const spotlightRoot = page.locator(SELECTORS["spotlight-root"]);
    await expect(spotlightRoot).toBeVisible();

    // Total label with sample count (NOT 388)
    const totalLabel = page.locator(SELECTORS["spotlight-total-label"]);
    const totalText = await totalLabel.textContent();
    expect(totalText).not.toContain("388 KUDOS");
    expect(totalText).toMatch(/\d+ KUDOS/); // Should have a number of KUDOs

    // Pan/Zoom toggle visible
    const panZoomToggle = page.locator(SELECTORS["spotlight-pan-zoom-toggle"]);
    await expect(panZoomToggle).toBeVisible();

    // Search input visible
    const searchInput = page.locator(SELECTORS["spotlight-search-input"]);
    await expect(searchInput).toBeVisible();

    // Reject 101-character search (validation)
    await searchInput.fill("a".repeat(101));
    await searchInput.press("Enter");
    const searchError = page.locator(SELECTORS["spotlight-search-error"]);
    await expect(searchError).toBeVisible();

    // Sidebar visible
    const sidebar = page.locator(SELECTORS["kudos-board-sidebar"]);
    await expect(sidebar).toBeVisible();

    // 6 stat lines with labels
    // Frame has exactly 5 concrete stat rows (D.1.2/D.1.3/D.1.4/D.1.6/D.1.7 —
    // the spec prose's "6 dòng" miscounts; divider D.1.5 is not a stat line)
    const statLines = page.locator(SELECTORS["sidebar-stat-line"]);
    await expect(statLines).toHaveCount(5);

    // "Mở Secret Box" button disabled with tooltip
    const openGiftBtn = page.locator(SELECTORS["sidebar-open-gift-btn"]);
    await expect(openGiftBtn).toBeDisabled();

    // Tooltip on hover
    const tooltip = page.locator(SELECTORS["sidebar-open-gift-tooltip"]);
    await openGiftBtn.hover();
    await expect(tooltip).toContainText(VERBOSE_STRINGS.openGiftTooltip);

    // Rank leaderboard present
    const rankLeaderboard = page.locator(SELECTORS["sidebar-rank-leaderboard"]);
    await expect(rankLeaderboard).toBeVisible();

    // Gift leaderboard shows "Chưa có dữ liệu" (empty state)
    const giftLeaderboard = page.locator(SELECTORS["sidebar-gift-leaderboard"]);
    await expect(giftLeaderboard).toBeVisible();
    const emptyMsg = page.locator(SELECTORS["sidebar-leaderboard-empty"]);
    await expect(emptyMsg).toContainText(VERBOSE_STRINGS.emptyLeaderboard);
  });

  // Feed empty-state variant (TC 926d92a5, d035e3b8) is NOT e2e-assertable on the
  // sample-data page without a fake toggle; it is covered by a real Vitest unit on
  // KudosFeed (pages=[] renders "Hiện tại chưa có Kudos nào.") owned by Phase 04.
});
