import { describe, expect, it } from "vitest";
import { hiddVillaCoords } from "../client/src/data/hiddCoordinates";

const directControls = new Map<string, { lat: number; lng: number }>([
  ["2|20", { lat: 24.567808, lng: 54.458334 }],
  ["2|25", { lat: 24.568441, lng: 54.458343 }],
  ["1|22", { lat: 24.565335, lng: 54.461819 }],
  ["3|26", { lat: 24.566247, lng: 54.463364 }],
  ["4|24", { lat: 24.568778, lng: 54.458657 }],
  ["BOULEVARD|80", { lat: 24.581831, lng: 54.471252 }],
  ["BOULEVARD|118", { lat: 24.586218, lng: 54.474764 }],
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
    expect(hiddVillaCoords.filter((item) => item.positionSource === "user_supplied_coordinate")).toHaveLength(28);
    expect(hiddVillaCoords.filter((item) => item.positionSource === "yandex_exact_address_match")).toHaveLength(366);
    expect(hiddVillaCoords.every((item) => ["user_supplied_coordinate", "yandex_exact_address_match", "street_control_calibrated", "shape_control_calibrated"].includes(item.positionSource))).toBe(true);
    expect(hiddVillaCoords.filter((item) => item.positionSource !== "user_supplied_coordinate").every((item) => item.controlPlot === null)).toBe(true);
  });
});
