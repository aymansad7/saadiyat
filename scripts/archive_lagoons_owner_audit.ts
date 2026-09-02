import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { oneDriveSyncEvents, propertyOwnerImportRecords } from "../drizzle/schema";
import { appendActivityAudit } from "../server/activityAudit";
import { getDb } from "../server/db";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";

const SOURCE_FILE = "Newlagoonsandnoya.xlsx";
const AUDIT_PATH = "/home/ubuntu/saadiyat/server/data/owner_workbook_2026_08_26_audit.json";
const ACTOR = "source-import@saadiyat-resalehub.local";

const db = await getDb();
if (!db) throw new Error("Database is unavailable.");
const configured = await getConfiguredOneDrive();
const parentItemId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Source-Imports", "Lagoons", "2026-08-26"]);
const item = await uploadOneDriveFile({
  driveId: configured.drive.id,
  parentItemId,
  filename: "Newlagoonsandnoya-owner-audit-2026-08-26.json",
  bytes: readFileSync(AUDIT_PATH),
  mimeType: "application/json",
});
if (!item.id) throw new Error("OneDrive did not return a Lagoons audit item ID.");
await db.update(propertyOwnerImportRecords).set({ sourceItemId: item.id }).where(eq(propertyOwnerImportRecords.sourceFile, SOURCE_FILE));
await db.insert(oneDriveSyncEvents).values({
  connectionKey: "primary",
  eventType: "upload",
  status: "success",
  idempotencyKey: `owner-source-audit:${item.id}`,
  summary: "Archived private Lagoons/Noya owner-match audit source.",
  detailsJson: JSON.stringify({ sourceFile: SOURCE_FILE, recordType: "private_owner_source_audit" }),
  attemptedAt: new Date(),
  completedAt: new Date(),
}).onDuplicateKeyUpdate({ set: { status: "success", completedAt: new Date() } });
await appendActivityAudit({
  eventType: "onedrive_sync",
  actorEmail: ACTOR,
  actorName: "Source Import",
  entityType: "owner_source_archive",
  entityKey: SOURCE_FILE,
  summary: "Archived private Lagoons/Noya owner-match audit in OneDrive.",
});
console.log(JSON.stringify({ archived: true, sourceRowsUpdated: SOURCE_FILE }, null, 2));
