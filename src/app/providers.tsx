import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

/**
 * Wraps the app in the next-intl client provider so client components can
 * call `useTranslations`/`useLocale`. NOT mounted by this phase -- Phase
 * 07 mounts it in `layout.tsx` alongside the rest of the shell. Kept as a
 * thin, logic-free pass-through: locale/messages resolution itself is
 * `src/i18n/request.ts`'s job (already covered by the parity test), so
 * there is no branch here worth a dedicated unit test.
 */
export async function AppProviders({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
