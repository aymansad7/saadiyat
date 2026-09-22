import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { inventoryImportedProjects, inventoryUnitState } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [project] = await db
    .select({
      slug: inventoryImportedProjects.projectSlug,
      name: inventoryImportedProjects.projectName,
      area: inventoryImportedProjects.areaKey,
      unitCount: inventoryImportedProjects.unitCount,
      availableCount: inventoryImportedProjects.availableCount,
    })
    .from(inventoryImportedProjects)
    .where(and(
      eq(inventoryImportedProjects.dataset, "other"),
      eq(inventoryImportedProjects.projectSlug, "yas-riva-reserve"),
    ));
  const states = await db
    .select({
      sourceStatus: inventoryUnitState.sourceStatus,
      count: sql<number>`count(*)`,
    })
    .from(inventoryUnitState)
    .where(and(
      eq(inventoryUnitState.dataset, "other"),
      eq(inventoryUnitState.projectSlug, "yas-riva-reserve"),
    ))
    .groupBy(inventoryUnitState.sourceStatus);
  console.log(JSON.stringify({ project, states }, null, 2));
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
