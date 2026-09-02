import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FEED_PAGES, HIGHLIGHT_SLIDES } from "@/components/kudos/board/design-sample-data";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import { KudosDetailView } from "@/components/kudos/detail/kudos-detail-view";

type KudosDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * `/kudos/[id]` -- decision-sourced detail screen, no MoMorph frame of its
 * own (clarifications.md 2026-08-31 "trang detail tối thiểu ... tái dùng
 * component card"). This phase resolves `id` against the exact same
 * design-sourced sample data `/kudos` itself renders from
 * (`HIGHLIGHT_SLIDES`/`FEED_PAGES`, ids `sample-kudos-1`..`13`); Phase 07
 * swaps this lookup for a real `getKudosById` query without touching
 * `KudosDetailView` (BR-001: this route is guarded purely by its absence
 * from `PUBLIC_ROUTES`, no guard code added here).
 */
function findSampleKudosById(id: string): KudosCardSample | null {
  // `FEED_PAGES` is typed `FeedPage[]` (`items: KudosCardView[]`) at its
  // export boundary, but `sample-cards.ts` actually builds every item as a
  // `KudosCardSample` -- the cast reflects that real runtime shape, same
  // as `HIGHLIGHT_SLIDES`'s own (unwidened) `KudosCardSample[]` type.
  const feedItems = FEED_PAGES.flatMap((page) => page.items) as KudosCardSample[];
  const all: KudosCardSample[] = [...HIGHLIGHT_SLIDES, ...feedItems];
  return all.find((card) => card.id === id) ?? null;
}

export default async function KudosDetailPage({ params }: KudosDetailPageProps) {
  const { id } = await params;
  const view = findSampleKudosById(id);

  if (!view) {
    // No dedicated "kudos not found" copy exists this round -- reuses the
    // site's own `common.notFound` catalogue (same strings as
    // `src/app/not-found.tsx`) rather than inventing new text.
    const t = await getTranslations("common.notFound");
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <div data-testid="kudos-detail-notfound" className="flex flex-col items-center gap-4">
          <p className="font-body text-sm font-bold uppercase tracking-widest text-gold">{t("title")}</p>
          <p className="max-w-md font-body text-base text-white/80">{t("description")}</p>
          <Link
            href="/"
            className="mt-2 rounded-pill border border-border-gold px-6 py-3 font-body text-sm font-bold text-gold"
          >
            {t("backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col items-center px-4 py-16">
      <KudosDetailView view={view} truncate={false} />
    </main>
  );
}
