import type { Metadata } from "next";
import { AwardGrid } from "@/components/homepage/award-grid";
import type { CountdownRemaining } from "@/components/homepage/event-countdown";
import { HeroSection } from "@/components/homepage/hero-section";
import { KudosPromo } from "@/components/homepage/kudos-promo";
import { RootFurtherBlock } from "@/components/homepage/root-further-block";
import homeCopy from "../../../messages/vi/home.json";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: homeCopy.awards.subDescription,
};

/**
 * BR-005_CountdownClientOnlyHydration: the server always renders this
 * `00/00/00`, `reached: false` placeholder; Phase 07's `useCountdown`
 * (src/lib/countdown/use-countdown.ts) takes over on the client and feeds
 * the real remaining time into `EventCountdown` without changing this
 * page's composition.
 */
const SERVER_PLACEHOLDER: CountdownRemaining = {
  days: "00",
  hours: "00",
  minutes: "00",
  reached: false,
};

/**
 * Homepage SAA body (MoMorph i87tDx10uM), sections R1-R5 per
 * docs/screens/SCR005_Homepage/spec.md: hero+countdown+event info, Root
 * Further description, awards title+grid, Kudos promo. Header/footer/FAB
 * come from the `(site)` route group layout (src/app/(site)/layout.tsx),
 * which renders no `<main>` of its own -- this page owns the landmark.
 */
export default function Home() {
  return (
    <main className="flex w-full flex-col">
      <HeroSection remaining={SERVER_PLACEHOLDER} />
      <RootFurtherBlock />
      <AwardGrid />
      <KudosPromo />
    </main>
  );
}
