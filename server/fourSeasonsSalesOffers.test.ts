import { describe, expect, it } from "vitest";
import { FOUR_SEASONS_VILLAS } from "../client/src/data/fourSeasons";
import {
  FOUR_SEASONS_SALES_OFFERS,
  fourSeasonsVillaKey,
} from "./fourSeasonsSalesOffers";

describe("Four Seasons sales offers", () => {
  it("contains 15 exact, canonical available-villa offers", () => {
    const canonical = new Set(FOUR_SEASONS_VILLAS.map(villa => villa.villaKey));
    expect(FOUR_SEASONS_SALES_OFFERS).toHaveLength(15);
    expect(new Set(FOUR_SEASONS_SALES_OFFERS.map(offer => offer.villaNumber)).size).toBe(15);
    for (const offer of FOUR_SEASONS_SALES_OFFERS) {
      expect(canonical.has(fourSeasonsVillaKey(offer.villaNumber))).toBe(true);
      expect(offer.askingPriceAed).toBeGreaterThan(0);
      expect([5, 6, 7]).toContain(offer.bedrooms);
    }
  });

  it("keeps every offer linked to its supplied bedroom-specific file", () => {
    for (const offer of FOUR_SEASONS_SALES_OFFERS) {
      expect(offer.filename).toContain(`${offer.bedrooms}`);
    }
  });
});
