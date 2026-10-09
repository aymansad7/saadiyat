import { readFile } from "node:fs/promises";
import {
  ensureFolderPath,
  getConfiguredOneDrive,
  uploadOneDriveFileSafely,
} from "../server/oneDrive";

const sourcePath = "/home/ubuntu/upload/ALAIN_Explore_All_Projects_20261009_150047.xlsx";
const sourceName = "ALAIN_Explore_All_Projects_20261009_150047.xlsx";

async function main() {
  const [configured, bytes] = await Promise.all([
    getConfiguredOneDrive(),
    readFile(sourcePath),
  ]);
  const folder = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Operations",
    "Source-Imports",
    "Four-Seasons",
    "2026-10-09",
  ]);
  const item = await uploadOneDriveFileSafely({
    driveId: configured.drive.id,
    parentItemId: folder,
    filename: sourceName,
    bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (!item.id) throw new Error("OneDrive did not return an item identifier for the Four Seasons source workbook.");
  console.log(JSON.stringify({
    sourceName,
    bytes: bytes.length,
    itemId: item.id,
    webUrl: item.webUrl ?? null,
    storagePath: "Operations/Source-Imports/Four-Seasons/2026-10-09",
  }, null, 2));
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
