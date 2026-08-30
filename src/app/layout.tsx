import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { montserrat, montserratAlternates } from "@/lib/fonts";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Sun* Annual Awards 2025",
};

/**
 * Html/body shell only -- no header/footer/FAB here. Those live in the
 * `(site)` route group's layout so `/login` (the `(auth)` route group)
 * can render its own minimal header/footer per the login spec.
 *
 * `AppProviders` (next-intl's `NextIntlClientProvider`) wraps `children`
 * here, once, at the root -- both route groups need `useTranslations`.
 * `lang` is resolved from the same `NEXT_LOCALE` cookie `AppProviders`
 * reads, so the `<html>` tag's declared language always matches the
 * rendered copy.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${montserratAlternates.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
