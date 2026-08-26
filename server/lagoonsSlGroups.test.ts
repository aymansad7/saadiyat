import { describe, expect, it } from "vitest";
import source from "./data/lagoons.json";
import { getLagoonsSlPhase } from "../client/src/pages/LagoonsSlGroup";
import type { LagoonsVilla } from "../client/src/data/lagoons";
import { buildMarkers } from "../client/src/pages/SaadiyatMap";

describe("Lagoons SL groups from Aldar card codes", () => {
  const villas = source.villas as LagoonsVilla[];

  it("parses only an explicit SL code in Aldar unit or building-section fields", () => {
    const counts = new Map<string, number>();
    for (const villa of villas) {
      const phase = getLagoonsSlPhase(villa);
      if (phase) counts.set(phase, (counts.get(phase) ?? 0) + 1);
    }
    expect(Object.fromEntries(counts)).toMatchObject({ SL2: 173, SL3: 336, SL4: 147, SL5: 283, SL7: 235, SL8: 375 });
  });

  it("does not infer a phase from an unrelated label when no Aldar code exists", () => {
    const withoutAldarCode = { ...villas[0], aldar_data: { ...villas[0].aldar_data, building_section: null, aldar_unit_name: null } };
    expect(getLagoonsSlPhase(withoutAldarCode)).toBeNull();
  });

  it("keeps the documented 4BHK, 5BHK and 6BHK models represented within each group", () => {
    for (const phase of ["SL2", "SL3", "SL4", "SL5", "SL7", "SL8"]) {
      const models = new Set(villas.filter((villa) => getLagoonsSlPhase(villa) === phase).map((villa) => villa.model));
      expect(models.has("4BHK")).toBe(true);
      expect(models.has("5BHK")).toBe(true);
      expect(models.has("6BHK")).toBe(true);
    }
  });

  it("passes each documented SL phase through to the corresponding Lagoons map marker", () => {
    const markers = buildMarkers().filter((marker) => marker.community === "lagoons");
    for (const phase of ["SL2", "SL3", "SL4", "SL5", "SL7", "SL8"]) {
      expect(markers.some((marker) => marker.slPhase === phase)).toBe(true);
    }
    expect(markers.filter((marker) => marker.slPhase).every((marker) => /^SL[234578]$/.test(marker.slPhase!))).toBe(true);
  });
});
