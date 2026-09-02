import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { ComposeFooter } from "../compose-footer";
import { renderWithComposeIntl } from "./render-with-compose-intl";

describe("ComposeFooter", () => {
  it("disables Gửi when submitDisabled is true", () => {
    renderWithComposeIntl(
      <ComposeFooter submitDisabled={true} onCancel={vi.fn()} onSubmit={vi.fn()} />,
    );
    expect(screen.getByTestId("kudos-compose-submit")).toBeDisabled();
  });

  it("enables Gửi and fires onSubmit when submitDisabled is false", () => {
    const onSubmit = vi.fn();
    renderWithComposeIntl(
      <ComposeFooter submitDisabled={false} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );
    const submit = screen.getByTestId("kudos-compose-submit");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("fires onCancel when Hủy is clicked", () => {
    const onCancel = vi.fn();
    renderWithComposeIntl(
      <ComposeFooter submitDisabled={false} onCancel={onCancel} onSubmit={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId("kudos-compose-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
