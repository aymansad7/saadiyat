import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { archiveSeiSaadiyatSourceFiles, exportSeiSaadiyatOfficialWorkbook } from "../server/seiSaadiyatOfficialExport";
import { runInventorySync } from "../server/inventorySync";

const sourceDir = resolve(process.cwd(), "server/data/sources/world-of-aldar/2026-09-07");
const workbookPath = resolve(process.cwd(), "../upload/Aldar_Sei_Saadiyat_778_Units_FULL.xlsx");
const archive = await archiveSeiSaadiyatSourceFiles([
  {
    filename: "Aldar_Sei_Saadiyat_778_Units_FULL.xlsx",
    bytes: Buffer.from(await readFile(workbookPath)),
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    filename: "sei-saadiyat-778.json",
    bytes: Buffer.from(await readFile(resolve(sourceDir, "sei-saadiyat-778.json"))),
    mimeType: "application/json",
  },
  {
    filename: "sei-saadiyat-official-audit.md",
    bytes: Buffer.from(await readFile(resolve(process.cwd(), "sei-saadiyat-official-audit.md"))),
    mimeType: "text/markdown",
  },
]);
const sync = await runInventorySync({ trigger: "manual", triggeredBy: "owner-supplied-aldar-sei-capture-2026-09-07" });
const workbook = await exportSeiSaadiyatOfficialWorkbook();
console.log(JSON.stringify({
  archivedSourceFiles: archive.fileCount,
  sync: { runId: sync.runId, counts: sync.counts, newProjects: sync.newProjects.map(project => project.projectSlug) },
  workbook: { filename: workbook.filename, rowCount: workbook.rowCount },
}, null, 2));
