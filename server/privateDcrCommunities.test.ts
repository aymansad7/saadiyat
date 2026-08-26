import { describe, expect, it } from "vitest";
import {
  BUILDING_PLOTS_SDW4,
  BUILDING_PLOTS_SDW4_UNAVAILABLE_DCRS,
  PRIVATE_OWNERS_VIP_PLOTS,
  PRIVATE_OWNERS_VIP_UNAVAILABLE_DCRS,
} from "../client/src/data/privateOwnersVip";
import { buildMarkers } from "../client/src/pages/SaadiyatMap";

describe("Private Owners VIP and Building Plots SDW4 DCR registries", () => {
  it("preserves only accessible DCR records and explicitly lists unavailable files", () => {
    expect(PRIVATE_OWNERS_VIP_PLOTS).toHaveLength(7);
    expect(PRIVATE_OWNERS_VIP_UNAVAILABLE_DCRS).toEqual(["SDN3_7"]);
    expect(BUILDING_PLOTS_SDW4).toHaveLength(26);
    expect(BUILDING_PLOTS_SDW4_UNAVAILABLE_DCRS).toEqual(["SDW4_C7", "SDW4_C8", "SDW4_C9", "SDW4_C12", "SDW4_C14", "SDW4_C28"]);
  });

  it("keeps official DCR centroids and direct source links for every published plot", () => {
    for (const plot of [...PRIVATE_OWNERS_VIP_PLOTS, ...BUILDING_PLOTS_SDW4]) {
      expect(plot.latitude).toBeGreaterThan(24.4);
      expect(plot.longitude).toBeGreaterThan(54.3);
      expect(plot.landSqm).toBeGreaterThan(0);
      expect(plot.maxGfaSqm).toBeGreaterThan(0);
      expect(plot.dcrUrl).toBe(`https://geosmart.dmt.gov.ae/dcr/${plot.id}.pdf`);
      expect(plot.locationSource).toBe("Official DCR UTM boundary centroid");
    }
  });

  it("adds full DCR-only cards to the Interactive Map without an availability claim", () => {
    const markers = buildMarkers();
    const privateMarkers = markers.filter((marker) => marker.community === "private-owners-vip");
    const buildingMarkers = markers.filter((marker) => marker.community === "building-plots-sdw4");
    expect(privateMarkers).toHaveLength(PRIVATE_OWNERS_VIP_PLOTS.length);
    expect(buildingMarkers).toHaveLength(BUILDING_PLOTS_SDW4.length);
    expect(privateMarkers[0]).toMatchObject({
      label: `Plot ${PRIVATE_OWNERS_VIP_PLOTS[0].plotNumber}`,
      dcrHref: PRIVATE_OWNERS_VIP_PLOTS[0].dcrUrl,
    });
    expect(buildingMarkers[0]).toMatchObject({
      label: `Plot ${BUILDING_PLOTS_SDW4[0].plotNumber}`,
      dcrHref: BUILDING_PLOTS_SDW4[0].dcrUrl,
    });
    expect(privateMarkers[0]).not.toHaveProperty("availabilityStatus");
    expect(buildingMarkers[0]).not.toHaveProperty("availabilityStatus");
  });
});
