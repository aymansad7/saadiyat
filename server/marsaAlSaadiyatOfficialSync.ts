import { and, eq } from "drizzle-orm";
import {
  applyOfficialUnitPricePatch,
  applyOfficialUnitSourceStatusPatch,
  runInventorySync,
} from "./inventorySync";
import {
  archiveMarsaAlSaadiyatOfficialCapture,
  captureMarsaAlSaadiyatOfficialProject,
  captureMarsaAlSaadiyatOfficialPartialPatch,
  type MarsaProjectConfig,
} from "./marsaAlSaadiyatOfficialCapture";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";
import { getDb } from "./db";
import { invalidateImportedAldarProjectCache } from "./importedAldarProjects";
import { inventoryImportedProjects } from "../drizzle/schema";

function positiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Updates safe descriptive fields for observed stored units; it never adds or removes a card. */
async function updateObservedPartialUnitDetails(
  config: MarsaProjectConfig,
  sourceUnits: Array<Record<string, unknown> & { unitNumber?: string }>,
  triggeredBy: string,
  runId: number,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.select({ id: inventoryImportedProjects.id, sourceJson: inventoryImportedProjects.sourceJson })
    .from(inventoryImportedProjects)
    .where(and(eq(inventoryImportedProjects.dataset, "saadiyat"), eq(inventoryImportedProjects.projectSlug, config.slug)))
    .limit(1);
  if (!row) return 0;
  const observed = new Map(sourceUnits.map(unit => [text(unit.unitNumber), unit]));
  let updated = 0;
  try {
    const project = JSON.parse(row.sourceJson) as { buildings?: Array<{ units?: Array<Record<string, unknown>> }> };
    for (const building of project.buildings ?? []) {
      for (const unit of building.units ?? []) {
        const source = observed.get(text(unit.unit_name));
        if (!source) continue;
        const bedrooms = positiveNumber(source.bedroomCount);
        const saleableArea = positiveNumber(source.saleableArea);
        unit.unit_type = text(source.unitType) ?? unit.unit_type ?? "Villa";
        unit.unit_category = text(source.unitCategory) ?? unit.unit_category ?? null;
        unit.unit_model = text(source.propertyName) ?? text(source.unitModel) ?? unit.unit_model ?? null;
        unit.bedrooms = bedrooms == null ? unit.bedrooms ?? null : String(bedrooms);
        unit.total_rooms = bedrooms == null ? unit.total_rooms ?? null : String(bedrooms);
        unit.plot_area_sqm = positiveNumber(source.plotArea) ?? unit.plot_area_sqm ?? null;
        unit.saleable_area_sqm = saleableArea ?? unit.saleable_area_sqm ?? null;
        unit.total_area_sqm = saleableArea ?? unit.total_area_sqm ?? null;
        unit.balcony_area_sqm = positiveNumber(source.balconyArea) ?? unit.balcony_area_sqm ?? null;
        unit.unit_finishes = source.isFurnished === true ? "Furnished" : unit.unit_finishes ?? null;
        unit.inventory_category = text(source.propertyName) ?? unit.inventory_category ?? "Villa";
        const features = [
          text(source.variantCode) ? `Variant: ${text(source.variantCode)}` : null,
          text(source.variantType) ? `Type code: ${text(source.variantType)}` : null,
          text(source.facadeType) ? `Facade: ${text(source.facadeType)}` : null,
          source.isExplorable === true ? "Floor plan published" : null,
          source.isInteriorExplorable === true ? "Interior explorer published" : null,
        ].filter(Boolean).join(" · ");
        if (features) unit.features_spec = features;
        updated += 1;
      }
    }
    await db.update(inventoryImportedProjects)
      .set({ sourceJson: JSON.stringify(project), lastImportedRunId: runId, importedBy: triggeredBy })
      .where(eq(inventoryImportedProjects.id, row.id));
    invalidateImportedAldarProjectCache("saadiyat");
    return updated;
  } catch {
    return 0;
  }
}

