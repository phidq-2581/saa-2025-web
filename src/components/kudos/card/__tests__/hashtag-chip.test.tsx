import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HashtagChip } from "../hashtag-chip";

const HASHTAG = { id: "hashtag-1", name: "Aim High" };

describe("HashtagChip", () => {
  it("renders a plain, non-interactive span when onClick is omitted (kudos-detail-view reuse)", () => {
    render(<HashtagChip hashtag={HASHTAG} />);

    expect(screen.getByText("#Aim High")).toBeInTheDocument();
    expect(screen.queryByTestId("hashtag-chip")).not.toBeInTheDocument();
  });

  it("renders a clickable button and calls onClick with the hashtag id (spec D.4, Phase 07)", () => {
    const onClick = vi.fn();
    render(<HashtagChip hashtag={HASHTAG} onClick={onClick} />);

    const chip = screen.getByTestId("hashtag-chip");
    expect(chip).toHaveTextContent("#Aim High");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledWith("hashtag-1");
  });
});
