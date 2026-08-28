import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // S4 (red-team security-adversary): src/** must never import from e2e/**
  // -- e2e/support/** holds the service-role key (SUPABASE_SECRET_KEY);
  // an accidental src/ import would pull it into the app bundle.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/e2e/**", "**/e2e", "e2e/**", "e2e"],
              message:
                "src/** must not import from e2e/** (S4) -- e2e/support/** holds the service-role key.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-app directories in this repo:
    ".claude/**",
    "supabase/**",
    "resources/**",
    "plans/**",
    "test-results/**",
    "playwright-report/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
