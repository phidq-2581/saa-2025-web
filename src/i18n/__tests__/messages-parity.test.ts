import { describe, expect, it } from "vitest";
import commonVi from "../../../messages/vi/common.json";
import commonEn from "../../../messages/en/common.json";
import loginVi from "../../../messages/vi/login.json";
import loginEn from "../../../messages/en/login.json";
import homeVi from "../../../messages/vi/home.json";
import homeEn from "../../../messages/en/home.json";
import awardsVi from "../../../messages/vi/awards.json";
import awardsEn from "../../../messages/en/awards.json";

// Phase 03 owned exactly one namespace file ("common"); Phase 07 extends
// this list to the full four-screen set. Verifies vi/en carry identical
// key sets and that no value was left blank (a blank string is worse than
// a missing key -- it renders silently wrong instead of loudly missing).
const NAMESPACES = ["common", "login", "home", "awards"] as const;
const CATALOGS: Record<
  (typeof NAMESPACES)[number],
  { vi: Record<string, unknown>; en: Record<string, unknown> }
> = {
  common: { vi: commonVi, en: commonEn },
  login: { vi: loginVi, en: loginEn },
  home: { vi: homeVi, en: homeEn },
  awards: { vi: awardsVi, en: awardsEn },
};

// `awards.json` carries a genuine array field (`cardContent.*.prizes`), so
// unlike the flatten helper's original common-only version, arrays must be
// walked (by index) rather than treated as opaque leaf values -- otherwise
// every prize entry would fail the "must be a string" check below just for
// being an array.
function flattenEntries(obj: Record<string, unknown>, prefix = ""): Array<[string, unknown]> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      const children = Array.isArray(value)
        ? Object.fromEntries(value.map((item, index) => [String(index), item]))
        : (value as Record<string, unknown>);
      return flattenEntries(children, path);
    }
    return [[path, value]];
  });
}

describe("message catalog parity", () => {
  it.each(NAMESPACES)("%s: vi and en expose identical key sets", (namespace) => {
    const { vi: viCatalog, en: enCatalog } = CATALOGS[namespace];
    const viKeys = flattenEntries(viCatalog).map(([key]) => key).sort();
    const enKeys = flattenEntries(enCatalog).map(([key]) => key).sort();
    expect(viKeys).toEqual(enKeys);
  });

  it.each(NAMESPACES)("%s: neither catalog has a blank string value", (namespace) => {
    const { vi: viCatalog, en: enCatalog } = CATALOGS[namespace];
    for (const [key, value] of [...flattenEntries(viCatalog), ...flattenEntries(enCatalog)]) {
      // `null` is a deliberate "not applicable" leaf (e.g. a single-prize
      // award's `qualifier`), present in both catalogs -- not a blank
      // string standing in for missing content, so it's exempt here while
      // still counting toward the identical-key-sets check above.
      if (value === null) continue;
      expect(typeof value, `${key} must be a string`).toBe("string");
      expect((value as string).length, `${key} must not be blank`).toBeGreaterThan(0);
    }
  });
});
