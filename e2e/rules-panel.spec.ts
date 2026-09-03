import { test, expect } from "@playwright/test";

/**
 * Thể lệ panel (MoMorph b1Filzi9i6, frame 3204:6051) -- guest-reachable via the
 * footer's "Tiêu chuẩn chung" button (clarifications.md 2026-09-03: all three
 * rules affordances open the same panel; a guest sees "Viết KUDOS" disabled).
 * Data-testid contract: rules-panel, rules-panel-close, rules-panel-write,
 * rules-panel-scroll, rules-badge, rules-tier.
 */
const BADGES = ["REVIVAL", "TOUCH OF LIGHT", "STAY GOLD", "FLOW TO HORIZON", "BEYOND THE BOUNDARY", "ROOT FURTHER"];

test.describe("Thể lệ panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("footer 'Tiêu chuẩn chung' opens the panel with every declared element (TC_THELE_GUI_001, GUI_002)", async ({
    page,
  }) => {
    await expect(page.getByTestId("rules-panel")).toHaveCount(0);
    await page.getByTestId("site-footer").getByRole("button", { name: "Tiêu chuẩn chung" }).click();

    const panel = page.getByTestId("rules-panel");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("role", "dialog");
    await expect(panel.getByRole("heading", { name: "Thể lệ" })).toBeVisible();
    await expect(panel.getByText("NGƯỜI NHẬN KUDOS: HUY HIỆU HERO CHO NHỮNG ẢNH HƯỞNG TÍCH CỰC")).toBeVisible();
    await expect(panel.getByText("NGƯỜI GỬI KUDOS: SƯU TẬP TRỌN BỘ 6 ICON, NHẬN NGAY PHẦN QUÀ BÍ ẨN")).toBeVisible();
    await expect(panel.getByTestId("rules-tier")).toHaveCount(4);
    await expect(panel.getByText("Có 1-4 người gửi Kudos cho bạn")).toBeVisible();
    await expect(panel.getByTestId("rules-badge")).toHaveCount(6);
    for (const label of BADGES) await expect(panel.getByText(label, { exact: true })).toBeVisible();
    await expect(panel.getByRole("heading", { name: "KUDOS QUỐC DÂN" })).toBeVisible();

    const close = panel.getByTestId("rules-panel-close");
    const write = panel.getByTestId("rules-panel-write");
    await expect(close).toContainText("Đóng");
    await expect(write).toContainText("Viết KUDOS");
  });

  test("panel content scrolls to its end when it overflows (TC_THELE_FUN_001)", async ({ page }) => {
    await page.getByTestId("site-footer").getByRole("button", { name: "Tiêu chuẩn chung" }).click();
    const scroller = page.getByTestId("rules-panel-scroll");
    await expect(scroller).toBeVisible();
    const overflow = await scroller.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeGreaterThan(0);
    await scroller.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const atEnd = await scroller.evaluate((el) => Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight);
    expect(atEnd).toBe(true);
  });

  test("'Đóng' closes the panel and the page is shown again (TC_THELE_FUN_003)", async ({ page }) => {
    await page.getByTestId("site-footer").getByRole("button", { name: "Tiêu chuẩn chung" }).click();
    await expect(page.getByTestId("rules-panel")).toBeVisible();
    await page.getByTestId("rules-panel-close").click();
    await expect(page.getByTestId("rules-panel")).toHaveCount(0);
    await expect(page.getByTestId("hero-section")).toBeVisible();
  });

  test("Escape closes the panel (dialog a11y baseline, clarifications 2026-09-03)", async ({ page }) => {
    await page.getByTestId("site-footer").getByRole("button", { name: "Tiêu chuẩn chung" }).click();
    await expect(page.getByTestId("rules-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("rules-panel")).toHaveCount(0);
  });

  test("guest sees 'Viết KUDOS' disabled and dimmed; clicking it does nothing (TC_THELE_GUI_003, FUN_005)", async ({
    page,
  }) => {
    await page.getByTestId("site-footer").getByRole("button", { name: "Tiêu chuẩn chung" }).click();
    const write = page.getByTestId("rules-panel-write");
    await expect(write).toBeDisabled();
    const opacity = await write.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeLessThan(1);
    await write.click({ force: true });
    await expect(page.getByTestId("rules-panel")).toBeVisible();
    await expect(page.getByTestId("kudos-compose-dialog")).toHaveCount(0);
  });
});
