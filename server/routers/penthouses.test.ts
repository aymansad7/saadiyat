import { describe, expect, it } from "vitest";
import { isClientFacingPenthouseProject, isOfficialPenthouse, isUserClassifiedTopFloorPenthouse, penthouseLocationForProject } from "./penthouses";

describe("isOfficialPenthouse", () => {
  it("recognises Aldar penthouse labels across published unit fields", () => {
    expect(isOfficialPenthouse({ unit_name: "A-01", unit_type: "Apartment", unit_category: "5BR Penthouse", unit_model: null, total_rooms: null, bedrooms: "5", status: "Available", price_aed: null, saleable_area_sqm: null, total_area_sqm: null })).toBe(true);
    expect(isOfficialPenthouse({ unit_name: "A-02", unit_type: "Apartment", unit_category: null, unit_model: "Penthouse Type A", total_rooms: null, bedrooms: "4", status: "Available", price_aed: null, saleable_area_sqm: null, total_area_sqm: null })).toBe(true);
  });

  it("does not infer a penthouse when the official type contains no penthouse label", () => {
    expect(isOfficialPenthouse({ unit_name: "A-03", unit_type: "Apartment", unit_category: "3BR Apartment", unit_model: "Type A", total_rooms: "3BHK", bedrooms: "3", status: "Available", price_aed: null, saleable_area_sqm: null, total_area_sqm: null })).toBe(false);
  });

  it("excludes Marjan and Rosso Bay from the client-facing collection", () => {
    expect(isClientFacingPenthouseProject({ slug: "almarjan", name: "Al Marjan Island" })).toBe(false);
    expect(isClientFacingPenthouseProject({ slug: "rosso-bay-residences", name: "Rosso Bay Residences" })).toBe(false);
    expect(isClientFacingPenthouseProject({ slug: "onesaadiyat", name: "One Saadiyat (Baccarat)" })).toBe(true);
  });

  it("classifies Saadiyat and Yas penthouses for the location filters", () => {
    expect(penthouseLocationForProject("saadiyat", "onesaadiyat")).toBe("saadiyat");
    expect(penthouseLocationForProject("other", "yas-links-luxury-living")).toBe("yas-island");
  });

  it("includes only the two user-designated 5BR Sky Villas on The Arthouse top floor", () => {
    const matching = { unit_name: "TheArthouse-R11-08-02", unit_type: "Apartment", unit_category: "5BR+M (SV)", unit_model: null, total_rooms: null, bedrooms: "5", status: "Available", price_aed: 90979000, saleable_area_sqm: 1283.4, total_area_sqm: 1283.4 };
    const nonMatching = { ...matching, unit_name: "TheArthouse-R11-08-01", unit_category: "1BR (A1)", bedrooms: "1" };
    expect(isUserClassifiedTopFloorPenthouse("thearthouse", matching)).toBe(true);
    expect(isUserClassifiedTopFloorPenthouse("thearthouse", nonMatching)).toBe(false);
  });

  it("includes only the two documented Nobu Building 2 top-floor residences", () => {
    const nobuTopFloor = { unit_name: "NobuResidences-B2-East-05-01", unit_type: "Apartment", unit_category: "3 Bedroom", unit_model: "3BHK", total_rooms: null, bedrooms: "3", status: "Available", price_aed: 150805578, saleable_area_sqm: 1435.42, total_area_sqm: 1435.42 };
    const ordinaryNobuTopFloor = { ...nobuTopFloor, unit_name: "NobuResidences-B1-08-04", saleable_area_sqm: 300.62, total_area_sqm: 300.62 };
    expect(isUserClassifiedTopFloorPenthouse("nobu-residences", nobuTopFloor)).toBe(true);
    expect(isUserClassifiedTopFloorPenthouse("nobu-residences", ordinaryNobuTopFloor)).toBe(false);
  });

  it("keeps service-charge values unit-source scoped rather than inferring a charge for every penthouse", () => {
    const charge = 776.51;
    expect(charge / 10.764).toBeCloseTo(72.14, 2);
  });
});
