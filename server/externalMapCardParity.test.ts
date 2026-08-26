import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.resolve(root, relative), "utf8");

const mapSource = read("client/src/pages/SaadiyatMap.tsx");

describe("external card and Interactive Map card parity", () => {
  it.each([
    ["Lagoons", "client/src/components/LagoonsVillaCard.tsx"],
    ["St. Regis", "client/src/components/VillaCard.tsx"],
    ["generic DCR plots", "client/src/components/SimplePlotCard.tsx"],
    ["Nudra", "client/src/pages/Nudra.tsx"],
    ["Four Seasons", "client/src/pages/FourSeasons.tsx"],
    ["Saadiyat Reserve", "client/src/pages/SaadiyatReserve.tsx"],
  ])("shows protected owner facts in the %s external card", (_label, relative) => {
    const source = read(relative);
    expect(source).toContain("ListingOwnerFacts");
  });

  it("places protected owner identity and mobile in the Map Card after authenticated refresh", () => {
    expect(mapSource).toContain("Owner · Authorized View");
    expect(mapSource).toContain("m.phone");
    expect(mapSource).toContain('refetchOnMount: "always"');
    expect(mapSource).toContain("enabled: Boolean(user)");
  });

  it.each([
    ["Lagoons", "client/src/components/LagoonsVillaCard.tsx", "InteractiveMapLink"],
    ["St. Regis", "client/src/components/VillaCard.tsx", "InteractiveMapLink"],
    ["generic DCR plots", "client/src/components/SimplePlotCard.tsx", "/map?plot="],
    ["Nudra", "client/src/pages/Nudra.tsx", "/map?plot="],
    ["Four Seasons", "client/src/pages/FourSeasons.tsx", "/map?plot="],
    ["Saadiyat Reserve", "client/src/pages/SaadiyatReserve.tsx", "/map?plot="],
  ])("keeps an exact external-card-to-map link for %s", (_label, relative, needle) => {
    expect(read(relative)).toContain(needle);
  });

  it("keeps exact map-to-card navigation and the documented core field checklist", () => {
    for (const needle of [
      "m.detailHref",
      "m.tableHref",
      "m.landSqm",
      "m.builtUpSqm",
      "m.originalPrice",
      "m.askingPrice",
      "m.rentPrice",
      "m.transactions",
      "m.dcrHref",
      "m.owner",
      "m.phone",
      "m.tenant",
    ]) {
      expect(mapSource).toContain(needle);
    }
  });
});
