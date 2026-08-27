import { describe, expect, it } from "vitest";
import { getExactOfficialAldarUnitUrl } from "./aldarOfficialLink";

describe("official Aldar unit link validation", () => {
  const exactUrl = "https://world.aldar.com/uae/abudhabi/mamshagarden/property/MamshaGarden-B5-01-05";

  it("accepts only the captured World of Aldar URL for the exact same unit", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-05")).toBe(exactUrl);
  });

  it("rejects a different unit code even when the URL belongs to the same Aldar project", () => {
    expect(getExactOfficialAldarUnitUrl(exactUrl, "MamshaGarden-B5-01-06")).toBeNull();
  });

  it("rejects unknown hosts and links that are not individual property routes", () => {
    expect(getExactOfficialAldarUnitUrl("https://example.com/property/MamshaGarden-B5-01-05", "MamshaGarden-B5-01-05")).toBeNull();
    expect(getExactOfficialAldarUnitUrl("https://world.aldar.com/uae/abudhabi/mamshagarden", "MamshaGarden-B5-01-05")).toBeNull();
  });
});
