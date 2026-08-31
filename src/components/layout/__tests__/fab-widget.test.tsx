import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { FabWidget } from "../fab-widget";

describe("FabWidget", () => {
  it("toggle starts collapsed with aria-expanded=false and aria-controls pointing at the menu id (BR-004)", () => {
    renderWithIntl(<FabWidget />);

    const toggle = screen.getByTestId("fab-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "fab-menu");
    expect(document.getElementById("fab-menu")).not.toBeNull();
  });

  it("flips aria-expanded to true on click (BR-004)", () => {
    renderWithIntl(<FabWidget />);

    const toggle = screen.getByTestId("fab-toggle");
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("has the localized toggle accessible name Hành động nhanh in VN, unaffected by expanded state (BR-004)", () => {
    renderWithIntl(<FabWidget />);

    const toggle = screen.getByTestId("fab-toggle");
    expect(toggle).toHaveAttribute("aria-label", "Hành động nhanh");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", "Hành động nhanh");
  });

  it("shows VN expanded-menu labels Thể lệ / Viết KUDOS / Hủy by default (BR-004)", () => {
    renderWithIntl(<FabWidget />);
    fireEvent.click(screen.getByTestId("fab-toggle"));

    expect(screen.getByText("Thể lệ")).toBeInTheDocument();
    expect(screen.getByText("Viết KUDOS")).toBeInTheDocument();
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });

  it("shows EN expanded-menu labels Rules / Write KUDOS / Cancel with locale=en, toggle name stays VN (BR-004)", () => {
    renderWithIntl(<FabWidget />, { locale: "en" });
    fireEvent.click(screen.getByTestId("fab-toggle"));

    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText("Write KUDOS")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByTestId("fab-toggle")).toHaveAttribute(
      "aria-label",
      "Hành động nhanh",
    );
  });
});
