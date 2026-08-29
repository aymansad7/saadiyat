import { describe, expect, it } from "vitest";
import { safeOneDriveName, unitFolderPath } from "./oneDrive";

describe("OneDrive unit-folder boundaries", () => {
  it("uses the canonical community, phase, and unit key below the approved root", () => {
    expect(unitFolderPath({ community: "lagoons", phaseKey: "SL2", villaKey: "Lagoons/SL2/139-01", documentType: "spa" })).toEqual([
      "Communities",
      "lagoons",
      "SL2",
      "Lagoons-SL2-139-01",
      "SPA",
    ]);
  });

  it("neutralizes separators and invalid OneDrive characters instead of accepting a path", () => {
    expect(safeOneDriveName("../Owner: File?", "Document")).toBe(".-Owner- File-");
    expect(() => safeOneDriveName("   ", "Document")).toThrow("Document is required");
  });

  it("routes marketing and owner files to distinct, deterministic category folders", () => {
    expect(unitFolderPath({ community: "hidd", villaKey: "Hidd/100", documentType: "marketing" }).at(-1)).toBe("Marketing");
    expect(unitFolderPath({ community: "hidd", villaKey: "Hidd/100", documentType: "owner_document" }).at(-1)).toBe("Owner-Documents");
  });
});
