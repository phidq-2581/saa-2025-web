import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import AwardSystemPage from "../../../app/(site)/he-thong-giai/page";

describe("AwardSystemPage", () => {
  it("renders the main landmark, hero, section title and Kudos banner", () => {
    renderWithIntl(<AwardSystemPage />);
    expect(screen.getByTestId("award-system-main")).toBeInTheDocument();
    expect(screen.getByTestId("award-hero")).toBeInTheDocument();
    expect(screen.getByTestId("award-section-title")).toBeInTheDocument();
    expect(screen.getByTestId("award-kudos-banner")).toBeInTheDocument();
  });

  it("renders exactly 6 sections whose id equals the category slug (BR-002 deep-link contract)", () => {
    renderWithIntl(<AwardSystemPage />);
    const cards = screen.getAllByTestId("award-info-card");
    expect(cards).toHaveLength(6);

    for (const category of AWARD_CATEGORIES) {
      const section = document.getElementById(category.slug);
      expect(section).not.toBeNull();
      expect(section?.dataset.testid).toBe("award-info-card");
    }
  });

  // Phase 07b: body copy now flows through `useTranslations` -- this proves
  // the `NEXT_LOCALE=en` switch actually reaches the rendered tree, using a
  // MoMorph-sourced EN string with no VN counterpart in the same position.
  it("renders the EN catalog when locale is en", () => {
    renderWithIntl(<AwardSystemPage />, { locale: "en" });
    expect(
      screen.getByRole("heading", { name: "SAA 2025 Award System" }),
    ).toBeInTheDocument();
  });
});
