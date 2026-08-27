import { describe, expect, it } from "vitest";
import { getExactOfficialAldarUnitUrl } from "./aldarOfficialLink";

describe("official Aldar unit link validation", () => {
  const exactUrl = "https://world.aldar.com/uae/abudhabi/mamshagarden/property/MamshaGarden-B5-01-05";

  it("accepts only the captured World of Aldar URL for the exact same unit", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-05")).toBe(exactUrl);
  });

  it("uses the verified current Aldar format when a legacy Source Terraces path has been withdrawn", () => {
    const legacyUrl = "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/TheSourceTerraces-R22-05-02";
    expect(getExactOfficialAldarUnitUrl(legacyUrl, "THESOURCETERRACES-R22-05-02")).toBe(
      "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/R22-05-02/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
  });

  it("uses the same verified current format for another Source Terraces unit", () => {
    const legacyUrl = "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/TheSourceTerraces-R22-05-03";
    expect(getExactOfficialAldarUnitUrl(legacyUrl, "TheSourceTerraces-R22-05-03")).toBe(
      "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/R22-05-03/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
  });

  it("rejects a different unit code even when the URL belongs to the same Aldar project", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-06")).toBeNull();
  });

  it("rejects unknown hosts and links that are not individual property routes", () => {
    expect(getExactOfficialAldarUnitUrl("https://example.com/property/MamshaGarden-B5-01-05", "MamshaGarden-B5-01-05")).toBeNull();
    expect(getExactOfficialAldarUnitUrl("https://world.aldar.com/uae/abudhabi/mamshagarden", "MamshaGarden-B5-01-05")).toBeNull();
  });
});
