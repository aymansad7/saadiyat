import { describe, expect, it } from "vitest";
import { seiSaadiyatOfficialExportRows } from "./seiSaadiyatOfficialExport";
import { getSaadiyatDataset } from "./routers/aldarSaadiyat";
import { getExactOfficialAldarUnitUrl } from "./aldarOfficialLink";

describe("Sei Saadiyat official import", () => {
  it("keeps all 778 exact source units in six distinct buildings without fabricating prices or public unit routes", () => {
    const project = getSaadiyatDataset().projects.find(item => item.slug === "sei-saadiyat");
    expect(project).toBeDefined();
    expect(project?.name).toBe("Sei Saadiyat");
    expect(project?.unit_count).toBe(778);
    expect(project?.buildings.map(building => [building.name, building.unit_count])).toEqual([
      ["Building 1", 57],
      ["Building 2", 208],
      ["Building 3", 70],
      ["Building 4", 129],
      ["Building 5", 147],
      ["Building 6", 167],
    ]);
    const units = project?.buildings.flatMap(building => building.units) ?? [];
    expect(units).toHaveLength(778);
    expect(new Set(units.map(unit => unit.unit_name))).toHaveLength(778);
    expect(units.every(unit => unit.status === "New")).toBe(true);
    expect(units.every(unit => unit.price_aed == null)).toBe(true);
    expect(units.every(unit => {
      if (!unit.aldar_link) return false;
      const url = new URL(unit.aldar_link);
      return url.hostname === "world.aldar.com"
        && url.pathname === "/uae/abudhabi/seisaadiyat"
        && Boolean(url.searchParams.get("unit"));
    })).toBe(true);
    expect(units.every(unit => getExactOfficialAldarUnitUrl(unit.aldar_link, unit.unit_name, "sei-saadiyat") === unit.aldar_link)).toBe(true);
    expect(units.some(unit => unit.unit_name === "SeiSaadiyat-T4-05-07")).toBe(true);
  });

  it("exports source-backed Sei rows without exposing a generic project page as an exact unit link", () => {
    const rows = seiSaadiyatOfficialExportRows();
    expect(rows).toHaveLength(778);
    expect(rows.every(row => row.project === "Sei Saadiyat")).toBe(true);
    expect(rows.every(row => row.priceAed == null)).toBe(true);
    expect(rows.every(row => row.exactUnitLink == null)).toBe(true);
  });
});
