import ExcelJS from "exceljs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [workbookPath, outputPath = "server/data/sources/world-of-aldar/2026-09-07/sei-saadiyat-778.json", reportPath = "/tmp/sei_saadiyat_match.json"] = process.argv.slice(2);
if (!workbookPath) {
  throw new Error("Usage: node scripts/normalize_sei_saadiyat_workbook.mjs INPUT.xlsx [OUTPUT.json] [REPORT.json]");
}

const toText = (value) => {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text.trim() || null;
    if ("result" in value) return toText(value.result);
    if ("richText" in value && Array.isArray(value.richText)) return value.richText.map(part => part.text).join("").trim() || null;
  }
  const text = String(value).trim();
  return text || null;
};

const asNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = toText(value)?.replace(/[\s,AED,]/gi, "") ?? "";
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};
const asPublishedPrice = (value) => {
  const price = asNumber(value);
  return price != null && price > 0 ? price : null;
};
const asBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const text = toText(value)?.toLowerCase();
  if (text === "true" || text === "yes") return true;
  if (text === "false" || text === "no") return false;
  return null;
};
const asBedrooms = (value) => {
  const number = asNumber(value);
  return number == null ? null : String(number);
};

function readTable(sheet) {
  if (!sheet) throw new Error("Missing required All Units worksheet.");
  const headers = sheet.getRow(1).values.slice(1).map(toText);
  return Array.from({ length: Math.max(0, sheet.rowCount - 1) }, (_, index) => {
    const raw = sheet.getRow(index + 2).values.slice(1);
    return Object.fromEntries(headers.map((header, column) => [header ?? `Column ${column + 1}`, raw[column] ?? null]));
  }).filter(row => toText(row.unitNumber));
}

function sourceLocatorForUnit(value, unitNumber, detailUnitId) {
  const link = toText(value);
  if (!link || !detailUnitId) return null;
  let url;
  try { url = new URL(link); } catch { throw new Error(`${unitNumber}: invalid directUnitURL.`); }
  const isAldarWorld = url.hostname === "world.aldar.com";
  if (!isAldarWorld || url.pathname !== "/uae/abudhabi/seisaadiyat" || url.searchParams.get("unit") !== detailUnitId) {
    throw new Error(`${unitNumber}: directUnitURL does not preserve its supplied World of Aldar unit identifier.`);
  }
  return { unitId: detailUnitId, url: url.toString() };
}

function towerInfo(value) {
  const raw = toText(value);
  const match = raw?.match(/^T([1-6])$/i);
  if (!match) throw new Error(`Unexpected Sei tower value: ${raw ?? "(blank)"}`);
  const number = Number(match[1]);
  return { raw, number, slug: `sei-saadiyat-building-${number}`, name: `Building ${number}` };
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);
const rows = readTable(workbook.getWorksheet("All Units"));
if (rows.length !== 778) throw new Error(`Expected 778 Sei unit rows, found ${rows.length}.`);

