import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const snapshot = JSON.parse(readFileSync(resolve(root, "server/data/aldar_other.json"), "utf8")) as {
  projects: Array<{
    slug: string;
    unit_count: number;
    available_count: number;
    buildings: Array<{
      slug: string;
      unit_count: number;
      units: Array<{
        unit_name: string;
        aldar_link: string | null;
        status: string | null;
        price_aed: number | null;
        reservation_amount: number | null;
        payment_plans: string | null;
        source_unit_status?: string | null;
        source_captured_at?: string | null;
      }>;
    }>;
  }>;
};

const expected = [
  { project: "al-ghadeer-gardens", building: "r2", count: 437, sourcePrefix: "AlGhadeerGardens-", path: "alghadeergardens" },
  { project: "al-ghadeer-gardens", building: "n2", count: 353, sourcePrefix: "AlGhadeerGardens-", path: "alghadeergardens" },
  { project: "al-ghadeer-parks-1", building: "nc", count: 280, sourcePrefix: "AlGhadeerParks1-", path: "alghadeerparks1" },
  { project: "al-ghadeer-parks-2", building: "nd", count: 173, sourcePrefix: "AlGhadeerParks2-", path: "alghadeerparks2" },
] as const;

describe("captured official Al Ghadeer snapshot", () => {
  it("is deterministically reproducible from the captured World of Aldar source rows", () => {
    expect(() => execFileSync(process.execPath, ["scripts/generate_alghadeer_snapshot.mjs", "--check"], { cwd: root, stdio: "pipe" })).not.toThrow();
  });

  it("contains all four reviewed clusters with exactly 1,243 unique canonical units", () => {
    const observed: string[] = [];
    for (const item of expected) {
      const project = snapshot.projects.find(candidate => candidate.slug === item.project);
      const building = project?.buildings.find(candidate => candidate.slug === item.building);
      expect(building?.unit_count).toBe(item.count);
      for (const unit of building?.units ?? []) observed.push(`${item.project}::${unit.unit_name}`);
    }
    expect(observed).toHaveLength(1243);
    expect(new Set(observed).size).toBe(1243);
  });

  it("keeps direct World of Aldar routes bound to each captured full unit code", () => {
    for (const item of expected) {
      const project = snapshot.projects.find(candidate => candidate.slug === item.project);
      const building = project?.buildings.find(candidate => candidate.slug === item.building);
      for (const unit of building?.units ?? []) {
        expect(unit.unit_name.startsWith(item.sourcePrefix)).toBe(true);
        const shortCode = unit.unit_name.slice(item.sourcePrefix.length);
        expect(shortCode).toMatch(/^(?:R2|N2|NC|ND)-(?:V|TH)-\d{3}(?:-[A-Za-z]+)?-\d{2}$/);
        expect(unit.aldar_link).toBe(
          `https://world.aldar.com/uae/abudhabi/${item.path}/property/${shortCode}/0?scheme=S1&unitstate=floorplan&furnished=true`,
        );
      }
    }
  });

  it("restores only the exact R2 historical source prices and never manufactures availability", () => {
    for (const item of expected) {
      const project = snapshot.projects.find(candidate => candidate.slug === item.project);
      const building = project?.buildings.find(candidate => candidate.slug === item.building);
      expect(project?.available_count).toBe(0);
      expect(building?.units.every(unit => (
        unit.status === null
        && typeof unit.source_unit_status === "string"
        && unit.source_captured_at === "2026-09-03"
      ))).toBe(true);
      const priced = building?.units.filter(unit => unit.price_aed != null) ?? [];
      if (item.building === "r2") {
        expect(priced).toHaveLength(434);
        expect(priced.every(unit => unit.price_source_captured_at === "2026-08-12")).toBe(true);
      } else {
        expect(priced).toHaveLength(0);
        expect(building?.units.every(unit => unit.payment_plans === null)).toBe(true);
      }
    }
  });
});
