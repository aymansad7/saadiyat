import { describe, expect, it } from "vitest";
import { getAldarOfficialPenthouseGallery } from "./aldarOfficialPenthouseMedia";

describe("Aldar official penthouse gallery", () => {
  it("returns the category-level Mandarin gallery only for its two documented penthouses", () => {
    expect(getAldarOfficialPenthouseGallery("fountainviewresidences", "FountainViewResidences-B1-09-01")?.images).toHaveLength(2);
    expect(getAldarOfficialPenthouseGallery("fountainviewresidences", "FountainViewResidences-B2-09-01")?.sourceLabel).toContain("category");
    expect(getAldarOfficialPenthouseGallery("fountainviewresidences", "FountainViewResidences-B1-08-01")).toBeNull();
    expect(getAldarOfficialPenthouseGallery("noburesidences", "NobuResidences-B2E-05-01")).toBeNull();
  });
});
