/**
 * Creates a recovery archive of the web project and stores it in the approved
 * OneDrive root. The archive explicitly excludes credentials, VCS internals,
 * dependencies, logs, and build artifacts. It is not shared publicly.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { appendActivityAudit } from "../server/activityAudit.ts";
import { getDb } from "../server/db.ts";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive.ts";
import { oneDriveSyncEvents } from "../drizzle/schema.ts";

const projectRoot = process.cwd();
const date = new Date().toISOString().slice(0, 10);
const archiveName = `saadiyat-source-${date}.tar.gz`;
const archivePath = join("/tmp", archiveName);

try {
  rmSync(archivePath, { force: true });
  execFileSync("tar", [
    "-czf", archivePath,
    "--exclude=.git",
    "--exclude=node_modules",
    "--exclude=.pnpm-store",
    "--exclude=dist",
    "--exclude=build",
    "--exclude=coverage",
    "--exclude=.manus-logs",
    "--exclude=.env",
    "--exclude=.env.*",
    "--exclude=*.log",
    "--exclude=*.tsbuildinfo",
    "-C", projectRoot,
    ".",
  ]);
  if (!existsSync(archivePath)) throw new Error("Source archive was not created.");

  const configured = await getConfiguredOneDrive();
  const codeArchivesFolder = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Code-Archives"]);
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: codeArchivesFolder,
    filename: archiveName,
    bytes: readFileSync(archivePath),
    mimeType: "application/gzip",
  });
  if (!item.id) throw new Error("OneDrive did not return an archive item identifier.");

  const db = await getDb();
  if (db) {
    await db.insert(oneDriveSyncEvents).values({
      connectionKey: "primary",
      eventType: "upload",
      status: "success",
      idempotencyKey: `source-archive:${configured.drive.id}:${item.id}:${item.eTag ?? "unknown"}`,
      summary: `Uploaded recovery source archive ${archiveName}.`,
      detailsJson: JSON.stringify({ archiveName, itemId: item.id, excluded: [".env*", ".git", "node_modules", "dist", "build", "coverage", ".manus-logs"] }),
      attemptedAt: new Date(),
      completedAt: new Date(),
    });
    await appendActivityAudit({
      eventType: "onedrive_sync",
      actorEmail: "system",
      entityType: "source_archive",
      entityKey: item.id,
      summary: `Uploaded OneDrive recovery archive ${archiveName}.`,
    });
  }
  console.log(JSON.stringify({ archiveName, itemId: item.id, webUrl: item.webUrl ?? null }, null, 2));
} finally {
  rmSync(archivePath, { force: true });
}
