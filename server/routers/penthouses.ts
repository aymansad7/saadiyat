import { masterProcedure, router } from "../_core/trpc";
import { AREAS, areaForProject, type AreaKey } from "../aldarAreas";
import { mergeImportedAldarProjects } from "../importedAldarProjects";
import { getDataset } from "./aldarOther";
import { getSaadiyatDataset } from "./aldarSaadiyat";

type PenthouseSourceUnit = {
  unit_name: string | null;
  unit_type: string | null;
  unit_category: string | null;
  unit_model: string | null;
  total_rooms: string | null;
  bedrooms: string | null;
  status: string | null;
  price_aed: number | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
};

type PenthouseSourceProject = {
  slug: string;
  name: string;
  buildings: Array<{ slug: string; name: string; units: PenthouseSourceUnit[] }>;
};

const SQFT_PER_SQM = 10.764;
const EXCLUDED_PROJECT_SLUGS = new Set(["almarjan", "rosso-bay-residences"]);

export type PenthouseLocationKey = "saadiyat" | "yas-island" | "fahid-island" | "other";

export function isClientFacingPenthouseProject(project: Pick<PenthouseSourceProject, "slug" | "name">): boolean {
  const identity = `${project.slug} ${project.name}`.toLowerCase();
  return !EXCLUDED_PROJECT_SLUGS.has(project.slug)
    && !/(marjan|rosso\s*bay|stephanie)/i.test(identity);
}

export function penthouseLocationForProject(dataset: "saadiyat" | "other", projectSlug: string): PenthouseLocationKey {
  const area = areaForProject(projectSlug);
  if (area === "yas-island" || area === "fahid-island" || area === "saadiyat") return area;
  return dataset === "saadiyat" ? "saadiyat" : "other";
}

function penthouseLocationLabel(locationKey: PenthouseLocationKey) {
  if (locationKey === "saadiyat" || locationKey === "yas-island") return AREAS[locationKey].name;
  if (locationKey === "fahid-island") return AREAS[locationKey].name;
  return "Other Abu Dhabi";
}

export function isOfficialPenthouse(unit: PenthouseSourceUnit): boolean {
  return [unit.unit_type, unit.unit_category, unit.unit_model, unit.total_rooms]
    .some(value => /penthouse/i.test(value ?? ""));
}

export function isUserClassifiedTopFloorPenthouse(projectSlug: string, unit: PenthouseSourceUnit): boolean {
  return projectSlug === "thearthouse"
    && /-08-02$/i.test(unit.unit_name ?? "")
    && /5BR\+M\s*\(SV\)/i.test(unit.unit_category ?? unit.unit_model ?? "");
}

function numberOrNull(value: number | null | undefined) {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function buildRecords(dataset: "saadiyat" | "other", projects: PenthouseSourceProject[]) {
  return projects
    .filter(isClientFacingPenthouseProject)
    .flatMap(project => project.buildings.flatMap(building => building.units
    .filter(unit => isOfficialPenthouse(unit) || isUserClassifiedTopFloorPenthouse(project.slug, unit))
    .filter(unit => Boolean(unit.unit_name))
    .map(unit => {
      const priceAed = numberOrNull(unit.price_aed);
      const saleableAreaSqm = numberOrNull(unit.saleable_area_sqm);
      const totalAreaSqm = numberOrNull(unit.total_area_sqm);
      const areaSqm = saleableAreaSqm ?? totalAreaSqm;
      const pricePerSqmAed = priceAed != null && areaSqm != null ? priceAed / areaSqm : null;
      const pricePerSqftAed = pricePerSqmAed != null ? pricePerSqmAed / SQFT_PER_SQM : null;
      const hrefBase = dataset === "saadiyat" ? "/aldar-saadiyat" : "/aldar-other";
      const locationKey = penthouseLocationForProject(dataset, project.slug);
      return {
        dataset,
        projectSlug: project.slug,
        projectName: project.name,
        locationKey,
        locationLabel: penthouseLocationLabel(locationKey),
        buildingSlug: building.slug,
        buildingName: building.name,
        unitName: unit.unit_name!,
        bedrooms: unit.bedrooms,
        unitType: unit.unit_model ?? unit.unit_category ?? unit.unit_type,
        classification: isOfficialPenthouse(unit) ? "Official penthouse" : "Top-floor penthouse",
        status: unit.status,
        priceAed,
        areaSqm,
        areaSource: saleableAreaSqm != null ? "saleable" as const : totalAreaSqm != null ? "total" as const : null,
        pricePerSqmAed,
        pricePerSqftAed,
        href: `${hrefBase}/${project.slug}/${building.slug}/${encodeURIComponent(unit.unit_name!)}`,
      };
    })));
}

function chooseMoreCompleteRecord<T extends { dataset: string; priceAed: number | null; areaSqm: number | null; status: string | null }>(current: T, candidate: T) {
  const score = (record: T) =>
    (record.priceAed != null ? 4 : 0)
    + (record.areaSqm != null ? 2 : 0)
    + (record.status != null ? 1 : 0)
    + (record.dataset === "other" ? 0.1 : 0);
  return score(candidate) > score(current) ? candidate : current;
}

export const penthousesRouter = router({
  /** Cross-dataset luxury inventory view; Other Aldar scope remains Master-only. */
  list: masterProcedure.query(async () => {
    const [saadiyatProjects, otherProjects] = await Promise.all([
      mergeImportedAldarProjects("saadiyat", getSaadiyatDataset().projects),
      mergeImportedAldarProjects("other", getDataset().projects),
    ]);
    const rawUnits = [
      ...buildRecords("saadiyat", saadiyatProjects as PenthouseSourceProject[]),
      ...buildRecords("other", otherProjects as PenthouseSourceProject[]),
    ];
    const unique = new Map<string, typeof rawUnits[number]>();
    for (const unit of rawUnits) {
      const key = `${unit.projectSlug}:${unit.unitName}`;
      unique.set(key, unique.has(key) ? chooseMoreCompleteRecord(unique.get(key)!, unit) : unit);
    }
    const units = Array.from(unique.values())
      .sort((a, b) => a.projectName.localeCompare(b.projectName) || (b.priceAed ?? -1) - (a.priceAed ?? -1) || a.unitName.localeCompare(b.unitName));
    const priced = units.filter(unit => unit.priceAed != null);
    return {
      summary: {
        totalUnits: units.length,
        totalProjects: new Set(units.map(unit => `${unit.dataset}:${unit.projectSlug}`)).size,
        pricedUnits: priced.length,
        priceMinAed: priced.length ? Math.min(...priced.map(unit => unit.priceAed!)) : null,
        priceMaxAed: priced.length ? Math.max(...priced.map(unit => unit.priceAed!)) : null,
      },
      units,
    };
  }),
});
