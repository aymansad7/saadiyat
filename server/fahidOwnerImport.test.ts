import { describe, expect, it } from "vitest";
import { normalizeOwnerPhone, ownerIdentityKey, planFahidOwnerImport } from "./fahidOwnerImport";

const beachHouse = {
  projectName: "The Beach House Fahid",
  projectSlug: "thebeachhouse",
  units: [
    { projectName: "The Beach House Fahid", projectSlug: "thebeachhouse", buildingKey: "b-3", buildingName: "Building 3", unitName: "TheBeachHouse-B1-08-05", unitTypeKey: "2BHK", bedrooms: 2 },
    { projectName: "The Beach House Fahid", projectSlug: "thebeachhouse", buildingKey: "b-8", buildingName: "Building 8", unitName: "TheBeachHouse-B8-01-01", unitTypeKey: "1BHK", bedrooms: 1 },
  ],
};

describe("FAHAD owner import planning", () => {
  it("uses unique B8–B11 evidence to select The Beach House before linking B1 records", () => {
    const plan = planFahidOwnerImport([
      { sourceRow: 2, sourceUnit: "B1-08-05", ownerName: "Owner One", ownerPhone: "0500000000", rawMobile: "0500000000" },
      { sourceRow: 3, sourceUnit: "B8-01-01", ownerName: "Owner Two", ownerPhone: "***", rawMobile: "***" },
    ], [
      beachHouse,
      { projectName: "Fahid Beach Terraces", projectSlug: "fahidbeachterraces", units: [{ ...beachHouse.units[0]!, projectName: "Fahid Beach Terraces", projectSlug: "fahidbeachterraces", unitName: "FahidBeachTerraces-B1-08-05" }] },
    ]);

    expect(plan.identifiedProject.slug).toBe("thebeachhouse");
    expect(plan.linked).toHaveLength(2);
    expect(plan.linked[0]?.villaKey).toContain("aldar-other/thebeachhouse/b-3/TheBeachHouse-B1-08-05");
  });

  it("keeps malformed and absent source codes unlinked instead of repairing or guessing", () => {
    const plan = planFahidOwnerImport([
      { sourceRow: 5, sourceUnit: "B8-01-01", ownerName: "Known", ownerPhone: null, rawMobile: "" },
      { sourceRow: 6, sourceUnit: "B2-07--04", ownerName: "Malformed", ownerPhone: null, rawMobile: "" },
      { sourceRow: 7, sourceUnit: "B9-99-99", ownerName: "Absent", ownerPhone: null, rawMobile: "" },
    ], [beachHouse]);
    expect(plan.linked).toHaveLength(1);
    expect(plan.unlinked.map(row => row.reason)).toEqual(["invalid_unit_format", "no_exact_unit_in_identified_project"]);
  });

  it("normalizes contact values without merging phone-less VIP labels across different source units", () => {
    expect(normalizeOwnerPhone(" *** ")).toBeNull();
    expect(normalizeOwnerPhone("05 0123 4567")).toBe("0501234567");
    expect(ownerIdentityKey({ ownerName: "VVIP", ownerPhone: null, sourceUnit: "B1-01-01" }))
      .not.toBe(ownerIdentityKey({ ownerName: "VVIP", ownerPhone: null, sourceUnit: "B1-01-02" }));
  });
});
