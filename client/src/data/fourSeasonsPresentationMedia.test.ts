import { describe, expect, it } from "vitest";
import {
  FOUR_SEASONS_PRESENTATION_HERO,
  FOUR_SEASONS_PRESENTATION_IMAGES,
} from "./fourSeasonsPresentationMedia";

describe("Four Seasons presentation media", () => {
  it("uses a mix of official project lifestyle and sales-centre imagery", () => {
    expect(FOUR_SEASONS_PRESENTATION_IMAGES.length).toBeGreaterThanOrEqual(6);
    expect(FOUR_SEASONS_PRESENTATION_IMAGES.some((image) => image.kind === "lifestyle")).toBe(true);
    expect(FOUR_SEASONS_PRESENTATION_IMAGES.some((image) => image.kind === "sales-centre")).toBe(true);
    expect(FOUR_SEASONS_PRESENTATION_HERO.featured).toBe(true);
  });

  it("does not represent project imagery as an exact residence view", () => {
    for (const image of FOUR_SEASONS_PRESENTATION_IMAGES) {
      expect(image.url).toMatch(/^\/manus-storage\//);
      expect(image.description.toLowerCase()).toMatch(/illustrative|project(-level)? reference|not (a specific|an exact)/);
    }
  });
});
