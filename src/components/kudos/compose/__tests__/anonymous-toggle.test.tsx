import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { AnonymousToggle } from "../anonymous-toggle";
import { renderWithComposeIntl } from "./render-with-compose-intl";

describe("AnonymousToggle", () => {
  it("hides the name field when unchecked", () => {
    renderWithComposeIntl(
      <AnonymousToggle
        checked={false}
        displayName=""
        onCheckedChange={vi.fn()}
        onDisplayNameChange={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("kudos-compose-anonymous-name")).not.toBeInTheDocument();
  });

  it("shows the name field when checked", () => {
    renderWithComposeIntl(
      <AnonymousToggle
        checked={true}
        displayName="Ẩn danh"
        onCheckedChange={vi.fn()}
        onDisplayNameChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId("kudos-compose-anonymous-name")).toHaveValue("Ẩn danh");
  });

  it("discards the display name via onDisplayNameChange when unchecking", () => {
    const onCheckedChange = vi.fn();
    const onDisplayNameChange = vi.fn();
    renderWithComposeIntl(
      <AnonymousToggle
        checked={true}
        displayName="Ẩn danh"
        onCheckedChange={onCheckedChange}
        onDisplayNameChange={onDisplayNameChange}
      />,
    );
    fireEvent.click(screen.getByTestId("kudos-compose-anonymous-checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(onDisplayNameChange).toHaveBeenCalledWith("");
  });
});
