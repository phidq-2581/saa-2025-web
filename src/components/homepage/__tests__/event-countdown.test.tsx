import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { EventCountdown } from "../event-countdown";

describe("EventCountdown", () => {
  it("renders the 00/00/00 server placeholder with DAYS/HOURS/MINUTES labels and Coming soon (BR-005)", () => {
    renderWithIntl(
      <EventCountdown remaining={{ days: "00", hours: "00", minutes: "00", reached: false }} />,
    );

    expect(screen.getByTestId("countdown-days")).toHaveTextContent("00");
    expect(screen.getByTestId("countdown-days")).toHaveTextContent("DAYS");
    expect(screen.getByTestId("countdown-hours")).toHaveTextContent("00");
    expect(screen.getByTestId("countdown-hours")).toHaveTextContent("HOURS");
    expect(screen.getByTestId("countdown-minutes")).toHaveTextContent("00");
    expect(screen.getByTestId("countdown-minutes")).toHaveTextContent("MINUTES");
    expect(screen.getByTestId("coming-soon-label")).toHaveTextContent("Coming soon");
  });

  it("zero-pads single-digit values (BR-001)", () => {
    renderWithIntl(
      <EventCountdown remaining={{ days: "5", hours: "9", minutes: "0", reached: false }} />,
    );

    expect(screen.getByTestId("countdown-days")).toHaveTextContent("05");
    expect(screen.getByTestId("countdown-hours")).toHaveTextContent("09");
    expect(screen.getByTestId("countdown-minutes")).toHaveTextContent("00");
  });

  it("hides the Coming soon label once the event is reached (BR-002, BR-003)", () => {
    renderWithIntl(
      <EventCountdown remaining={{ days: "00", hours: "00", minutes: "00", reached: true }} />,
    );

    expect(screen.queryByTestId("coming-soon-label")).not.toBeInTheDocument();
    expect(screen.getByTestId("countdown-days")).toHaveTextContent("00");
  });
});
