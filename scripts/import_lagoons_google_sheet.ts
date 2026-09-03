import { readFileSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { propertyOwnerImportRecords, propertyOwnerUnits, propertyOwners, villaListingAudit, villaListings } from "../drizzle/schema";
import { latestGoogleCardRows, prepareLagoonsGoogleOwnerRecords, type LagoonsGooglePlanRow } from "../server/lagoonsGoogleSheetOwnerImport";
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

function readHistory(value: string | null) {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toWholeAed(value: string | number | null | undefined) {
  if (value == null || value === "") return null;
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= 10_000_000_000 ? Math.round(numeric) : null;
}

function crmSnapshot(row: LagoonsGooglePlanRow, importedAt: string) {
  return {
    source: SOURCE_FILE,
    sourceSheet: row.source_sheet,
    sourceRow: row.source_row,
    importedAt,
    stage: row.snapshot?.stage ?? null,
    offeringType: row.snapshot?.offeringType ?? null,
    responsiblePerson: row.snapshot?.responsiblePerson ?? null,
    community: row.snapshot?.community ?? null,
    subCommunity: row.snapshot?.subCommunity ?? null,
    buildingName: row.snapshot?.buildingName ?? null,
    listingAvailability: row.snapshot?.listingAvailability ?? null,
    bedrooms: row.snapshot?.bedrooms ?? null,
    offeringPrice: row.snapshot?.offeringPrice ?? null,
    propertyType: row.snapshot?.propertyType ?? null,
    product: row.snapshot?.product ?? null,
    price: row.snapshot?.price ?? null,
    quantity: row.snapshot?.quantity ?? null,
  };
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
    Array.from(new Set(prepared.map(row => row.matchReason)))
      .map(reason => [reason, prepared.filter(row => row.matchReason === reason).length])
      .sort((left, right) => Number(right[1]) - Number(left[1])),
  );
  const summary = {
    dryRun: !APPLY,
    sourceRows: prepared.length,
    linked: prepared.filter(row => row.matchStatus === "linked").length,
    unlinked: prepared.filter(row => row.matchStatus === "unlinked").length,
    conflicts: prepared.filter(row => row.matchStatus === "conflict").length,
    currentCardUnits: latestGoogleCardRows(prepared).length,
    reasonCounts,
  };
  if (!APPLY) return void console.log(JSON.stringify(summary, null, 2));

  const existingSourceItemId = existingImportRows.find(row => row.sourceItemId)?.sourceItemId ?? null;
  const sourceItemId = existingSourceItemId ?? await archiveSourceWithRetry();
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
  const overlayGroups = latestGoogleCardRows(prepared);
  const importedAt = new Date().toISOString();
  const auditRows: { villaKey: string; actorEmail: string; actorName: string; summary: string; changesJson: string }[] = [];
  let overlaysWritten = 0;
  for (const group of overlayGroups) {
    const row = group.current;
    if (!row.villa_key || !row.ownerId) continue;
    const owner = ownerById.get(row.ownerId);
    if (!owner) continue;
    const existing = listingByKey.get(row.villa_key);
    const snapshot = crmSnapshot(row, importedAt);
    const currentBefore = existing ? readHistory(existing.ownerCurrentDataJson)[0] ?? null : null;
    const priorHistory = existing ? readHistory(existing.ownerHistoryJson) : [];
    const history = currentBefore?.sourceRow === row.source_row
      ? priorHistory
      : [
          ...priorHistory,
          ...(currentBefore ? [{ kind: "prior_google_crm_current", capturedAt: importedAt, data: currentBefore }] : []),
          ...group.previous.map(previous => ({ kind: "prior_google_crm_row", capturedAt: importedAt, data: crmSnapshot(previous, importedAt) })),
          ...(existing && (existing.ownerName || existing.ownerPhone || existing.ownerEmail)
            ? [{ kind: "prior_card_owner_overlay", capturedAt: importedAt, data: { ownerName: existing.ownerName, ownerPhone: existing.ownerPhone, ownerEmail: existing.ownerEmail } }]
            : []),
        ].slice(-80);
    const askingPriceAed = toWholeAed(row.snapshot?.offeringPrice) ?? existing?.askingPriceAed ?? null;
    const currentPhone = row.owner_phone ?? existing?.ownerPhone ?? owner.phone;
    const changes = {
      ownerPhone: { from: existing?.ownerPhone ?? null, to: currentPhone },
      askingPriceAed: { from: existing?.askingPriceAed ?? null, to: askingPriceAed },
      currentSourceRow: row.source_row,
      priorSourceRows: group.previous.map(previous => previous.source_row),
    };
    if (existing) {
      await db.update(villaListings).set({
        ownerName: owner.displayName,
        ownerPhone: currentPhone,
        ownerEmail: owner.email ?? existing.ownerEmail,
        askingPriceAed,
        ownerCurrentDataJson: JSON.stringify([snapshot]),
        ownerHistoryJson: JSON.stringify(history),
        updatedBy: ACTOR,
      }).where(eq(villaListings.id, existing.id));
    } else {
      await db.insert(villaListings).values({
        villaKey: row.villa_key,
        community: "lagoons",
        status: "draft",
        ownerName: owner.displayName,
        ownerPhone: currentPhone,
        ownerEmail: owner.email,
        askingPriceAed,
        ownerCurrentDataJson: JSON.stringify([snapshot]),
        ownerHistoryJson: JSON.stringify(history),
        updatedBy: ACTOR,
      });
    }
    auditRows.push({
      villaKey: row.villa_key,
      actorEmail: ACTOR,
      actorName: ACTOR_NAME,
      summary: `Applied latest Google CRM row ${row.source_row}; prior values retained as owner history.`,
      changesJson: JSON.stringify({ source: SOURCE_FILE, ...changes }),
    });
    overlaysWritten += 1;
  }
  if (auditRows.length) await db.insert(villaListingAudit).values(auditRows);
  console.log(JSON.stringify({ ...summary, sourceFileStoredInOneDrive: true, cardOverlaysWritten: overlaysWritten }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
