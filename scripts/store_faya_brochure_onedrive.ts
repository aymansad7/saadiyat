import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import { and, eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { oneDriveSyncEvents, unitDocuments } from "../drizzle/schema";
import { createOneDriveViewLink, ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";

const SOURCE = "/home/ubuntu/upload/FAYABrochure.pdf";
const COMMUNITY = "Faya Al Saadiyat";
const PROJECT_KEY = "Faya Al Saadiyat Project";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");

  const bytes = readFileSync(SOURCE);
  const filename = basename(SOURCE);
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Projects", COMMUNITY, "Brochures"]);
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename,
    bytes,
    mimeType: "application/pdf",
  });
  if (!item.id) throw new Error("OneDrive did not return an item identifier.");
  const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
  const sourceHash = createHash("sha256").update(bytes).digest("hex");
  const sizeBytes = statSync(SOURCE).size;

  const existing = await db.select().from(unitDocuments).where(and(eq(unitDocuments.driveId, configured.drive.id), eq(unitDocuments.itemId, item.id))).limit(1);
  let documentId: number;
  if (existing[0]) {
    documentId = existing[0].id;
    await db.update(unitDocuments).set({
      villaKey: PROJECT_KEY,
      community: COMMUNITY,
      phaseKey: null,
      documentType: "brochure",
      websiteVisibility: "card_link",
      shareAccess: "anyone_link",
      filename,
      mimeType: "application/pdf",
      sizeBytes,
      description: "User-supplied Faya Al Saadiyat project brochure. Project-level document; not assigned to an individual residence.",
      parentItemId: folderId,
      webUrl: item.webUrl ?? null,
      shareUrl,
      etag: item.eTag ?? null,
      versionLabel: sourceHash.slice(0, 12),
      uploadedBy: "system:user-upload",
      uploadedByName: "Owner upload",
      removedAt: null,
    }).where(eq(unitDocuments.id, documentId));
  } else {
    const inserted = await db.insert(unitDocuments).values({
      villaKey: PROJECT_KEY,
      community: COMMUNITY,
      phaseKey: null,
      documentType: "brochure",
      websiteVisibility: "card_link",
      shareAccess: "anyone_link",
      filename,
      mimeType: "application/pdf",
      sizeBytes,
      description: "User-supplied Faya Al Saadiyat project brochure. Project-level document; not assigned to an individual residence.",
      driveId: configured.drive.id,
      itemId: item.id,
      parentItemId: folderId,
      webUrl: item.webUrl ?? null,
      shareUrl,
      etag: item.eTag ?? null,
      versionLabel: sourceHash.slice(0, 12),
      uploadedBy: "system:user-upload",
      uploadedByName: "Owner upload",
    });
    documentId = Number(inserted[0].insertId);
  }

  const idempotencyKey = `faya-brochure:${configured.drive.id}:${item.id}`;
  await db.insert(oneDriveSyncEvents).values({
    connectionKey: "primary",
    documentId,
    eventType: "upload",
    status: "success",
    idempotencyKey,
    summary: "Stored user-supplied Faya Al Saadiyat project brochure in OneDrive.",
    detailsJson: JSON.stringify({ community: COMMUNITY, projectKey: PROJECT_KEY, filename, sizeBytes, sourceHash, driveItemId: item.id, parentItemId: folderId }),
    attemptedAt: new Date(),
    completedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: { documentId, status: "success", summary: "Stored user-supplied Faya Al Saadiyat project brochure in OneDrive.", completedAt: new Date(), errorMessage: null },
  });

  console.log(JSON.stringify({
    stored: true,
    documentId,
    filename,
    sizeBytes,
    sourceHash,
    oneDrive: { driveItemId: item.id, parentItemId: folderId, webUrl: item.webUrl ?? null, shareLinkCreated: Boolean(shareUrl) },
    classification: { community: COMMUNITY, projectKey: PROJECT_KEY, documentType: "brochure", assignment: "project-level only" },
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
