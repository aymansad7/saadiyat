import { describe, expect, it } from "vitest";
import { isPublishedSeiUnitPrice } from "./seiSaadiyatOfficialCapture";

describe("Sei official price eligibility", () => {
  it("rejects missing, zero, and the known AED 1 placeholder", () => {
    expect(isPublishedSeiUnitPrice(null)).toBe(false);
    expect(isPublishedSeiUnitPrice(0)).toBe(false);
    expect(isPublishedSeiUnitPrice(1)).toBe(false);
    expect(isPublishedSeiUnitPrice("1")).toBe(false);
  });

  it("accepts a valid official unit price", () => {
    expect(isPublishedSeiUnitPrice(2_500_000)).toBe(true);
  });
});
