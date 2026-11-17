import { describe, expect, it } from "vitest";
import { CANOPIES_SANCTUARY } from "./canopiesSanctuary";
import { areaForProject } from "../../../server/aldarAreas";

describe("The Canopies Sanctuary brochure", () => {
  it("keeps the new Yas Point release separate from the original Canopies", () => {
    expect(CANOPIES_SANCTUARY.slug).toBe("the-canopies-sanctuary");
    expect(CANOPIES_SANCTUARY.location).toBe("Yas Point · Yas Island");
    expect(areaForProject(CANOPIES_SANCTUARY.slug)).toBe("yas-island");
    expect(areaForProject("the-canopies")).toBe("yas-island");
  });
  it("links the supplied original brochure without assigning it to an exact unit", () => {
    expect(CANOPIES_SANCTUARY.brochure).toBe("/manus-storage/TheCanopiesSanctuaryBrochure_f425a406.pdf");
    expect(CANOPIES_SANCTUARY.brochureFilename).toBe("TheCanopiesSanctuaryBrochure.pdf");
    expect(CANOPIES_SANCTUARY.documentScope).toContain("unmodified");
    expect(CANOPIES_SANCTUARY).not.toHaveProperty("unitName");
  });
});
