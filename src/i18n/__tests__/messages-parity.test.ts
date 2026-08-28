import { describe, expect, it } from "vitest";
import vi from "../../../messages/vi/common.json";
import en from "../../../messages/en/common.json";

// Phase 03 owns exactly one namespace file ("common"); Phase 07 extends
// this list when it adds more. Verifies vi/en carry identical key sets and
// that no value was left blank (a blank string is worse than a missing
// key -- it renders silently wrong instead of loudly missing).
const NAMESPACES = ["common"] as const;
const CATALOGS: Record<
  (typeof NAMESPACES)[number],
  { vi: Record<string, unknown>; en: Record<string, unknown> }
> = {
  common: { vi, en },
};

function flattenEntries(obj: Record<string, unknown>, prefix = ""): Array<[string, unknown]> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? flattenEntries(value as Record<string, unknown>, path)
      : [[path, value]];
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
      expect(typeof value, `${key} must be a string`).toBe("string");
      expect((value as string).length, `${key} must not be blank`).toBeGreaterThan(0);
    }
  });
});
