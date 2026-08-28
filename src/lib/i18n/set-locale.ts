"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/i18n/request";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * F002 FR-001 / BR-001_LocalePersistence / S5: `locale` arrives over the
 * Server Action network boundary (attacker-controlled, not just
 * TS-narrowed) -- validated here against the same allow-list `request.ts`
 * uses, falling back to `defaultLocale` rather than trusting the caller.
 * Cookie flags: `httpOnly: false` is deliberate -- next-intl's client-side
 * `useLocale()`/hydration reads require a readable cookie.
 */
export async function setLocale(locale: string, pathname: string): Promise<void> {
  const safeLocale = isLocale(locale) ? locale : defaultLocale;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, safeLocale, {
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });

  revalidatePath(pathname);
}
