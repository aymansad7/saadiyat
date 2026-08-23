import { describe, expect, it } from "vitest";
import {
  convertAreaInput,
  detectAreaUnit,
  isWithinAreaRange,
  matchesAreaQuery,
  normalizeArea,
  sqftToSqm,
  sqmToSqft,
} from "./areaSearch";

describe("areaSearch", () => {
  it("converts between square metres and square feet", () => {
    expect(sqmToSqft(1)).toBeCloseTo(10.764, 3);
    expect(sqftToSqm(10.764)).toBeCloseTo(1, 3);
    expect(normalizeArea({ sqm: 100 }).sqft).toBeCloseTo(1076.4, 1);
  });

  it("detects explicitly typed area units", () => {
    expect(detectAreaUnit("2,342 m²")).toBe("sqm");
    expect(detectAreaUnit("25,203 sqft")).toBe("sqft");
  });

  it("matches an area in either unit with a small display tolerance", () => {
    const area = { sqm: 2342, sqft: 25203.89 };
    expect(matchesAreaQuery("2342 m2", area)).toBe(true);
    expect(matchesAreaQuery("25,204 sqft", area)).toBe(true);
    expect(matchesAreaQuery("1900 m2", area)).toBe(false);
  });

  it("filters by min and max in the selected unit", () => {
    const area = { sqm: 2342 };
    expect(isWithinAreaRange(area, "sqm", "2000", "2500")).toBe(true);
    expect(isWithinAreaRange(area, "sqm", "2400", "")).toBe(false);
    expect(isWithinAreaRange(area, "sqft", "25000", "26000")).toBe(true);
  });

  it("converts entered filter bounds when switching units", () => {
    expect(convertAreaInput("2342", "sqm", "sqft")).toBe("25209");
    expect(convertAreaInput("25209", "sqft", "sqm")).toBe("2342");
  });
});
