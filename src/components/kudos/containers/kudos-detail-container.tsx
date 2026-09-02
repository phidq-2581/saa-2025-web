import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getKudosById } from "@/lib/kudos/queries/get-kudos-by-id";
import { resolveImageUrls } from "@/lib/kudos/queries/resolve-image-urls";
import { getReceivedKudosCounts } from "@/lib/kudos/queries/get-received-kudos-counts";
import { createClient } from "@/lib/supabase/server";
import type { AuthorPresentation, HeroTier } from "@/components/kudos/board/kudos-board-types";
import { deriveAsteriskTier, type AsteriskTier } from "@/lib/kudos/derive/asterisk-tier";
import { KudosDetailView } from "@/components/kudos/detail/kudos-detail-view";

export interface KudosDetailContainerProps {
  id: string;
}

/** See `kudos-board-container.tsx`'s own doc for the hero-tier/asterisk-
 * tier reasoning (reuses the approved 10/20/50 milestone rule) and the
 * department gap. Duplicated here rather than shared across containers --
 * a handful of lines, two call sites, not worth a cross-container module. */
const HERO_TIER_BY_ASTERISK: Record<AsteriskTier, HeroTier> = { 0: "new", 1: "rising", 2: "super", 3: "legend" };

function buildAuthorMeta(userId: string, receivedCounts: ReadonlyMap<string, number>): AuthorPresentation {
  const asteriskTier = deriveAsteriskTier(receivedCounts.get(userId) ?? 0);
  return { department: "", heroTier: HERO_TIER_BY_ASTERISK[asteriskTier], asteriskTier };
}

/**
 * `/kudos/[id]` (F006, clarifications.md 2026-08-31 "trang detail tối
 * thiểu ... tái dùng component card"). Owns both the found and not-found
 * root markup so `page.tsx` stays a thin route-param pass-through
 * (BR-001: this route is guarded purely by absence from `PUBLIC_ROUTES`,
 * no guard code added here).
 */
export async function KudosDetailContainer({ id }: KudosDetailContainerProps) {
  const view = await getKudosById(id);

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

  const supabase = await createClient();
  const [imagePaths, receivedCounts, claimsResult] = await Promise.all([
    resolveImageUrls(supabase, view.imagePaths),
    getReceivedKudosCounts(supabase),
    supabase.auth.getClaims(),
  ]);
  const sample = {
    ...view,
    imagePaths,
    senderMeta: buildAuthorMeta(view.sender.id, receivedCounts),
    receiverMeta: buildAuthorMeta(view.receiver.id, receivedCounts),
  };
  const currentViewerId = (claimsResult.data?.claims?.sub as string | undefined) ?? "";

  return (
    <main className="flex w-full flex-col items-center px-4 py-16">
      <KudosDetailView view={sample} truncate={false} currentViewerId={currentViewerId} />
    </main>
  );
}
