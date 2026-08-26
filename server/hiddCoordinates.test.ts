import { describe, expect, it } from "vitest";
import { hiddVillaCoords } from "../client/src/data/hiddCoordinates";
import street11Audit from "./data/hidd_street11_yandex_2026_08_26.json";

const directControls = new Map<string, { lat: number; lng: number }>([
  ["2|20", { lat: 24.567808, lng: 54.458334 }],
  ["2|25", { lat: 24.568441, lng: 54.458343 }],
  ["1|22", { lat: 24.565335, lng: 54.461819 }],
  ["3|26", { lat: 24.566247, lng: 54.463364 }],
  ["4|24", { lat: 24.568778, lng: 54.458657 }],
  ["BOULEVARD|80", { lat: 24.581831, lng: 54.471252 }],
  ["BOULEVARD|118", { lat: 24.586218, lng: 54.474764 }],
  ["11|1", { lat: 24.571004, lng: 54.463814 }],
  ["11|19", { lat: 24.570766, lng: 54.465898 }],
  ["1|10", { lat: 24.566338, lng: 54.460948 }],
  ["BOULEVARD|71", { lat: 24.579581, lng: 54.470641 }],
  ["BOULEVARD|123", { lat: 24.584537, lng: 54.473476 }],
]);

describe("Hidd Al Saadiyat control-calibrated coordinates", () => {
  it("preserves user-supplied controls exactly", () => {
    for (const [key, expected] of directControls) {
      const [street, villaNumber] = key.split("|");
      const point = hiddVillaCoords.find((item) => item.street === street && item.villaNumber === villaNumber);
      expect(point, key).toBeDefined();
      expect(point?.positionSource).toBe("user_supplied_coordinate");
      expect(point?.lat).toBe(expected.lat);
      expect(point?.lng).toBe(expected.lng);
    }
  });

  it("labels user controls, exact Yandex matches, and calibrated positions as distinct sources", () => {
    expect(hiddVillaCoords).toHaveLength(468);
    expect(hiddVillaCoords.filter((item) => item.positionSource === "user_supplied_coordinate")).toHaveLength(39);
    expect(hiddVillaCoords.filter((item) => item.positionSource === "yandex_exact_address_match")).toHaveLength(378);
    expect(hiddVillaCoords.every((item) => ["user_supplied_coordinate", "yandex_exact_address_match", "street_control_calibrated", "shape_control_calibrated"].includes(item.positionSource))).toBe(true);
    expect(hiddVillaCoords.filter((item) => item.positionSource !== "user_supplied_coordinate").every((item) => item.controlPlot === null)).toBe(true);
  });

  it("uses only completed high-confidence Street 11 matches and skips incomplete lookups", () => {
    expect(street11Audit.accepted).toHaveLength(26);
    expect(street11Audit.skipped).toHaveLength(36);
    expect(street11Audit.accepted.every((item) => item.street === "11" && item.returnedAddress.startsWith(`${item.villaNumber}, 11 Street`))).toBe(true);

    const villa27 = hiddVillaCoords.find((item) => item.street === "11" && item.villaNumber === "27");
    expect(villa27).toMatchObject({
      lat: 24.571661,
      lng: 54.466104,
      positionSource: "yandex_exact_address_match",
    });
  });
});
