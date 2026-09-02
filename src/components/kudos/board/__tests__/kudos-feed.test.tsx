import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test-utils/render-with-intl";
import { KudosFeed } from "../kudos-feed";

describe("KudosFeed", () => {
  it("renders the empty-state copy 'Hiện tại chưa có Kudos nào.' when pages is empty (spec C.2, TC 926d92a5/d035e3b8)", () => {
    renderWithIntl(<KudosFeed pages={[]} />);

    expect(screen.getByTestId("kudos-feed-empty")).toHaveTextContent("Hiện tại chưa có Kudos nào.");
    expect(screen.queryByTestId("kudos-feed")).not.toBeInTheDocument();
  });
});
