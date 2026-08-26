import { describe, expect, it } from "vitest";
import { buildMarkers, COMMUNITY_CENTERS, getMapMarkerColor } from "../client/src/pages/SaadiyatMap";

describe("Unified map property cards", () => {
  const markers = buildMarkers();

  it("represents every SL9 DCR plot with direct document and mapping links", () => {
    const sl9 = markers.filter((marker) => marker.community === "lagoons-hidden-sl9");
    expect(sl9).toHaveLength(257);
    expect(sl9.every((marker) => marker.label.startsWith("Villa "))).toBe(true);
    expect(sl9.every((marker) => marker.landSqm && marker.builtUpSqm && marker.dcrHref && marker.dmtHref && marker.googleMapsHref)).toBe(true);
    expect(sl9.every((marker) => marker.detailLines?.includes("Official DCR centroid"))).toBe(true);
  });

  it("surfaces documented Hidd villa facts and distinguishes calibrated locations", () => {
    const villa80 = markers.find((marker) => marker.id === "hidd-80-BOULEVARD");
    expect(villa80).toBeDefined();
    expect(villa80?.landSqft).toBeGreaterThan(0);
    expect(villa80?.builtUpSqm).toBeGreaterThan(0);
    expect(villa80?.detailLines).toContain("User-supplied official control");
    expect(villa80?.googleMapsHref).toContain("24.581831,54.471252");

    const villa100 = markers.find((marker) => marker.id === "hidd-100-BOULEVARD");
    expect(villa100?.owner).toContain("Saeed Bin Butti Al Qubaisi");
    expect(villa100?.tenant).toBe("Mariam Alrashdi");
    expect(villa100?.tenantPhone).toBe("0506202222");
    expect(villa100?.tenancyStart).toBeUndefined();

    expect(villa100?.detailLines).toContain("Yandex exact house-address match");
    expect(villa100?.detailHref).toBe("/hidd-al-saadiyat?view=cards#villa-100-BOULEVARD");

    const street11 = markers.filter((marker) => marker.community === "hidd" && marker.detailLines?.includes("Street 11"));
    expect(street11.length).toBeGreaterThan(0);
    expect(street11.every((marker) => marker.detailLines?.includes("Sea View · Street 11"))).toBe(true);
  });

  it("adds Nudra only from exact Yandex house-address results without inventing a B/D/S unit crosswalk", () => {
    const nudra = markers.filter((marker) => marker.community === "nudra");
    expect(nudra).toHaveLength(18);
    expect(nudra.every((marker) => marker.unitType === "Yandex exact house-address match")).toBe(true);
    expect(nudra.every((marker) => marker.detailHref === "/nudra" && marker.tableHref === "/nudra?view=table")).toBe(true);
    expect(nudra.every((marker) => marker.detailLines?.includes("Unit code and price shown after source-backed crosswalk"))).toBe(true);
  });

  it("carries building-area data for map cards when the originating project provides it", () => {
    const stRegis = markers.find((marker) => marker.id === "st-regis-1");
    expect(stRegis?.landSqm).toBeGreaterThan(0);
    expect(stRegis?.builtUpSqm).toBeGreaterThan(0);
    expect(stRegis?.detailLines).toContain("4 bedrooms");

    const fourSeasons = markers.find((marker) => marker.id === "four-seasons-29");
    expect(fourSeasons?.landSqm).toBeGreaterThan(0);
    expect(fourSeasons?.builtUpSqm).toBeGreaterThan(0);
    expect(fourSeasons?.floorplanHref).toBeTruthy();
  });

  it("mirrors documented Aldar facts and resale state for standard Lagoons villas", () => {
    const villa = markers.find((marker) => marker.id === "lagoons-AlGhaf-203-02");
    expect(villa?.landSqm).toBeGreaterThan(0);
    expect(villa?.builtUpSqm).toBeGreaterThan(0);
    expect(villa?.saleableSqm).toBeGreaterThan(0);
    expect(villa?.bedrooms).toBe("5");
    expect(villa?.unitType).toBe("Villa");
    expect(villa?.model).toBe("5BHK");
    expect(villa?.developer).toBe("Aldar");
    expect(villa?.originalPrice).toBeGreaterThan(0);

    const directDcr = markers.find((marker) => marker.id === "lagoons-AlGhaf-139-01");
    expect(directDcr?.dcrHref).toContain("SDE3_2944.pdf");
  });

  it("exposes a direct DCR action for DCR-backed community plots", () => {
    const jawaher = markers.find((marker) => marker.id === "jawaher-1");
    const beachVilla = markers.find((marker) => marker.community === "saadiyat-beach-villas");
    const privateVilla = markers.find((marker) => marker.community === "private-villas");
    expect(jawaher?.dcrHref).toContain("SDN1_");
    expect(beachVilla?.dcrHref).toContain("geosmart.dmt.gov.ae/dcr/");
    expect(privateVilla?.dcrHref).toContain("geosmart.dmt.gov.ae/dcr/");
  });

  it("reserves green strictly for documented available or listed markers", () => {
    expect(getMapMarkerColor({ community: "saadiyat-beach-villas" })).not.toBe("#10B981");
    expect(getMapMarkerColor({ community: "lagoons-hidden-sl9" })).not.toBe("#10B981");
    expect(getMapMarkerColor({ community: "hidd" })).not.toBe("#10B981");
    expect(getMapMarkerColor({ community: "four-seasons", availabilityStatus: "available" })).toBe("#10B981");
    expect(getMapMarkerColor({ community: "jawaher", listing: {} as never })).toBe("#10B981");
    expect(Object.values(COMMUNITY_CENTERS).filter((item) => item.color === "#10B981")).toHaveLength(0);
  });

  it("keeps every project family connected to a property detail/table card with documented land data where provided", () => {
    const families = [
      "st-regis",
      "jawaher",
      "saadiyat-beach-villas",
      "saadiyat-golf-views",
      "hidd",
      "nudra",
      "private-villas",
      "lagoons",
      "four-seasons",
      "saadiyat-reserve",
      "lagoons-hidden-sl9",
    ];

    for (const family of families) {
      const projectMarkers = markers.filter((marker) => marker.community === family);
      expect(projectMarkers.length, family).toBeGreaterThan(0);
      expect(projectMarkers.some((marker) => marker.detailHref && marker.tableHref), family).toBe(true);
    }

    const familiesWithRegisteredLand = families.filter((family) => !["private-villas", "nudra"].includes(family));
    for (const family of familiesWithRegisteredLand) {
      expect(markers.filter((marker) => marker.community === family).some((marker) => marker.landSqm || marker.landSqft), family).toBe(true);
    }
  });
});
