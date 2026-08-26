import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { summarizeLagoonsVillas } from "./routers/lagoons";

type LagoonsSource = {
  villas: Array<Record<string, unknown>>;
};

const root = process.cwd();
const dataset = JSON.parse(
  fs.readFileSync(path.resolve(root, "server/data/lagoons.json"), "utf8"),
) as LagoonsSource;
const clusterSource = fs.readFileSync(
  path.resolve(root, "client/src/pages/LagoonsCluster.tsx"),
  "utf8",
);
const cardSource = fs.readFileSync(
  path.resolve(root, "client/src/components/LagoonsVillaCard.tsx"),
  "utf8",
);
const mapSource = fs.readFileSync(
  path.resolve(root, "client/src/pages/SaadiyatMap.tsx"),
  "utf8",
);

describe("Lagoons card and map experience", () => {
  it("derives the correct village bedroom and position totals from the source villas", () => {
    const summary = summarizeLagoonsVillas(dataset.villas as never[]);

    expect(summary.ethir).toMatchObject({
      total: 173,
      by_model: { "4BHK": 52, "5BHK": 102, "6BHK": 19 },
      corners: 4,
      edges: 70,
    });
    expect(summary["al-sidr"]).toMatchObject({
      total: 619,
      by_model: { "4BHK": 340, "5BHK": 239, "6BHK": 40 },
      corners: 4,
      edges: 140,
    });
    expect(summary["al-ghaf"]).toMatchObject({
      total: 757,
      by_model: { "4BHK": 319, "5BHK": 360, "6BHK": 78 },
      corners: 5,
      edges: 144,
    });
  });

  it("uses the canonical Lagoons key for imported owners in cards and map markers", () => {
    expect(cardSource).toContain("return `lagoons/${v.unit_name}`");
    expect(cardSource).toContain('community="lagoons"');
    expect(clusterSource).toContain('useListingIndex({ community: "lagoons" })');
    expect(mapSource).toContain("overridesByKey.get(marker.villaKey)");
  });

  it("shows loading before the empty state and makes the entire card a first-click target", () => {
    expect(clusterSource).toContain("villasQuery.isLoading || !villasQuery.isFetched");
    expect(clusterSource).toContain("Loading villas…");
    expect(cardSource).toContain('role="link"');
    expect(cardSource).toContain("navigate(detailHref)");
  });

  it("refreshes protected listing overrides after auth and places owner mobile high in Map Card", () => {
    expect(mapSource).toContain("enabled: Boolean(user)");
    expect(mapSource).toContain('refetchOnMount: "always"');
    expect(mapSource).toContain("Owner · Authorized View");
    expect(mapSource).toContain("word-break:break-all");
  });
});
