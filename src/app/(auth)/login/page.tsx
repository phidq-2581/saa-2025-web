import type { Metadata } from "next";
import { signInWithGoogle } from "@/app/login/actions";
import { LoginHero } from "@/components/login/login-hero";
import { GoogleSignInButton } from "@/components/login/google-sign-in-button";
import { LoginErrorNotice } from "@/components/login/login-error-notice";

export const metadata: Metadata = {
  title: "ROOT FURTHER | Sun* Annual Awards 2025",
  description: "Bắt đầu hành trình của bạn cùng SAA 2025.",
};

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
  const params = await searchParams;
  const errorCode = firstValue(params.error);
  const next = firstValue(params.next);

  return (
    <LoginHero>
      <LoginErrorNotice errorCode={errorCode} />
      <GoogleSignInButton action={signInWithGoogle} label="LOGIN With Google" next={next} />
    </LoginHero>
  );
}
