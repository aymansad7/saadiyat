import { describe, expect, it } from "vitest";
import { getPenthouseProjectPresentation, isPenthousePresentationUnit, PENTHOUSES_GUGGENHEIM_HERO } from "./penthousePresentation";

describe("penthouse presentation data", () => {
  it("keeps Baccarat project imagery at the project level", () => {
    const presentation = getPenthouseProjectPresentation("onesaadiyat");
    expect(presentation?.imageUrl).toContain("/manus-storage/");
    expect(presentation?.sourceLabel).toContain("Not an exact-unit view");
    expect(presentation?.gallery).toHaveLength(10);
    expect(presentation?.gallery?.every(image => image.url.includes("/manus-storage/"))).toBe(true);
  });

  it("uses the supplied Guggenheim project/category image as the Penthouse hero", () => {
    expect(PENTHOUSES_GUGGENHEIM_HERO.url).toContain("/manus-storage/");
    expect(PENTHOUSES_GUGGENHEIM_HERO.sourceLabel).toContain("Not an exact-unit view");
  });

  it("recognises only published penthouse labels for the presentation treatment", () => {
    expect(isPenthousePresentationUnit({ unit_category: "5BR Penthouse" })).toBe(true);
    expect(isPenthousePresentationUnit({ unit_model: "Type A", total_rooms: "3BHK" })).toBe(false);
    expect(isPenthousePresentationUnit({ unit_name: "TheArthouse-R12-08-02", unit_category: "5BR+M (SV)" }, "thearthouse")).toBe(true);
  });

  it("enables the presentation treatment for the two documented Nobu top-floor residences only", () => {
    expect(isPenthousePresentationUnit({ unit_name: "NobuResidences-B2-East-05-01", unit_category: "3 Bedroom" }, "nobu-residences")).toBe(true);
    expect(isPenthousePresentationUnit({ unit_name: "NobuResidences-B1-08-04", unit_category: "3 Bedroom" }, "nobu-residences")).toBe(false);
  });
});
