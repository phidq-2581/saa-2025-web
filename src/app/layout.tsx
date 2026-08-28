import type { Metadata } from "next";
import { montserrat, montserratAlternates } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Sun* Annual Awards 2025",
};

/**
 * Html/body shell only -- no header/footer/FAB here. Those live in the
 * `(site)` route group's layout so `/login` (the `(auth)` route group)
 * can render its own minimal header/footer per the login spec.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${montserratAlternates.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-white">{children}</body>
    </html>
  );
}
