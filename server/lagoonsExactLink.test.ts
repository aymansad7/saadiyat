import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type LagoonsSourceVilla = {
  id: string;
  detail_url: string | null;
  aldar_data?: { aldar_link?: string | null } | null;
};

const source = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "data/lagoons.json"), "utf8"),
) as { villas: LagoonsSourceVilla[] };

describe("Lagoons exact World of Aldar links", () => {
  it("binds every interactive card link to its own canonical Lagoons unit key", () => {
    expect(source.villas.length).toBeGreaterThan(0);
    for (const villa of source.villas) {
      expect(villa.detail_url, `${villa.id} must retain an exact interactive route`).toBeTruthy();
      const url = new URL(villa.detail_url!);
      const path = url.pathname.split("/").filter(Boolean);
      expect(url.hostname).toBe("world.aldar.com");
      expect(path.at(-3)).toBe("property");
      expect(decodeURIComponent(path.at(-2) ?? "")).toBe(villa.id);
      expect(path.at(-2)).not.toBe("lagoons");
    }
  });

  it("keeps raw legacy Aldar data separate from the card’s exact interactive destination", () => {
    const differentLegacyRows = source.villas.filter(villa => villa.aldar_data?.aldar_link && villa.aldar_data.aldar_link !== villa.detail_url);
    expect(differentLegacyRows.length).toBeGreaterThan(0);
    expect(differentLegacyRows.every(villa => new URL(villa.detail_url!).pathname.includes(`/property/${encodeURIComponent(villa.id)}/`))).toBe(true);
  });
});
