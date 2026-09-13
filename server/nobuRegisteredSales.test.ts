import { describe, expect, it } from "vitest";
import { matchNobuTransaction, type NobuSourceUnit, type NobuTransactionRow } from "./nobuRegisteredSales";

const row: NobuTransactionRow = {
  sourceRow: 2,
  saleApplicationDate: "2026-08-18",
  assetClass: "residential",
  propertyType: "apartment",
  propertyLayout: "3 beds",
  projectName: "Nobu Residences 2",
  registeredSellingPriceAed: 35_000_000,
  saleableAreaSqm: 287.01,
  registeredRateAedSqm: 121946.97,
  soldShare: 1,
  landPlotGroundAreaSqm: 11106.91,
  saleApplicationType: "off-plan",
  saleSequence: "secondary",
};

describe("matchNobuTransaction", () => {
  it("attaches a transaction only when its building, layout, type and area identify one unit", () => {
    const units: NobuSourceUnit[] = [{ unitName: "NobuResidences-B2-West-01-02", buildingName: "NobuResidences-B2-West", bedrooms: 3, propertyType: "apartment", saleableAreaSqm: 287.01 }];
    const result = matchNobuTransaction(row, units);
    expect(result.matchType).toBe("unit_exact");
    expect(result.matchedUnitName).toBe("NobuResidences-B2-West-01-02");
  });

  it("does not claim a transaction belongs to a named unit when the area repeats", () => {
    const units: NobuSourceUnit[] = [
      { unitName: "NobuResidences-B2-East-01-02", buildingName: "NobuResidences-B2-East", bedrooms: 3, propertyType: "apartment", saleableAreaSqm: 287.01 },
      { unitName: "NobuResidences-B2-West-01-02", buildingName: "NobuResidences-B2-West", bedrooms: 3, propertyType: "apartment", saleableAreaSqm: 287.01 },
    ];
    const result = matchNobuTransaction(row, units);
    expect(result.matchType).toBe("area_group");
    expect(result.matchedUnitName).toBeNull();
  });
});
