import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Detail = {
  canonical_unit_code: string;
  unit_name: string;
  project_slug: string;
  building_slug: string;
  price_aed: number | null;
  payment_plans: Array<{ installments: unknown[] }>;
  offers: unknown[];
};

const source = JSON.parse(
  readFileSync(resolve(process.cwd(), "server/data/sources/world-of-aldar/2026-09-03/alghadeer_complete_workbook.json"), "utf8"),
) as { source_row_count: number; units: Detail[] };
const sourceJson = JSON.stringify(source);

describe("Al Ghadeer complete workbook import source", () => {
  it("contains an exact, unique detail record for every imported Ghadeer unit", () => {
    expect(source.source_row_count).toBe(1243);
    expect(source.units).toHaveLength(1243);
    expect(new Set(source.units.map(unit => unit.canonical_unit_code)).size).toBe(1243);
    expect(new Set(source.units.map(unit => unit.unit_name)).size).toBe(1243);
    expect(source.units.filter(unit => unit.project_slug === "al-ghadeer-gardens")).toHaveLength(790);
    expect(source.units.filter(unit => unit.project_slug === "al-ghadeer-parks-1" && unit.building_slug === "nc")).toHaveLength(280);
    expect(source.units.filter(unit => unit.project_slug === "al-ghadeer-parks-2" && unit.building_slug === "nd")).toHaveLength(173);
  });

  it("retains the documented price and commercial details for each exact Parks unit", () => {
    const parks = source.units.filter(unit => unit.project_slug.startsWith("al-ghadeer-parks"));
    expect(parks).toHaveLength(453);
    expect(parks.every(unit => typeof unit.price_aed === "number" && unit.price_aed > 0)).toBe(true);
    expect(parks.every(unit => Array.isArray(unit.payment_plans) && Array.isArray(unit.offers))).toBe(true);
    const gardens = source.units.filter(unit => unit.project_slug === "al-ghadeer-gardens");
    expect(gardens.some(unit => unit.payment_plans.length > 0)).toBe(true);
    expect(gardens.some(unit => unit.offers.length > 0)).toBe(true);
  });

  it("does not retain Salesforce identifiers or the private detail API endpoint in card-source data", () => {
    expect(sourceJson).not.toMatch(/Salesforce|propertyservice\.world\.aldar\.com/i);
  });
});
