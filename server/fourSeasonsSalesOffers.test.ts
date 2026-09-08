import { describe, expect, it } from "vitest";
import { FOUR_SEASONS_VILLAS } from "../client/src/data/fourSeasons";
import {
  FOUR_SEASONS_SALES_OFFERS,
  FOUR_SEASONS_SUPPORTING_DOCUMENTS,
  fourSeasonsVillaKey,
} from "./fourSeasonsSalesOffers";

describe("Four Seasons sales offers", () => {
  it("contains 16 exact, canonical available-villa offers", () => {
    const canonical = new Set(FOUR_SEASONS_VILLAS.map(villa => villa.villaKey));
    expect(FOUR_SEASONS_SALES_OFFERS).toHaveLength(16);
    expect(new Set(FOUR_SEASONS_SALES_OFFERS.map(offer => offer.villaNumber)).size).toBe(16);
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

  it("keeps Mansion 7 as a price-neutral supporting file on the exact canonical villa", () => {
    expect(FOUR_SEASONS_SUPPORTING_DOCUMENTS).toEqual([
      expect.objectContaining({ villaNumber: 7, bedrooms: 7, filename: "Mansion7-FourSeasons.pdf" }),
    ]);
    expect(fourSeasonsVillaKey(FOUR_SEASONS_SUPPORTING_DOCUMENTS[0]!.villaNumber)).toBe("four-seasons/villa-7");
  });
});
