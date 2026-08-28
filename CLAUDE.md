# SAA 2025 Web — Project Instructions

Web app for SAA 2025 built from Figma design + MoMorph screen specs.
MoMorph fileKey: `9ypp4enmFmdK3YAFJLIu6C` (screens on Figma page "Website", spec status Done).

## Stack & commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (http://localhost:3000) |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit/component tests | `npm run test` (Vitest, jsdom) |
| E2E tests | `npm run test:e2e` (Playwright chromium; auto-starts dev server) |
| Supabase local | `supabase start` / `supabase stop` (Docker required) |

Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase
(`@supabase/ssr` — browser client in `src/lib/supabase/client.ts`, server client
in `src/lib/supabase/server.ts`). Env in `.env.local` (gitignored).

## Hard rules

- **Visual values come from MoMorph MCP only** (get_frame / specs). Never guess or
  round colors, spacing, font sizes, radii, shadows, breakpoints.
- **Mock data comes from the Figma design content.** Do not invent data.
- **No fake green**: never mock/stub/weaken assertions to make tests pass.
  A failing test is fixed in the code, not in the test.
- **TDD for behavior**: real failing test (RED, non-zero exit from the screen
  assertion) before implementation, then GREEN with the same command.
- **No duplicate files**: never create `-v2`, `-enhanced`, `-new` copies — edit in place.
- Files kebab-case, each code file **< 200 lines**.
- Code, comments, commit messages in **English**; conventional commits, no AI references.
- After creating/changing a code file, run `npm run typecheck` to catch errors early.
- Quality gate before ending any phase:
  `npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build`
- Never commit secrets. `.env.local`, `.env*` are gitignored; only `.env.example` is tracked.
- Database changes go through `supabase/migrations/*.sql`, never manual mutation.

## Key paths

- Screen specs/test cases (raw, from MoMorph): `docs/momorph/{screen-slug}/`
- Clarified decisions (authoritative): `plans/clarifications.md`
- Docs to keep in sync: `docs/system-architecture.md`, `docs/code-standards.md`,
  `docs/development-roadmap.md`
