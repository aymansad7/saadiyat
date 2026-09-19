import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { extractAllOfficialWorldAldarUnits } from "../server/alGhadeerOfficialCapture";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";
import { inventoryImportedProjects, inventorySyncRuns } from "../drizzle/schema";
import { invalidateImportedAldarProjectCache } from "../server/importedAldarProjects";

const PROJECT_SLUG = "talay-at-marsa-al-saadiyat";
const PROJECT_ROUTE = "https://world.aldar.com/uae/abudhabi/talay";
const LAUNCH_PRICE_SOURCE = "https://nasluxury.com/blogs/talay-at-marsa-al-saadiyat-aldar-launches-351-luxury-villas-on-saadiyat-island/";
const LAUNCH_PRICE_EVIDENCE = "/home/ubuntu/upload/nasluxury.com_blogs_talay-at-marsa-al-saadiyat-aldar-launches-351-luxury-villas-on-saadiyat-island__aa55b2f7-e508-442f-9056-be890095c434.md";
const DETAIL_ROUTE = "https://propertyservice.world.aldar.com/api/v2/units/unit-detail";

type SourceUnit = Record<string, unknown>;
type ProjectPayload = { buildings?: Array<{ units?: Array<{ unit_name?: string | null; price_aed?: number | null }> }>; release_summary?: Record<string, unknown>; published_starting_prices?: Record<string, unknown>; [key: string]: unknown };

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}
function isTalayProductionUnit(value: string | null): value is string {
  return Boolean(value && /^Talay-MarsaAlSaadiyat-V-\d{3}-01$/i.test(value));
}

async function officialDetailPrice(unit: SourceUnit): Promise<number | null> {
  const locationId = text(unit.locationId);
  if (!locationId) throw new Error("Talay source unit omitted its location ID.");
  const url = new URL(DETAIL_ROUTE);
  url.searchParams.set("location_id", locationId);
  url.searchParams.set("kiosk", "false");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "SaadiyatResaleHub/1.0" } });
  if (!response.ok) throw new Error(`Talay detail API returned HTTP ${response.status}.`);
  const payload = await response.json() as { data?: { unitDetail?: Record<string, unknown> } };
  const detail = payload.data?.unitDetail;
  const expected = text(unit.unitNumber);
  if (!detail || text(detail.Name) !== expected || text(detail.CurrencyIsoCode) !== "AED") throw new Error(`Talay detail identity/currency validation failed for ${expected ?? "unknown unit"}.`);
  return numeric(detail.SellingPrice__c);
}

