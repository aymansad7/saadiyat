import { describe, expect, it } from "vitest";
import { getPenthouseProjectPresentation, isPenthousePresentationUnit } from "./penthousePresentation";

describe("penthouse presentation data", () => {
  it("keeps Baccarat project imagery at the project level", () => {
    const presentation = getPenthouseProjectPresentation("onesaadiyat");
    expect(presentation?.imageUrl).toContain("/manus-storage/");
    expect(presentation?.sourceLabel).toContain("Illustrative");
  });

  it("recognises only published penthouse labels for the presentation treatment", () => {
    expect(isPenthousePresentationUnit({ unit_category: "5BR Penthouse" })).toBe(true);
    expect(isPenthousePresentationUnit({ unit_model: "Type A", total_rooms: "3BHK" })).toBe(false);
    expect(isPenthousePresentationUnit({ unit_name: "TheArthouse-R12-08-02", unit_category: "5BR+M (SV)" }, "thearthouse")).toBe(true);
  });
});
