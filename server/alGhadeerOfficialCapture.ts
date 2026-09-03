import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GHADDEER_SLUGS = new Set(["al-ghadeer-gardens", "al-ghadeer-parks-1", "al-ghadeer-parks-2"]);

export const AL_GHADEER_OFFICIAL_CLUSTERS = [
  { projectSlug: "al-ghadeer-gardens", projectName: "Al Ghadeer Gardens", projectPath: "alghadeergardens", buildingSlug: "r2", buildingName: "R2", prefix: "AlGhadeerGardens-R2-", shortCodePrefix: "AlGhadeerGardens-", route: "https://world.aldar.com/uae/abudhabi/alghadeergardens/r2" },
  { projectSlug: "al-ghadeer-gardens", projectName: "Al Ghadeer Gardens", projectPath: "alghadeergardens", buildingSlug: "n2", buildingName: "N2", prefix: "AlGhadeerGardens-N2-", shortCodePrefix: "AlGhadeerGardens-", route: "https://world.aldar.com/uae/abudhabi/alghadeergardens/n2" },
  { projectSlug: "al-ghadeer-parks-1", projectName: "Al Ghadeer Parks 1", projectPath: "alghadeerparks1", buildingSlug: "nc", buildingName: "NC", prefix: "AlGhadeerParks1-NC-", shortCodePrefix: "AlGhadeerParks1-", route: "https://world.aldar.com/uae/abudhabi/alghadeerparks1/nc" },
  { projectSlug: "al-ghadeer-parks-2", projectName: "Al Ghadeer Parks 2", projectPath: "alghadeerparks2", buildingSlug: "nd", buildingName: "ND", prefix: "AlGhadeerParks2-ND-", shortCodePrefix: "AlGhadeerParks2-", route: "https://world.aldar.com/uae/abudhabi/alghadeerparks2/nd" },
] as const;

