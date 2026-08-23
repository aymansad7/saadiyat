import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  FAYA_LARGEST_UNITS,
  FAYA_SHARED_TRANSACTION,
  getFayaTransactions,
} from "../client/src/data/fayaTransactions";

describe("Faya Al Saadiyat combined transaction", () => {
  it("links one unsplit AED 190M transaction to exactly the two largest Faya units", () => {
    expect(FAYA_SHARED_TRANSACTION.priceAed).toBe(190_000_000);
    expect(FAYA_SHARED_TRANSACTION.landAreaSqm).toBe(6_478.16);
    expect(FAYA_SHARED_TRANSACTION.builtUpAreaSqm).toBe(16_032.32);
    expect(FAYA_SHARED_TRANSACTION.sharedUnitNames).toEqual(FAYA_LARGEST_UNITS);
    expect(FAYA_SHARED_TRANSACTION.sharedUnitNames).toHaveLength(2);
  });

  it("maps both selected units to the same transaction and no unrelated unit", () => {
    expect(getFayaTransactions(FAYA_LARGEST_UNITS[0])[0]?.id).toBe(FAYA_SHARED_TRANSACTION.id);
    expect(getFayaTransactions(FAYA_LARGEST_UNITS[1])[0]?.id).toBe(FAYA_SHARED_TRANSACTION.id);
    expect(getFayaTransactions("FayaAlSaadiyat-SB45-V-19-01")).toEqual([]);
  });

  it("keeps the higher AED 403.8M original-price unit as the first selected unit", () => {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "server/data/aldar_saadiyat.json"), "utf8"),
    );
    const project = data.projects.find((entry: any) => entry.slug === "faya-al-saadiyat");
    const units = project.buildings.flatMap((building: any) => building.units);
    const selected = FAYA_LARGEST_UNITS.map(unitName =>
      units.find((unit: any) => unit.unit_name === unitName),
    );
    const ranked = [...units].sort(
      (a: any, b: any) =>
        (b.total_area_sqm ?? b.saleable_area_sqm ?? 0) -
        (a.total_area_sqm ?? a.saleable_area_sqm ?? 0),
    );

    expect(new Set(ranked.slice(0, 2).map((unit: any) => unit.unit_name))).toEqual(
      new Set(FAYA_LARGEST_UNITS),
    );
    expect(selected[0].price_aed).toBe(403_808_101);
    expect(selected[1].price_aed).toBe(400_808_101);
  });
});
