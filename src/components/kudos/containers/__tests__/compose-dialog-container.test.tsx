import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import composeVi from "../../../../../messages/vi/compose.json";
import { ComposeDialogContainer } from "../compose-dialog-container";
import { submitKudos } from "@/lib/kudos/write/submit-kudos";

const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: routerRefresh, replace: vi.fn() }),
}));

vi.mock("@/lib/kudos/write/submit-kudos", () => ({
  submitKudos: vi.fn(),
}));

// `KudosComposeDialog` drives a real TipTap editor -- the project's own
// convention (`compose/__tests__/*.test.tsx`) is to unit-test its pieces
// in isolation and leave the full contenteditable flow to E2E. This stub
// exercises exactly the logic `ComposeDialogContainer` itself adds
// (self-kudos guard, error mapping, success wiring) without driving TipTap.
vi.mock("@/components/kudos/compose/kudos-compose-dialog", () => ({
  KudosComposeDialog: ({ open, onSubmit, errorMessage }: {
    open: boolean;
    onSubmit: (draft: unknown) => Promise<void>;
    errorMessage?: string | null;
  }) => {
    if (!open) return null;
    const draft = { content: { type: "doc", content: [] }, hashtagIds: ["h1"], files: [], isAnonymous: false, anonymousDisplayName: "" };
    // Mirrors `KudosComposeDialog.handleSubmit`'s own catch (it swallows a
    // rejected `onSubmit` -- the caller already surfaced its own
    // `errorMessage` before throwing); replicated here since this stub
    // fully replaces that component for this suite.
    const submit = (receiverId: string) => {
      onSubmit({ ...draft, receiverId }).catch(() => {});
    };
    return (
      <div data-testid="stub-dialog">
        {errorMessage ? <p data-testid="stub-error">{errorMessage}</p> : null}
        <button onClick={() => submit("receiver-1")}>submit-other</button>
        <button onClick={() => submit("viewer-1")}>submit-self</button>
      </div>
    );
  },
}));

function renderContainer(overrides: Partial<Parameters<typeof ComposeDialogContainer>[0]> = {}) {
  const onClose = vi.fn();
  const onSubmitted = vi.fn();
  render(
    <NextIntlClientProvider locale="vi" messages={{ compose: composeVi }}>
      <ComposeDialogContainer
        open
        onClose={onClose}
        recipients={[]}
        hashtags={[]}
        currentViewerId="viewer-1"
        onSubmitted={onSubmitted}
        {...overrides}
      />
    </NextIntlClientProvider>,
  );
  return { onClose, onSubmitted };
}

describe("ComposeDialogContainer", () => {
  afterEach(() => {
    vi.mocked(submitKudos).mockReset();
    routerRefresh.mockReset();
  });

  it("rejects a self-kudos draft client-side without calling submitKudos (Group-3 checkpoint decision)", async () => {
    const { onSubmitted } = renderContainer();

    fireEvent.click(screen.getByText("submit-self"));

    expect(await screen.findByTestId("stub-error")).toHaveTextContent(composeVi.selfKudosError);
    expect(submitKudos).not.toHaveBeenCalled();
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("submits, refreshes and calls onSubmitted on a successful draft (happy path)", async () => {
    vi.mocked(submitKudos).mockResolvedValue({ ok: true, id: "new-kudos-id" });
    const { onSubmitted } = renderContainer();

    fireEvent.click(screen.getByText("submit-other"));

    await vi.waitFor(() => expect(onSubmitted).toHaveBeenCalledOnce());
    expect(submitKudos).toHaveBeenCalledWith(expect.objectContaining({ senderId: "viewer-1", receiverId: "receiver-1" }));
    expect(routerRefresh).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("stub-error")).not.toBeInTheDocument();
  });

  it("surfaces the mapped error message and does not resolve onSubmitted when submitKudos fails", async () => {
    vi.mocked(submitKudos).mockResolvedValue({ ok: false, code: "upload-failed", failedIndex: 0 });
    const { onSubmitted } = renderContainer();

    fireEvent.click(screen.getByText("submit-other"));

    expect(await screen.findByTestId("stub-error")).toHaveTextContent(composeVi.uploadError);
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
