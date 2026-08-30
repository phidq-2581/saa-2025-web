# Code Standards — SAA 2025 Web

## Language & naming

- Code, comments, commit messages: **English**.
- Files: **kebab-case** (`login-form.tsx`, `use-session.ts`). Components export PascalCase.
- Every code file **< 200 lines** — split into modules/components before it grows past that. E2E spec and support files under `e2e/` count toward this rule too (split by concern rather than by screen once one file would cross it — see `e2e/integration-flows.spec.ts` / `integration-locale-countdown.spec.ts`), and must pass `npm run typecheck` (e.g. a typed `import { type Cookie } from "@playwright/test"` rather than an untyped literal).

## Components

- Server Components by default; add `"use client"` only when interaction requires it.
- Composition over inheritance. Extract utilities into `src/lib/`.
- Mock data must come from the Figma design content itself — never invented.
- Visual values (colors, spacing, font, radius, shadow) come from MoMorph MCP — never guessed, and are expressed as Tailwind v4 `@theme` tokens (`--color-*`, `--radius-*`, `--font-*` in `src/app/globals.css`), not inline hex/pixel values in components.
- MoMorph text content comes from `get_node().character` on the actual text node — never a component instance's `itemName`, which stays whatever the master component was last named and does not reflect a per-instance text override (verified wrong on 5 of 6 award cards).
- A deferred/inert control (no destination this round) renders as `<button type="button" aria-disabled="true" tabIndex={-1} className="cursor-default ...">` — never a `<span role="button">` or an `<a>` with no `href`. Keeps it visibly styled and out of the tab order.
- Inside a column already capped to its exact design width (e.g. `max-w-[1224px]`), the mobile gutter is `px-4 md:px-0` — padding is a narrow-viewport concern only, never stacked on top of the max-width at `md`+.
- A hero's background image/gradient layers that bleed outside their own section's flow height need `-z-10` (not `z-0`/omitted) so they sit behind the section's content without adding to document flow height.
- Structural E2E/component hooks use `data-testid` (e.g. `site-header`, `site-footer`, `fab-toggle`, `fab-menu`) rather than text or CSS selectors, so copy changes don't break tests.
- An icon-only interactive element carries a visually-hidden `sr-only` label (see `fab-widget.tsx`'s "Hủy" button) so it stays screen-reader- and Playwright-text-matchable without showing visible text.

## Testing

- TDD for behavior: failing test first (real RED), minimal code to GREEN.
- Unit/component: Vitest, colocated in `__tests__/` next to the code under test.
- E2E: Playwright specs in `e2e/`, one durable spec per screen flow.
- Never weaken an assertion to make a test pass. No fake/mocked data to force green.
- A visual-QA claim needs measured probes, not eyeballing a screenshot: rendered `getBoundingClientRect()` vs. the MCP node's `x`/`width`, computed font styles vs. `get_node().styles`, `document.elementFromPoint()` for occlusion/z-index bugs, and full page height vs. the Figma frame height.

## Auth & i18n conventions

- OAuth is only ever started from a `"use server"` Server Action (`src/app/login/actions.ts`) — never rendered/called directly from a Server Component. `signInWithOAuth` writes a PKCE `code_verifier` cookie through `createClient()`'s `setAll`, which silently no-ops outside an action/route-handler context; calling it from a Server Component drops the verifier cookie and the later code exchange fails with an unrelated-looking error.
- The route guard lives at `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`), not the repo root — this project's App Router is under `src/`.
- Server-side session checks use `supabase.auth.getClaims()`, never `getSession()`/`getUser()` (Supabase's current guidance for proxy/server code).
- Every redirect that carries a caller-supplied path goes through `safeNext()` (`src/lib/auth/safe-next.ts`) first — never interpolate a `next`/return-path query param straight into a redirect URL.
- ESLint enforces `src/** must not import from e2e/**` (`eslint.config.mjs`) — the Supabase service-role key lives only under `e2e/support/**`.
- E2E specs covering an authenticated route use the `authenticatedPage`/`adminPage` fixtures from `e2e/support/authenticated-fixture.ts` (real seeded Supabase sessions) rather than mocked cookies.
- E2E env (`SUPABASE_SECRET_KEY`, etc.) loads via `dotenv` in `playwright.config.ts` from `.env.local` — Playwright's Node process doesn't inherit Next's own env loading.
- No `console.log` outside an `E2E_DEBUG`-gated block (see `e2e/session-fixture.spec.ts`).
- Logout submits a plain `<form method="post" action="/auth/sign-out">` to a Route Handler, never a Server Action prop — a Server Action's `redirect()` is a soft, client-side navigation that can race the response's `Set-Cookie` headers against the URL update (verified empirically, reproducibly 0/3); a hard, full-page form POST is atomic for the browser (3/3). A Route Handler gets no automatic same-origin check the way a Server Action does, so it must verify the `Origin` header itself, and should respond `303 See Other` (not the default 307) so the browser follows with `GET` instead of re-POSTing the form body.
- A next-intl `onSelectLocale`/similar callback handed to a Client Component must be a Server Action *reference* (e.g. `export async function selectLocaleAction(...)`), never an inline closure defined inside a Server Component.
- An `en/*.json` catalogue key with no confirmed Figma EN source falls back to the Vietnamese design text at runtime — never a `[VN]`-prefixed placeholder, which would leak to English-locale visitors. Log the gap in `docs/test-traceability.md` instead.

## Quality gate (every phase)

```sh
npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build
```

## Git

- Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`), no AI references.
- Never commit secrets — `.env.local` is gitignored; only `.env.example` is tracked.
