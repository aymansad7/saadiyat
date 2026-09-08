export type FourSeasonsSalesOffer = {
  villaNumber: number;
  bedrooms: 5 | 6 | 7;
  askingPriceAed: number;
  filename: "5Bedroom.pdf" | "6Bedroom.pdf" | "FourSeasons-7BedroomMansionsProposal..pdf";
  offerLabel: string;
};

/**
 * Exact villa/price rows transcribed from the owner-supplied Four Seasons
 * offers on 8 September 2026. This is an operational offer source, not a
 * municipal sale record or a developer availability feed.
 */
export const FOUR_SEASONS_SALES_OFFERS: readonly FourSeasonsSalesOffer[] = [
  { villaNumber: 16, bedrooms: 5, askingPriceAed: 95_000_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 19, bedrooms: 5, askingPriceAed: 69_900_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 20, bedrooms: 5, askingPriceAed: 77_000_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 21, bedrooms: 5, askingPriceAed: 77_000_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 44, bedrooms: 5, askingPriceAed: 90_000_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 45, bedrooms: 5, askingPriceAed: 80_000_000, filename: "5Bedroom.pdf", offerLabel: "Four Seasons 5 Bedroom Sales Offer" },
  { villaNumber: 12, bedrooms: 6, askingPriceAed: 120_000_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 25, bedrooms: 6, askingPriceAed: 125_000_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 27, bedrooms: 6, askingPriceAed: 130_000_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 29, bedrooms: 6, askingPriceAed: 132_500_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 31, bedrooms: 6, askingPriceAed: 135_000_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 50, bedrooms: 6, askingPriceAed: 110_000_000, filename: "6Bedroom.pdf", offerLabel: "Four Seasons 6 Bedroom Sales Offer" },
  { villaNumber: 2, bedrooms: 7, askingPriceAed: 320_000_000, filename: "FourSeasons-7BedroomMansionsProposal..pdf", offerLabel: "Four Seasons 7 Bedroom Mansions Sales Offer" },
  { villaNumber: 3, bedrooms: 7, askingPriceAed: 320_000_000, filename: "FourSeasons-7BedroomMansionsProposal..pdf", offerLabel: "Four Seasons 7 Bedroom Mansions Sales Offer" },
  { villaNumber: 4, bedrooms: 7, askingPriceAed: 320_000_000, filename: "FourSeasons-7BedroomMansionsProposal..pdf", offerLabel: "Four Seasons 7 Bedroom Mansions Sales Offer" },
] as const;

export const FOUR_SEASONS_OFFER_SOURCE_LABEL = "Owner-supplied Four Seasons Sales Offer PDFs · 2026-09-08";

export function fourSeasonsVillaKey(villaNumber: number) {
  return `four-seasons/villa-${villaNumber}`;
}
