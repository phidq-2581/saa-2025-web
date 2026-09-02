import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import composeVi from "../../../../../messages/vi/compose.json";

/**
 * Local intl test wrapper for `compose/**` unit tests. Not the shared
 * `src/test-utils/render-with-intl.tsx` helper -- that file's `CATALOGS`
 * map doesn't include the `compose` namespace yet and lives outside this
 * phase's owned files, so this component tree gets its own minimal
 * `NextIntlClientProvider` wrapper carrying the real
 * `messages/vi/compose.json` catalog instead of a hand-rolled stub.
 */
export function renderWithComposeIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="vi" messages={{ compose: composeVi }}>
      {ui}
    </NextIntlClientProvider>,
  );
}
