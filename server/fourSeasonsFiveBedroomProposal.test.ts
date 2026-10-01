import { describe, expect, it } from "vitest";
import { FOUR_SEASONS_VILLAS } from "../client/src/data/fourSeasons";
import {
  FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS,
  FOUR_SEASONS_FIVE_BEDROOM_PROPOSAL_SOURCE,
  fourSeasonsVillaKey,
} from "./fourSeasonsFiveBedroomProposal";

describe("Four Seasons Five Bedroom Proposal", () => {
  it("preserves the six exact owner-supplied offer rows", () => {
    expect(FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS.map((row) => row.villaNumber)).toEqual([16, 19, 20, 21, 44, 45]);
    expect(FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS.map((row) => row.askingPriceAed)).toEqual([
      95_000_000,
      69_900_000,
      77_000_000,
      77_000_000,
      90_000_000,
      80_000_000,
    ]);
  });

  it("keeps exact areas and card identities", () => {
    const villa20 = FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS.find((row) => row.villaNumber === 20)!;
    const villa45 = FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS.find((row) => row.villaNumber === 45)!;
    expect(villa20).toMatchObject({
      proposedType: "Garden Villa (5 Bed)",
      view: "Golf",
      landAreaSqft: 13_225.6,
      builtUpAreaSqft: 17_451.2,
      askingPriceAed: 77_000_000,
    });
    expect(villa45).toMatchObject({
      view: "Park",
      landAreaSqft: 12_900.43,
      builtUpAreaSqft: 17_451.2,
      askingPriceAed: 80_000_000,
    });
    expect(fourSeasonsVillaKey(45)).toBe("four-seasons/villa-45");
    expect(FOUR_SEASONS_FIVE_BEDROOM_PROPOSAL_SOURCE.filename).toMatch(/Proposal/);
  });

  it("aligns the Four Seasons card area references with the proposal", () => {
    for (const proposal of FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS) {
      const villa = FOUR_SEASONS_VILLAS.find((entry) => entry.villaNumber === proposal.villaNumber);
      expect(villa, `Villa ${proposal.villaNumber} is present`).toBeDefined();
      expect(villa).toMatchObject({
        bedrooms: 5,
        plotAreaSqft: proposal.landAreaSqft,
        builtUpAreaSqft: proposal.builtUpAreaSqft,
        plotAreaSqm: proposal.landAreaSqm,
        builtUpAreaSqm: proposal.builtUpAreaSqm,
      });
    }
  });
});
