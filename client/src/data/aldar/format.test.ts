import { describe, expect, it } from "vitest";
import { getUnitPriceMetrics } from "./format";

describe("getUnitPriceMetrics", () => {
  it("prefers documented saleable area for price density", () => {
    const metrics = getUnitPriceMetrics(5_000_000, 250, 300);
    expect(metrics?.areaSource).toBe("saleable");
    expect(metrics?.pricePerSqmAed).toBe(20_000);
    expect(metrics?.pricePerSqftAed).toBeCloseTo(20_000 / 10.764, 6);
  });

  it("does not calculate from an AED 1 placeholder or a missing area", () => {
    expect(getUnitPriceMetrics(1, 100, 100)).toBeNull();
    expect(getUnitPriceMetrics(5_000_000, null, null)).toBeNull();
  });
});