type Cluster = (typeof AL_GHADEER_OFFICIAL_CLUSTERS)[number];
type OfficialRawUnit = Record<string, unknown> & { unitNumber?: string };
type OtherDataset = { projects: Array<Record<string, unknown>>; [key: string]: unknown };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function unescapeHtml(raw: string) {
  return raw
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function decodeObjectAt(raw: string, start: number): unknown | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(raw.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function extractOfficialWorldAldarUnits(html: string, prefix: string): OfficialRawUnit[] {
  const decoded = unescapeHtml(html);
  const units = new Map<string, OfficialRawUnit>();
  let cursor = 0;
  while (cursor < decoded.length) {
    const start = decoded.indexOf('{"unitType":', cursor);
    if (start < 0) break;
    const candidate = decodeObjectAt(decoded, start);
    cursor = start + 12;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const unitNumber = text((candidate as OfficialRawUnit).unitNumber);
    if (unitNumber?.startsWith(prefix)) units.set(unitNumber, candidate as OfficialRawUnit);
  }
  return Array.from(units.values()).sort((left, right) => String(left.unitNumber).localeCompare(String(right.unitNumber)));
}

function normalizeUnit(cluster: Cluster, source: OfficialRawUnit, captureDate: string) {
  const unitName = text(source.unitNumber);
  if (!unitName?.startsWith(cluster.shortCodePrefix)) throw new Error(`${cluster.buildingName}: invalid official unit code.`);
  const shortCode = unitName.slice(cluster.shortCodePrefix.length);
  if (!/^(?:R2|N2|NC|ND)-(?:V|TH)-\d{3}(?:-[A-Za-z]+)?-\d{2}$/i.test(shortCode)) {
    throw new Error(`${cluster.buildingName}: unsupported exact official unit code ${unitName}.`);
  }
  const saleableArea = numeric(source.saleableArea);
  const suiteArea = numeric(source.suiteArea);
  return {
    unit_name: unitName,
    aldar_link: `https://world.aldar.com/uae/abudhabi/${cluster.projectPath}/property/${encodeURIComponent(shortCode)}/0?scheme=S1&unitstate=floorplan&furnished=true`,
    unit_type: text(source.unitType),
    unit_category: text(source.unitCategory),
    unit_model: text(source.propertyName) ?? text(source.unitModel),
    bedrooms: numeric(source.bedroomCount) == null ? null : String(numeric(source.bedroomCount)),
    total_rooms: text(source.propertyName),
    status: null,
    price_aed: numeric(source.price),
    reservation_amount: null,
    online_reservation_fee: null,
    plot_area_sqm: numeric(source.plotArea),
    saleable_area_sqm: saleableArea,
    total_area_sqm: suiteArea ?? saleableArea,
    terrace_area_sqm: null,
    balcony_area_sqm: numeric(source.balconyArea),
    service_charge_aed_sqm: null,
    service_charge_escalation_pct: null,
    car_parks: null,
    unit_finishes: source.isFurnished === false ? "Unfurnished" : null,
    features_spec: text(source.variantCode),
    inventory_category: "Official World of Aldar live capture",
    property_status: null,
    mandatory_pool: null,
    mandatory_premium: null,
    darna_applicable: null,
    virtual_tour: null,
    payment_plans: text(source.paymentPlan),
    building_section: cluster.buildingName,
    project_field: "Captured official unit record; raw explorer state is not an NAS availability listing.",
    source_unit_status: text(source.unitStatus),
    source_captured_at: captureDate,
    source_route: new URL(cluster.route).pathname,
  };
}

function baselineOtherDataset(): OtherDataset {
  const candidates = [
    resolve(__dirname, "data/aldar_other.json"),
    resolve(__dirname, "../data/aldar_other.json"),
    resolve(process.cwd(), "server/data/aldar_other.json"),
    resolve(process.cwd(), "dist/data/aldar_other.json"),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as OtherDataset;
    } catch {
      // Try the next deployed or development candidate.
    }
  }
  throw new Error("Aldar Other baseline dataset was not found.");
}

function historicalR2PricingByUnit(baseline: OtherDataset) {
  const prices = new Map<string, Record<string, unknown>>();
  const project = baseline.projects.find(row => row.slug === "al-ghadeer-gardens");
  for (const building of (project?.buildings as Array<Record<string, unknown>> | undefined) ?? []) {
    if (building.slug !== "r2" || !Array.isArray(building.units)) continue;
    for (const unit of building.units as Array<Record<string, unknown>>) {
      if (typeof unit.unit_name === "string" && typeof unit.price_aed === "number" && unit.price_aed > 0) {
        prices.set(unit.unit_name, unit);
      }
    }
  }
  return prices;
}

export async function captureAlGhadeerOfficialSnapshot(fetchImpl: typeof fetch = fetch) {
  const captureDate = new Date().toISOString().slice(0, 10);
  const baseline = baselineOtherDataset();
  const historicR2Prices = historicalR2PricingByUnit(baseline);
  const captured = await Promise.all(AL_GHADEER_OFFICIAL_CLUSTERS.map(async cluster => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetchImpl(cluster.route, {
        headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${cluster.buildingName}: World of Aldar returned HTTP ${response.status}.`);
      const html = await response.text();
      const sourceUnits = extractOfficialWorldAldarUnits(html, cluster.prefix);
      if (!sourceUnits.length) throw new Error(`${cluster.buildingName}: no matching official units were published in a complete page response.`);
      const units = sourceUnits.map(row => {
        const normalized = normalizeUnit(cluster, row, captureDate);
        const historic = cluster.buildingSlug === "r2" ? historicR2Prices.get(normalized.unit_name) : null;
        if (normalized.price_aed != null || !historic) return normalized;
        return {
          ...normalized,
          price_aed: historic.price_aed,
          reservation_amount: historic.reservation_amount ?? null,
          online_reservation_fee: historic.online_reservation_fee ?? null,
          payment_plans: historic.payment_plans ?? null,
          price_source: historic.price_source ?? "Historical Aldar official price snapshot",
          price_source_captured_at: historic.price_source_captured_at ?? "2026-08-12",
        };
      });
      if (new Set(units.map(unit => unit.unit_name)).size !== units.length) throw new Error(`${cluster.buildingName}: duplicate official unit code.`);
      return { cluster, sourceUnits, units };
    } finally {
      clearTimeout(timeout);
    }
  }));

  const byProject = new Map<string, Record<string, unknown>>();
  for (const { cluster, units } of captured) {
    let project = byProject.get(cluster.projectSlug);
    if (!project) {
      project = { slug: cluster.projectSlug, name: cluster.projectName, area: "other", source_file: `World of Aldar live capture · ${captureDate}`, unit_count: 0, available_count: 0, building_count: 0, buildings: [] as unknown[] };
      byProject.set(cluster.projectSlug, project);
    }
    (project.buildings as unknown[]).push({ slug: cluster.buildingSlug, name: cluster.buildingName, unit_count: units.length, available_count: 0, units });
    project.unit_count = Number(project.unit_count) + units.length;
    project.building_count = Number(project.building_count) + 1;
  }
  const officialProjects = Array.from(byProject.values());
  const projects = [
    ...baseline.projects.filter(project => !GHADDEER_SLUGS.has(String(project.slug))),
    ...officialProjects,
  ];
  const otherDataset = {
    ...baseline,
    project_count: projects.length,
    total_units: projects.reduce((sum, project) => sum + Number(project.unit_count ?? 0), 0),
    total_available: projects.reduce((sum, project) => sum + Number(project.available_count ?? 0), 0),
    projects,
  };
  const files = captured.map(({ cluster, sourceUnits }) => ({
    filename: `${cluster.projectSlug}-${cluster.buildingSlug}-units.json`,
    bytes: Buffer.from(JSON.stringify(sourceUnits)),
    mimeType: "application/json",
  }));
  return { captureDate, clusters: captured.map(({ cluster, units }) => ({ projectSlug: cluster.projectSlug, buildingSlug: cluster.buildingSlug, unitCount: units.length })), otherDataset, files };
}
