import { describe, expect, it } from "vitest";
import { normalizeUnitSearch, scoreSmartUnitSearch, type SearchableUnit } from "./unitSearch";

const sustainableTownhouse: SearchableUnit = {
  unitName: "SC-YN7-TH-362",
  projectName: "The Sustainable City Yas Island",
  projectSlug: "the-sustainable-city-yas-island",
  buildingName: "SC-YN7",
  buildingSlug: "sc-yn7",
  dataset: "other",
  status: "Available",
  priceAed: null,
  bedrooms: "4",
  unitType: "TownHouse",
  areaSqm: null,
  areaSqft: null,
  href: "/aldar-other/the-sustainable-city-yas-island/sc-yn7/SC-YN7-TH-362",
};

const fayaVilla: SearchableUnit = {
  unitName: "FayaAlSaadiyat-SB45-V-01-01",
  projectName: "Faya Al Saadiyat",
  projectSlug: "faya-al-saadiyat",
  buildingName: "SB45",
  buildingSlug: "sb45",
  dataset: "saadiyat",
  status: "Available",
  priceAed: null,
  bedrooms: "7",
  unitType: "Villa",
  areaSqm: null,
  areaSqft: null,
  href: "/aldar-saadiyat/faya-al-saadiyat/sb45/FayaAlSaadiyat-SB45-V-01-01",
};

const oneSaadiyatSkyVilla: SearchableUnit = {
  unitName: "OneSaadiyat-Zenith-03-03",
  projectName: "One Saadiyat (Baccarat)",
  projectSlug: "onesaadiyat",
  buildingName: "Zenith",
  buildingSlug: "zenith",
  dataset: "saadiyat",
  status: "Available",
  priceAed: null,
  bedrooms: "4",
  unitType: "Sky Villa",
  areaSqm: null,
  areaSqft: null,
  href: "/aldar-saadiyat/onesaadiyat/zenith/OneSaadiyat-Zenith-03-03",
};

describe("smart global unit search", () => {
  it("normalizes separators in Aldar project and unit-code searches", () => {
    expect(normalizeUnitSearch("SC 362")).toBe("sc362");
    expect(normalizeUnitSearch("SC-YN7-TH-362")).toBe("scyn7th362");
  });

  it("matches SC 362 to the documented Sustainable City townhouse", () => {
    expect(scoreSmartUnitSearch("sc 362", sustainableTownhouse)).toBeGreaterThan(0);
    expect(scoreSmartUnitSearch("SC-YN7 TH 362", sustainableTownhouse)).toBeGreaterThan(0);
    expect(scoreSmartUnitSearch("townhouse 362", sustainableTownhouse)).toBeGreaterThan(0);
  });

  it("does not associate an unrelated unit number with the property", () => {
    expect(scoreSmartUnitSearch("sc 361", sustainableTownhouse)).toBe(0);
    expect(scoreSmartUnitSearch("faya 362", sustainableTownhouse)).toBe(0);
  });

  it("matches documented Faya and One Saadiyat unit tokens across separators", () => {
    expect(scoreSmartUnitSearch("faya 01 01", fayaVilla)).toBeGreaterThan(0);
    expect(scoreSmartUnitSearch("SB45 V 01 01", fayaVilla)).toBeGreaterThan(0);
    expect(scoreSmartUnitSearch("one saadiyat zenith 03 03", oneSaadiyatSkyVilla)).toBeGreaterThan(0);
    expect(scoreSmartUnitSearch("sky villa 03 03", oneSaadiyatSkyVilla)).toBeGreaterThan(0);
  });
});
