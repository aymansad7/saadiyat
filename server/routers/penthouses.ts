import { masterProcedure, router } from "../_core/trpc";
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

export function isOfficialPenthouse(unit: PenthouseSourceUnit): boolean {
  return [unit.unit_type, unit.unit_category, unit.unit_model, unit.total_rooms]
    .some(value => /penthouse/i.test(value ?? ""));
}

function numberOrNull(value: number | null | undefined) {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function buildRecords(dataset: "saadiyat" | "other", projects: PenthouseSourceProject[]) {
  return projects.flatMap(project => project.buildings.flatMap(building => building.units
    .filter(isOfficialPenthouse)
    .filter(unit => Boolean(unit.unit_name))
    .map(unit => {
      const priceAed = numberOrNull(unit.price_aed);
      const saleableAreaSqm = numberOrNull(unit.saleable_area_sqm);
      const totalAreaSqm = numberOrNull(unit.total_area_sqm);
      const areaSqm = saleableAreaSqm ?? totalAreaSqm;
      const pricePerSqmAed = priceAed != null && areaSqm != null ? priceAed / areaSqm : null;
      const pricePerSqftAed = pricePerSqmAed != null ? pricePerSqmAed / SQFT_PER_SQM : null;
      const hrefBase = dataset === "saadiyat" ? "/aldar-saadiyat" : "/aldar-other";
      return {
        dataset,
        projectSlug: project.slug,
        projectName: project.name,
        buildingSlug: building.slug,
        buildingName: building.name,
        unitName: unit.unit_name!,
        bedrooms: unit.bedrooms,
        unitType: unit.unit_model ?? unit.unit_category ?? unit.unit_type,
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

export const penthousesRouter = router({
  /** Cross-dataset luxury inventory view; Other Aldar scope remains Master-only. */
  list: masterProcedure.query(async () => {
    const [saadiyatProjects, otherProjects] = await Promise.all([
      mergeImportedAldarProjects("saadiyat", getSaadiyatDataset().projects),
      mergeImportedAldarProjects("other", getDataset().projects),
    ]);
    const units = [
      ...buildRecords("saadiyat", saadiyatProjects as PenthouseSourceProject[]),
      ...buildRecords("other", otherProjects as PenthouseSourceProject[]),
    ].sort((a, b) => a.projectName.localeCompare(b.projectName) || (b.priceAed ?? -1) - (a.priceAed ?? -1) || a.unitName.localeCompare(b.unitName));
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
