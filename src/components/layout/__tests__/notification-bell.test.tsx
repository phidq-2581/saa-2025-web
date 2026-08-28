import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationBell } from "../notification-bell";

describe("NotificationBell", () => {
  it("hides the badge when unreadCount is 0 (TC ID-28)", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });

  it("shows the badge when unreadCount is above 0 (TC ID-29)", () => {
    render(<NotificationBell unreadCount={3} />);
    expect(screen.getByTestId("notification-badge")).toBeInTheDocument();
  });
});
