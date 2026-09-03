import { readFileSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { propertyOwnerImportRecords, propertyOwnerUnits, propertyOwners, villaListingAudit, villaListings } from "../drizzle/schema";
import { prepareLagoonsGoogleOwnerRecords, type LagoonsGooglePlanRow } from "../server/lagoonsGoogleSheetOwnerImport";
import { getDb } from "../server/db";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";

const APPLY = process.env.APPLY === "1";
const SOURCE_FILE = "LAGOONS_FROM_CRM_2026-09-03.xlsx";
const SOURCE_PATH = "/home/ubuntu/owner-import-sources/LAGOONS_FROM_CRM_2026-09-03.xlsx";
const PLAN_PATH = "/home/ubuntu/lagoons_google_import_plan.json";
const ACTOR = "source-import@saadiyat-resalehub.local";
const ACTOR_NAME = "Google CRM Source Import";
const BATCH_SIZE = 250;

function chunks<T>(values: T[]) {
  return Array.from({ length: Math.ceil(values.length / BATCH_SIZE) }, (_, index) => values.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE));
}

async function archiveSourceWithRetry() {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const configured = await getConfiguredOneDrive();
      const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Source-Imports", "Lagoons", "2026-09-03"]);
      const uploaded = await uploadOneDriveFile({
        driveId: configured.drive.id,
        parentItemId: folderId,
        filename: SOURCE_FILE,
        bytes: readFileSync(SOURCE_PATH),
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      if (uploaded.id) return uploaded.id;
      lastError = new Error("OneDrive did not return a source file identifier.");
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not archive the Google source file in OneDrive.");
}

async function main() {
  const plan = JSON.parse(readFileSync(PLAN_PATH, "utf8")) as { records: LagoonsGooglePlanRow[] };
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [links, owners, listings, existingImportRows] = await Promise.all([
    db.select().from(propertyOwnerUnits).where(eq(propertyOwnerUnits.community, "lagoons")),
    db.select().from(propertyOwners),
    db.select().from(villaListings).where(eq(villaListings.community, "lagoons")),
    db.select().from(propertyOwnerImportRecords).where(eq(propertyOwnerImportRecords.sourceFile, SOURCE_FILE)),
  ]);
  const ownerById = new Map(owners.map(owner => [owner.id, owner]));
  const ownerByVilla = new Map<string, { id: number; displayName: string; phone: string | null; email: string | null }[]>();
  for (const link of links.filter(link => link.relationship === "owner")) {
    const owner = ownerById.get(link.ownerId);
    if (!owner) continue;
    ownerByVilla.set(link.villaKey, [...(ownerByVilla.get(link.villaKey) ?? []), owner]);
  }
  const prepared = prepareLagoonsGoogleOwnerRecords(plan.records, ownerByVilla);
  const reasonCounts = Object.fromEntries(
    [...new Set(prepared.map(row => row.matchReason))]
      .map(reason => [reason, prepared.filter(row => row.matchReason === reason).length])
      .sort((left, right) => Number(right[1]) - Number(left[1])),
  );
  const summary = {
    dryRun: !APPLY,
    sourceRows: prepared.length,
    linked: prepared.filter(row => row.matchStatus === "linked").length,
    unlinked: prepared.filter(row => row.matchStatus === "unlinked").length,
    conflicts: prepared.filter(row => row.matchStatus === "conflict").length,
    distinctLinkedUnits: new Set(prepared.filter(row => row.matchStatus === "linked").map(row => row.villa_key)).size,
    reasonCounts,
  };
  if (!APPLY) return void console.log(JSON.stringify(summary, null, 2));

  const existingSourceItemId = existingImportRows.find(row => row.sourceItemId)?.sourceItemId ?? null;
  let sourceItemId = existingSourceItemId;
  if (!sourceItemId) {
    sourceItemId = await archiveSourceWithRetry();
  }
  if (!sourceItemId) throw new Error("OneDrive did not return a source file identifier.");

  for (const batch of chunks(prepared)) {
    await db.insert(propertyOwnerImportRecords).values(batch.map(row => ({
      sourceFile: SOURCE_FILE,
      sourceSheet: row.source_sheet,
      sourceRow: row.source_row,
      sourceUnit: row.source_unit,
      sourceProject: row.source_project,
      ownerId: row.ownerId,
      villaKey: row.community === "lagoons" ? row.villa_key ?? null : null,
      community: row.community,
      matchStatus: row.matchStatus,
      matchReason: row.matchReason,
      rawOwnerName: "Name not supplied by CRM",
      rawOwnerPhone: row.owner_phone,
      sourceItemId,
      importedBy: ACTOR,
    }))).onDuplicateKeyUpdate({ set: {
      ownerId: sql`VALUES(${propertyOwnerImportRecords.ownerId})`,
      villaKey: sql`VALUES(${propertyOwnerImportRecords.villaKey})`,
      community: sql`VALUES(${propertyOwnerImportRecords.community})`,
      matchStatus: sql`VALUES(${propertyOwnerImportRecords.matchStatus})`,
      matchReason: sql`VALUES(${propertyOwnerImportRecords.matchReason})`,
      rawOwnerPhone: sql`VALUES(${propertyOwnerImportRecords.rawOwnerPhone})`,
      sourceItemId,
      importedBy: ACTOR,
    } });
  }

  const listingByKey = new Map(listings.map(listing => [listing.villaKey, listing]));
  const overlayRows = [...new Map(prepared.filter(row => row.matchStatus === "linked" && row.villa_key && row.ownerId).map(row => [`${row.villa_key}|${row.ownerId}`, row])).values()];
  let overlaysWritten = 0;
  for (const row of overlayRows) {
    const owner = ownerById.get(row.ownerId!);
    if (!owner || !row.villa_key) continue;
    const existing = listingByKey.get(row.villa_key);
    if (existing && ((existing.ownerName && existing.ownerName !== owner.displayName) || (existing.ownerPhone && owner.phone && existing.ownerPhone.replace(/\D/g, "") !== owner.phone.replace(/\D/g, "")))) continue;
    if (existing) {
      await db.update(villaListings).set({
        ownerName: existing.ownerName ?? owner.displayName,
        ownerPhone: existing.ownerPhone ?? owner.phone,
        ownerEmail: existing.ownerEmail ?? owner.email,
        updatedBy: ACTOR,
      }).where(eq(villaListings.id, existing.id));
    } else {
      await db.insert(villaListings).values({
        villaKey: row.villa_key,
        community: "lagoons",
        status: "draft",
        ownerName: owner.displayName,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        updatedBy: ACTOR,
      });
    }
    overlaysWritten += 1;
  }
  if (overlayRows.length) {
    await db.insert(villaListingAudit).values(overlayRows.map(row => ({
      villaKey: row.villa_key!, actorEmail: ACTOR, actorName: ACTOR_NAME,
      summary: `Reconciled existing reviewed owner record from Google CRM row ${row.source_row}; listing remains Draft.`,
      changesJson: JSON.stringify({ source: SOURCE_FILE, sourceRow: row.source_row, ownerOverlay: "reconciled_from_reviewed_relation" }),
    })));
  }
  console.log(JSON.stringify({ ...summary, sourceFileStoredInOneDrive: true, cardOverlaysWritten: overlaysWritten }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
