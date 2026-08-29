/**
 * Creates only the approved high-level OneDrive structure and a non-sensitive
 * README. Community and exact-unit folders are created lazily on website upload
 * so the storage tree never contains fabricated units.
 */
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive.ts";

const configured = await getConfiguredOneDrive();
const folders = [
  ["Communities"],
  ["Operations"],
  ["Operations", "Code-Archives"],
];
for (const path of folders) await ensureFolderPath(configured.drive.id, configured.root.id, path);

const readme = `# Saadiyat Resale Hub — OneDrive repository

This folder is the central document repository for the Saadiyat Resale Hub website.

## Structure

- Communities/ — created from the website for each documented Community, Phase, and exact Unit or Plot key. Unit folders contain Brochures, SPA, Owner Documents, Floorplans, Source Files, Marketing, and Other documents only when a file is added through the website.
- Operations/ — contains the website-owned Saadiyat-Unit-Register.xlsx export. It is updated from the website and is not imported back into the website.
- Operations/Code-Archives/ — versioned recovery archives of the website source. Archives exclude passwords, tokens, .env files, node_modules, .git, logs, and build artifacts.

## Access

The website opens only an individual file link deliberately registered to a unit. It never lists this folder publicly. SPA and owner documents are not exposed on public property cards.
`;

const item = await uploadOneDriveFile({
  driveId: configured.drive.id,
  parentItemId: configured.root.id,
  filename: "README.md",
  bytes: Buffer.from(readme, "utf8"),
  mimeType: "text/markdown",
});
if (!item.id) throw new Error("OneDrive did not return a README identifier.");
console.log(JSON.stringify({ rootFolder: configured.root.name, readmeItemId: item.id, folders }, null, 2));
