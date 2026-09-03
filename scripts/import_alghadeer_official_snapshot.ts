import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { archiveAlGhadeerOfficialSourceFiles, exportAlGhadeerOfficialWorkbook } from "../server/alGhadeerOfficialExport";
import { runInventorySync } from "../server/inventorySync";

const sourceDir = resolve(process.cwd(), "server/data/sources/world-of-aldar/2026-09-03");
const legacyPricingSource = resolve(process.cwd(), "server/data/sources/world-of-aldar/2026-08-12/alghadeer_gardens_r2_pricing.json");
const sourceFiles = [
  "alghadeer_r2_units.json",
  "alghadeer_n2_units.json",
  "alghadeer_parks1_units.json",
  "alghadeer_parks2_units.json",
  "link-verification.md",
] as const;

const archive = await archiveAlGhadeerOfficialSourceFiles(
  await Promise.all(sourceFiles.map(async filename => ({
    filename,
    bytes: Buffer.from(await readFile(resolve(sourceDir, filename))),
    mimeType: filename.endsWith(".json") ? "application/json" : "text/markdown",
  }))),
);
const legacyArchive = await archiveAlGhadeerOfficialSourceFiles([
  {
    filename: "alghadeer_gardens_r2_pricing.json",
    bytes: Buffer.from(await readFile(legacyPricingSource)),
    mimeType: "application/json",
  },
], "2026-08-12");
const sync = await runInventorySync({
  trigger: "manual",
  triggeredBy: "official-world-of-aldar-capture-2026-09-03",
});
const workbook = await exportAlGhadeerOfficialWorkbook();

console.log(JSON.stringify({
  archivedSourceFiles: archive.fileCount,
  archivedLegacyPriceSourceFiles: legacyArchive.fileCount,
  sync: { runId: sync.runId, counts: sync.counts, newProjects: sync.newProjects.map(project => project.projectSlug) },
  workbook: { filename: workbook.filename, rowCount: workbook.rowCount },
}, null, 2));
