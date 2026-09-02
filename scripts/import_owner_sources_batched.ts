import { readFileSync } from "node:fs";
import { propertyOwnerImportRecords, propertyOwners, propertyOwnerUnits, villaListingAudit, villaListings } from "../drizzle/schema";
import { ownerIdentityKey } from "../server/fahidOwnerImport";
import { getDb } from "../server/db";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";

const APPLY = process.env.APPLY === "1";
const ACTOR = "source-import@saadiyat-resalehub.local";
const ACTOR_NAME = "Source Import";
const BATCH_SIZE = 250;
const FAHID_PLAN_PATH = "/home/ubuntu/fahid_import_plan.json";
const LAGOONS_AUDIT_PATH = "/home/ubuntu/saadiyat/server/data/owner_workbook_2026_08_26_audit.json";
const FAHID_WORKBOOK_PATH = "/home/ubuntu/upload/FAHAD.xlsx";

type SourceRecord = {
  sourceFile: string; sourceSheet: string; sourceRow: number; sourceUnit: string;
  ownerName: string; ownerPhone: string | null; sourceProject: string | null;
  status: "linked" | "unlinked"; reason: string | null; villaKey: string | null;
  community: string | null; buildingKey: string | null; unitTypeKey: string | null; bedrooms: number | null;
};
type Prepared = SourceRecord & { ownerId: number; matchStatus: "linked" | "unlinked" | "conflict"; matchReason: string | null };

function readJson<T>(path: string) { return JSON.parse(readFileSync(path, "utf8")) as T; }
function tidy(value: string | null | undefined) { const clean = value?.trim().replace(/\s+/g, " ") ?? ""; return clean || null; }
function chunks<T>(values: T[]) { return Array.from({ length: Math.ceil(values.length / BATCH_SIZE) }, (_, index) => values.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE)); }
function sourceKey(row: Pick<SourceRecord, "sourceFile" | "sourceSheet" | "sourceRow">) { return `${row.sourceFile}|${row.sourceSheet}|${row.sourceRow}`; }
function sourceLabel(row: SourceRecord) { return `${row.sourceFile} · ${row.sourceSheet} · Row ${row.sourceRow}`; }
function sourceIdentity(row: SourceRecord) { return ownerIdentityKey({ ownerName: row.ownerName, ownerPhone: row.ownerPhone, sourceUnit: `${row.sourceFile}/${row.sourceSheet}/${row.sourceRow}` }); }

function toLagoonsRecords(rows: any[]): SourceRecord[] {
  return rows.map(row => ({
    sourceFile: "Newlagoonsandnoya.xlsx", sourceSheet: tidy(row.sheet) ?? "Unspecified", sourceRow: Number(row.row), sourceUnit: tidy(row.source_unit) ?? "Unknown",
    ownerName: tidy(row.owner_name) ?? "Unknown owner", ownerPhone: tidy(row.owner_phone), sourceProject: tidy(row.project),
    status: row.villa_key && row.community ? "linked" : "unlinked", reason: row.villa_key && row.community ? "approved_exact_unit_match" : "legacy_source_has_no_exact_canonical_unit",
    villaKey: tidy(row.villa_key), community: tidy(row.community), buildingKey: null, unitTypeKey: null, bedrooms: null,
  }));
}

async function uploadFahidWorkbook() {
  const configured = await getConfiguredOneDrive();
  const parentItemId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Source-Imports", "Fahid", "2026-09-02"]);
  const item = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId, filename: "FAHAD.xlsx", bytes: readFileSync(FAHID_WORKBOOK_PATH), mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  if (!item.id) throw new Error("OneDrive did not return a FAHAD.xlsx item ID.");
  return item.id;
}

