import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import AwardSystemPage from "../../../app/(site)/he-thong-giai/page";

describe("AwardSystemPage", () => {
  it("renders the main landmark, hero, section title and Kudos banner", () => {
    render(<AwardSystemPage />);
    expect(screen.getByTestId("award-system-main")).toBeInTheDocument();
    expect(screen.getByTestId("award-hero")).toBeInTheDocument();
    expect(screen.getByTestId("award-section-title")).toBeInTheDocument();
    expect(screen.getByTestId("award-kudos-banner")).toBeInTheDocument();
  });

  it("renders exactly 6 sections whose id equals the category slug (BR-002 deep-link contract)", () => {
    render(<AwardSystemPage />);
    const cards = screen.getAllByTestId("award-info-card");
    expect(cards).toHaveLength(6);

    for (const category of AWARD_CATEGORIES) {
      const section = document.getElementById(category.slug);
      expect(section).not.toBeNull();
      expect(section?.dataset.testid).toBe("award-info-card");
    }
  });
});
