import { describe, expect, it } from "vitest";
import { isPublishedSeiUnitPrice, publishedPriceFromSeiDetail, selectSeiPriceProbeUnits } from "./seiSaadiyatOfficialCapture";

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

  it("selects a bounded representative probe across all six official buildings", () => {
    const units = Array.from({ length: 18 }, (_, index) => ({
      unitNumber: `SeiSaadiyat-T${Math.floor(index / 3) + 1}-01-${String((index % 3) + 1).padStart(2, "0")}`,
      locationId: `location-${index}`,
    }));
    const selected = selectSeiPriceProbeUnits(units);
    expect(selected).toHaveLength(18);
    expect(new Set(selected.map(unit => String(unit.unitNumber).slice(13, 14)))).toEqual(new Set(["1", "2", "3", "4", "5", "6"]));
  });
});
