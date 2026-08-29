import { createOneDriveViewLink, ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive.ts";
import { oneDriveSyncEvents } from "../drizzle/schema.ts";
import { getDb } from "../server/db.ts";

const verificationName = "onedrive-technical-verification.txt";
const verificationContent = [
  "Saadiyat Resale Hub — OneDrive technical verification.",
  "This file is not a property record, SPA, brochure, floorplan, owner document, or source file.",
  `Created at UTC: ${new Date().toISOString()}`,
].join("\n");

const configured = await getConfiguredOneDrive();
const verificationFolder = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Verification"]);
const item = await uploadOneDriveFile({
  driveId: configured.drive.id,
  parentItemId: verificationFolder,
  filename: verificationName,
  bytes: Buffer.from(verificationContent, "utf8"),
  mimeType: "text/plain; charset=utf-8",
});

if (!item.id) throw new Error("OneDrive did not return an item identifier for the verification file.");
const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
if (!shareUrl.startsWith("https://")) throw new Error("OneDrive did not return a valid individual view link.");

const db = await getDb();
if (!db) throw new Error("Database is unavailable to record the technical verification.");
await db.insert(oneDriveSyncEvents).values({
  connectionKey: "primary",
  eventType: "upload",
  status: "success",
  idempotencyKey: `technical-verification:${item.id}:${item.eTag ?? "unknown"}`,
  summary: "Uploaded Operations/Verification technical file and created an individual view link.",
  detailsJson: JSON.stringify({
    fileName: verificationName,
    driveItemId: item.id,
    mimeType: item.file?.mimeType ?? "text/plain",
    size: item.size ?? verificationContent.length,
    linkCreated: true,
  }),
  attemptedAt: new Date(),
  completedAt: new Date(),
});

console.log(JSON.stringify({
  status: "verified",
  fileName: verificationName,
  driveItemId: item.id,
  linkCreated: true,
  itemSize: item.size ?? verificationContent.length,
}));
