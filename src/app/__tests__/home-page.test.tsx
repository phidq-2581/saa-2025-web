import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import Home from "../(site)/page";

describe("Home page", () => {
  // Phase 07: `HeroSection` renders `EventCountdownLive`, which reads
  // `NEXT_PUBLIC_EVENT_START_AT` and ticks for real (BR-005) -- unlike the
  // Phase 05-era eternal `00/00/00, reached: false` placeholder, so the
  // countdown-specific test below stubs the env var and re-imports the page
  // fresh per case rather than relying on the top-level static import.
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });


  it("renders the hero heading and the main landmark", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ROOT FURTHER" })).toBeInTheDocument();
  });

  it("renders exactly 6 award cards, each linking to /he-thong-giai#{slug}", () => {
    render(<Home />);
    const cards = screen.getAllByTestId("award-card");
    expect(cards).toHaveLength(6);

    for (const category of AWARD_CATEGORIES) {
      const card = cards.find((el) => el.dataset.slug === category.slug);
      expect(card).toBeDefined();
      const link = card!.querySelector("a");
      expect(link).toHaveAttribute("href", `/he-thong-giai#${category.slug}`);
    }
  });

  it("renders the deferred CTA/detail affordances", () => {
    render(<Home />);
    expect(screen.getByTestId("cta-about-awards")).toHaveAttribute("href", "/he-thong-giai");
    expect(screen.getByTestId("cta-about-kudos")).not.toHaveAttribute("href");
    expect(screen.getByTestId("kudos-promo-detail")).not.toHaveAttribute("href");
  });

  it("shows a live not-reached countdown with Coming soon visible before the event (BR-003)", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENT_START_AT", "2999-01-01T00:00:00+07:00");
    const { default: FreshHome } = await import("../(site)/page");

    render(<FreshHome />);

    expect(screen.getByTestId("countdown-days")).toBeInTheDocument();
    expect(screen.getByTestId("coming-soon-label")).toBeInTheDocument();
  });

  it("hides Coming soon once the event has passed (BR-003, BR-002)", async () => {
    vi.stubEnv("NEXT_PUBLIC_EVENT_START_AT", "2000-01-01T00:00:00+07:00");
    const { default: FreshHome } = await import("../(site)/page");

    render(<FreshHome />);

    expect(screen.getByTestId("countdown-days")).toHaveTextContent("00");
    expect(screen.queryByTestId("coming-soon-label")).not.toBeInTheDocument();
  });
});
