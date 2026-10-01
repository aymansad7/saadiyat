import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { appendActivityAudit } from "../server/activityAudit";
import {
  createOneDriveViewLink,
  ensureFolderPath,
  getConfiguredOneDrive,
  uploadOneDriveFileSafely,
} from "../server/oneDrive";

const ACTOR = "broker-source-import@saadiyatresale.com";
const ACTOR_NAME = "Broker source import";
const sourceRoot = "/home/ubuntu/saadiyat-private-ops-2026-10-01";

const documents = [
  {
    key: "factSheet",
    filename: "Four-Seasons-Private-Residences-Fact-Sheet-V5.pdf",
    localPath: resolve(sourceRoot, "FACTSHEET_FSPR_20250905_V5.pdf"),
    label: "Official fact sheet · V5 · 5 September 2025",
  },
  {
    key: "masterPlanNumbers",
    filename: "Four-Seasons-Master-Plan-V3-Numbered.pdf",
    localPath: resolve(sourceRoot, "masterplans/MASTERPLAN1_FSPR_20250717_V3.pdf"),
    label: "Official numbered master plan · V3 · 17 July 2025",
  },
  {
    key: "masterPlanCollections",
    filename: "Four-Seasons-Master-Plan-V3-Collections.pdf",
    localPath: resolve(sourceRoot, "masterplans/MASTERPLAN2_FSPR_20250717_V3.pdf"),
    label: "Official collection master plan · V3 · 17 July 2025",
  },
] as const;

async function retry<T>(label: string, operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1_000));
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function main() {
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Communities",
    "Four Seasons",
    "Project-Reference",
    "Marketing",
  ]);

  const output: Record<string, { filename: string; shareUrl: string; sizeBytes: number }> = {};
  for (const document of documents) {
    const bytes = Buffer.from(await readFile(document.localPath));
    const item = await retry(`Uploading ${document.filename}`, () => uploadOneDriveFileSafely({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename: document.filename,
      bytes,
      mimeType: "application/pdf",
    }));
    if (!item.id) throw new Error(`OneDrive did not return an item ID for ${document.filename}.`);
    const shareUrl = await retry(`Creating share link for ${document.filename}`, () => createOneDriveViewLink({
      driveId: configured.drive.id,
      itemId: item.id,
    }));
    output[document.key] = {
      filename: item.name || document.filename,
      shareUrl,
      sizeBytes: item.size ?? bytes.length,
    };
    await appendActivityAudit({
      eventType: "document_create",
      actorEmail: ACTOR,
      actorName: ACTOR_NAME,
      entityType: "project_document",
      entityKey: `four-seasons:${document.key}:${item.id}`,
      summary: `Stored ${document.label} in the Four Seasons project reference folder on OneDrive.`,
      changes: { documentType: "marketing", websiteVisibility: "project_link", source: "Al Ain broker portal" },
    });
  }

  const result = {
    source: "Al Ain Broker Info Portal · Four Seasons Private Residences Abu Dhabi on Saadiyat Beach",
    destination: "Communities/Four Seasons/Project-Reference/Marketing",
    documents: output,
  };
  await writeFile(resolve(sourceRoot, "four-seasons-broker-document-links.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    setTimeout(() => process.exit(process.exitCode ?? 0), 0);
  });
