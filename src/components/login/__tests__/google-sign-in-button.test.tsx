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

  // Phase 07 (reviewer Low #9): `next` travels solely via `action.bind(null,
  // next)` -- a hidden input mirroring the same value was dead markup and
  // has been removed. This asserts the removal, not a re-add.
  it("carries no hidden 'next' input -- next travels only via the bound action", () => {
    render(
      <GoogleSignInButton action={vi.fn()} label="LOGIN With Google" next="/he-thong-giai" />,
    );

    expect(document.querySelector('input[name="next"]')).not.toBeInTheDocument();
  });
});
