import { describe, expect, it } from "vitest";
import { selectYasParkPlaceSourceUnits, YAS_PARK_PLACE_CONFIG } from "./yasParkPlaceOfficialSync";

describe("Yas Park Place official source capture", () => {
  it("retains only exact Yas Park Place unit identities with published source states", () => {
    const selected = selectYasParkPlaceSourceUnits([
      { unitNumber: "YasParkPlace-B1-02-03", unitStatus: "Sold" },
      { unitNumber: "YasParkPlace-B6-16-01", unitStatus: "Available" },
      { unitNumber: "YasParkPlace-B1-02-03", unitStatus: "Sold" },
      { unitNumber: "Talay-MarsaAlSaadiyat-V-001-01", unitStatus: "New" },
      { unitNumber: "YasParkPlace-B1-02-04", unitStatus: "" },
    ]);
    expect(selected).toEqual([
      { unitName: "YasParkPlace-B1-02-03", sourceStatus: "Sold" },
      { unitName: "YasParkPlace-B6-16-01", sourceStatus: "Available" },
    ]);
  });

  it("uses the verified 780-unit source coverage threshold", () => {
    expect(YAS_PARK_PLACE_CONFIG.expectedUnitCount).toBe(780);
    expect(YAS_PARK_PLACE_CONFIG.areaKey).toBe("yas-island");
  });
});
