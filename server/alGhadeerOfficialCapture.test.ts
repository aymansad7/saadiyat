import { describe, expect, it } from "vitest";
import { captureAlGhadeerOfficialSnapshot, extractOfficialWorldAldarUnits, AL_GHADEER_OFFICIAL_CLUSTERS } from "./alGhadeerOfficialCapture";

describe("Al Ghadeer official capture parser", () => {
  it("extracts only the exact project and phase prefix from escaped official page content", () => {
    const html = [
      '{\\"unitType\\":\\"Villa\\",\\"unitNumber\\":\\"AlGhadeerGardens-R2-V-001-01\\",\\"unitStatus\\":\\"Sold\\",\\"price\\":\\"\\"}',
      '{\\"unitType\\":\\"Villa\\",\\"unitNumber\\":\\"AlGhadeerGardens-N2-V-001-01\\",\\"unitStatus\\":\\"Available\\",\\"price\\":\\"1500000\\"}',
    ].join(" ");
    const rows = extractOfficialWorldAldarUnits(html, AL_GHADEER_OFFICIAL_CLUSTERS[0].prefix);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ unitNumber: "AlGhadeerGardens-R2-V-001-01", unitStatus: "Sold" });
  });

  it("preserves the verified workbook price when the live page omits commercial fields", async () => {
    const responseFor = (url: string) => {
      const cluster = AL_GHADEER_OFFICIAL_CLUSTERS.find(item => url === item.route);
      if (!cluster) throw new Error(`Unexpected URL ${url}`);
      const code = cluster.buildingSlug === "nc"
        ? "NC-TH-001-01"
        : cluster.buildingSlug === "nd"
          ? "ND-TH-001-01"
          : `${cluster.buildingSlug.toUpperCase()}-V-001-01`;
      return new Response(`{\\"unitType\\":\\"TownHouse\\",\\"unitNumber\\":\\"${cluster.shortCodePrefix}${code}\\",\\"unitStatus\\":\\"Booked\\",\\"price\\":\\"\\"}`);
    };
    const captured = await captureAlGhadeerOfficialSnapshot(async url => responseFor(String(url)));
    const parks = captured.otherDataset.projects.find(project => project.slug === "al-ghadeer-parks-1") as {
      buildings: Array<{ units: Array<{ unit_name: string; price_aed: number | null; price_source: string | null }> }>;
    };
    const unit = parks.buildings[0].units.find(item => item.unit_name === "AlGhadeerParks1-NC-TH-001-01");
    expect(unit?.price_aed).toEqual(expect.any(Number));
    expect(unit?.price_source).toBe("User-provided Aldar Al Ghadeer Hero Full Complete workbook");
  });
});