async function main() {
  const fahidPlan = readJson<{ records: any[] }>(FAHID_PLAN_PATH);
  const lagoonsAudit = readJson<{ approved_records: any[]; ambiguous_records: any[]; unmatched_records: any[] }>(LAGOONS_AUDIT_PATH);
  const fahid: SourceRecord[] = fahidPlan.records.map(row => ({
    sourceFile: "FAHAD.xlsx", sourceSheet: "Table 1", sourceRow: Number(row.source_row), sourceUnit: tidy(row.source_unit) ?? "Unknown",
    ownerName: tidy(row.owner_name) ?? "Unknown owner", ownerPhone: tidy(row.owner_phone), sourceProject: "The Beach House Fahid",
    status: row.status, reason: row.status === "linked" ? "B8–B11 project evidence and exact unit-code match" : tidy(row.reason),
    villaKey: tidy(row.villa_key), community: tidy(row.community), buildingKey: tidy(row.building_key), unitTypeKey: tidy(row.unit_type_key), bedrooms: typeof row.bedrooms === "number" ? row.bedrooms : null,
  }));
  const lagoons = [...toLagoonsRecords(lagoonsAudit.approved_records), ...toLagoonsRecords(lagoonsAudit.ambiguous_records), ...toLagoonsRecords(lagoonsAudit.unmatched_records)];
  const records = [...fahid, ...lagoons];
  const summary = { dryRun: !APPLY, fahid: { linked: fahid.filter(row => row.status === "linked").length, unlinked: fahid.filter(row => row.status === "unlinked").length }, lagoons: { linked: lagoons.filter(row => row.status === "linked").length, unlinked: lagoons.filter(row => row.status === "unlinked").length }, totalSourceRows: records.length };
  if (!APPLY) return void console.log(JSON.stringify(summary, null, 2));

  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [imports, owners, listings] = await Promise.all([db.select().from(propertyOwnerImportRecords), db.select().from(propertyOwners), db.select().from(villaListings)]);
  const existingFahidSourceItemId = imports.find(row => row.sourceFile === "FAHAD.xlsx" && row.sourceItemId)?.sourceItemId ?? null;
  const ownerByImport = new Map(imports.filter(row => row.ownerId != null).map(row => [`${row.sourceFile}|${row.sourceSheet}|${row.sourceRow}`, Number(row.ownerId)]));
  const ownerByPhoneIdentity = new Map<string, number>();
  const ownerBySourceLabel = new Map(owners.filter(owner => owner.sourceLabel).map(owner => [owner.sourceLabel!, owner.id]));
  for (const owner of owners) if (owner.phone) ownerByPhoneIdentity.set(ownerIdentityKey({ ownerName: owner.displayName, ownerPhone: owner.phone, sourceUnit: `existing-${owner.id}` }), owner.id);

  const newOwners = new Map<string, SourceRecord>();
  for (const row of records) {
    if (ownerByImport.has(sourceKey(row)) || ownerByPhoneIdentity.has(sourceIdentity(row)) || ownerBySourceLabel.has(sourceLabel(row))) continue;
    newOwners.set(sourceIdentity(row), row);
  }
  for (const batch of chunks([...newOwners.values()])) await db.insert(propertyOwners).values(batch.map(row => ({ displayName: row.ownerName, phone: row.ownerPhone, sourceLabel: sourceLabel(row), createdBy: ACTOR, createdByName: ACTOR_NAME })));
  const refreshedOwners = await db.select().from(propertyOwners);
  for (const owner of refreshedOwners) {
    if (owner.sourceLabel) ownerBySourceLabel.set(owner.sourceLabel, owner.id);
    if (owner.phone) ownerByPhoneIdentity.set(ownerIdentityKey({ ownerName: owner.displayName, ownerPhone: owner.phone, sourceUnit: `existing-${owner.id}` }), owner.id);
  }

  const listingByKey = new Map(listings.map(row => [row.villaKey, row]));
  const prepared: Prepared[] = [];
  let conflicts = 0;
  for (const row of records) {
    const ownerId = ownerByImport.get(sourceKey(row)) ?? ownerByPhoneIdentity.get(sourceIdentity(row)) ?? ownerBySourceLabel.get(sourceLabel(row));
    if (!ownerId) throw new Error(`Owner resolution failed for ${sourceKey(row)}.`);
    let matchStatus: Prepared["matchStatus"] = row.status;
    let matchReason = row.reason;
    const listing = row.villaKey ? listingByKey.get(row.villaKey) : null;
    if (matchStatus === "linked" && listing?.ownerName && ownerIdentityKey({ ownerName: listing.ownerName, ownerPhone: listing.ownerPhone, sourceUnit: `existing-${listing.id}` }) !== sourceIdentity(row)) {
      matchStatus = "conflict"; matchReason = "existing_listing_owner_conflicts_with_source_record"; conflicts += 1;
    }
    prepared.push({ ...row, ownerId, matchStatus, matchReason });
  }

  const fahidSourceItemId = existingFahidSourceItemId ?? await uploadFahidWorkbook();
  const safeLinked = prepared.filter(row => row.matchStatus === "linked" && row.villaKey && row.community);
  const newListings = safeLinked.filter(row => !listingByKey.has(row.villaKey!));
  for (const batch of chunks(newListings)) await db.insert(villaListings).values(batch.map(row => ({ villaKey: row.villaKey!, community: row.community!, status: "draft" as const, ownerName: row.ownerName, ownerPhone: row.ownerPhone, buildingKey: row.buildingKey, unitTypeKey: row.unitTypeKey, bedrooms: row.bedrooms, updatedBy: ACTOR }))).onDuplicateKeyUpdate({ set: { updatedBy: ACTOR } });

  const uniqueLinks = [...new Map(safeLinked.map(row => [`${row.ownerId}|${row.villaKey}`, row])).values()];
  for (const batch of chunks(uniqueLinks)) await db.insert(propertyOwnerUnits).values(batch.map(row => ({ ownerId: row.ownerId, villaKey: row.villaKey!, community: row.community!, relationship: "owner" as const, sourceLabel: sourceLabel(row), linkedBy: ACTOR, linkedByName: ACTOR_NAME }))).onDuplicateKeyUpdate({ set: { relationship: "owner", linkedBy: ACTOR, linkedByName: ACTOR_NAME } });
  for (const batch of chunks(prepared)) await db.insert(propertyOwnerImportRecords).values(batch.map(row => ({ sourceFile: row.sourceFile, sourceSheet: row.sourceSheet, sourceRow: row.sourceRow, sourceUnit: row.sourceUnit, sourceProject: row.sourceProject, ownerId: row.ownerId, villaKey: row.matchStatus === "linked" ? row.villaKey : null, community: row.matchStatus === "linked" ? row.community : null, matchStatus: row.matchStatus, matchReason: row.matchReason, rawOwnerName: row.ownerName, rawOwnerPhone: row.ownerPhone, sourceItemId: row.sourceFile === "FAHAD.xlsx" ? fahidSourceItemId : null, importedBy: ACTOR }))).onDuplicateKeyUpdate({ set: { importedBy: ACTOR } });
  for (const batch of chunks(uniqueLinks)) await db.insert(villaListingAudit).values(batch.map(row => ({ villaKey: row.villaKey!, actorEmail: ACTOR, actorName: ACTOR_NAME, summary: `Imported exact owner link from ${sourceLabel(row)}.`, changesJson: JSON.stringify({ source: row.sourceFile, sourceRow: row.sourceRow, relationship: "owner" }) })));
  console.log(JSON.stringify({ ...summary, sourceFileStoredInOneDrive: true, ownerRecordsCreated: newOwners.size, ownerRecordsReused: records.length - newOwners.size, unitLinksWritten: uniqueLinks.length, listingRowsCreated: newListings.length, conflicts }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
