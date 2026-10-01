export const FOUR_SEASONS_FIVE_BEDROOM_PROPOSAL_SOURCE = {
  filename: "Four-Seasons-5-Bedroom-Proposal-2026-10-01.pdf",
  localFilename: "5Bedroom.pdf",
  sourceLabel: "Owner-supplied Four Seasons 5 Bedroom Proposal · 1 Oct 2026",
  actor: "owner-supplied-four-seasons-5-bedroom-proposal-2026-10-01",
  actorName: "Owner-supplied Four Seasons 5 Bedroom Proposal",
} as const;

export type FourSeasonsFiveBedroomProposal = {
  villaNumber: number;
  proposedType: string;
  view: string;
  landAreaSqft: number;
  builtUpAreaSqft: number;
  landAreaSqm: number;
  builtUpAreaSqm: number;
  askingPriceAed: number;
};

/**
 * Exact values transcribed from the supplied proposal. They are owner-supplied
 * resale offer data, not developer availability or a municipal sale record.
 */
export const FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS: readonly FourSeasonsFiveBedroomProposal[] = [
  {
    villaNumber: 16,
    proposedType: "5 Bedroom Plus Villa",
    view: "Golf",
    landAreaSqft: 14_363.24,
    builtUpAreaSqft: 19_123.49,
    landAreaSqm: 1_334.39,
    builtUpAreaSqm: 1_776.63,
    askingPriceAed: 95_000_000,
  },
  {
    villaNumber: 19,
    proposedType: "Signature Garden Villa (5 Bed)",
    view: "Garden",
    landAreaSqft: 14_144.09,
    builtUpAreaSqft: 17_451.2,
    landAreaSqm: 1_314.03,
    builtUpAreaSqm: 1_621.27,
    askingPriceAed: 69_900_000,
  },
  {
    villaNumber: 20,
    proposedType: "Garden Villa (5 Bed)",
    view: "Golf",
    landAreaSqft: 13_225.6,
    builtUpAreaSqft: 17_451.2,
    landAreaSqm: 1_228.7,
    builtUpAreaSqm: 1_621.27,
    askingPriceAed: 77_000_000,
  },
  {
    villaNumber: 21,
    proposedType: "Golf View Villa (5 Bed)",
    view: "Golf",
    landAreaSqft: 13_937.74,
    builtUpAreaSqft: 17_451.2,
    landAreaSqm: 1_294.86,
    builtUpAreaSqm: 1_621.27,
    askingPriceAed: 77_000_000,
  },
  {
    villaNumber: 44,
    proposedType: "Garden Villa (5 Bed)",
    view: "Park",
    landAreaSqft: 13_195.36,
    builtUpAreaSqft: 17_451.2,
    landAreaSqm: 1_225.89,
    builtUpAreaSqm: 1_621.27,
    askingPriceAed: 90_000_000,
  },
  {
    villaNumber: 45,
    proposedType: "5 Bedroom Villa",
    view: "Park",
    landAreaSqft: 12_900.43,
    builtUpAreaSqft: 17_451.2,
    landAreaSqm: 1_198.49,
    builtUpAreaSqm: 1_621.27,
    askingPriceAed: 80_000_000,
  },
] as const;

export function fourSeasonsVillaKey(villaNumber: number) {
  return `four-seasons/villa-${villaNumber}`;
}
