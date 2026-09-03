import ExcelJS from "exceljs";
import { sql } from "drizzle-orm";
import { oneDriveSyncEvents } from "../drizzle/schema";
import { getDb } from "./db";
import { getDataset, type AldarOtherUnit } from "./routers/aldarOther";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";

const CAPTURE_DATE = "2026-09-03";
const GHADDEER_PROJECTS = new Set([
  "al-ghadeer-gardens",
  "al-ghadeer-parks-1",
  "al-ghadeer-parks-2",
]);

type GhadeerProject = {
  slug: string;
  name: string;
  source_file: string;
  buildings: Array<{ slug: string; name: string; units: AldarOtherUnit[] }>;
};

export type AlGhadeerExportRow = {
  project: string;
  cluster: string;
  unitCode: string;
  unitType: string | null;
  unitCategory: string | null;
  bedrooms: string | null;
  plotAreaSqm: number | null;
  saleableAreaSqm: number | null;
  totalAreaSqm: number | null;
  furnishing: string | null;
  explorerState: string | null;
  captureDate: string | null;
  officialLink: string | null;
  sourceRoute: string | null;
  priceAed: null;
  operationalAvailability: null;
};

export function alGhadeerOfficialExportRows(): AlGhadeerExportRow[] {
  const projects = getDataset().projects.filter(project => GHADDEER_PROJECTS.has(project.slug)) as GhadeerProject[];
  return projects.flatMap(project => project.buildings.flatMap(building => building.units.map(unit => ({
    project: project.name,
    cluster: building.name,
    unitCode: unit.unit_name ?? "",
    unitType: unit.unit_type,
    unitCategory: unit.unit_category,
    bedrooms: unit.bedrooms,
    plotAreaSqm: unit.plot_area_sqm,
    saleableAreaSqm: unit.saleable_area_sqm,
    totalAreaSqm: unit.total_area_sqm,
    furnishing: unit.unit_finishes,
    explorerState: unit.source_unit_status ?? null,
    captureDate: unit.source_captured_at ?? null,
    officialLink: unit.aldar_link,
    sourceRoute: unit.source_route ?? null,
    // These fields are intentionally null: World of Aldar's captured explorer
    // did not publish a price or operational availability for this import.
    priceAed: null,
    operationalAvailability: null,
  }))));
}

async function recordEvent(input: { eventType: "upload" | "workbook_export"; idempotencyKey: string; summary: string; details: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for OneDrive audit logging.");
  await db.insert(oneDriveSyncEvents).values({
    connectionKey: "primary",
    eventType: input.eventType,
    status: "success",
    idempotencyKey: input.idempotencyKey,
    summary: input.summary,
    detailsJson: JSON.stringify(input.details),
    attemptedAt: new Date(),
    completedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      status: "success",
      summary: input.summary,
      detailsJson: JSON.stringify(input.details),
      errorMessage: null,
      attemptedAt: new Date(),
      completedAt: new Date(),
    },
  });
}

export async function archiveAlGhadeerOfficialSourceFiles(files: Array<{ filename: string; bytes: Buffer; mimeType: string }>) {
  const configured = await getConfiguredOneDrive();
  const sourceFolder = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Operations",
    "Official-Snapshots",
    "World-of-Aldar",
    CAPTURE_DATE,
  ]);
  const saved = [] as Array<{ filename: string; itemId: string }>;
  for (const file of files) {
    const item = await uploadOneDriveFile({
      driveId: configured.drive.id,
      parentItemId: sourceFolder,
      filename: file.filename,
      bytes: file.bytes,
      mimeType: file.mimeType,
    });
    if (!item.id) throw new Error(`OneDrive did not return an item identifier for ${file.filename}.`);
    await recordEvent({
      eventType: "upload",
      idempotencyKey: `official-world-of-aldar-ghadeer:${CAPTURE_DATE}:${file.filename}`,
      summary: `Archived official World of Aldar Ghadeer source: ${file.filename}.`,
      details: { source: "World of Aldar captured snapshot", captureDate: CAPTURE_DATE, filename: file.filename, itemId: item.id },
    });
    saved.push({ filename: file.filename, itemId: item.id });
  }
  return { fileCount: saved.length, files: saved };
}

export async function exportAlGhadeerOfficialWorkbook() {
  const rows = alGhadeerOfficialExportRows();
  if (rows.length !== 1243) throw new Error(`Expected 1,243 official Al Ghadeer rows, found ${rows.length}.`);
  const configured = await getConfiguredOneDrive();
  const folder = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Operations",
    "Official-Snapshots",
    "World-of-Aldar",
    CAPTURE_DATE,
  ]);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Saadiyat Resale Hub";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Official Units");
  sheet.columns = [
    { header: "Project", key: "project", width: 26 },
    { header: "Cluster / Phase", key: "cluster", width: 18 },
    { header: "Official Unit Code", key: "unitCode", width: 42 },
    { header: "Unit Type", key: "unitType", width: 18 },
    { header: "Official Category", key: "unitCategory", width: 28 },
    { header: "Bedrooms", key: "bedrooms", width: 12 },
    { header: "Plot Area (m²)", key: "plotAreaSqm", width: 18 },
    { header: "Saleable Area (m²)", key: "saleableAreaSqm", width: 22 },
    { header: "Total Area (m²)", key: "totalAreaSqm", width: 20 },
    { header: "Furnishing", key: "furnishing", width: 16 },
    { header: "Captured Explorer State", key: "explorerState", width: 28 },
    { header: "Official Source Capture", key: "captureDate", width: 22 },
    { header: "Official Interactive Link", key: "officialLink", width: 96 },
    { header: "Official Source Route", key: "sourceRoute", width: 48 },
    { header: "Official Price (AED)", key: "priceAed", width: 22 },
    { header: "Operational Availability", key: "operationalAvailability", width: 28 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (const row of rows) sheet.addRow(row);
  const note = workbook.addWorksheet("Read Me");
  note.columns = [{ header: "Source note", key: "note", width: 120 }];
  note.getRow(1).font = { bold: true };
  note.addRow({ note: `Captured from World of Aldar on ${CAPTURE_DATE}. This is a static official snapshot, not a live feed.` });
  note.addRow({ note: "Official prices and current operational availability were not published in the reviewed source and are intentionally blank." });
  note.addRow({ note: "Captured Explorer State is retained as a raw source label only; it is not an NAS availability listing." });
  note.addRow({ note: "Every Interactive Link is derived from the exact captured full unit code; no generic project or lookalike unit URL is included." });

  const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `Al-Ghadeer-Official-Unit-Register-${CAPTURE_DATE}.xlsx`;
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folder,
    filename,
    bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (!item.id) throw new Error("OneDrive did not return the Al Ghadeer workbook identifier.");
  await recordEvent({
    eventType: "workbook_export",
    idempotencyKey: `official-world-of-aldar-ghadeer-workbook:${CAPTURE_DATE}`,
    summary: `Exported Al Ghadeer official unit register with ${rows.length} source-backed rows.`,
    details: { source: "World of Aldar captured snapshot", captureDate: CAPTURE_DATE, filename, rowCount: rows.length, itemId: item.id },
  });
  return { filename, rowCount: rows.length, itemId: item.id };
}
