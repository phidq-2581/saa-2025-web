import { useEffect, useRef, useState } from "react";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import type { SampleFeedPage } from "./kudos-feed-container";

export interface UseInfiniteFeedParams {
  initialFeedPage: SampleFeedPage;
  filterValue: { hashtagId: string | null; department: string | null };
  loadMoreAction: (params: {
    offset: number;
    hashtagId: string | null;
    department: string | null;
  }) => Promise<SampleFeedPage>;
}

const SCROLL_NEAR_BOTTOM_PX = 400;

/**
 * Phase 07: the feed's pagination/infinite-scroll state, pulled out of
 * `kudos-feed-container.tsx` to keep that file under the project's 200-line
 * cap. `initialFeedPage` resync uses React's documented "adjust state
 * during render" pattern (not a `useEffect`) so a filter-triggered remount
 * or a post-toggle `router.refresh()` never commits a stale render first.
 */
export function useInfiniteFeed({ initialFeedPage, filterValue, loadMoreAction }: UseInfiniteFeedParams) {
  const [feedPageSeen, setFeedPageSeen] = useState(initialFeedPage);
  const [feedItems, setFeedItems] = useState<KudosCardSample[]>(initialFeedPage.items);
  const [nextOffset, setNextOffset] = useState(initialFeedPage.nextOffset);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  if (initialFeedPage !== feedPageSeen) {
    setFeedPageSeen(initialFeedPage);
    setFeedItems(initialFeedPage.items);
    setNextOffset(initialFeedPage.nextOffset);
  }

  async function handleLoadMore() {
    if (nextOffset === null || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const page = await loadMoreAction({
        offset: nextOffset,
        hashtagId: filterValue.hashtagId,
        department: filterValue.department,
      });
      setFeedItems((current) => [...current, ...page.items]);
      setNextOffset(page.nextOffset);
    } catch (error) {
      console.error("useInfiniteFeed: failed to load more kudos", error);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    function onScroll() {
      if (loadingRef.current || nextOffset === null) return;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_NEAR_BOTTOM_PX;
      if (nearBottom) void handleLoadMore();
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleLoadMore reads the latest offset/filter via closure each call; re-binding the listener only needs to happen when nextOffset changes
  }, [nextOffset]);

  return { feedItems, nextOffset, loadingMore, handleLoadMore };
}
