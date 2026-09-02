import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import type { HashtagRef } from "@/lib/kudos/types";
import { HashtagPicker } from "../hashtag-picker";
import { renderWithComposeIntl } from "./render-with-compose-intl";

const OPTIONS: HashtagRef[] = Array.from({ length: 6 }, (_, i) => ({
  id: `tag-${i + 1}`,
  name: `Tag ${i + 1}`,
}));

describe("HashtagPicker", () => {
  it("adds a tag as a chip when an option is picked", () => {
    const onChange = vi.fn();
    renderWithComposeIntl(<HashtagPicker selected={[]} options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("kudos-compose-hashtag-add"));
    fireEvent.click(screen.getAllByTestId("kudos-compose-hashtag-option")[0]);
    expect(onChange).toHaveBeenCalledWith([OPTIONS[0]]);
  });

  it("removes a chip via its remove button", () => {
    const onChange = vi.fn();
    renderWithComposeIntl(
      <HashtagPicker selected={[OPTIONS[0]]} options={OPTIONS} onChange={onChange} />,
    );
    fireEvent.click(screen.getByTestId("kudos-compose-hashtag-chip-remove"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("disables unselected options and shows the max error at 5 tags", () => {
    const selected = OPTIONS.slice(0, 5);
    renderWithComposeIntl(
      <HashtagPicker selected={selected} options={OPTIONS} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId("kudos-compose-hashtag-add"));
    const options = screen.getAllByTestId("kudos-compose-hashtag-option");
    expect(options[5]).toBeDisabled();
    // options[0] is already selected, so it stays clickable (unpicking is
    // always allowed) -- clicking it marks the field "touched" without
    // needing a disabled 6th click, which jsdom/testing-library correctly
    // refuses to dispatch on a `disabled` button.
    fireEvent.click(options[0]);
    expect(screen.getByTestId("kudos-compose-hashtag-error")).toHaveTextContent("Tối đa 5 hashtag");
  });
});
