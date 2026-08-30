"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { AwardCategory } from "@/lib/awards/award-categories";
import { resolveActiveSlug } from "./resolve-active-slug";
import awards from "../../../messages/vi/awards.json";

type AwardCategoryNavProps = {
  categories: readonly AwardCategory[];
};

function subscribeToHashChange(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashSnapshot() {
  return window.location.hash;
}

// Empty on the server AND on the client's first (hydration) render, so
// SSR output and the initial client render always agree -- BR-002's real
// hash read happens in `useSyncExternalStore`'s own post-mount resync,
// the same guarantee `src/lib/countdown/use-countdown.ts` already relies
// on for its `BR-005_CountdownClientOnlyHydration` placeholder swap. An
// earlier version of this component read `window.location.hash` from a
// lazy `useState` initializer instead; that produces a *different* value
// on the client's hydration render than on the server, which triggers a
// React hydration-attribute-mismatch that is logged but never patched
// into the DOM (verified against BR-002's RED test), leaving the nav
// permanently stuck inactive.
function getServerHashSnapshot() {
  return "";
}

// Row height per `get_node` on each C.1-C.6 child of `mms_C_Menu list`
// (313:8459): every item is 56px tall (single-line label) except the two
// whose label wraps to 2 lines in the design -- C.3 "Top Project\nLeader"
// (313:8462, endY919-startY847=72) and C.5 "Signature 2025 \nCreator"
// (313:8464, endY1079-startY1007=72). `h-14`(56)/`h-18`(72) + `p-4`(16px,
// matches each node's own padding) leaves exactly the design's 24px/40px
// content-row height under Tailwind's border-box default.
const TWO_LINE_ROW_SLUGS = new Set(["top-project-leader", "signature-2025-creator"]);

/**
 * Left menu (MoMorph item C, `mms_C_Menu list`, 313:8459). Every child
 * C.1-C.6 carries exactly one `MM_MEDIA_Target` icon instance (verified
 * per-item via `query_section`/`list_media_nodes` -- no C.x is icon-less),
 * so every item renders the same shared icon asset. Active style (gold
 * text + glow + gold underline) traces to the C.1 instance's own style
 * delta vs C.2-C.6 -- `color: var(--Details-Text-Primary-1, #FFEA9E)` +
 * `text-shadow` glow + `border-bottom: 1px solid #FFEA9E`, which already
 * exist as `--color-gold` / `--shadow-glow-gold` (phase-02 tokens). Items
 * are left-aligned to their own content width (`alignItems: flex-start`
 * on 313:8459, each C.x a different width: 139-178px), not stretched to
 * fill the 178px nav column.
 *
 * Quantity/prize text was removed from these items -- that content lives
 * on `AwardInfoCard` per specs.csv rows C.1-C.6 (label + leading icon
 * only) and per the tester's relocation of the RED test's quantity/prize
 * assertions onto `award-info-card`.
 *
 * Each item is a `<li data-slug>` wrapping a `<button data-slug>` --
 * `aria-current` lives on the inner button so a chained
 * `navItems.locator('[data-slug=...]')` (a descendant query) and a
 * `filter({ has: locator('[aria-current="true"]') })` both resolve; the
 * outer `<li>` still carries `data-slug` itself for a plain
 * `toHaveAttribute` check on `navItems.nth(i)`.
 *
 * Phase 07: `aria-current` is mirrored onto the outer `<li>` too. A
 * SEPARATE consumer (`e2e/integration-flows.spec.ts`'s award-card-click
 * assertion) queries `[data-testid="award-nav-item"][data-slug="..."]` as
 * one compound selector, which resolves to the `<li>` (only it carries
 * `data-testid`) and checks `aria-current` directly on THAT element, not a
 * descendant -- the button-only attribute this component already shipped
 * with (still asserted, unchanged, by `award-system.spec.ts`'s descendant
 * queries) never satisfies that compound-selector read. Duplicating the
 * state onto both elements satisfies both call sites without weakening
 * either; `aria-current` on a non-interactive wrapper is valid ARIA.
 *
 * Active slug = an explicit click (`clickedSlug`) overriding the
 * URL-hash-derived slug, so BR-001 (click marks exactly one item active)
 * and BR-002 (deep-link hash pre-activates on load) share one source of
 * truth without a manual `setState` inside an effect (avoids
 * `react-hooks/set-state-in-effect`); the mount/hash-change effect below
 * only performs the DOM scroll side effect.
 */
export function AwardCategoryNav({ categories }: AwardCategoryNavProps) {
  const hash = useSyncExternalStore(subscribeToHashChange, getHashSnapshot, getServerHashSnapshot);
  const [clickedSlug, setClickedSlug] = useState<string | null>(null);

  const slugs = categories.map((category) => category.slug);
  const hashSlug = resolveActiveSlug(hash, slugs);
  const activeSlug = clickedSlug ?? hashSlug;

  useEffect(() => {
    if (!hashSlug) return;
    document.getElementById(hashSlug)?.scrollIntoView({ block: "start" });
  }, [hashSlug]);

  function handleSelect(slug: string) {
    setClickedSlug(slug);
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav data-testid="award-category-nav" aria-label={awards.nav.ariaLabel} className="md:w-44.5">
      <ul className="flex flex-col items-start gap-1">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          const rowHeight = TWO_LINE_ROW_SLUGS.has(category.slug) ? "h-18" : "h-14";
          return (
            <li
              key={category.slug}
              data-testid="award-nav-item"
              data-slug={category.slug}
              aria-current={isActive ? "true" : undefined}
            >
              <button
                type="button"
                data-slug={category.slug}
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleSelect(category.slug)}
                className={`flex items-center gap-1 rounded-chip p-4 text-left font-body text-sm leading-5 font-bold whitespace-normal ${rowHeight} ${
                  isActive
                    ? "border-b border-gold text-gold text-shadow-(--shadow-glow-gold)"
                    : "text-white"
                }`}
              >
                <img src="/awards/target-icon.svg" alt="" width={24} height={24} />
                {category.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
