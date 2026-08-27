import { describe, expect, it } from "vitest";
import { getExactOfficialAldarUnitUrl, isGeneratedCurrentAldarUnitUrl } from "./aldarOfficialLink";

describe("official Aldar unit link validation", () => {
  const exactUrl = "https://world.aldar.com/uae/abudhabi/mamshagarden/property/MamshaGarden-B5-01-05";

  it("accepts only the captured World of Aldar URL for the exact same unit", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-05")).toBe(exactUrl);
  });

  it("uses the verified current Aldar format when a legacy Source Terraces path has been withdrawn", () => {
    const legacyUrl = "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/TheSourceTerraces-R22-05-02";
    expect(getExactOfficialAldarUnitUrl(legacyUrl, "THESOURCETERRACES-R22-05-02", "the-source-terraces")).toBe(
      "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/R22-05-02/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
  });

  it("uses the same verified current format for another Source Terraces unit", () => {
    const legacyUrl = "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/TheSourceTerraces-R22-05-03";
    expect(getExactOfficialAldarUnitUrl(legacyUrl, "TheSourceTerraces-R22-05-03", "the-source-terraces")).toBe(
      "https://world.aldar.com/uae/abudhabi/thesourceterraces/property/R22-05-03/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
  });

  it("rejects a different unit code even when the URL belongs to the same Aldar project", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-06")).toBeNull();
  });

  it("generates the verified current Mamsha Gardens format when an active unit has no legacy URL", () => {
    expect(getExactOfficialAldarUnitUrl(null, "MamshaGarden-B5-01-05", "mamsha-gardens")).toBe(
      "https://world.aldar.com/uae/abudhabi/mamshagarden/property/B5-01-05/0?unitstate=floorplan&scheme=S1&furnished=true",
    );
  });

  it("uses the captured Nobu B2 East unit format rather than the unverified legacy unit-code shape", () => {
    expect(getExactOfficialAldarUnitUrl(null, "NobuResidences-B2-East-05-01", "nobu-residences")).toBe(
      "https://world.aldar.com/uae/abudhabi/noburesidences/property/B2E-05-01/0?scheme=S1&unitstate=interior&furnished=true",
    );
  });

  it("prioritizes the documented Sustainable City URL over a stale legacy unit path", () => {
    expect(getExactOfficialAldarUnitUrl(
      "https://world.aldar.com/uae/abudhabi/thesustainablecity/property/SC-YN7-TH-362",
      "SC-YN7-TH-362",
      "the-sustainable-city-yas-island",
    )).toBe("https://world.aldar.com/uae/abudhabi/sc/property/YN7-362-01/0?unitstate=floorplan&scheme=S1&furnished=true");
  });

  it("keeps Sustainable City rule scoped to the documented unit rather than giving arbitrary SC units a bypass", () => {
    expect(getExactOfficialAldarUnitUrl(
      "https://world.aldar.com/uae/abudhabi/sc/property/SC-YN7-TH-001",
      "SC-YN7-TH-001",
      "the-sustainable-city-yas-island",
    )).toBe("https://world.aldar.com/uae/abudhabi/sc/property/YN7-001-01/0?unitstate=floorplan&scheme=S1&furnished=true");
  });

  it("keeps each generated current URL strictly scoped to its matching project rule", () => {
    expect(getExactOfficialAldarUnitUrl(
      "https://world.aldar.com/uae/abudhabi/onesaadiyat/property/OneSaadiyat-Zenith-06-03",
      "OneSaadiyat-Zenith-06-03",
      "onesaadiyat",
    )).toBe("https://world.aldar.com/uae/abudhabi/onesaadiyat/property/Zenith-06-03/0?unitstate=floorplan&scheme=S1&furnished=true");
    expect(getExactOfficialAldarUnitUrl(
      null,
      "OneSaadiyat-Zenith-06-03",
      "the-sustainable-city-yas-island",
    )).toBeNull();
  });

  it("recognizes browser-safe current URLs without trusting a stale legacy target", () => {
    const sustainableCurrent = getExactOfficialAldarUnitUrl(null, "SC-YN7-TH-362", "the-sustainable-city-yas-island");
    const oneCurrent = getExactOfficialAldarUnitUrl(null, "OneSaadiyat-Zenith-06-03", "onesaadiyat");
    expect(isGeneratedCurrentAldarUnitUrl(sustainableCurrent, "SC-YN7-TH-362", "the-sustainable-city-yas-island")).toBe(true);
    expect(isGeneratedCurrentAldarUnitUrl(oneCurrent, "OneSaadiyat-Zenith-06-03", "onesaadiyat")).toBe(true);
    expect(isGeneratedCurrentAldarUnitUrl(
      "https://world.aldar.com/uae/abudhabi/sc/property/SC-YN7-TH-362",
      "SC-YN7-TH-362",
      "the-sustainable-city-yas-island",
    )).toBe(false);
  });

  it.each([
    ["al-deem-townhomes", "AlDeemTownhomes-AlDeem-TH-399", "aldeemtownhomes", "AlDeem-399-01"],
    ["almarjan", "AlMarjan-B3-19-03", "almarjan", "B3-19-03"],
    ["rosso-bay-residences", "AlMarjan-R2-23-03", "almarjan", "R2-23-03"],
    ["al-ghadeer-gardens", "AlGhadeerGardens-R2-V-078", "alghadeergardens", "R2-V-078-01"],
    ["athlon", "Athlon-Olympia-TH-33-01", "athlon", "Olympia-33-01"],
    ["fahidbeachresidences", "FahidBeachResidences-B6-08-06", "fahidbeachresidences", "B6-08-06"],
    ["fahidbeachterraces", "FahidBeachTerraces-B1-02-09", "fahidbeachterraces", "B1-02-09"],
    ["fountainviewresidences", "FountainViewResidences-B2-09-01", "fountainviewresidences", "B2-09-01"],
    ["onesaadiyat", "OneSaadiyat-Zenith-06-03", "onesaadiyat", "Zenith-06-03"],
    ["the-canopies", "TheCanopies-B1-01-14", "thecanopies", "B1-01-14"],
    ["thearthouse", "TheArthouse-R12-08-02", "thearthouse", "R12-08-02"],
    ["thebeachhouse", "TheBeachHouse-B4-01-02", "thebeachhouse", "B4-01-02"],
    ["verdes", "Verdes-Pine-07-08", "verdes", "Pine-07-08"],
    ["wilds", "TheWilds-P5-V-005-01", "wilds", "P5-005-01"],
    ["gardenia-bay", "Gardenia-Fuchsia-B21-02-07", "gardenia", "Fuchsia-02-07"],
    ["rise-by-athlon-1", "RiseByAthlon-Azul-02-05", "risebyathlon", "Azul-02-05"],
    ["rise-by-athlon-2", "RiseByAthlon-Cyan-03-12", "risebyathlon", "Cyan-03-12"],
    ["rise-by-athlon-3", "RiseByAthlon-Grid-01-09", "risebyathlon", "Grid-01-09"],
    ["rise-by-athlon-4", "RiseByAthlon-Foundry-01-09", "risebyathlon", "Foundry-01-09"],
    ["sama-yas", "SamaYas-B1-02-02", "samayas", "B1-02-02"],
    ["yas-links-luxury-living", "YasLinksLuxury-B1-08-01", "yaslinksluxury", "B1-08-01"],
    ["yas-park-place", "YasParkPlace-B1-01-01", "yasparkplace", "B1-01-01"],
    ["faya-al-saadiyat", "FayaAlSaadiyat-SB45-V-21-01", "fayaalsaadiyat", "FayaAlSaadiyat-SB45-V-21-01"],
    ["faya-al-saadiyat-ii", "FayaAlSaadiyatII-SDN2-V-01-01", "fayaalsaadiyatii", "SDN2-01-01"],
    ["mamsha-palm", "MamshaPalm-Residence-05-08", "mamshapalm", "Residence-05-08"],
    ["the-row-saadiyat", "TheRowSaadiyat-B1-02-12", "therowsaadiyat", "B1-02-12"],
  ])("generates only the verified current format for %s", (projectSlug, unitName, projectPath, code) => {
    const city = projectSlug === "wilds" ? "dubai" : "abudhabi";
    expect(getExactOfficialAldarUnitUrl(null, unitName, projectSlug)).toBe(
      `https://world.aldar.com/uae/${city}/${projectPath}/property/${code}/0?unitstate=floorplan&scheme=S1&furnished=true`,
    );
  });

  it("does not generate a current URL for units confirmed withdrawn from the current project format", () => {
    expect(getExactOfficialAldarUnitUrl(null, "TheRowSaadiyat-B1-01-15", "the-row-saadiyat")).toBeNull();
    expect(getExactOfficialAldarUnitUrl(null, "AlMarjan-B2-16-09", "almarjan")).toBeNull();
    expect(getExactOfficialAldarUnitUrl(null, "TheCanopies-B1-02-04", "the-canopies")).toBeNull();
    expect(getExactOfficialAldarUnitUrl(null, "FahidBeachResidences-B5-01-04", "fahidbeachresidences")).toBeNull();
    expect(getExactOfficialAldarUnitUrl(null, "Grove-R16-05-09", "louvreresidences")).toBeNull();
  });

  it("rejects unknown hosts and links that are not individual property routes", () => {
    expect(getExactOfficialAldarUnitUrl("https://example.com/property/MamshaGarden-B5-01-05", "MamshaGarden-B5-01-05")).toBeNull();
    expect(getExactOfficialAldarUnitUrl("https://world.aldar.com/uae/abudhabi/mamshagarden", "MamshaGarden-B5-01-05")).toBeNull();
  });
});
