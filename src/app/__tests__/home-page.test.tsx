import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import Home from "../(site)/page";

describe("Home page", () => {
  it("renders the hero heading and the main landmark", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ROOT FURTHER" })).toBeInTheDocument();
  });

  it("renders exactly 6 award cards, each linking to /he-thong-giai#{slug}", () => {
    render(<Home />);
    const cards = screen.getAllByTestId("award-card");
    expect(cards).toHaveLength(6);

    for (const category of AWARD_CATEGORIES) {
      const card = cards.find((el) => el.dataset.slug === category.slug);
      expect(card).toBeDefined();
      const link = card!.querySelector("a");
      expect(link).toHaveAttribute("href", `/he-thong-giai#${category.slug}`);
    }
  });

  it("renders the countdown server placeholder and the deferred CTA/detail affordances", () => {
    render(<Home />);
    expect(screen.getByTestId("countdown-days")).toHaveTextContent("00");
    expect(screen.getByTestId("coming-soon-label")).toBeInTheDocument();
    expect(screen.getByTestId("cta-about-awards")).toHaveAttribute("href", "/he-thong-giai");
    expect(screen.getByTestId("cta-about-kudos")).not.toHaveAttribute("href");
    expect(screen.getByTestId("kudos-promo-detail")).not.toHaveAttribute("href");
  });
});