async function archiveOfficialSourceFiles(
  config: MarsaProjectConfig,
  capture: { captureDate: string; files: Array<{ filename: string; bytes: Buffer; mimeType: string }> },
) {
  const configured = await getConfiguredOneDrive();
  const date = capture.captureDate.slice(0, 10);
  const folderId = await ensureFolderPath(
    configured.drive.id,
    configured.root.id,
    ["Operations", "Official-Snapshots", "World-of-Aldar", date, config.slug],
  );
  const files: Array<{ filename: string; itemId: string | null }> = [];
  for (const file of capture.files) {
    const item = await uploadOneDriveFile({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename: file.filename,
      bytes: file.bytes,
      mimeType: file.mimeType,
    });
    files.push({ filename: file.filename, itemId: item.id ?? null });
  }
  return files;
}

/**
 * Imports a complete phase-level snapshot. Completeness is asserted before any
 * database write, so a temporary partial World of Aldar page cannot remove or
 * downgrade a Talay or Talay Beach record.
 */
export async function refreshMarsaAlSaadiyatOfficialProject(
  config: MarsaProjectConfig,
  input: { trigger: "scheduled" | "manual"; triggeredBy: string },
) {
  try {
    const capture = await captureMarsaAlSaadiyatOfficialProject(config);
    const archive = await archiveOfficialSourceFiles(config, capture);
    const evidencePath = archiveMarsaAlSaadiyatOfficialCapture(capture);
    const { runId, counts, rollups, newProjects } = await runInventorySync({
      trigger: input.trigger,
      triggeredBy: input.triggeredBy,
      datasets: { saadiyat: { projects: [capture.project] } },
      projectScope: [{ dataset: "saadiyat", projectSlug: config.slug }],
    });
    return {
      captureDate: capture.captureDate,
      runId,
      statusRunId: runId,
      priceRunId: runId,
      sourceUnitCount: capture.sourceUnitCount,
      expectedUnitCount: config.expectedUnitCount,
      publishedPriceCount: capture.publishedPriceCount,
      sourceStatusChangeCount: counts.sourceStatusChanges,
      priceChangeCount: counts.priceChanges,
      counts,
      rollups,
      newProjects,
      archive,
      evidencePath,
      mode: "complete-snapshot" as const,
    };
  } catch (error) {
    const message = String((error as Error)?.message ?? error);
    if (!/source coverage is \d+; expected \d+/i.test(message)) throw error;
    const capture = await captureMarsaAlSaadiyatOfficialPartialPatch(config);
    const archive = await archiveOfficialSourceFiles(config, capture);
    const evidencePath = archiveMarsaAlSaadiyatOfficialCapture(capture);
    const sourceStatus = await applyOfficialUnitSourceStatusPatch({
      trigger: input.trigger,
      triggeredBy: input.triggeredBy,
      dataset: "saadiyat",
      projectSlug: config.slug,
      statuses: capture.details.map(detail => ({ unitName: detail.unitName, sourceStatus: detail.sourceStatus })),
    });
    const prices = await applyOfficialUnitPricePatch({
      trigger: input.trigger,
      triggeredBy: input.triggeredBy,
      dataset: "saadiyat",
      projectSlug: config.slug,
      prices: capture.details.map(detail => ({ unitName: detail.unitName, priceAed: detail.priceAed })),
    });
    const updatedDescriptiveUnitCount = await updateObservedPartialUnitDetails(
      config,
      capture.sourceUnits,
      input.triggeredBy,
      prices.runId,
    );
    const counts = {
      unitsScanned: capture.sourceUnitCount,
      newUnits: 0,
      soldUnits: sourceStatus.counts.soldUnits,
      statusChanges: 0,
      sourceStatusChanges: sourceStatus.counts.sourceStatusChanges,
      priceChanges: prices.counts.priceChanges,
      removedUnits: 0,
    };
    return {
      captureDate: capture.captureDate,
      runId: prices.runId,
      statusRunId: sourceStatus.runId,
      priceRunId: prices.runId,
      sourceUnitCount: capture.sourceUnitCount,
      expectedUnitCount: capture.expectedUnitCount,
      publishedPriceCount: capture.publishedPriceCount,
      sourceStatusChangeCount: sourceStatus.appliedUnitCount,
      priceChangeCount: prices.appliedUnitCount,
      counts,
      rollups: [...sourceStatus.rollups, ...prices.rollups],
      newProjects: [],
      archive,
      evidencePath,
      mode: "partial-price-and-source-status-patch" as const,
      coverageGuard: message,
      updatedDescriptiveUnitCount,
    };
  }
}