async function main() {
  const captureDate = new Date().toISOString().slice(0, 10);
  const response = await fetch(PROJECT_ROUTE, { headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" } });
  if (!response.ok) throw new Error(`Talay official page returned HTTP ${response.status}.`);
  const officialHtml = await response.text();
  const raw = extractAllOfficialWorldAldarUnits(officialHtml) as SourceUnit[];
  const production = raw.filter(unit => isTalayProductionUnit(text(unit.unitNumber)));
  if (production.length !== 167) throw new Error(`Talay production coverage changed: expected 167 exact units, received ${production.length}.`);
  const bedroomCounts = production.reduce<Record<string, number>>((counts, unit) => {
    const key = String(numeric(unit.bedroomCount));
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  if (bedroomCounts["4"] !== 60 || bedroomCounts["5"] !== 49 || bedroomCounts["6"] !== 58) throw new Error(`Talay bedroom coverage changed: ${JSON.stringify(bedroomCounts)}`);

  const probes = [4, 5, 6].map(bedrooms => production.find(unit => numeric(unit.bedroomCount) === bedrooms)).filter((unit): unit is SourceUnit => Boolean(unit));
  const detailPrices = await Promise.all(probes.map(officialDetailPrice));
  if (detailPrices.some(price => price !== 1)) throw new Error(`Talay has begun returning a non-placeholder individual price; stop and run a unit-level official price import instead. Values: ${detailPrices.join(", ")}`);

  const sourceEvidence = readFileSync(LAUNCH_PRICE_EVIDENCE);
  const evidenceText = sourceEvidence.toString("utf8");
  for (const expected of ["AED 13.5 million", "AED 15.5 million", "AED 17.2 million", "50/50", "5% booking"]) {
    if (!evidenceText.includes(expected)) throw new Error(`Talay launch-price evidence omitted expected phrase: ${expected}`);
  }

  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [imported] = await db.select().from(inventoryImportedProjects).where(and(eq(inventoryImportedProjects.dataset, "saadiyat"), eq(inventoryImportedProjects.projectSlug, PROJECT_SLUG))).limit(1);
  if (!imported) throw new Error("Talay imported project was not found.");
  const project = JSON.parse(imported.sourceJson) as ProjectPayload;

  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "Talay"]);
  const officialArchive = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId: folderId, filename: `talay-live-unit-check-${captureDate}.html`, bytes: Buffer.from(officialHtml), mimeType: "text/html" });
  const priceReferenceArchive = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId: folderId, filename: `talay-launch-price-reference-${captureDate}.md`, bytes: sourceEvidence, mimeType: "text/markdown" });

  project.published_starting_prices = {
    label: "Talay launch starting prices (not unit-specific)",
    source: "NAS Luxury public launch pricing reference",
    source_url: LAUNCH_PRICE_SOURCE,
    captured_at: captureDate,
    payment_plan: "50/50 · 5% booking",
    price_notice: "Starting prices are by bedroom type only. They are not assigned to a villa number, do not include plot premiums or add-ons, and are excluded from unit price metrics and portfolio totals. World of Aldar still returns AED 1 placeholder values for the sampled exact unit details.",
    prices: [
      { unit_type: "4-bedroom Villa", bedrooms: 4, starting_price_aed: 13_500_000 },
      { unit_type: "5-bedroom Villa", bedrooms: 5, starting_price_aed: 15_500_000 },
      { unit_type: "6-bedroom Villa", bedrooms: 6, starting_price_aed: 17_200_000 },
    ],
  };
  project.release_summary = {
    ...(project.release_summary ?? {}),
    unit_price_status: "Exact unit prices are not live in World of Aldar at the recorded check. Launch starting prices are shown separately by bedroom type.",
    unit_price_checked_at: captureDate,
  };

  await db.insert(inventorySyncRuns).values({ trigger: "manual", status: "running", triggeredBy: "owner:talay-launch-starting-prices" });
  const [run] = await db.select().from(inventorySyncRuns).orderBy(desc(inventorySyncRuns.id)).limit(1);
  if (!run) throw new Error("Talay launch-price audit run was not created.");
  try {
    await db.update(inventoryImportedProjects).set({ sourceJson: JSON.stringify(project), lastImportedRunId: run.id, importedBy: "owner:talay-launch-starting-prices" }).where(eq(inventoryImportedProjects.id, imported.id));
    await db.update(inventorySyncRuns).set({
      status: "success",
      unitsScanned: production.length,
      newUnits: 0,
      soldUnits: 0,
      statusChanges: 0,
      sourceStatusChanges: 0,
      priceChanges: 0,
      removedUnits: 0,
      newProjectsJson: "[]",
      summaryJson: JSON.stringify([{ projectSlug: PROJECT_SLUG, projectName: "Talay at Marsa Al Saadiyat", note: "Launch starting prices recorded separately by bedroom type; unit-level official prices remain unpublished." }]),
      finishedAt: new Date(),
    }).where(eq(inventorySyncRuns.id, run.id));
  } catch (error) {
    await db.update(inventorySyncRuns).set({ status: "error", errorMessage: String(error).slice(0, 2000), finishedAt: new Date() }).where(eq(inventorySyncRuns.id, run.id));
    throw error;
  }
  invalidateImportedAldarProjectCache("saadiyat");

  mkdirSync(resolve(process.cwd(), "private-audits"), { recursive: true });
  const audit = {
    capturedAt: new Date().toISOString(),
    projectSlug: PROJECT_SLUG,
    officialSource: { route: PROJECT_ROUTE, productionUnitCount: production.length, byBedrooms: bedroomCounts, sampledDetailPrices: detailPrices, conclusion: "AED 1 placeholders; no exact unit price patch applied." },
    launchStartingPrices: project.published_starting_prices,
    archival: { officialLivePageItemId: officialArchive.id ?? null, launchPriceReferenceItemId: priceReferenceArchive.id ?? null },
    runId: run.id,
  };
  const auditFile = resolve(process.cwd(), "private-audits", `talay-launch-starting-prices-${captureDate}.json`);
  writeFileSync(auditFile, JSON.stringify(audit, null, 2));
  console.log(JSON.stringify({ auditFile, ...audit }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
