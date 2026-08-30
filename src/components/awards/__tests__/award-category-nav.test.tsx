import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { AwardCategoryNav } from "../award-category-nav";

// jsdom implements `Element.scrollIntoView` as a no-op stub only in newer
// versions; guard so the click handler never throws under jsdom.
beforeEach(() => {
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
  window.location.hash = "";
});

describe("AwardCategoryNav", () => {
  it("renders exactly 6 award-nav-item, one per category, in order", () => {
    renderWithIntl(<AwardCategoryNav categories={AWARD_CATEGORIES} />);
    const items = screen.getAllByTestId("award-nav-item");
    expect(items).toHaveLength(6);
    items.forEach((item, index) => {
      expect(item.dataset.slug).toBe(AWARD_CATEGORIES[index].slug);
    });
  });

  it("marks only the clicked item active (BR-001)", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AwardCategoryNav categories={AWARD_CATEGORIES} />);

    const bestManagerButton = screen.getByRole("button", { name: /Best Manager/ });
    await user.click(bestManagerButton);
    expect(bestManagerButton).toHaveAttribute("aria-current", "true");

    const mvpButton = screen.getByRole("button", { name: /MVP/ });
    await user.click(mvpButton);
    expect(mvpButton).toHaveAttribute("aria-current", "true");
    expect(bestManagerButton).not.toHaveAttribute("aria-current", "true");

    const activeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-current") === "true");
    expect(activeButtons).toHaveLength(1);
  });

  it("activates nothing when no section id in the document matches the initial hash (BR-003)", () => {
    window.location.hash = "#does-not-exist";
    renderWithIntl(<AwardCategoryNav categories={AWARD_CATEGORIES} />);
    const activeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-current") === "true");
    expect(activeButtons).toHaveLength(0);
  });
});
