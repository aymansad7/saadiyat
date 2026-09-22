import { describe, expect, it } from "vitest";
import {
  EXPECTED_YAS_RIVA_RESERVE_UNIT_COUNT,
  buildYasRivaReserveProject,
  isPublishedYasRivaReservePrice,
  officialYasRivaReserveUnitUrl,
  selectYasRivaReservePriceProbeUnits,
} from "./yasRivaReserveOfficialCapture";

function sourceUnit(index: number) {
  const waterfront = index > 247;
  const number = String(index).padStart(3, "0");
  const bedroomCount = waterfront ? (index % 2 ? 5 : 6) : index <= 96 ? 4 : index <= 212 ? 5 : 6;
  const prefix = waterfront ? "WF" : "IL";
  return {
    unitNumber: `YasRivaReserve-${prefix}-V-${number}-01`,
    locationId: `location-${index}`,
    unitStatus: "New",
    unitCategory: `${waterfront ? "Waterfront" : "Inland"} ${bedroomCount}-Bedroom`,
    unitType: "Villa",
    propertyName: `${bedroomCount}BHK Villa`,
    bedroomCount,
    saleableArea: "539.32",
    suiteArea: "533.19",
    balconyArea: "6.13",
    price: "1",
  };
}

describe("Yas Riva Reserve official capture", () => {
  it("keeps all 292 verified villas grouped as Inland and Waterfront without treating AED 1 as pricing", () => {
    const source = Array.from({ length: EXPECTED_YAS_RIVA_RESERVE_UNIT_COUNT }, (_, index) => sourceUnit(index + 1));
    const project = buildYasRivaReserveProject(source, "2026-09-22");
    expect(project.slug).toBe("yas-riva-reserve");
    expect(project.unit_count).toBe(292);
    expect(project.buildings.map(building => [building.name, building.units.length])).toEqual([["Inland", 247], ["Waterfront", 45]]);
    expect(project.buildings.flatMap(building => building.units).every(unit => unit.status === null && unit.source_unit_status === "New" && unit.price_aed === null)).toBe(true);
  });

  it("excludes placeholder prices and produces only exact official unit URLs", () => {
    expect(isPublishedYasRivaReservePrice(1)).toBe(false);
    expect(isPublishedYasRivaReservePrice(0)).toBe(false);
    expect(isPublishedYasRivaReservePrice(" ")).toBe(false);
    expect(isPublishedYasRivaReservePrice(12_500_000)).toBe(true);
    expect(officialYasRivaReserveUnitUrl("YasRivaReserve-IL-V-001-01")).toBe(
      "https://world.aldar.com/uae/abudhabi/yasrivareserve/property/IL-001-01/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
    expect(officialYasRivaReserveUnitUrl("not-a-yas-riva-unit")).toBeNull();
  });

  it("selects release-monitor representatives across every published villa category", () => {
    const rows = [
      { unitName: "YasRivaReserve-IL-V-001-01", locationId: "a", sourceStatus: "New", sourcePriceAed: null, raw: sourceUnit(1) },
      { unitName: "YasRivaReserve-IL-V-097-01", locationId: "b", sourceStatus: "New", sourcePriceAed: null, raw: sourceUnit(97) },
      { unitName: "YasRivaReserve-IL-V-213-01", locationId: "c", sourceStatus: "New", sourcePriceAed: null, raw: sourceUnit(213) },
      { unitName: "YasRivaReserve-WF-V-248-01", locationId: "d", sourceStatus: "New", sourcePriceAed: null, raw: sourceUnit(248) },
    ];
    expect(selectYasRivaReservePriceProbeUnits(rows).map(unit => unit.unitName)).toEqual(rows.map(unit => unit.unitName));
  });
});
