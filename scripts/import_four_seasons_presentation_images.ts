import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { appendActivityAudit } from "../server/activityAudit";
import {
  ensureFolderPath,
  getConfiguredOneDrive,
  uploadOneDriveFileSafely,
} from "../server/oneDrive";

const ACTOR = "broker-source-import@saadiyatresale.com";
const ACTOR_NAME = "Broker source import";
const root = "/home/ubuntu/saadiyat-private-ops-2026-10-01/gallery-assets";
const filenames = [
  "sales-centre-1.jpg",
  "sales-centre-2.jpg",
  "sales-centre-3.jpg",
  "sales-centre-4.jpg",
  "lifestyle-garden.jpg",
  "lifestyle-beach.jpg",
  "lifestyle-sea.jpg",
] as const;

async function main() {
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Communities",
    "Four Seasons",
    "Project-Reference",
    "Imagery",
  ]);
  const uploaded: Array<{ filename: string; sizeBytes: number }> = [];
  for (const filename of filenames) {
    const bytes = Buffer.from(await readFile(resolve(root, filename)));
    const item = await uploadOneDriveFileSafely({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename,
      bytes,
      mimeType: "image/jpeg",
    });
    uploaded.push({ filename: item.name || filename, sizeBytes: item.size ?? bytes.length });
  }
  await appendActivityAudit({
    eventType: "document_create",
    actorEmail: ACTOR,
    actorName: ACTOR_NAME,
    entityType: "project_media",
    entityKey: "four-seasons:presentation-gallery:2026-10-01",
    summary: "Stored seven official Four Seasons project and lifestyle images in OneDrive for the client presentation gallery.",
    changes: { source: "Al Ain Broker Info Portal", count: uploaded.length, websiteVisibility: "project_gallery" },
  });
  console.log(JSON.stringify({ folder: "Communities/Four Seasons/Project-Reference/Imagery", uploaded }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => setTimeout(() => process.exit(process.exitCode ?? 0), 0));
