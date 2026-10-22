import { describe, expect, it } from "vitest";
import { isExactLagoonsSl7Villa219Source, LAGOONS_SL7_V219 } from "./lagoonsSl7Villa219";

describe("Lagoons Wilds SL7 Villa 219 listing record", () => {
  it("requires the exact Aldar unit identity and source-backed dimensions", () => {
    expect(isExactLagoonsSl7Villa219Source({
      aldarUnitName: "Lagoons-Wilds-SL7-V-219",
      bedrooms: 6,
      landAreaSqm: 874.25,
      builtUpAreaSqm: 591.43,
    })).toBe(true);
    expect(isExactLagoonsSl7Villa219Source({
      aldarUnitName: "Lagoons-Wilds-SL8-V-219",
      bedrooms: 6,
      landAreaSqm: 874.25,
      builtUpAreaSqm: 591.43,
    })).toBe(false);
  });

  it("keeps the supplied all-in purchase reference separate from a resale asking price", () => {
    expect(LAGOONS_SL7_V219.masterListing.status).toBe("available");
    expect(LAGOONS_SL7_V219.masterListing.askingPriceAed).toBeNull();
    expect(LAGOONS_SL7_V219.financialReference.totalPaidToDateAed).toBe(
      LAGOONS_SL7_V219.financialReference.ownerPaymentsToDateAed
      + LAGOONS_SL7_V219.financialReference.registrationFeesAed,
    );
    expect(LAGOONS_SL7_V219.masterListing.publicNotes).not.toContain("12,273,267.84");
  });
});
