import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { extractAllOfficialWorldAldarUnits } from "../server/alGhadeerOfficialCapture";
import { getDb } from "../server/db";
import { runInventorySync } from "../server/inventorySync";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";
import { aldarProjectDiscoveries } from "../drizzle/schema";

const PROJECT_NAME = "Talay at Marsa Al Saadiyat";
const PROJECT_SLUG = "talay-at-marsa-al-saadiyat";
const PROJECT_ROUTE = "https://world.aldar.com/uae/abudhabi/talay";
const SOURCE_PATH = "/uae/abudhabi/talay";
const EXPECTED_PRODUCTION_UNIT_COUNT = 167;
const PRESS_RELEASE_URL = "https://www.aldar.com/en/news-and-media/aldar-launches-first-homes-at-marsa-al-saadiyat-with-351-exclusive-villas-at-talay";

type OfficialRawUnit = Record<string, unknown> & { unitNumber?: string };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
function productionUnitCode(value: string | null): value is string {
  return Boolean(value && /^Talay-MarsaAlSaadiyat-V-\d{3}-01$/i.test(value));
}
function officialPrice(value: unknown): number | null {
  const price = numeric(value);
  return price != null && price > 1 ? price : null;
}

async function main() {
  const captureDate = new Date().toISOString().slice(0, 10);
  const response = await fetch(PROJECT_ROUTE, { headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" } });
  if (!response.ok) throw new Error(`Talay official page returned HTTP ${response.status}.`);
  const html = await response.text();
  const source = extractAllOfficialWorldAldarUnits(html) as OfficialRawUnit[];
  if (!source.length) throw new Error("Talay official page returned no unit records.");

  const testRecords = source.filter(unit => /_TEST$/i.test(text(unit.unitNumber) ?? ""));
  const production = source.filter(unit => productionUnitCode(text(unit.unitNumber)));
  const invalid = source.filter(unit => !productionUnitCode(text(unit.unitNumber)) && !/_TEST$/i.test(text(unit.unitNumber) ?? ""));
  if (invalid.length) throw new Error(`Talay source contains unexpected unit codes: ${invalid.map(unit => unit.unitNumber).join(", ")}`);
  if (testRecords.length !== 1) throw new Error(`Talay expected one explicit _TEST source record, received ${testRecords.length}.`);
  if (production.length !== EXPECTED_PRODUCTION_UNIT_COUNT) throw new Error(`Talay expected ${EXPECTED_PRODUCTION_UNIT_COUNT} production units after excluding _TEST, received ${production.length}.`);
  if (new Set(production.map(unit => text(unit.unitNumber))).size !== production.length) throw new Error("Talay source has duplicate production unit identities.");

  const typeCounts = production.reduce<Record<string, number>>((counts, unit) => {
    const key = String(numeric(unit.bedroomCount) ?? "unknown");
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  if (typeCounts["4"] !== 60 || typeCounts["5"] !== 49 || typeCounts["6"] !== 58) {
    throw new Error(`Talay production bedroom distribution did not match expected source after test exclusion: ${JSON.stringify(typeCounts)}`);
  }

  const units = production.map(unit => {
    const unitName = text(unit.unitNumber)!;
    const shortCode = unitName.replace(/^Talay-MarsaAlSaadiyat-/i, "");
    return {
      unit_name: unitName,
      aldar_link: `https://world.aldar.com/uae/abudhabi/talay/property/${encodeURIComponent(shortCode)}/0?scheme=S1&unitstate=floorplan&furnished=true`,
      unit_type: text(unit.unitType),
      unit_category: text(unit.unitCategory),
      unit_model: text(unit.propertyName) ?? text(unit.unitModel),
      bedrooms: numeric(unit.bedroomCount) == null ? null : String(numeric(unit.bedroomCount)),
      total_rooms: text(unit.propertyName),
      // World of Aldar identifies release status as "New". It is intentionally
      // retained as a source state, not converted into NAS broker availability.
      status: null,
      source_unit_status: text(unit.unitStatus) ?? text(unit.status),
      // Price=1 is an Aldar placeholder before commercial pricing is released.
      price_aed: officialPrice(unit.price),
      reservation_amount: null,
      online_reservation_fee: null,
      plot_area_sqm: numeric(unit.plotArea),
      saleable_area_sqm: numeric(unit.saleableArea),
      total_area_sqm: numeric(unit.suiteArea) ?? numeric(unit.saleableArea),
      terrace_area_sqm: numeric(unit.balconyArea),
      balcony_area_sqm: numeric(unit.balconyArea),
      service_charge_aed_sqm: null,
      service_charge_escalation_pct: null,
      car_parks: null,
      unit_finishes: unit.isFurnished === false ? "Unfurnished" : unit.isFurnished === true ? "Furnished" : null,
      features_spec: text(unit.variantCode),
      inventory_category: "Official World of Aldar release",
      property_status: "Sale",
      mandatory_pool: null,
      mandatory_premium: typeof unit.isPremium === "boolean" ? unit.isPremium : null,
      darna_applicable: null,
      virtual_tour: null,
      payment_plans: text(unit.paymentPlan),
      building_section: "Talay · Official release",
      project_field: "Official World of Aldar release. Unit-level price, plot area, and payment plan were not published at capture; an AED 1 detail value is excluded as a placeholder. The raw New label is a source state, not NAS broker availability.",
      source_location_id: text(unit.locationId),
      source_captured_at: captureDate,
      source_route: SOURCE_PATH,
      facade_type: text(unit.facadeType),
      variant_type: text(unit.variantType),
      has_official_floorplan: unit.hasFloorplan === true,
      has_official_interior: unit.hasInterior === true,
      has_unique_view: unit.hasUniqueView === true,
      is_official_showhome: unit.isShowhome === true,
    };
  });

  const project = {
    slug: PROJECT_SLUG,
    name: PROJECT_NAME,
    area: "saadiyat",
    source_file: `World of Aldar official Talay release · ${captureDate}`,
    source_url: PROJECT_ROUTE,
    official_press_release_url: PRESS_RELEASE_URL,
    official_sale_from_date: "2026-09-23",
    unit_count: units.length,
    available_count: 0,
    building_count: 1,
    published_starting_prices: {
      label: "Unit pricing",
      source: "World of Aldar official Talay project page",
      source_url: PROJECT_ROUTE,
      captured_at: captureDate,
      status: "Not yet published at unit level; AED 1 placeholders excluded.",
      prices: [],
    },
    release_summary: {
      source: "Aldar official press release · 17 September 2026",
      source_url: PRESS_RELEASE_URL,
      total_villas_announced_with_talay_beach: 351,
      sale_from_date: "2026-09-23",
      note: "The official Talay page currently renders 168 raw records, one of which is explicitly suffixed _TEST. The 167 production records imported here are 60 four-bedroom, 49 five-bedroom, and 58 six-bedroom villas.",
    },
    buildings: [{
      slug: "official-release",
      name: "Talay · Official release",
      unit_count: units.length,
      available_count: 0,
      units,
    }],
  };

  const configured = await getConfiguredOneDrive();
  const archiveFolderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "New-Projects"]);
  const archive = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: archiveFolderId,
    filename: `talay-at-marsa-al-saadiyat-${captureDate}.html`,
    bytes: Buffer.from(html),
    mimeType: "text/html",
  });

  const sync = await runInventorySync({
    trigger: "manual",
    triggeredBy: "owner:official-talay-import",
    datasets: { saadiyat: { projects: [project] }, other: { projects: [] } },
    projectScope: [{ dataset: "saadiyat", projectSlug: PROJECT_SLUG }],
  });

  const db = await getDb();
  if (!db) throw new Error("Database is unavailable after import.");
  const now = new Date();
  await db.insert(aldarProjectDiscoveries).values({
    sourcePath: SOURCE_PATH,
    projectSlug: PROJECT_SLUG,
    projectName: PROJECT_NAME,
    dataset: "saadiyat",
    areaKey: "saadiyat",
    status: "imported",
    unitCount: units.length,
    lastSeenAt: now,
    lastCheckedAt: now,
    importedAt: now,
    lastError: null,
  }).onDuplicateKeyUpdate({
    set: { projectSlug: PROJECT_SLUG, projectName: PROJECT_NAME, dataset: "saadiyat", areaKey: "saadiyat", status: "imported", unitCount: units.length, lastSeenAt: now, lastCheckedAt: now, importedAt: now, lastError: null },
  });

  mkdirSync(resolve(process.cwd(), "private-audits"), { recursive: true });
  const auditFile = resolve(process.cwd(), "private-audits", `talay-official-import-${captureDate}.json`);
  const audit = {
    capturedAt: new Date().toISOString(),
    project: { name: PROJECT_NAME, slug: PROJECT_SLUG, route: PROJECT_ROUTE, rawSourceRecordCount: source.length, excludedTestRecords: testRecords.map(unit => unit.unitNumber), productionUnitCount: units.length, bedroomDistribution: typeCounts },
    pricing: { publishedUnitPriceCount: units.filter(unit => unit.price_aed != null).length, note: "No valid unit-level price was published; AED 1 placeholder values were excluded." },
    fields: { plotAreaPublishedCount: units.filter(unit => unit.plot_area_sqm != null).length, saleableAreaPublishedCount: units.filter(unit => unit.saleable_area_sqm != null).length, paymentPlanPublishedCount: units.filter(unit => Boolean(unit.payment_plans)).length },
    archive: { driveItemId: archive.id ?? null, parentItemId: archiveFolderId, filename: `talay-at-marsa-al-saadiyat-${captureDate}.html` },
    sync,
  };
  writeFileSync(auditFile, JSON.stringify(audit, null, 2));
  console.log(JSON.stringify({ auditFile, ...audit }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
