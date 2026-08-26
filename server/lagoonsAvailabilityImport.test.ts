import { describe, expect, it } from "vitest";
import importData from "./data/lagoons_availability_2026_08_26.json";
import {
  getAvailability,
  SHARED_AVAILABILITY_BY_UNIT,
} from "../client/src/data/lagoonsAvailability";
import { buildMarkers, getMapMarkerColor } from "../client/src/pages/SaadiyatMap";

describe("Saadiyat Lagoons availability import", () => {
  it("publishes only exact villa-key matches from the shared availability sheet", () => {
    expect(importData.summary).toEqual({
      source_rows: 23,
      exact_villas: 10,
      ambiguous_villas: 9,
      unmatched_rows: 4,
    });
    expect(Object.keys(SHARED_AVAILABILITY_BY_UNIT)).toHaveLength(10);
    expect(SHARED_AVAILABILITY_BY_UNIT["Lagoons-AlSidr-V-198-01"]?.asking_price_aed).toBe(9_500_000);
    expect(SHARED_AVAILABILITY_BY_UNIT["Lagoons-AlGhaf-V-099-02"]).toBeUndefined();
  });

  it("marks an exact shared-sheet match as available and exposes its documented asking price on the map", () => {
    const availability = getAvailability("Lagoons-AlSidr-V-198-01");
    expect(availability.sources).toContain("shared-availability");
    expect(availability.sharedAvailability?.asking_price_aed).toBe(9_500_000);

    const marker = buildMarkers().find((item) => item.villaKey === "lagoons/AlSidr-198-01");
    expect(marker?.availabilityStatus).toBe("available");
    expect(marker?.askingPrice).toBe(9_500_000);
    expect(getMapMarkerColor(marker!)).toBe("#10B981");
  });
});
