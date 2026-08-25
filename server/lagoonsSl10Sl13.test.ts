import { describe, expect, it } from "vitest";
import { LAGOONS_SL10_PLOTS, LAGOONS_SL13_PLOTS } from "../client/src/data/lagoonsDcrPhases";

function expectOfficialDcrRegistry(plots: typeof LAGOONS_SL10_PLOTS, phase: "SL10" | "SL13", expectedCount: number) {
  expect(plots).toHaveLength(expectedCount);
  expect(new Set(plots.map((plot) => plot.villaKey)).size).toBe(expectedCount);
  expect(new Set(plots.map((plot) => plot.dcrId)).size).toBe(expectedCount);
  for (const plot of plots) {
    expect(plot.phase).toBe(phase);
    expect(plot.coordinateSource).toBe("official_dcr_centroid");
    expect(plot.latitude).toBeGreaterThan(24);
    expect(plot.longitude).toBeGreaterThan(54);
    expect(plot.landSqm).toBeGreaterThan(0);
    expect(plot.maxGfaSqm).toBeGreaterThan(0);
    expect(plot.boundary.length).toBeGreaterThanOrEqual(3);
    expect(plot.dcrUrl).toMatch(/^\/manus-storage\/SDE3_\d+_[a-f0-9]+\.pdf$/);
    expect(plot.dmtUrl).toBe(`https://geosmart.dmt.gov.ae/dcr/${plot.dcrId}.pdf`);
    expect(plot.googleMapsUrl).toContain(`${plot.latitude}`);
    expect(plot.availability).toBe("unknown");
  }
}

describe("Lagoons SL10 and SL13 official DCR registries", () => {
  it("keeps 18 individually sourced SL10 plots", () => {
    expectOfficialDcrRegistry(LAGOONS_SL10_PLOTS, "SL10", 18);
    expect(LAGOONS_SL10_PLOTS.map((plot) => plot.dcrId)).toEqual(
      Array.from({ length: 18 }, (_, index) => `SDE3_${1982 + index}`),
    );
  });

  it("keeps only the 12 available SL13 DCRs without fabricating the unavailable identifiers", () => {
    expectOfficialDcrRegistry(LAGOONS_SL13_PLOTS, "SL13", 12);
    expect(LAGOONS_SL13_PLOTS.map((plot) => plot.dcrId)).toEqual([
      "SDE3_1966", "SDE3_1967", "SDE3_1970", "SDE3_1971", "SDE3_1972", "SDE3_1973",
      "SDE3_1974", "SDE3_1975", "SDE3_1978", "SDE3_1979", "SDE3_1980", "SDE3_1981",
    ]);
  });
});
