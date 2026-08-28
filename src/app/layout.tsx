import type { Metadata } from "next";
import { montserrat, montserratAlternates } from "@/lib/fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FabWidget } from "@/components/layout/fab-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "Sun* Annual Awards 2025",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${montserratAlternates.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-white">
        <SiteHeader variant="guest" locale="vi" />
        {children}
        <SiteFooter />
        <FabWidget />
      </body>
    </html>
  );
}
