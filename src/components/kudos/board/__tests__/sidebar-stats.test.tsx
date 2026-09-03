import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { SidebarStats } from "../sidebar-stats";
import type { SidebarStatsView } from "../kudos-board-types";

const BASE: SidebarStatsView = {
  kudosReceivedCount: 25,
  kudosSentCount: 25,
  heartsReceivedCount: 25,
  secretBoxOpenedCount: 25,
  secretBoxUnopenedCount: 25,
  asteriskTier: 0,
  heartsDoubled: false,
  campaign: null,
};

/**
 * "Hover campain" (MoMorph gI07KYVJWE, frame 3241:15021): hovering the x2 marker
 * next to "Số tim bạn nhận được" shows the campaign card with the real window
 * of the current special-day run.
 */
describe("SidebarStats campaign marker", () => {
  it("shows no x2 marker and no campaign tooltip outside a special-day run", () => {
    renderWithIntl(<SidebarStats stats={BASE} />);
    expect(screen.queryByTestId("sidebar-campaign-marker")).toBeNull();
    expect(screen.queryByTestId("sidebar-campaign-tooltip")).toBeNull();
  });

  it("shows the x2 marker with the campaign card filled from the window", () => {
    renderWithIntl(
      <SidebarStats stats={{ ...BASE, heartsDoubled: true, campaign: { start: "2026-12-26", end: "2026-12-27" } }} />,
    );
    const marker = screen.getByTestId("sidebar-campaign-marker");
    expect(marker).toBeInTheDocument();
    expect(marker.querySelector("img")).toHaveAttribute("src", "/kudos-board/campaign-x2.png");
    expect(marker.querySelector("img")).toHaveAttribute("width", "34");
    const tooltip = screen.getByTestId("sidebar-campaign-tooltip");
    expect(tooltip).toHaveTextContent("Ngày x2 tim – lan tỏa gấp đôi yêu thương!");
    expect(tooltip).toHaveTextContent(
      "Từ 00:00 ngày 26/12 đến 23:59 ngày 27/12, tất cả tim bạn nhận được đều được nhân đôi.",
    );
    // The fire art is the hand-exported Group 435 (label baked in), so no
    // separate "x2" text may precede the title.
    const art = tooltip.querySelector("img");
    expect(art).toHaveAttribute("src", "/kudos-board/campaign-x2.png");
    expect(art).toHaveAttribute("width", "56");
    expect(art).toHaveAttribute("height", "66");
    expect(tooltip.textContent?.startsWith("Ngày x2 tim")).toBe(true);
  });
});
