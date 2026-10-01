import { describe, expect, it } from "vitest";
import {
  FOUR_SEASONS_PROJECT_DETAILS,
  FOUR_SEASONS_PROJECT_DOCUMENT_LINKS,
} from "./fourSeasonsProjectDetails";

describe("Four Seasons official broker project details", () => {
  it("keeps all official master-plan villa families and client document links", () => {
    expect(FOUR_SEASONS_PROJECT_DETAILS.collections).toEqual(expect.arrayContaining([
      "Golf Villas",
      "Garden Villas",
      "Golf View Villas",
      "Sea Side Villas",
      "The Beach Mansions",
      "Royal Beach Mansion",
    ]));
    expect(FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.factSheetUrl).toMatch(/^https:\/\/nasluxury-my\.sharepoint\.com\//);
    expect(FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.numberedMasterPlanUrl).toMatch(/^https:\/\/nasluxury-my\.sharepoint\.com\//);
    expect(FOUR_SEASONS_PROJECT_DOCUMENT_LINKS.collectionsMasterPlanUrl).toMatch(/^https:\/\/nasluxury-my\.sharepoint\.com\//);
  });

  it("retains project-level fact-sheet amenities without attributing them to a villa", () => {
    expect(FOUR_SEASONS_PROJECT_DETAILS.amenities).toContain("Beach lounge");
    expect(FOUR_SEASONS_PROJECT_DETAILS.amenities).toContain("Owners lounge");
    expect(FOUR_SEASONS_PROJECT_DETAILS.indicativeSpecifications.length).toBeGreaterThan(3);
  });

  it("records owner-supplied service charge references separately for villas and apartments", () => {
    expect(FOUR_SEASONS_PROJECT_DETAILS.serviceCharges).toEqual([
      { residenceType: "Villas", aedPerSqft: 24, aedPerSqm: 258.33 },
      { residenceType: "Apartments", aedPerSqft: 61, aedPerSqm: 656.6 },
    ]);
    expect(FOUR_SEASONS_PROJECT_DETAILS.serviceChargeSource).toContain("Owner-supplied");
  });
});
