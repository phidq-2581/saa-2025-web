import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginErrorNotice } from "../login-error-notice";

describe("LoginErrorNotice", () => {
  it("renders the OAuth-failure message for a known error code (TC US002 AS1)", () => {
    render(<LoginErrorNotice errorCode="domain" />);
    expect(screen.getByTestId("login-error-notice")).toHaveTextContent(
      "Đăng nhập không thành công. Vui lòng thử lại.",
    );
  });

  it("renders nothing when errorCode is undefined", () => {
    render(<LoginErrorNotice />);
    expect(screen.queryByTestId("login-error-notice")).not.toBeInTheDocument();
  });

  it("renders nothing for an unrecognized error code", () => {
    render(<LoginErrorNotice errorCode="not_a_real_code" />);
    expect(screen.queryByTestId("login-error-notice")).not.toBeInTheDocument();
  });
});
