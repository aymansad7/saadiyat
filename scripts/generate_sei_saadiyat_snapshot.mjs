import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const basePath = resolve(root, "server/data/aldar_saadiyat.json");
const sourcePath = resolve(root, "server/data/sources/world-of-aldar/2026-09-07/sei-saadiyat-778.json");

const base = JSON.parse(await readFile(basePath, "utf8"));
const source = JSON.parse(await readFile(sourcePath, "utf8"));
if (source.project?.slug !== "sei-saadiyat" || source.project?.unit_count !== 778 || source.buildings?.length !== 6) {
  throw new Error("Sei source normalization does not meet the expected 778-unit / six-building contract.");
}

const publicUnit = (unit) => ({
  unit_name: unit.unit_name,
  // This is the exact source-backed World of Aldar interactive locator. The
  // server validates it against this specific unit before redirecting.
  aldar_link: unit.aldar_link,
  unit_type: unit.unit_type,
  unit_category: unit.unit_category,
  unit_model: unit.unit_model,
  bedrooms: unit.bedrooms,
  total_rooms: unit.total_rooms,
  status: unit.status,
  price_aed: unit.price_aed,
  reservation_amount: unit.reservation_amount,
  online_reservation_fee: unit.online_reservation_fee,
  plot_area_sqm: unit.plot_area_sqm,
  saleable_area_sqm: unit.saleable_area_sqm,
  total_area_sqm: unit.total_area_sqm,
  terrace_area_sqm: unit.terrace_area_sqm,
  balcony_area_sqm: unit.balcony_area_sqm,
  service_charge_aed_sqm: unit.service_charge_aed_sqm,
  service_charge_escalation_pct: unit.service_charge_escalation_pct,
  car_parks: unit.car_parks,
  unit_finishes: unit.unit_finishes,
  features_spec: unit.features_spec,
  inventory_category: unit.inventory_category,
  property_status: unit.property_status,
  mandatory_pool: unit.mandatory_pool,
  mandatory_premium: unit.mandatory_premium,
  darna_applicable: unit.darna_applicable,
  virtual_tour: unit.virtual_tour,
  payment_plans: unit.payment_plans,
  building_section: unit.building_section,
  project_field: unit.project_field,
});

const project = {
  slug: source.project.slug,
  name: source.project.name,
  source_file: source.project.source_file,
  unit_count: source.project.unit_count,
  available_count: 0,
  building_count: source.project.building_count,
  buildings: source.buildings.map(building => ({
    slug: building.slug,
    name: building.name,
    unit_count: building.unit_count,
    available_count: 0,
    units: building.units.map(publicUnit),
  })),
};
const countedUnits = project.buildings.reduce((sum, building) => sum + building.units.length, 0);
if (countedUnits !== 778) throw new Error(`Expected 778 Sei units after public projection, found ${countedUnits}.`);
if (new Set(project.buildings.map(building => building.slug)).size !== 6) throw new Error("Sei building slugs are not unique.");
if (project.buildings.some(building => !/^sei-saadiyat-building-[1-6]$/.test(building.slug))) throw new Error("Unexpected Sei building slug.");

base.projects = base.projects.filter(existing => existing.slug !== project.slug);
base.projects.push(project);
base.project_count = base.projects.length;
base.total_units = base.projects.reduce((sum, item) => sum + Number(item.unit_count || 0), 0);
base.total_available = base.projects.reduce((sum, item) => sum + Number(item.available_count || 0), 0);
base.exported_at = "2026-09-07";
await writeFile(basePath, JSON.stringify(base));
console.log(JSON.stringify({
  project: project.slug,
  units: countedUnits,
  buildings: Object.fromEntries(project.buildings.map(building => [building.name, building.unit_count])),
  projectCount: base.project_count,
  totalUnits: base.total_units,
  totalAvailable: base.total_available,
}, null, 2));
