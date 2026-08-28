import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "../google-sign-in-button";

describe("GoogleSignInButton", () => {
  it("renders the label and a visible Google icon, enabled by default (TC 6ae76d15)", () => {
    render(<GoogleSignInButton action={vi.fn()} label="LOGIN With Google" />);

    const button = screen.getByTestId("google-sign-in-button");
    expect(button).toHaveTextContent("LOGIN With Google");
    expect(button).toBeEnabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("mirrors next into a hidden input for the bound server action", () => {
    render(
      <GoogleSignInButton
        action={vi.fn()}
        label="LOGIN With Google"
        next="/he-thong-giai"
      />,
    );

    const hiddenInput = document.querySelector('input[name="next"]');
    expect(hiddenInput).toHaveValue("/he-thong-giai");
  });
});
