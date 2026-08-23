import { describe, expect, it } from "vitest";
import { buildMarkers } from "../SaadiyatMap";

describe("Saadiyat interactive map cards", () => {
  const markers = buildMarkers();

  it("uses the correct St. Regis detail route and includes its transactions", () => {
    const marker = markers.find((item) => item.villaKey === "st-regis/Plot-1");
    expect(marker?.detailHref).toBe("/st-regis/villa/1");
    expect(marker?.transactions?.length).toBeGreaterThan(0);
  });

  it("does not duplicate Golf Views as SBV Gate 1 markers", () => {
    expect(markers.some((item) => item.villaKey?.includes("saadiyat-beach-villas/Gate1-"))).toBe(false);
    const golf = markers.find((item) => item.villaKey === "golf-views/SDN2_6-1_2");
    expect(golf?.transactions?.length).toBeGreaterThan(0);
    expect(golf?.detailHref).toContain("/community/saadiyat-golf-views");
  });

  it("provides detail links for every mapped community marker", () => {
    const communities = [
      "st-regis",
      "jawaher",
      "saadiyat-beach-villas",
      "saadiyat-golf-views",
      "hidd",
      "private-villas",
      "lagoons",
    ];
    for (const community of communities) {
      const communityMarkers = markers.filter((item) => item.community === community);
      expect(communityMarkers.length).toBeGreaterThan(0);
      expect(communityMarkers.every((item) => Boolean(item.detailHref))).toBe(true);
    }
  });
});
