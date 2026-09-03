import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { HeroTierBadge } from "../hero-tier-badge";

/**
 * Hero pills are the MM_MEDIA_* pill exports (master 109x19; New Hero exported
 * by hand since MoMorph has no file for it). Hovering a pill shows the
 * "Hover danh hiệu" card (clarifications.md 2026-09-03 evening).
 */
describe("HeroTierBadge", () => {
  it("renders the exported pill image for tiers MoMorph exports, keeping the tier name accessible", () => {
    renderWithIntl(<HeroTierBadge tier="rising" />);
    const img = screen.getByRole("img", { name: "Rising Hero" });
    expect(img).toHaveAttribute("src", "/kudos-board/hero-rising.png");
    expect(img).toHaveAttribute("width", "109");
    expect(img).toHaveAttribute("height", "19");
  });

  it("scales the same export to the Thể lệ panel's 126x22 instance in md size", () => {
    renderWithIntl(<HeroTierBadge tier="legend" size="md" />);
    const img = screen.getByRole("img", { name: "Legend Hero" });
    expect(img).toHaveAttribute("src", "/kudos-board/hero-legend.png");
    expect(img).toHaveAttribute("width", "126");
    expect(img).toHaveAttribute("height", "22");
  });

  it("renders New Hero from the hand-exported pill, in the badge and at 2x inside its card", () => {
    renderWithIntl(<HeroTierBadge tier="new" />);
    const badge = screen.getByRole("img", { name: "New Hero" });
    expect(badge).toHaveAttribute("src", "/kudos-board/hero-new.png");
    expect(badge).toHaveAttribute("width", "109");
    const cardPill = screen.getByRole("tooltip").querySelector("img");
    expect(cardPill).toHaveAttribute("src", "/kudos-board/hero-new.png");
    expect(cardPill).toHaveAttribute("width", "218");
    expect(screen.queryByText("New Hero")).toBeNull();
  });

  it("draws the tooltip per the 'Hover danh hiệu' frames: 304px card, 2x pill, white range over grey description", () => {
    renderWithIntl(<HeroTierBadge tier="legend" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("w-[304px]");
    const pill = tooltip.querySelector("img");
    expect(pill).toHaveAttribute("width", "218");
    expect(pill).toHaveAttribute("height", "38");
    expect(tooltip).toHaveTextContent("Có hơn 20 người gửi Kudos cho bạn");
  });

  it("carries the tier rule as a hover tooltip (range + description from the Thể lệ copy)", () => {
    renderWithIntl(<HeroTierBadge tier="super" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Có 10–20 người gửi Kudos cho bạn");
    expect(tooltip).toHaveTextContent("Bạn đã trở thành biểu tượng được tin tưởng và yêu quý");
  });

  it("omits the tooltip when asked (the Thể lệ panel already shows the rule next to the pill)", () => {
    renderWithIntl(<HeroTierBadge tier="super" size="md" tooltip={false} />);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
