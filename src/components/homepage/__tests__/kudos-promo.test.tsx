import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { KudosPromo } from "../kudos-promo";

describe("KudosPromo", () => {
  it("renders label, title, description, illustration, and an inert Chi tiết affordance (BR-008)", () => {
    renderWithIntl(<KudosPromo />);

    expect(screen.getByTestId("kudos-promo")).toBeInTheDocument();
    expect(screen.getByText("Phong trào ghi nhận")).toBeInTheDocument();
    expect(screen.getByText("Sun* Kudos")).toBeInTheDocument();
    expect(screen.getByTestId("kudos-promo").querySelector("img")).toBeInTheDocument();

    const detail = screen.getByTestId("kudos-promo-detail");
    expect(detail).toHaveTextContent("Chi tiết");
    expect(detail).not.toHaveAttribute("href");
    expect(detail.tagName).not.toBe("A");
  });
});
