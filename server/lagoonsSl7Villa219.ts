export const LAGOONS_SL7_V219 = {
  villaKey: "lagoons/AlGhaf-219-02",
  community: "lagoons",
  canonicalUnitName: "AlGhaf-219-02",
  officialAldarUnitName: "Lagoons-Wilds-SL7-V-219",
  phaseKey: "SL7",
  buildingKey: "CLUSTER-AL-GHAF",
  unitTypeKey: "VILLA",
  inventoryKey: "VILLA-6BHK",
  bedrooms: 6,
  sourceLandAreaSqm: 874.25,
  sourceBuiltUpAreaSqm: 591.43,
  sourceOfficialBasePriceAed: 11_103_265,
  masterListing: {
    status: "available" as const,
    askingPriceAed: null,
    listingPartners: "NAS Luxury",
    publicNotes: [
      "Luxury 6-bedroom corner villa in Saadiyat Lagoons Wilds SL7.",
      "Premium corner setting with landscaped greenery on one side, a neighbouring villa on the other, and rear outlook toward the community park and mosque.",
      "The owner selected the position for privacy, natural light and long-term value. Resale asking price has not been supplied.",
    ].join(" "),
    internalNotes: [
      "Master-supplied resale reference · 22 Oct 2026.",
      "Exact Aldar match: Lagoons-Wilds-SL7-V-219 ↔ internal map/card AlGhaf-219-02.",
      "Operational listing status: Available with NAS Luxury. This does not alter Aldar's official source-state history or base developer price.",
      "Financial overview — user-supplied, not a resale asking price:",
      "• Original purchase price including registration fees: AED 12,273,267.84.",
      "• Owner payments to date: AED 4,209,657.60.",
      "• Registration fees: AED 255,914.83.",
      "• Total amount paid to date: AED 4,465,572.43.",
      "Official Aldar base price retained separately: AED 11,103,265. Difference from the supplied all-in purchase figure is not inferred.",
      "Property highlights supplied by Master: luxury 6-bedroom premium specification; premium corner position; landscaped greenery; rear park and mosque outlook; among the later community villas with no immediate future villa construction stated around it.",
      "Premium finishing reference supplied: marble in principal flooring areas, engineered wood in bedrooms/walk-in closets, timber veneer joinery, reconstituted stone wet-kitchen countertop, marble bathroom countertops, and a smart-home package with two external security cameras, keypad entry and camera doorbell.",
      "Owner identity was not supplied. Master-only residency note: American resident based in Chicago, USA.",
    ].join("\n"),
  },
  financialReference: {
    originalPurchaseIncludingRegistrationAed: 12_273_267.84,
    ownerPaymentsToDateAed: 4_209_657.60,
    registrationFeesAed: 255_914.83,
    totalPaidToDateAed: 4_465_572.43,
  },
} as const;

export function isExactLagoonsSl7Villa219Source(input: {
  aldarUnitName?: string | null;
  bedrooms?: number | null;
  landAreaSqm?: number | null;
  builtUpAreaSqm?: number | null;
}) {
  return input.aldarUnitName === LAGOONS_SL7_V219.officialAldarUnitName
    && input.bedrooms === LAGOONS_SL7_V219.bedrooms
    && input.landAreaSqm === LAGOONS_SL7_V219.sourceLandAreaSqm
    && input.builtUpAreaSqm === LAGOONS_SL7_V219.sourceBuiltUpAreaSqm;
}
