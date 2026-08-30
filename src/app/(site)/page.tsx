import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AwardGrid } from "@/components/homepage/award-grid";
import { HeroSection } from "@/components/homepage/hero-section";
import { KudosPromo } from "@/components/homepage/kudos-promo";
import { RootFurtherBlock } from "@/components/homepage/root-further-block";

/**
 * Per-page title + description, localised from design content only
 * (clarifications.md § SEO). The title itself is the static brand name
 * (locale-invariant, matches the root layout's own default); only the
 * description varies by locale.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: "Sun* Annual Awards 2025",
    description: t("awards.subDescription"),
  };
}

/**
 * Homepage SAA body (MoMorph i87tDx10uM), sections R1-R5 per
 * docs/screens/SCR005_Homepage/spec.md: hero+countdown+event info, Root
 * Further description, awards title+grid, Kudos promo. Header/footer/FAB
 * come from the `(site)` route group layout (src/app/(site)/layout.tsx),
 * which renders no `<main>` of its own -- this page owns the landmark.
 *
 * `HeroSection` no longer receives a `remaining` prop: it renders
 * `EventCountdownLive` internally, which itself owns the server-placeholder
 * -> client-tick handoff (BR-005_CountdownClientOnlyHydration).
 */
export default function Home() {
  return (
    <main className="flex w-full flex-col">
      <HeroSection />
      <RootFurtherBlock />
      <AwardGrid />
      <KudosPromo />
    </main>
  );
}
