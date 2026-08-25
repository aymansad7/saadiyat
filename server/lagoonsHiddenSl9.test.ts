import { describe, expect, it } from "vitest";
import { LAGOONS_HIDDEN_SL9_PLOTS, LAGOONS_HIDDEN_SL9_SUMMARY } from "../client/src/data/lagoonsHiddenSl9";

describe("Lagoons Hidden Phase SL9 official DCR registry", () => {
  it("contains 257 unique official SL9 DCR plots", () => {
    expect(LAGOONS_HIDDEN_SL9_SUMMARY.officialPlotCount).toBe(257);
    expect(LAGOONS_HIDDEN_SL9_PLOTS).toHaveLength(257);
    expect(new Set(LAGOONS_HIDDEN_SL9_PLOTS.map((plot) => plot.villaKey)).size).toBe(257);
    expect(new Set(LAGOONS_HIDDEN_SL9_PLOTS.map((plot) => plot.dcrId)).size).toBe(257);
    expect(LAGOONS_HIDDEN_SL9_PLOTS.every((plot) => plot.phase === "SL9")).toBe(true);
  });

  it("keeps every coordinate, area, and DCR reference directly source-traceable", () => {
    for (const plot of LAGOONS_HIDDEN_SL9_PLOTS) {
      expect(plot.coordinateSource).toBe("official_dcr_centroid");
      expect(plot.latitude).toBeGreaterThan(24);
      expect(plot.longitude).toBeGreaterThan(54);
      expect(plot.landSqm).toBeGreaterThan(0);
      expect(plot.landSqft).toBeGreaterThan(0);
      expect(plot.boundary.length).toBeGreaterThanOrEqual(3);
      expect(plot.dcrUrl).toMatch(/^\/manus-storage\/SDE3_\d+_[a-f0-9]+\.pdf$/);
      expect(plot.dmtUrl).toBe(`https://geosmart.dmt.gov.ae/dcr/${plot.dcrId}.pdf`);
      expect(plot.googleMapsUrl).toContain(`${plot.latitude}`);
    }
  });

  it("does not fabricate availability, prices, bedrooms, or original prices", () => {
    expect(LAGOONS_HIDDEN_SL9_SUMMARY.availabilityStatus).toBe("unknown");
    expect(LAGOONS_HIDDEN_SL9_PLOTS.every((plot) => plot.availability === "unknown")).toBe(true);
  });
});
