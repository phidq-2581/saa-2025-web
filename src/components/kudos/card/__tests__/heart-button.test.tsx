import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeartButton } from "../heart-button";

describe("HeartButton", () => {
  it("renders inactive (aria-pressed=false, data-active=false) by default (Phase 07)", () => {
    render(<HeartButton heartCount={3} canHeart />);

    const button = screen.getByTestId("kudos-card-heart-btn");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("data-active", "false");
    expect(button).toHaveTextContent("3");
  });

  it("renders active (aria-pressed=true, data-active=true) when liked=true (Phase 07, TC 7a7ec63e)", () => {
    render(<HeartButton heartCount={4} canHeart liked />);

    const button = screen.getByTestId("kudos-card-heart-btn");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-active", "true");
  });

  it("calls onToggleHeart on click when canHeart=true", () => {
    const onToggleHeart = vi.fn();
    render(<HeartButton heartCount={0} canHeart onToggleHeart={onToggleHeart} />);

    fireEvent.click(screen.getByTestId("kudos-card-heart-btn"));
    expect(onToggleHeart).toHaveBeenCalledOnce();
  });

  it("stays disabled and never fires onToggleHeart when canHeart=false (BR-005, sender's own kudos)", () => {
    const onToggleHeart = vi.fn();
    render(<HeartButton heartCount={0} canHeart={false} onToggleHeart={onToggleHeart} />);

    const button = screen.getByTestId("kudos-card-heart-btn");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onToggleHeart).not.toHaveBeenCalled();
  });
});
