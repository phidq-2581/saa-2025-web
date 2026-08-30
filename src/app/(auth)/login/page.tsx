import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { signInWithGoogle } from "@/app/login/actions";
import { LoginHero } from "@/components/login/login-hero";
import { GoogleSignInButton } from "@/components/login/google-sign-in-button";
import { LoginErrorNotice } from "@/components/login/login-error-notice";

/**
 * Per-page title + description, localised from design content only
 * (clarifications.md § SEO). Title stays the static brand string
 * (locale-invariant); description mirrors the hero's own copy.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return {
    title: "ROOT FURTHER | Sun* Annual Awards 2025",
    description: t("heroSubtitle"),
  };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

/**
 * `/login` (GzbNeVGJHz). Reads `error` for the OAuth-failure banner and
 * `next` to thread the post-login redirect target through
 * `signInWithGoogle` -- both round-trip via `src/app/auth/callback/route.ts`
 * (Phase 03), out of scope here. Next.js 16 makes `searchParams` a
 * Promise, so it must be awaited before use.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, t] = await Promise.all([searchParams, getTranslations("login")]);
  const errorCode = firstValue(params.error);
  const next = firstValue(params.next);

  return (
    <LoginHero>
      <LoginErrorNotice errorCode={errorCode} />
      <GoogleSignInButton
        action={signInWithGoogle}
        label={t("googleButtonLabel")}
        next={next}
      />
    </LoginHero>
  );
}
