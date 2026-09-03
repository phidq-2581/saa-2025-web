import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import kudosVi from "../../../../../messages/vi/kudos.json";
import { KudosFeedContainer, type SampleFeedPage } from "../kudos-feed-container";
import { toggleHeart } from "@/lib/kudos/write/toggle-heart-action";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import type { KudosFilterValue } from "@/components/kudos/board/filter-bar";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh, replace: vi.fn() }),
}));

vi.mock("@/lib/kudos/write/toggle-heart-action", () => ({
  toggleHeart: vi.fn(),
}));

// Not under test here (covered by its own suite) and pulls in d3-cloud /
// ResizeObserver, which jsdom doesn't provide -- same reasoning `board/**`
// already applies by never unit-testing `SpotlightBoard` directly.
vi.mock("@/components/kudos/board/spotlight-board", () => ({
  SpotlightBoard: () => <div data-testid="stub-spotlight" />,
}));

vi.mock("./compose-dialog-container", () => ({
  ComposeDialogContainer: () => null,
}));

function buildCard(id: string, overrides: Partial<KudosCardSample> = {}): KudosCardSample {
  return {
    id,
    sender: { id: "sender-1", fullName: "Sender", avatarUrl: null },
    receiver: { id: "receiver-1", fullName: "Receiver", avatarUrl: null },
    content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Great work" }] }] },
    isAnonymous: false,
    anonymousDisplayName: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    heartCount: 2,
    hashtags: [{ id: "h1", name: "Aim High" }],
    imagePaths: [],
    senderMeta: { department: "", heroTier: "new", asteriskTier: 0 },
    receiverMeta: { department: "", heroTier: "new", asteriskTier: 0 },
    ...overrides,
  };
}

const BASE_PROPS = {
  currentViewerId: "viewer-1",
  filterValue: { hashtagId: null, department: null } as KudosFilterValue,
  filterOptions: { hashtags: [{ id: "h1", name: "Aim High" }], departments: ["Eng"] },
  highlightSlides: [] as KudosCardSample[],
  spotlightNodes: [],
  spotlightTotal: 0,
  initialFeedPage: { items: [buildCard("feed-1")], nextOffset: 10 } satisfies SampleFeedPage,
  sidebarStats: {
    kudosReceivedCount: 0,
    kudosSentCount: 0,
    heartsReceivedCount: 0,
    secretBoxOpenedCount: 0,
    secretBoxUnopenedCount: 0,
    asteriskTier: 0 as const,
    heartsDoubled: false,
    campaign: null,
  },
  rankPromotions: [],
  giftRecipients: [],
  recipients: [],
  loadMoreAction: vi.fn(),
};

function renderContainer(overrides: Partial<typeof BASE_PROPS> = {}) {
  return render(
    <NextIntlClientProvider locale="vi" messages={{ kudos: kudosVi }}>
      <KudosFeedContainer {...BASE_PROPS} {...overrides} />
    </NextIntlClientProvider>,
  );
}

describe("KudosFeedContainer", () => {
  // jsdom doesn't implement the Clipboard API; `copy-link-button.tsx`
  // (Track A, untouched) calls `navigator.clipboard.writeText` directly.
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

  afterEach(() => {
    routerPush.mockReset();
    routerRefresh.mockReset();
    vi.mocked(toggleHeart).mockReset();
  });

  it("renders the initial feed page's card", () => {
    renderContainer();
    expect(screen.getByTestId("kudos-card-content")).toHaveTextContent("Great work");
  });

  it("load more calls loadMoreAction with the current offset/filter and appends the returned items", async () => {
    const loadMoreAction = vi.fn().mockResolvedValue({
      items: [buildCard("feed-2", { content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Second card" }] }] } })],
      nextOffset: null,
    });
    renderContainer({ loadMoreAction, filterValue: { hashtagId: "h1", department: null } });

    fireEvent.click(screen.getByText(kudosVi.allKudos.loadMore));

    expect(loadMoreAction).toHaveBeenCalledWith({ offset: 10, hashtagId: "h1", department: null });
    expect(await screen.findByText("Second card")).toBeInTheDocument();
  });

  it("toggling a heart calls the server action, applies the returned count, and refreshes (TC 7a7ec63e)", async () => {
    vi.mocked(toggleHeart).mockResolvedValue({ ok: true, liked: true, heartCount: 3, grantedAmount: 1 });
    renderContainer();

    fireEvent.click(screen.getByTestId("kudos-card-heart-btn"));

    expect(toggleHeart).toHaveBeenCalledWith("feed-1");
    await vi.waitFor(() => expect(screen.getByTestId("kudos-card-heart-btn")).toHaveTextContent("3"));
    expect(screen.getByTestId("kudos-card-heart-btn")).toHaveAttribute("aria-pressed", "true");
    expect(routerRefresh).toHaveBeenCalledOnce();
  });

  it("does not update local state when the toggle action reports a failure", async () => {
    vi.mocked(toggleHeart).mockResolvedValue({ ok: false, code: "toggle-failed" });
    renderContainer();

    fireEvent.click(screen.getByTestId("kudos-card-heart-btn"));

    await vi.waitFor(() => expect(toggleHeart).toHaveBeenCalledOnce());
    expect(screen.getByTestId("kudos-card-heart-btn")).toHaveTextContent("2");
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("selecting a hashtag filter navigates to /kudos with the hashtag query param (TC 0e56cacb)", () => {
    renderContainer();

    fireEvent.click(screen.getByTestId("hashtag-filter-trigger"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Aim High/ }));

    expect(routerPush).toHaveBeenCalledWith("/kudos?hashtag=h1");
  });

  it("copying a link shows the verbatim toast text (TC 0adfd7ce)", () => {
    renderContainer();

    fireEvent.click(screen.getByTestId("kudos-card-copy-link-btn"));

    expect(screen.getByTestId("toast")).toHaveTextContent(kudosVi.card.copyLinkToast);
  });
});
