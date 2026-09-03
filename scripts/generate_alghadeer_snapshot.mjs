import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const targetPath = resolve(root, "server/data/aldar_other.json");
const sourceDir = resolve(root, "server/data/sources/world-of-aldar/2026-09-03");
const checkOnly = process.argv.includes("--check");

const officialCapture = "World of Aldar captured snapshot · 2026-09-03";
const noOperationalAvailabilityNote = "Captured official unit record; no price or current availability was published in this snapshot.";

const clusters = [
  {
    sourceFile: "alghadeer_r2_units.json",
    sourcePrefix: "AlGhadeerGardens-",
    expectedCount: 437,
    projectSlug: "al-ghadeer-gardens",
    projectName: "Al Ghadeer Gardens",
    projectPath: "alghadeergardens",
    buildingSlug: "r2",
    buildingName: "R2",
  },
  {
    sourceFile: "alghadeer_n2_units.json",
    sourcePrefix: "AlGhadeerGardens-",
    expectedCount: 353,
    projectSlug: "al-ghadeer-gardens",
    projectName: "Al Ghadeer Gardens",
    projectPath: "alghadeergardens",
    buildingSlug: "n2",
    buildingName: "N2",
  },
  {
    sourceFile: "alghadeer_parks1_units.json",
    sourcePrefix: "AlGhadeerParks1-",
    expectedCount: 280,
    projectSlug: "al-ghadeer-parks-1",
    projectName: "Al Ghadeer Parks 1",
    projectPath: "alghadeerparks1",
    buildingSlug: "nc",
    buildingName: "NC",
  },
  {
    sourceFile: "alghadeer_parks2_units.json",
    sourcePrefix: "AlGhadeerParks2-",
    expectedCount: 173,
    projectSlug: "al-ghadeer-parks-2",
    projectName: "Al Ghadeer Parks 2",
    projectPath: "alghadeerparks2",
    buildingSlug: "nd",
    buildingName: "ND",
  },
];

function numberOrNull(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function textOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function canonicalUnit(cluster, source) {
  const unitNumber = textOrNull(source.unitNumber);
  if (!unitNumber || !unitNumber.startsWith(cluster.sourcePrefix)) {
    throw new Error(`${cluster.buildingName}: source row does not have the expected published unitNumber prefix.`);
  }
  const shortCode = unitNumber.slice(cluster.sourcePrefix.length);
  if (!/^(?:R2|N2|NC|ND)-(?:V|TH)-\d{3}(?:-[A-Za-z]+)?-\d{2}$/i.test(shortCode)) {
    throw new Error(`${cluster.buildingName}: unsupported exact World of Aldar code ${unitNumber}.`);
  }
  const bedrooms = numberOrNull(source.bedroomCount);
  const suiteArea = numberOrNull(source.suiteArea);
  const saleableArea = numberOrNull(source.saleableArea);
  return {
    // Use World of Aldar's full stable unitNumber as the canonical local identity.
    unit_name: unitNumber,
    // Direct route is built solely from the captured, full unitNumber—not displayName.
    aldar_link: `https://world.aldar.com/uae/abudhabi/${cluster.projectPath}/property/${encodeURIComponent(shortCode)}/0?scheme=S1&unitstate=floorplan&furnished=true`,
    unit_type: textOrNull(source.unitType),
    unit_category: textOrNull(source.unitCategory),
    unit_model: textOrNull(source.propertyName) ?? textOrNull(source.unitModel),
    bedrooms: bedrooms == null ? null : String(bedrooms),
    total_rooms: textOrNull(source.propertyName),
    // Do not turn an exploratory-map `unitStatus` into operational availability.
    status: null,
    price_aed: null,
    reservation_amount: null,
    online_reservation_fee: null,
    plot_area_sqm: numberOrNull(source.plotArea),
    saleable_area_sqm: saleableArea,
    total_area_sqm: suiteArea ?? saleableArea,
    terrace_area_sqm: null,
    balcony_area_sqm: numberOrNull(source.balconyArea),
    service_charge_aed_sqm: null,
    service_charge_escalation_pct: null,
    car_parks: null,
    unit_finishes: source.isFurnished === false ? "Unfurnished" : null,
    features_spec: textOrNull(source.variantCode),
    inventory_category: "Official World of Aldar captured snapshot",
    property_status: null,
    mandatory_pool: null,
    mandatory_premium: null,
    darna_applicable: null,
    virtual_tour: null,
    payment_plans: null,
    building_section: cluster.buildingName,
    project_field: noOperationalAvailabilityNote,
    source_unit_status: textOrNull(source.unitStatus),
    source_captured_at: "2026-09-03",
    source_route: `/uae/abudhabi/${cluster.projectPath}/${cluster.buildingSlug}`,
  };
}

async function buildOfficialProjects() {
  const groups = new Map();
  for (const cluster of clusters) {
    const raw = JSON.parse(await readFile(resolve(sourceDir, cluster.sourceFile), "utf8"));
    if (!Array.isArray(raw) || raw.length !== cluster.expectedCount) {
      throw new Error(`${cluster.sourceFile}: expected ${cluster.expectedCount} source rows, received ${Array.isArray(raw) ? raw.length : "non-array"}.`);
    }
    const units = raw.map(row => canonicalUnit(cluster, row));
    if (new Set(units.map(unit => unit.unit_name)).size !== units.length) {
      throw new Error(`${cluster.sourceFile}: duplicate canonical unit identities.`);
    }
    let project = groups.get(cluster.projectSlug);
    if (!project) {
      project = {
        slug: cluster.projectSlug,
        name: cluster.projectName,
        area: "other",
        source_file: officialCapture,
        unit_count: 0,
        available_count: 0,
        building_count: 0,
        buildings: [],
      };
      groups.set(cluster.projectSlug, project);
    }
    project.buildings.push({
      slug: cluster.buildingSlug,
      name: cluster.buildingName,
      unit_count: units.length,
      available_count: 0,
      units,
    });
    project.unit_count += units.length;
    project.building_count += 1;
  }
  return Array.from(groups.values());
}

const baseline = JSON.parse(await readFile(targetPath, "utf8"));
const officialProjects = await buildOfficialProjects();
const replaceSlugs = new Set(officialProjects.map(project => project.slug));
const projects = [
  ...baseline.projects.filter(project => !replaceSlugs.has(project.slug)),
  ...officialProjects,
];
const next = {
  ...baseline,
  project_count: projects.length,
  total_units: projects.reduce((sum, project) => sum + project.unit_count, 0),
  total_available: projects.reduce((sum, project) => sum + project.available_count, 0),
  projects,
};
const rendered = `${JSON.stringify(next)}\n`;
const current = await readFile(targetPath, "utf8");

if (checkOnly) {
  if (current !== rendered) throw new Error("aldar_other.json is out of date. Run: pnpm exec node scripts/generate_alghadeer_snapshot.mjs");
  console.log(JSON.stringify({ ok: true, projects: officialProjects.map(project => ({ slug: project.slug, units: project.unit_count })), totalGhadeerUnits: 1243 }));
} else {
  await writeFile(targetPath, rendered, "utf8");
  console.log(JSON.stringify({ written: targetPath, projects: officialProjects.map(project => ({ slug: project.slug, units: project.unit_count })), totalGhadeerUnits: 1243 }));
}
