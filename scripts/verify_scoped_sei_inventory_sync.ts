import { readFile } from "node:fs/promises";
import { runInventorySync } from "../server/inventorySync";

type Dataset = { projects: Array<{ slug: string }> };

const path = new URL("../server/data/aldar_saadiyat.json", import.meta.url);
const source = JSON.parse(await readFile(path, "utf8")) as Dataset;
const sei = source.projects.find(project => project.slug === "sei-saadiyat");
if (!sei) throw new Error("Sei Saadiyat is absent from the source dataset.");

const result = await runInventorySync({
  trigger: "manual",
  triggeredBy: "scoped-sei-sync-verification",
  datasets: { saadiyat: { projects: [sei] } as never },
  projectScope: [{ dataset: "saadiyat", projectSlug: "sei-saadiyat" }],
});

if (result.counts.unitsScanned !== 778) {
  throw new Error(`Expected scoped Sei sync to scan 778 units, received ${result.counts.unitsScanned}.`);
}
if (result.rollups.some(rollup => rollup.projectSlug !== "sei-saadiyat")) {
  throw new Error("Scoped Sei sync emitted a rollup for another project.");
}

console.log(JSON.stringify({ runId: result.runId, unitsScanned: result.counts.unitsScanned, rollups: result.rollups.length }));
