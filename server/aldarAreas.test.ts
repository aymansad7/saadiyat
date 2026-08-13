import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AREAS, areaForProject, orderedAreas, type AreaKey } from "./aldarAreas";

/**
 * Locate aldar_other.json across the candidate locations used at runtime so the
 * test verifies the *real* dataset slugs are all classified.
 */
function loadOtherSlugs(): string[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, "data/aldar_other.json"),
    resolve(here, "../data/aldar_other.json"),
    resolve(here, "../server/data/aldar_other.json"),
    resolve(process.cwd(), "server/data/aldar_other.json"),
  ];
  for (const p of candidates) {
    try {
      const json = JSON.parse(readFileSync(p, "utf-8")) as {
        projects: { slug: string }[];
      };
      return json.projects.map(p => p.slug);
    } catch {
      /* try next */
    }
  }
  throw new Error("aldar_other.json not found in any candidate path");
}

describe("aldar area classification", () => {
  it("maps every project slug in the dataset to a real (non-fallback) area", () => {
    const slugs = loadOtherSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    const unclassified = slugs.filter(s => areaForProject(s) === "other");
    expect(unclassified).toEqual([]);
  });

  it("classifies known anchors correctly", () => {
    expect(areaForProject("yas-park-views")).toBe<AreaKey>("yas-island");
    expect(areaForProject("yas-park-gate")).toBe<AreaKey>("yas-island");
    expect(areaForProject("yas-park-place")).toBe<AreaKey>("yas-island");
    expect(areaForProject("rise-by-athlon-1")).toBe<AreaKey>("dubai");
    expect(areaForProject("al-ghadeer-gardens")).toBe<AreaKey>("al-ghadeer");
    // Nouran Living is physically Saadiyat even though it ships in aldar_other
    expect(areaForProject("nouran-living")).toBe<AreaKey>("saadiyat");
  });

  it("falls back to 'other' for unknown slugs", () => {
    expect(areaForProject("some-brand-new-project")).toBe<AreaKey>("other");
  });

  it("orders areas by their configured display order", () => {
    const ordered = orderedAreas();
    const orders = ordered.map(a => a.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
    // Yas Island should be first, "other" last
    expect(ordered[0].key).toBe("yas-island");
    expect(ordered[ordered.length - 1].key).toBe("other");
  });

  it("every area meta has both English and Arabic labels", () => {
    for (const meta of Object.values(AREAS)) {
      expect(meta.name.length).toBeGreaterThan(0);
      expect(meta.nameAr.length).toBeGreaterThan(0);
    }
  });
});
