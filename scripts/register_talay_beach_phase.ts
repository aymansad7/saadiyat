import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { aldarProjectDiscoveries, inventoryImportedProjects, inventorySyncRuns } from "../drizzle/schema";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";
import { invalidateImportedAldarProjectCache } from "../server/importedAldarProjects";

const PROJECT_SLUG = "talay-beach-villas";
const PROJECT_NAME = "Talay Beach Villas at Marsa Al Saadiyat";
const CAPTURE_DATE = new Date().toISOString().slice(0, 10);
const EVIDENCE_PATH = "/home/ubuntu/upload/theupsides.ae_projects_talay-at-marsa-al-saadiyat_1789736369478.md";
const OFFICIAL_PRESS_RELEASE = "https://www.aldar.com/en/news-and-media/aldar-launches-first-homes-at-marsa-al-saadiyat-with-351-exclusive-villas-at-talay";
const OFFICIAL_DIRECTORY_ROUTE = "https://world.aldar.com/uae/talayhero";
const THIRD_PARTY_SOURCE = "https://theupsides.ae/projects/talay-at-marsa-al-saadiyat";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const evidence = readFileSync(EVIDENCE_PATH);
  const evidenceHash = createHash("sha256").update(evidence).digest("hex");
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "Marsa-Al-Saadiyat", CAPTURE_DATE, "Phase-Research"]);
  const sourceFile = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename: `talay-beach-phase-research-${CAPTURE_DATE}.md`,
    bytes: evidence,
    mimeType: "text/markdown",
  });

  const project = {
    slug: PROJECT_SLUG,
    name: PROJECT_NAME,
    area: "saadiyat",
    source_file: `Talay Beach phase registration · ${CAPTURE_DATE}`,
    source_url: OFFICIAL_DIRECTORY_ROUTE,
    unit_count: 0,
    available_count: 0,
    building_count: 0,
    buildings: [],
    release_summary: {
      phase_status: "Phase registered; individual-unit cards will be added only when Aldar publishes unique unit codes and a live unit registry.",
      unit_registry_status: "No official Talay Beach unit page, exact villa identifiers, unit-level prices, plot assignments, payment milestones, or availability statuses were published in World of Aldar at capture.",
      source_note: "The phase count and typology overview below are retained as source-labelled planning information, not a unit register. It is not used for availability or pricing calculations.",
      total_villas: 184,
      location: "Marsa Al Saadiyat · Saadiyat Island",
      developer: "Aldar",
      payment_plan: "50/50 reported for the phase; official Talay Beach milestone schedule not published",
      handover: "Not officially published in the Aldar sources reviewed; third-party sources conflict on timing",
      price_notice: "No Talay Beach price list or unit prices published by Aldar. The values shown are indicative market references only and are not attached to individual villas.",
      source_urls: [
        { label: "Aldar launch announcement", url: OFFICIAL_PRESS_RELEASE, classification: "official" },
        { label: "World of Aldar district route", url: OFFICIAL_DIRECTORY_ROUTE, classification: "official; no unit registry" },
        { label: "Phase research", url: THIRD_PARTY_SOURCE, classification: "third-party; source-labelled" },
      ],
      typologies: [
        { label: "Beach Villa · 4 Bedroom", bedrooms: 4, count: 81, villa_area_sqm: 506, plot_area_sqm: 736, starting_price_aed: 13_500_000, price_status: "indicative only; Aldar confirmation pending" },
        { label: "Beach Villa · 5 Bedroom", bedrooms: 5, count: 42, villa_area_sqm: 587, plot_area_sqm: 857, starting_price_aed: 15_500_000, price_status: "indicative only; Aldar confirmation pending" },
        { label: "Beach Villa · 6 Bedroom", bedrooms: 6, count: 61, villa_area_sqm: 634, plot_area_sqm: 860, starting_price_aed: 17_200_000, price_status: "indicative only; Aldar confirmation pending" },
      ],
    },
  };

  await db.insert(inventorySyncRuns).values({ trigger: "manual", status: "running", triggeredBy: "owner:talay-beach-phase-registration" });
  const [run] = await db.select().from(inventorySyncRuns).orderBy(desc(inventorySyncRuns.id)).limit(1);
  if (!run) throw new Error("Talay Beach registration run was not created.");
  const now = new Date();
  try {
    await db.insert(inventoryImportedProjects).values({
      dataset: "saadiyat",
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      areaKey: "saadiyat",
      sourceJson: JSON.stringify(project),
      unitCount: 0,
      availableCount: 0,
      firstDetectedRunId: run.id,
      lastImportedRunId: run.id,
      importedBy: "owner:talay-beach-phase-registration",
    }).onDuplicateKeyUpdate({
      set: { projectName: PROJECT_NAME, areaKey: "saadiyat", sourceJson: JSON.stringify(project), unitCount: 0, availableCount: 0, lastImportedRunId: run.id, importedBy: "owner:talay-beach-phase-registration" },
    });
    await db.insert(aldarProjectDiscoveries).values({
      sourcePath: "/uae/talayhero#talay-beach-phase",
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      dataset: "saadiyat",
      areaKey: "saadiyat",
      status: "incomplete",
      unitCount: 0,
      lastSeenAt: now,
      lastCheckedAt: now,
      importedAt: null,
      lastError: "Talay Beach phase is documented, but Aldar has not published an individual-unit registry or official price list.",
    }).onDuplicateKeyUpdate({
      set: { projectSlug: PROJECT_SLUG, projectName: PROJECT_NAME, dataset: "saadiyat", areaKey: "saadiyat", status: "incomplete", unitCount: 0, lastSeenAt: now, lastCheckedAt: now, importedAt: null, lastError: "Talay Beach phase is documented, but Aldar has not published an individual-unit registry or official price list." },
    });
    await db.update(inventorySyncRuns).set({
      status: "success",
      unitsScanned: 0,
      newUnits: 0,
      soldUnits: 0,
      statusChanges: 0,
      sourceStatusChanges: 0,
      priceChanges: 0,
      removedUnits: 0,
      newProjectsJson: JSON.stringify([{ dataset: "saadiyat", projectSlug: PROJECT_SLUG, projectName: PROJECT_NAME, areaKey: "saadiyat", unitCount: 0, availableCount: 0, status: "registry_pending" }]),
      summaryJson: JSON.stringify([{ projectSlug: PROJECT_SLUG, projectName: PROJECT_NAME, note: "Phase overview registered; unit registry pending official publication." }]),
      finishedAt: now,
    }).where(eq(inventorySyncRuns.id, run.id));
  } catch (error) {
    await db.update(inventorySyncRuns).set({ status: "error", errorMessage: String(error).slice(0, 2000), finishedAt: new Date() }).where(eq(inventorySyncRuns.id, run.id));
    throw error;
  }
  invalidateImportedAldarProjectCache("saadiyat");

  mkdirSync(resolve(process.cwd(), "private-audits"), { recursive: true });
  const audit = {
    capturedAt: new Date().toISOString(),
    project: { name: PROJECT_NAME, slug: PROJECT_SLUG, officialDirectoryRoute: OFFICIAL_DIRECTORY_ROUTE, registeredUnitCount: 0, plannedVillaCount: 184 },
    sourceEvidence: { thirdPartySource: THIRD_PARTY_SOURCE, archivedOneDriveItemId: sourceFile.id ?? null, sha256: evidenceHash },
    constraints: ["No official Talay Beach unit registry was published.", "No exact unit cards, availability labels, Aldar links, plot assignments, or official pricing were created.", "Displayed typology prices are clearly flagged as indicative third-party references only."],
    syncRunId: run.id,
  };
  const auditFile = resolve(process.cwd(), "private-audits", `talay-beach-phase-registration-${CAPTURE_DATE}.json`);
  writeFileSync(auditFile, JSON.stringify(audit, null, 2));
  console.log(JSON.stringify({ auditFile, ...audit }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
