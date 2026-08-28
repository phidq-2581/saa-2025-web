import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "../site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("renders initials when avatarUrl is null (A4, mirrors TC GUI-009)", () => {
    render(
      <SiteHeader
        variant="authed"
        locale="vi"
        user={{ fullName: "Nguyen Van A", avatarUrl: null, role: "member" }}
      />,
    );
    expect(screen.getByLabelText("Nguyen Van A")).toHaveTextContent("NA");
  });

  it("renders no account trigger for the guest variant", () => {
    render(<SiteHeader variant="guest" locale="vi" />);
    expect(screen.queryByTestId("account-trigger")).not.toBeInTheDocument();
  });

  it("renders no notification bell or account trigger for the guest variant (bell is the authenticated delta, TC ID-0/ID-1/ID-11)", () => {
    render(<SiteHeader variant="guest" locale="vi" />);
    expect(screen.queryByTestId("notification-bell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("account-trigger")).not.toBeInTheDocument();
  });

  it("renders the notification bell and account trigger for the authed variant, badge hidden at unreadCount 0", () => {
    render(
      <SiteHeader
        variant="authed"
        locale="vi"
        unreadCount={0}
        user={{ fullName: "Nguyen Van A", avatarUrl: null, role: "member" }}
      />,
    );
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
    expect(screen.getByTestId("account-trigger")).toBeInTheDocument();
  });

  it("shows a Dashboard item for admin but not for member", async () => {
    const { rerender } = render(
      <SiteHeader
        variant="authed"
        locale="vi"
        user={{ fullName: "Admin User", avatarUrl: null, role: "admin" }}
      />,
    );
    screen.getByTestId("account-trigger").click();
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();

    rerender(
      <SiteHeader
        variant="authed"
        locale="vi"
        user={{ fullName: "Member User", avatarUrl: null, role: "member" }}
      />,
    );
    screen.getByTestId("account-trigger").click();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
