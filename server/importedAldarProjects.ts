import { eq } from "drizzle-orm";
import { inventoryImportedProjects } from "../drizzle/schema";
import { getDb } from "./db";

type SourceProject = {
  slug: string;
  name: string;
  buildings: unknown[];
  [key: string]: unknown;
};

function isSourceProject(value: unknown): value is SourceProject {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { slug?: unknown }).slug === "string" &&
      typeof (value as { name?: unknown }).name === "string" &&
      Array.isArray((value as { buildings?: unknown }).buildings),
  );
}

/**
 * Overlay the latest complete project object from an administrator-imported
 * Aldar source onto the bundled baseline. The imported payload is accepted
 * only when it is structurally a project object, and is never sent by the
 * browser or accepted from a public endpoint.
 */
export async function mergeImportedAldarProjects<T extends SourceProject>(
  dataset: "saadiyat" | "other",
  baseline: T[],
): Promise<T[]> {
  const db = await getDb();
  if (!db) return baseline;
  const rows = await db
    .select({ projectSlug: inventoryImportedProjects.projectSlug, sourceJson: inventoryImportedProjects.sourceJson })
    .from(inventoryImportedProjects)
    .where(eq(inventoryImportedProjects.dataset, dataset));

  const merged = new Map(baseline.map(project => [project.slug, project]));
  for (const row of rows) {
    try {
      const parsed: unknown = JSON.parse(row.sourceJson);
      if (!isSourceProject(parsed) || parsed.slug !== row.projectSlug) continue;
      merged.set(parsed.slug, parsed as T);
    } catch {
      // Keep the last known bundled project if an imported record is corrupt.
    }
  }
  return Array.from(merged.values());
}
