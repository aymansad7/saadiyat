/** One-time guarded project registration, not a recurring complete-inventory replacement. */
import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { inventoryImportedProjects, inventoryUnitState } from "../drizzle/schema";
import { getDb } from "../server/db";
import { runInventorySync } from "../server/inventorySync";
import { invalidateImportedAldarProjectCache } from "../server/importedAldarProjects";
import { CANOPIES_SANCTUARY_SLUG, validateCanopiesSanctuaryInitialImport } from "../server/canopiesSanctuaryImport";

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: tsx scripts/import_canopies_sanctuary_official.ts <verified-project-json> [--apply]");
  const project = validateCanopiesSanctuaryInitialImport(JSON.parse(await readFile(path, "utf8")));
  const db = await getDb();
  if (!db) throw new Error("Database unavailable.");
  const [prior] = await db.select({id: inventoryImportedProjects.id}).from(inventoryImportedProjects)
    .where(and(eq(inventoryImportedProjects.dataset, "other"), eq(inventoryImportedProjects.projectSlug, CANOPIES_SANCTUARY_SLUG))).limit(1);
  const [state] = await db.select({id: inventoryUnitState.id}).from(inventoryUnitState)
    .where(and(eq(inventoryUnitState.dataset, "other"), eq(inventoryUnitState.projectSlug, CANOPIES_SANCTUARY_SLUG))).limit(1);
  // The launch feed is partial: never re-run it over an existing registry.
  if (prior || state) throw new Error("Sanctuary already exists. Use a non-destructive exact-unit patch; this initial-import tool refuses replacements.");
  console.log(JSON.stringify({projectSlug: project.slug, sourceExposedUnits: project.buildings.flatMap(b => b.units).length,
    mode: process.argv.includes("--apply") ? "apply-initial-registration" : "dry-run"}));
  if (!process.argv.includes("--apply")) return;
  const result = await runInventorySync({ trigger: "manual", triggeredBy: "Master Admin / official Sanctuary launch capture 2026-11-17",
    datasets: {other: {projects: [project]}}, projectScope: [{dataset: "other", projectSlug: CANOPIES_SANCTUARY_SLUG}] });
  invalidateImportedAldarProjectCache();
  console.log(JSON.stringify(result, null, 2));
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
