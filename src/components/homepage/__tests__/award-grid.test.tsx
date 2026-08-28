import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardGrid } from "../award-grid";

describe("AwardGrid", () => {
  it("renders 6 cards in the fixed AWARD_CATEGORIES order, each with one link to /he-thong-giai#{slug} (BR-006)", () => {
    render(<AwardGrid />);
    const cards = screen.getAllByTestId("award-card");
    expect(cards).toHaveLength(6);

    cards.forEach((card, index) => {
      const category = AWARD_CATEGORIES[index];
      expect(card.dataset.slug).toBe(category.slug);

      const links = card.querySelectorAll("a");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", `/he-thong-giai#${category.slug}`);
      expect(links[0]).toHaveTextContent("Chi tiết");
    });
  });

  it("renders the section title copy from the design content", () => {
    render(<AwardGrid />);
    expect(screen.getByText("Sun* annual awards 2025")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeInTheDocument();
  });
});
