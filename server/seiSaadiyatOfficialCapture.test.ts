import { describe, expect, it } from "vitest";
import { isPublishedSeiUnitPrice, mergeOfficialSeiSourceUnits, parseSeiUnitDetailPayload, publishedPriceFromSeiDetail, selectSeiPriceProbeUnits } from "./seiSaadiyatOfficialCapture";

describe("Sei official price eligibility", () => {
  it("rejects missing, zero, and the known AED 1 placeholder", () => {
    expect(isPublishedSeiUnitPrice(null)).toBe(false);
    expect(isPublishedSeiUnitPrice(0)).toBe(false);
    expect(isPublishedSeiUnitPrice(1)).toBe(false);
    expect(isPublishedSeiUnitPrice("1")).toBe(false);
  });

  it("accepts a valid official unit price", () => {
    expect(isPublishedSeiUnitPrice(2_500_000)).toBe(true);
  });

  it("accepts only a valid AED price from the official unit-detail contract", () => {
    expect(publishedPriceFromSeiDetail({ data: { unitDetail: { CurrencyIsoCode: "AED", SellingPrice__c: 2_500_000 } } })).toBe(2_500_000);
    expect(publishedPriceFromSeiDetail({ data: { unitDetail: { CurrencyIsoCode: "AED", SellingPrice__c: 1 } } })).toBeNull();
    expect(publishedPriceFromSeiDetail({ data: { unitDetail: { CurrencyIsoCode: "USD", SellingPrice__c: 2_500_000 } } })).toBeNull();
  });

  it("treats Aldar's successful no-detail response as an unpublished price, not a probe failure", () => {
    expect(parseSeiUnitDetailPayload(
      { unitName: "SeiSaadiyat-T1-01-01", locationId: "source-location" },
      { success: true, message: "No unit details found for the specified locationId." },
    )).toEqual({
      unitName: "SeiSaadiyat-T1-01-01",
      locationId: "source-location",
      status: null,
      sellingPrice: null,
      reservationAmount: null,
    });
  });

  it("selects a bounded representative probe across all six official buildings", () => {
    const units = Array.from({ length: 18 }, (_, index) => ({
      unitNumber: `SeiSaadiyat-T${Math.floor(index / 3) + 1}-01-${String((index % 3) + 1).padStart(2, "0")}`,
      locationId: `location-${index}`,
    }));
    const selected = selectSeiPriceProbeUnits(units);
    expect(selected).toHaveLength(18);
    expect(new Set(selected.map(unit => String(unit.unitNumber).slice(13, 14)))).toEqual(new Set(["1", "2", "3", "4", "5", "6"]));
  });

  it("adds source-only units into their exact building without inventing a price", () => {
    const project = {
      unit_count: 1,
      buildings: [
        { slug: "sei-saadiyat-building-1", units: [{ unit_name: "SeiSaadiyat-T1-01-01" }] },
        { slug: "sei-saadiyat-building-2", units: [] },
      ],
    };
    const added = mergeOfficialSeiSourceUnits(project, [
      { unitNumber: "SeiSaadiyat-T1-01-01", locationId: "existing" },
      { unitNumber: "SeiSaadiyat-T2-01-01", locationId: "new", unitType: "Apartment", unitCategory: "1 BED TYPE 1", propertyName: "1BHK Apartment", bedroomCount: 1, saleableArea: "70.55", price: 1 },
    ], "2026-09-10");

    expect(added).toBe(1);
    expect(project.unit_count).toBe(2);
    expect(project.buildings[1]?.units).toEqual(expect.arrayContaining([
      expect.objectContaining({ unit_name: "SeiSaadiyat-T2-01-01", price_aed: null, source_location_id: "new" }),
    ]));
  });
});
