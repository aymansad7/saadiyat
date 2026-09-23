import { describe, expect, it } from "vitest";
import { selectTalayProductionSourceUnits } from "./talayOfficialSync";

function unit(number: string) {
  return { unitNumber: number, unitStatus: "New" };
}

describe("Talay official source selection", () => {
  it("accepts the full expected production release and excludes the explicit test record", () => {
    const source = [unit("Talay-MarsaAlSaadiyat-V-000-01_TEST"), ...Array.from({ length: 167 }, (_, index) => unit(`Talay-MarsaAlSaadiyat-V-${String(index + 1).padStart(3, "0")}-01`))];
    const production = selectTalayProductionSourceUnits(source);
    expect(production).toHaveLength(167);
    expect(production.some(row => /_TEST$/i.test(String(row.unitNumber)))).toBe(false);
  });

  it("fails closed if the official page coverage is incomplete", () => {
    const source = [unit("Talay-MarsaAlSaadiyat-V-000-01_TEST"), ...Array.from({ length: 166 }, (_, index) => unit(`Talay-MarsaAlSaadiyat-V-${String(index + 1).padStart(3, "0")}-01`))];
    expect(() => selectTalayProductionSourceUnits(source)).toThrow(/source coverage/i);
  });
});
