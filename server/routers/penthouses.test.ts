import { describe, expect, it } from "vitest";
import { isClientFacingPenthouseProject, isOfficialPenthouse, penthouseLocationForProject } from "./penthouses";

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
});
