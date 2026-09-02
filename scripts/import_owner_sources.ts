import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import {
  propertyOwnerImportRecords,
  propertyOwners,
  propertyOwnerUnits,
  villaListings,
} from "/home/ubuntu/saadiyat/drizzle/schema.ts";
import { ownerIdentityKey } from "/home/ubuntu/saadiyat/server/fahidOwnerImport.ts";
import { getDb } from "/home/ubuntu/saadiyat/server/db.ts";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "/home/ubuntu/saadiyat/server/oneDrive.ts";

const APPLY = process.env.APPLY === "1";
const ACTOR = "source-import@saadiyat-resalehub.local";
const ACTOR_NAME = "Source Import";
const FAHID_PLAN_PATH = "/home/ubuntu/fahid_import_plan.json";
const LAGOONS_AUDIT_PATH = "/home/ubuntu/saadiyat/server/data/owner_workbook_2026_08_26_audit.json";
const FAHID_WORKBOOK_PATH = "/home/ubuntu/upload/FAHAD.xlsx";

type SourceRecord = {
  sourceFile: string;
  sourceSheet: string;
  sourceRow: number;
  sourceUnit: string;
  ownerName: string;
  ownerPhone: string | null;
  sourceProject: string | null;
  status: "linked" | "unlinked";
  reason: string | null;
  villaKey: string | null;
  community: string | null;
  buildingKey: string | null;
  unitTypeKey: string | null;
  bedrooms: number | null;
  sourceItemId: string | null;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function tidy(value: string | null | undefined) {
  const result = value?.trim().replace(/\s+/g, " ") ?? "";
  return result || null;
}

function toLagoonsRecords(audit: any[]): SourceRecord[] {
  return audit.map((row) => ({
    sourceFile: "Newlagoonsandnoya.xlsx",
    sourceSheet: tidy(row.sheet) ?? "Unspecified",
    sourceRow: Number(row.row),
    sourceUnit: tidy(row.source_unit) ?? "Unknown",
    ownerName: tidy(row.owner_name) ?? "Unknown owner",
    ownerPhone: tidy(row.owner_phone),
    sourceProject: tidy(row.project),
    status: row.villa_key && row.community ? "linked" : "unlinked",
    reason: row.villa_key && row.community ? "approved_exact_unit_match" : "legacy_source_has_no_exact_canonical_unit",
    villaKey: tidy(row.villa_key),
    community: tidy(row.community),
    buildingKey: null,
    unitTypeKey: null,
    bedrooms: null,
    sourceItemId: null,
  }));
}

async function uploadFahidWorkbook() {
  const configured = await getConfiguredOneDrive();
  const folder = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Source-Imports", "Fahid", "2026-09-02"]);
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folder,
    filename: "FAHAD.xlsx",
    bytes: readFileSync(FAHID_WORKBOOK_PATH),
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (!item.id) throw new Error("OneDrive did not return an item ID for FAHAD.xlsx.");
  return item.id;
}

async function main() {
  const fahidPlan = readJson<{ records: any[] }>(FAHID_PLAN_PATH);
  const lagoonsAudit = readJson<{ approved_records: any[]; ambiguous_records: any[]; unmatched_records: any[] }>(LAGOONS_AUDIT_PATH);
  const fahidRecords: SourceRecord[] = fahidPlan.records.map((row) => ({
    sourceFile: "FAHAD.xlsx",
    sourceSheet: "Table 1",
    sourceRow: Number(row.source_row),
    sourceUnit: tidy(row.source_unit) ?? "Unknown",
    ownerName: tidy(row.owner_name) ?? "Unknown owner",
    ownerPhone: tidy(row.owner_phone),
    sourceProject: "The Beach House Fahid",
    status: row.status,
    reason: row.status === "linked" ? "B8–B11 project evidence and exact unit-code match" : tidy(row.reason),
    villaKey: tidy(row.villa_key),
    community: tidy(row.community),
    buildingKey: tidy(row.building_key),
    unitTypeKey: tidy(row.unit_type_key),
    bedrooms: typeof row.bedrooms === "number" ? row.bedrooms : null,
    sourceItemId: null,
  }));
  const lagoonsRecords = [
    ...toLagoonsRecords(lagoonsAudit.approved_records),
    ...toLagoonsRecords(lagoonsAudit.ambiguous_records),
    ...toLagoonsRecords(lagoonsAudit.unmatched_records),
  ];
  const records = [...fahidRecords, ...lagoonsRecords];
  const summary = {
    dryRun: !APPLY,
    fahid: { linked: fahidRecords.filter(row => row.status === "linked").length, unlinked: fahidRecords.filter(row => row.status === "unlinked").length },
    lagoons: { linked: lagoonsRecords.filter(row => row.status === "linked").length, unlinked: lagoonsRecords.filter(row => row.status === "unlinked").length },
    totalSourceRows: records.length,
  };
  if (!APPLY) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const fahidSourceItemId = await uploadFahidWorkbook();
  let ownersCreated = 0;
  let ownersReused = 0;
  let linksWritten = 0;
  let conflicts = 0;
  const ownerCache = new Map<string, number>();
  const ownerRows = await db.select().from(propertyOwners);
  for (const owner of ownerRows) {
    ownerCache.set(ownerIdentityKey({ ownerName: owner.displayName, ownerPhone: owner.phone, sourceUnit: `existing-${owner.id}` }), owner.id);
  }

  for (const original of records) {
    const record = { ...original, sourceItemId: original.sourceFile === "FAHAD.xlsx" ? fahidSourceItemId : null };
    const prior = (await db.select().from(propertyOwnerImportRecords).where(and(
      eq(propertyOwnerImportRecords.sourceFile, record.sourceFile),
      eq(propertyOwnerImportRecords.sourceSheet, record.sourceSheet),
      eq(propertyOwnerImportRecords.sourceRow, record.sourceRow),
    )).limit(1))[0];
    const sourceKey = ownerIdentityKey({ ownerName: record.ownerName, ownerPhone: record.ownerPhone, sourceUnit: `${record.sourceFile}/${record.sourceSheet}/${record.sourceRow}` });
    let ownerId = prior?.ownerId ?? ownerCache.get(sourceKey);
    if (!ownerId) {
      const created = await db.insert(propertyOwners).values({
        displayName: record.ownerName,
        phone: record.ownerPhone,
        sourceLabel: `${record.sourceFile} · ${record.sourceSheet} · Row ${record.sourceRow}`,
        createdBy: ACTOR,
        createdByName: ACTOR_NAME,
      });
      ownerId = Number(created[0].insertId);
      ownerCache.set(sourceKey, ownerId);
      ownersCreated += 1;
    } else {
      ownersReused += 1;
    }

    let matchStatus: "linked" | "unlinked" | "conflict" = record.status;
    let matchReason = record.reason;
    if (record.status === "linked" && record.villaKey && record.community) {
      const current = (await db.select().from(villaListings).where(eq(villaListings.villaKey, record.villaKey)).limit(1))[0];
      const currentKey = current?.ownerName
        ? ownerIdentityKey({ ownerName: current.ownerName, ownerPhone: current.ownerPhone, sourceUnit: `existing-${current.id}` })
        : null;
      if (currentKey && currentKey !== sourceKey) {
        matchStatus = "conflict";
        matchReason = "existing_listing_owner_conflicts_with_source_record";
        conflicts += 1;
      } else {
        await db.insert(villaListings).values({
          villaKey: record.villaKey,
          community: record.community,
          status: "draft",
          ownerName: record.ownerName,
          ownerPhone: record.ownerPhone,
          buildingKey: record.buildingKey,
          unitTypeKey: record.unitTypeKey,
          bedrooms: record.bedrooms,
          updatedBy: ACTOR,
        }).onDuplicateKeyUpdate({ set: {
          ownerName: record.ownerName,
          ownerPhone: record.ownerPhone,
          buildingKey: record.buildingKey ?? current?.buildingKey ?? null,
          unitTypeKey: record.unitTypeKey ?? current?.unitTypeKey ?? null,
          bedrooms: record.bedrooms ?? current?.bedrooms ?? null,
          updatedBy: ACTOR,
        } });
        await db.insert(propertyOwnerUnits).values({
          ownerId,
          villaKey: record.villaKey,
          community: record.community,
          relationship: "owner",
          sourceLabel: `${record.sourceFile} · ${record.sourceSheet} · Row ${record.sourceRow}`,
          linkedBy: ACTOR,
          linkedByName: ACTOR_NAME,
        }).onDuplicateKeyUpdate({ set: {
          relationship: "owner",
          sourceLabel: `${record.sourceFile} · ${record.sourceSheet} · Row ${record.sourceRow}`,
          linkedBy: ACTOR,
          linkedByName: ACTOR_NAME,
        } });
        linksWritten += 1;
      }
    }
    await db.insert(propertyOwnerImportRecords).values({
      sourceFile: record.sourceFile,
      sourceSheet: record.sourceSheet,
      sourceRow: record.sourceRow,
      sourceUnit: record.sourceUnit,
      sourceProject: record.sourceProject,
      ownerId,
      villaKey: matchStatus === "linked" ? record.villaKey : null,
      community: matchStatus === "linked" ? record.community : null,
      matchStatus,
      matchReason,
      rawOwnerName: record.ownerName,
      rawOwnerPhone: record.ownerPhone,
      sourceItemId: record.sourceItemId,
      importedBy: ACTOR,
    }).onDuplicateKeyUpdate({ set: {
      ownerId,
      villaKey: matchStatus === "linked" ? record.villaKey : null,
      community: matchStatus === "linked" ? record.community : null,
      matchStatus,
      matchReason,
      rawOwnerName: record.ownerName,
      rawOwnerPhone: record.ownerPhone,
      sourceItemId: record.sourceItemId,
      importedBy: ACTOR,
    } });
  }
  console.log(JSON.stringify({ ...summary, fahidSourceItemStored: true, ownersCreated, ownersReused, linksWritten, conflicts }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
