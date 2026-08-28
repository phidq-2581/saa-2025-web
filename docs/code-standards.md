# Code Standards — SAA 2025 Web

## Language & naming

- Code, comments, commit messages: **English**.
- Files: **kebab-case** (`login-form.tsx`, `use-session.ts`). Components export PascalCase.
- Every code file **< 200 lines** — split into modules/components before it grows past that.

## Components

- Server Components by default; add `"use client"` only when interaction requires it.
- Composition over inheritance. Extract utilities into `src/lib/`.
- Mock data must come from the Figma design content itself — never invented.
- Visual values (colors, spacing, font, radius, shadow) come from MoMorph MCP — never guessed.

## Testing

- TDD for behavior: failing test first (real RED), minimal code to GREEN.
- Unit/component: Vitest, colocated in `__tests__/` next to the code under test.
- E2E: Playwright specs in `e2e/`, one durable spec per screen flow.
- Never weaken an assertion to make a test pass. No fake/mocked data to force green.

## Quality gate (every phase)

```sh
npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build
```

## Git

- Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`), no AI references.
- Never commit secrets — `.env.local` is gitignored; only `.env.example` is tracked.
