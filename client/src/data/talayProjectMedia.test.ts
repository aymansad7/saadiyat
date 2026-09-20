import { describe, expect, it } from "vitest";
import { isTalayProjectSlug, TALAY_PROJECT_IMAGES } from "./talayProjectMedia";

describe("Talay project media", () => {
  it("keeps the ten supplied images as project-level, managed-storage visuals", () => {
    expect(TALAY_PROJECT_IMAGES).toHaveLength(10);
    expect(TALAY_PROJECT_IMAGES.every(image => image.url.startsWith("/manus-storage/"))).toBe(true);
    expect(TALAY_PROJECT_IMAGES.every(image => /Talay|green corridor|garden|exploration|luxury address|Unforgettable/i.test(image.label))).toBe(true);
  });

  it("only exposes the gallery on the exact Talay project", () => {
    expect(isTalayProjectSlug("talay-at-marsa-al-saadiyat")).toBe(true);
    expect(isTalayProjectSlug("talay-beach-villas")).toBe(false);
  });
});
