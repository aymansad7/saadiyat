import { describe, expect, it } from "vitest";
import {
  FOUR_SEASONS_ALAIN_APARTMENTS,
  FOUR_SEASONS_ALAIN_SNAPSHOT,
  FOUR_SEASONS_ALAIN_UNITS,
  FOUR_SEASONS_ALAIN_VILLAS,
} from "./fourSeasonsAlainExplore";

describe("Four Seasons Alain Explore snapshot", () => {
  it("keeps only the 116 non-test Four Seasons records from the supplied workbook", () => {
    expect(FOUR_SEASONS_ALAIN_SNAPSHOT.commercialUnitCount).toBe(116);
    expect(FOUR_SEASONS_ALAIN_UNITS).toHaveLength(116);
    expect(FOUR_SEASONS_ALAIN_VILLAS).toHaveLength(56);
    expect(FOUR_SEASONS_ALAIN_APARTMENTS).toHaveLength(60);
    expect(new Set(FOUR_SEASONS_ALAIN_UNITS.map((unit) => unit.unitKey)).size).toBe(116);
  });

  it("preserves the latest live status split without inventing an AED price", () => {
    expect(FOUR_SEASONS_ALAIN_SNAPSHOT.statusCounts).toEqual({
      Available: 11,
      Blocked: 24,
      Booked: 2,
      Reserved: 3,
      Sold: 76,
    });
    expect(FOUR_SEASONS_ALAIN_UNITS.every((unit) => unit.priceAed === null)).toBe(true);
    expect(FOUR_SEASONS_ALAIN_UNITS.every((unit) => unit.pricePublication === "Not published in public response")).toBe(true);
  });

  it("retains apartment identifiers, floor information and a separately visible penthouse", () => {
    expect(FOUR_SEASONS_ALAIN_APARTMENTS.find((unit) => unit.unitNumber === "504")).toMatchObject({
      unitCode: "SBR-A-504",
      sourceStatus: "Blocked",
      displayType: "5 Bedroom Penthouse",
      tower: 1,
      floor: "5",
      saleableAreaSqm: 1403.37,
    });
    expect(FOUR_SEASONS_ALAIN_APARTMENTS.filter((unit) => unit.sourceType === "5BR_Penthouse")).toHaveLength(2);
  });
});
