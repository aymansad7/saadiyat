import { describe, expect, it } from "vitest";
import { validateCanopiesSanctuaryInitialImport } from "./canopiesSanctuaryImport";

function fixture() {
  return { slug: "the-canopies-sanctuary", name: "The Canopies Sanctuary", buildings: [
    { slug: "the-canopies-sanctuary-b1", name: "B1", units: [
      { unit_name: "TheCanopies2-B1-02-10", aldar_link: null, unit_type: "Apartment", bedrooms: "Studio", status: null,
        source_unit_status: "New", price_aed: null, source_project_id: "a22Tq00000Be6jVIAR", source_detail_identity_verified: true },
    ] },
  ] };
}

describe("Sanctuary initial import integrity", () => {
  it("accepts exact newly exposed units without inferring total release coverage or availability", () => {
    const p = validateCanopiesSanctuaryInitialImport(fixture());
    expect(p.buildings[0].units[0]).toMatchObject({ status: null, source_unit_status: "New", price_aed: null });
  });
  it("rejects original phase identities, unverified details and duplicates", () => {
    const original = fixture(); original.buildings[0].units[0].unit_name = "TheCanopies-B1-02-10";
    expect(() => validateCanopiesSanctuaryInitialImport(original)).toThrow("identity");
    const unverified = fixture(); unverified.buildings[0].units[0].source_detail_identity_verified = false;
    expect(() => validateCanopiesSanctuaryInitialImport(unverified)).toThrow("not verified");
    const duplicate = fixture(); duplicate.buildings[0].units.push(duplicate.buildings[0].units[0]);
    expect(() => validateCanopiesSanctuaryInitialImport(duplicate)).toThrow("duplicate");
  });
  it("rejects placeholder prices instead of importing AED 1 as a launch price", () => {
    const p = fixture(); (p.buildings[0].units[0] as {price_aed: number | null}).price_aed = 1;
    expect(() => validateCanopiesSanctuaryInitialImport(p)).toThrow("placeholders");
  });
});
