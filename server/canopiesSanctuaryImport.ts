import type { RawProject, RawUnit } from "./inventorySync";

export const CANOPIES_SANCTUARY_SLUG = "the-canopies-sanctuary";
const SOURCE_PROJECT_ID = "a22Tq00000Be6jVIAR";

type SanctuaryUnit = RawUnit & {
  source_project_id?: string;
  source_detail_identity_verified?: boolean;
};

/** Initial import only: do not assume the currently exposed feed is a complete release. */
export function validateCanopiesSanctuaryInitialImport(input: unknown): RawProject {
  const project = input as RawProject;
  if (project?.slug !== CANOPIES_SANCTUARY_SLUG || project?.name !== "The Canopies Sanctuary" || !Array.isArray(project.buildings)) {
    throw new Error("Expected the distinct official Canopies Sanctuary project.");
  }
  if (!project.buildings.length) throw new Error("No official Sanctuary buildings supplied.");
  const names = new Set<string>();
  for (const building of project.buildings) {
    if (!/^the-canopies-sanctuary-b[1-3]$/.test(building.slug)) throw new Error("Unexpected Sanctuary building identity.");
    for (const record of building.units) {
      const unit = record as SanctuaryUnit;
      const match = /^TheCanopies2-(B[1-3])-\d{2}-\d{2}$/.exec(unit.unit_name ?? "");
      if (!match || building.slug !== `${CANOPIES_SANCTUARY_SLUG}-${match[1].toLowerCase()}` || names.has(unit.unit_name!)) {
        throw new Error("Mismatched or duplicate exact Sanctuary unit identity.");
      }
      if (unit.source_project_id !== SOURCE_PROJECT_ID || unit.source_detail_identity_verified !== true) {
        throw new Error("Sanctuary unit detail identity was not verified.");
      }
      if (unit.status !== null) throw new Error("Initial source capture must not assert operational availability.");
      if (unit.price_aed !== null && (!Number.isFinite(unit.price_aed) || unit.price_aed <= 1)) {
        throw new Error("Unpublished / AED 1 price placeholders must be excluded.");
      }
      names.add(unit.unit_name!);
    }
  }
  if (!names.size) throw new Error("No official Sanctuary units supplied.");
  return project;
}
