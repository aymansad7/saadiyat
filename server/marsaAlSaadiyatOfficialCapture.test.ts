import { describe, expect, it } from "vitest";
import {
  TALAY_BEACH_CONFIG,
  TALAY_CONFIG,
  __testables,
  selectMarsaProductionSourceUnits,
} from "./marsaAlSaadiyatOfficialCapture";

function units(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    unitNumber: `${prefix}${String(index + 1).padStart(3, "0")}-01`,
    unitStatus: "Available",
    locationId: `location-${index + 1}`,
  }));
}

describe("Marsa Al Saadiyat official captures", () => {
  it("accepts only complete Talay and Talay Beach source registries", () => {
    expect(selectMarsaProductionSourceUnits(units("Talay-MarsaAlSaadiyat-V-", 167), TALAY_CONFIG)).toHaveLength(167);
    expect(selectMarsaProductionSourceUnits(units("TalayBeach-MarsaAlSaadiyat-V-", 184), TALAY_BEACH_CONFIG)).toHaveLength(184);
    expect(() => selectMarsaProductionSourceUnits(units("Talay-MarsaAlSaadiyat-V-", 166), TALAY_CONFIG)).toThrow(/coverage/i);
  });

  it("generates only the verified Talay exact unit URL and does not invent a Talay Beach page", () => {
    expect(__testables.knownDirectAldarLink("Talay-MarsaAlSaadiyat-V-001-01", TALAY_CONFIG)).toBe(
      "https://world.aldar.com/uae/abudhabi/talay/property/MarsaAlSaadiyat-001-01/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
    expect(__testables.knownDirectAldarLink("TalayBeach-MarsaAlSaadiyat-V-001-01", TALAY_BEACH_CONFIG)).toBeNull();
  });

  it("derives a price range only from exact official unit-detail prices", () => {
    expect(__testables.groupedPriceSummary([
      { bedrooms: 4, priceAed: 14_424_043 },
      { bedrooms: 4, priceAed: 15_000_000 },
      { bedrooms: 5, priceAed: 16_000_000 },
      { bedrooms: 6, priceAed: 19_536_750 },
    ])).toEqual([
      { unit_type: "4-Bedroom Villas", bedrooms: 4, starting_price_aed: 14_424_043, max_price_aed: 15_000_000 },
      { unit_type: "5-Bedroom Villas", bedrooms: 5, starting_price_aed: 16_000_000, max_price_aed: 16_000_000 },
      { unit_type: "6-Bedroom Villas", bedrooms: 6, starting_price_aed: 19_536_750, max_price_aed: 19_536_750 },
    ]);
  });
});
