import ExcelJS from "exceljs";
import { sql } from "drizzle-orm";
import { oneDriveSyncEvents } from "../drizzle/schema";
import { getDb } from "./db";
import { getSaadiyatDataset, type SaadiyatUnit } from "./routers/aldarSaadiyat";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";

export const SEI_CAPTURE_DATE = "2026-09-07";
const SEI_PROJECT_SLUG = "sei-saadiyat";

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

async function sourceFolder(captureDate = SEI_CAPTURE_DATE) {
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, [
    "Operations",
    "Official-Snapshots",
    "World-of-Aldar",
    captureDate,
  ]);
  return { configured, folderId };
}

export async function archiveSeiSaadiyatSourceFiles(files: Array<{ filename: string; bytes: Buffer; mimeType: string }>, captureDate = SEI_CAPTURE_DATE) {
  const { configured, folderId } = await sourceFolder(captureDate);
  const saved: Array<{ filename: string; itemId: string }> = [];
  for (const file of files) {
    const item = await uploadOneDriveFile({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename: file.filename,
      bytes: file.bytes,
      mimeType: file.mimeType,
    });
    if (!item.id) throw new Error(`OneDrive did not return an item identifier for ${file.filename}.`);
    await recordEvent({
      eventType: "upload",
      idempotencyKey: `official-world-of-aldar-sei:${captureDate}:${file.filename}`,
      summary: `Archived Sei Saadiyat source: ${file.filename}.`,
      details: { source: "Official World of Aldar Sei capture", captureDate, filename: file.filename, itemId: item.id },
    });
    saved.push({ filename: file.filename, itemId: item.id });
  }
  return { fileCount: saved.length, files: saved };
}

export type SeiSaadiyatExportRow = {
  project: string;
  building: string;
  unitCode: string;
  unitType: string | null;
  category: string | null;
  bedrooms: string | null;
  sourceStatus: string | null;
  priceAed: number | null;
  saleableAreaSqm: number | null;
  totalAreaSqm: number | null;
  plotAreaSqm: number | null;
  reservationAmountAed: number | null;
  sourceFile: string;
  exactUnitLink: null;
};

export function seiSaadiyatOfficialExportRows(): SeiSaadiyatExportRow[] {
  const project = getSaadiyatDataset().projects.find(item => item.slug === SEI_PROJECT_SLUG);
  if (!project) throw new Error("Sei Saadiyat is absent from the Saadiyat dataset.");
  return project.buildings.flatMap(building => building.units.map((unit: SaadiyatUnit) => ({
    project: project.name,
    building: building.name,
    unitCode: unit.unit_name ?? "",
    unitType: unit.unit_type,
    category: unit.unit_category,
    bedrooms: unit.bedrooms,
    sourceStatus: unit.status,
    priceAed: unit.price_aed,
    saleableAreaSqm: unit.saleable_area_sqm,
    totalAreaSqm: unit.total_area_sqm,
    plotAreaSqm: unit.plot_area_sqm,
    reservationAmountAed: unit.reservation_amount,
    sourceFile: project.source_file,
    exactUnitLink: null,
  })));
}

export async function exportSeiSaadiyatOfficialWorkbook() {
  const rows = seiSaadiyatOfficialExportRows();
  if (rows.length !== 778) throw new Error(`Expected 778 Sei Saadiyat rows, found ${rows.length}.`);
  const { configured, folderId } = await sourceFolder();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Saadiyat Resale Hub";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Official Units");
  sheet.columns = [
    { header: "Project", key: "project", width: 22 },
    { header: "Building", key: "building", width: 16 },
    { header: "Official Unit Code", key: "unitCode", width: 32 },
    { header: "Unit Type", key: "unitType", width: 20 },
    { header: "Category", key: "category", width: 28 },
    { header: "Bedrooms", key: "bedrooms", width: 12 },
    { header: "Aldar Source Status", key: "sourceStatus", width: 22 },
    { header: "Published Unit Price (AED)", key: "priceAed", width: 28 },
    { header: "Saleable Area (m²)", key: "saleableAreaSqm", width: 22 },
    { header: "Total Area (m²)", key: "totalAreaSqm", width: 20 },
    { header: "Plot Area (m²)", key: "plotAreaSqm", width: 19 },
    { header: "Reservation Amount (AED)", key: "reservationAmountAed", width: 27 },
    { header: "Source File", key: "sourceFile", width: 44 },
    { header: "Exact Unit Link", key: "exactUnitLink", width: 24 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  rows.forEach(row => sheet.addRow(row));
  const note = workbook.addWorksheet("Read Me");
  note.columns = [{ header: "Source note", key: "note", width: 120 }];
  note.getRow(1).font = { bold: true };
  note.addRow({ note: `Sei Saadiyat source captured/imported on ${SEI_CAPTURE_DATE}; 778 units across Buildings 1–6.` });
  note.addRow({ note: "A zero publishedPriceAED value means price not published. It is blank in this register and is not AED 0." });
  note.addRow({ note: "World of Aldar supplied only a project-map URL with an opaque unit query identifier. Because this has not been demonstrated as a stable public unit-detail page, the Exact Unit Link column is intentionally blank." });
  note.addRow({ note: "Aldar Source Status is a raw source label only and does not constitute NAS operational availability." });

  const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename = `Sei-Saadiyat-Official-Unit-Register-${SEI_CAPTURE_DATE}.xlsx`;
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename,
    bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (!item.id) throw new Error("OneDrive did not return the Sei workbook identifier.");
  await recordEvent({
    eventType: "workbook_export",
    idempotencyKey: `official-world-of-aldar-sei-workbook:${SEI_CAPTURE_DATE}`,
    summary: `Exported Sei Saadiyat official unit register with ${rows.length} source-backed rows.`,
    details: { source: "Project-owner supplied Aldar unit export", captureDate: SEI_CAPTURE_DATE, filename, rowCount: rows.length, itemId: item.id },
  });
  return { filename, rowCount: rows.length, itemId: item.id };
}
