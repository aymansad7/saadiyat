// Aldar Saadiyat dataset loader.
// Source: consolidated from 18 Aldar inventory workbooks.
import raw from "./aldar_saadiyat.json";

export type AldarUnit = {
  unit_name: string | null;
  aldar_link: string | null;
  unit_type: string | null;
  unit_category: string | null;
  unit_model: string | null;
  bedrooms: string | null;
  total_rooms: string | null;
  status: string | null;
  price_aed: number | null;
  reservation_amount: number | null;
  online_reservation_fee: number | null;
  plot_area_sqm: number | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
  terrace_area_sqm: number | null;
  balcony_area_sqm: number | null;
  service_charge_aed_sqm: number | null;
  service_charge_escalation_pct: number | null;
  car_parks: number | null;
  unit_finishes: string | null;
  features_spec: string | null;
  inventory_category: string | null;
  property_status: string | null;
  mandatory_pool: boolean | null;
  mandatory_premium: boolean | null;
  darna_applicable: boolean | null;
  virtual_tour: string | null;
  payment_plans: string | null;
  building_section: string | null;
  project_field: string | null;
};

export type AldarBuilding = {
  slug: string;
  name: string;
  unit_count: number;
  available_count: number;
  units: AldarUnit[];
};

export type AldarProject = {
  slug: string;
  name: string;
  source_file: string;
  unit_count: number;
  available_count: number;
  building_count: number;
  buildings: AldarBuilding[];
};

export type AldarDataset = {
  exported_at: string;
  project_count: number;
  total_units: number;
  total_available: number;
  projects: AldarProject[];
};

export const ALDAR: AldarDataset = raw as AldarDataset;

export function getAldarProject(slug: string): AldarProject | undefined {
  return ALDAR.projects.find(p => p.slug === slug);
}

export function getAldarBuilding(
  projectSlug: string,
  buildingSlug: string,
): { project: AldarProject; building: AldarBuilding } | undefined {
  const project = getAldarProject(projectSlug);
  if (!project) return undefined;
  const building = project.buildings.find(b => b.slug === buildingSlug);
  if (!building) return undefined;
  return { project, building };
}

export function getAldarUnit(
  projectSlug: string,
  buildingSlug: string,
  unitName: string,
):
  | { project: AldarProject; building: AldarBuilding; unit: AldarUnit }
  | undefined {
  const ctx = getAldarBuilding(projectSlug, buildingSlug);
  if (!ctx) return undefined;
  const unit = ctx.building.units.find(u => u.unit_name === unitName);
  if (!unit) return undefined;
  return { ...ctx, unit };
}

export function isAvailable(status: string | null | undefined): boolean {
  return (status ?? "").toLowerCase() === "available";
}

export function statusTone(
  status: string | null | undefined,
): "available" | "sold" | "reserved" | "other" {
  const s = (status ?? "").toLowerCase();
  if (s === "available" || s === "new") return "available";
  if (s === "sold") return "sold";
  if (s === "booked" || s === "blocked" || s === "reserved") return "reserved";
  return "other";
}

export function allAvailableUnits(): Array<{
  project: AldarProject;
  building: AldarBuilding;
  unit: AldarUnit;
}> {
  const out: Array<{ project: AldarProject; building: AldarBuilding; unit: AldarUnit }> = [];
  for (const project of ALDAR.projects) {
    for (const building of project.buildings) {
      for (const unit of building.units) {
        if (isAvailable(unit.status)) {
          out.push({ project, building, unit });
        }
      }
    }
  }
  return out;
}