const seen = new Set();
const duplicateUnitNumbers = [];
const missingLinks = [];
const units = rows.map(row => {
  const unitName = toText(row.unitNumber);
  if (!unitName) throw new Error("A Sei row has no unitNumber.");
  if (seen.has(unitName)) duplicateUnitNumbers.push(unitName);
  seen.add(unitName);
  const tower = towerInfo(row.tower);
  const sourceLocator = sourceLocatorForUnit(row.directUnitURL, unitName, toText(row.detailUnitId));
  if (!sourceLocator) missingLinks.push(unitName);
  return {
    source_unit_code: unitName,
    unit_name: unitName,
    unit_short_name: toText(row.unitShortName),
    display_name: toText(row.displayName),
    building_slug: tower.slug,
    building_name: tower.name,
    source_tower: tower.raw,
    // The supplied route is an official project-map route with an opaque unit
    // identifier, not a demonstrated unit-detail page. It remains in the
    // private source record and no generic project page is exposed as a unit link.
    aldar_link: null,
    source_unit_id: sourceLocator.unitId,
    source_unit_locator: sourceLocator.url,
    unit_type: toText(row.unitType),
    unit_category: toText(row.unitCategory),
    unit_model: toText(row.unitModel),
    bedrooms: asBedrooms(row.bedroomCount),
    total_rooms: toText(row.totalRooms),
    status: toText(row.apiStatus) ?? toText(row.rscStatus),
    source_status: toText(row.apiStatus) ?? toText(row.rscStatus),
    price_aed: asPublishedPrice(row.publishedPriceAED),
    price_publish_status: toText(row.pricePublishStatus),
    reservation_amount: asPublishedPrice(row.reservationAmountAED),
    online_reservation_fee: null,
    plot_area_sqm: asNumber(row.plotAreaSqm),
    saleable_area_sqm: asNumber(row.saleableAreaSqm),
    total_area_sqm: asNumber(row.totalAreaSqm),
    suite_area_sqm: asNumber(row.suiteAreaSqm),
    terrace_area_sqm: asNumber(row.terraceAreaSqm),
    balcony_area_sqm: asNumber(row.balconyAreaSqm),
    service_charge_aed_sqm: null,
    service_charge_escalation_pct: asNumber(row.escalationServiceChargePct),
    car_parks: asNumber(row.numberOfCarParks),
    unit_finishes: toText(row.documentLabel),
    features_spec: toText(row.featuresSpecification),
    inventory_category: toText(row.inventoryCategory),
    property_status: toText(row.propertyStatus),
    mandatory_pool: asBoolean(row.mandatorySwimmingPool),
    mandatory_premium: asBoolean(row.mandatoryPremium),
    darna_applicable: null,
    virtual_tour: null,
    payment_plans: null,
    building_section: toText(row.buildingSectionName),
    project_field: toText(row.projectName),
    source_checked_at: toText(row.checkedAt),
  };
});

if (duplicateUnitNumbers.length) throw new Error(`Duplicate Sei unitNumber values: ${duplicateUnitNumbers.join(", ")}`);
if (missingLinks.length) throw new Error(`${missingLinks.length} Sei units lack exact Aldar links.`);
const buildingCounts = Object.fromEntries(Array.from({ length: 6 }, (_, index) => {
  const number = index + 1;
  return [`Building ${number}`, units.filter(unit => unit.building_name === `Building ${number}`).length];
}));
if (Object.values(buildingCounts).some(count => count === 0)) throw new Error("Every Sei building 1–6 must contain units.");

const normalized = {
  source: {
    workbook: "Aldar_Sei_Saadiyat_778_Units_FULL.xlsx",
    source_type: "Aldar unit export supplied by the project owner",
    captured_at: units[0]?.source_checked_at ?? null,
    imported_at: new Date().toISOString(),
    price_policy: "publishedPriceAED equals 0 is treated as unpublished; no price is inferred.",
  },
  project: {
    slug: "sei-saadiyat",
    name: "Sei Saadiyat",
    source_file: "Aldar_Sei_Saadiyat_778_Units_FULL.xlsx",
    unit_count: units.length,
    building_count: 6,
  },
  buildings: Array.from({ length: 6 }, (_, index) => {
    const number = index + 1;
    const buildingUnits = units.filter(unit => unit.building_name === `Building ${number}`);
    return { slug: `sei-saadiyat-building-${number}`, name: `Building ${number}`, source_tower: `T${number}`, unit_count: buildingUnits.length, units: buildingUnits };
  }),
};
const report = {
  project: normalized.project,
  exactMatch: { suppliedRows: rows.length, normalizedUnits: units.length, duplicateUnitNumbers, missingLinks },
  buildingCounts,
  prices: { published: units.filter(unit => unit.price_aed != null).length, unpublishedZero: units.filter(unit => unit.price_aed == null).length },
  statuses: Object.fromEntries(Object.entries(Object.groupBy(units, unit => unit.status ?? "(blank)")).map(([status, items]) => [status, items.length])),
  sampleSourceLocator: units[0] ? { unitName: units[0].unit_name, sourceUnitId: units[0].source_unit_id } : null,
};

await mkdir(dirname(resolve(outputPath)), { recursive: true });
await writeFile(outputPath, JSON.stringify(normalized, null, 2));
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
