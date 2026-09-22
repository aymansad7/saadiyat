import { updateHeartbeatJob } from "./_core/heartbeat";
import { notifyOwner } from "./_core/notification";
import { applyOfficialUnitPricePatch, applyOfficialUnitSourceStatusPatch, runInventorySync } from "./inventorySync";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";
import {
  captureYasRivaReserveOfficialFullPricePatch,
  captureYasRivaReserveOfficialSource,
  probeYasRivaReserveOfficialPricing,
  sourceProjectFromCapture,
  verifiedYasRivaReserveSourceStatusPatch,
  YAS_RIVA_RESERVE_PROJECT_SLUG,
} from "./yasRivaReserveOfficialCapture";

async function archiveYasRivaReserveOfficialSourceFiles(
  files: Array<{ filename: string; bytes: Buffer; mimeType: string }>,
  captureDate: string,
) {
  if (!files.length) return [];
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(
    configured.drive.id,
    configured.root.id,
    ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "Yas-Riva-Reserve"],
  );
  const saved: Array<{ filename: string; itemId: string | null }> = [];
  for (const file of files) {
    const item = await uploadOneDriveFile({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename: file.filename,
      bytes: file.bytes,
      mimeType: file.mimeType,
    });
    saved.push({ filename: file.filename, itemId: item.id ?? null });
  }
  return saved;
}

/**
 * Daily safe Yas Riva Reserve refresh. It re-captures the full verified source
 * project, preserves raw Aldar Explorer state separately from NAS availability,
 * and patches only valid published prices. It never infers a resale listing.
 */
export async function refreshYasRivaReserveOfficialInventory(input: {
  trigger: "scheduled" | "manual";
  triggeredBy: string;
}) {
  const capture = await captureYasRivaReserveOfficialSource();
  const snapshotSync = await runInventorySync({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    datasets: { other: { projects: [sourceProjectFromCapture(capture)] } },
    projectScope: [{ dataset: "other", projectSlug: YAS_RIVA_RESERVE_PROJECT_SLUG }],
  });
  const sourceStatusSync = await applyOfficialUnitSourceStatusPatch({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    dataset: "other",
    projectSlug: YAS_RIVA_RESERVE_PROJECT_SLUG,
    statuses: verifiedYasRivaReserveSourceStatusPatch(capture.units),
  });
  const pagePrices = capture.units.flatMap(unit => unit.sourcePriceAed != null
    ? [{ unitName: unit.unitName, priceAed: unit.sourcePriceAed }]
    : []);
  const priceSync = pagePrices.length
    ? await applyOfficialUnitPricePatch({
      trigger: input.trigger,
      triggeredBy: input.triggeredBy,
      dataset: "other",
      projectSlug: YAS_RIVA_RESERVE_PROJECT_SLUG,
      prices: pagePrices,
    })
    : null;
  const archive = await archiveYasRivaReserveOfficialSourceFiles(capture.files, capture.captureDate);
  return {
    captureDate: capture.captureDate,
    sourceUnitCount: capture.sourceUnitCount,
    runId: snapshotSync.runId,
    sourceStatusRunId: sourceStatusSync.runId,
    priceRunId: priceSync?.runId ?? null,
    counts: {
      unitsScanned: snapshotSync.counts.unitsScanned,
      newUnits: snapshotSync.counts.newUnits,
      soldUnits: snapshotSync.counts.soldUnits,
      statusChanges: snapshotSync.counts.statusChanges,
      sourceStatusChanges: snapshotSync.counts.sourceStatusChanges + sourceStatusSync.counts.sourceStatusChanges,
      priceChanges: snapshotSync.counts.priceChanges + (priceSync?.counts.priceChanges ?? 0),
      removedUnits: snapshotSync.counts.removedUnits,
    },
    rollups: [...snapshotSync.rollups, ...sourceStatusSync.rollups, ...(priceSync?.rollups ?? [])],
    newProjects: snapshotSync.newProjects,
    sourceStatusChangeCount: sourceStatusSync.appliedUnitCount,
    publishedPriceCount: pagePrices.length,
    priceChangeCount: priceSync?.appliedUnitCount ?? 0,
    archive,
  };
}

/**
 * Hourly release detector. It checks exact official unit details across all
 * currently published Yas Riva Reserve typologies. AED 1 / zero / blank values
 * are excluded. On first valid result it imports all 292 exact unit prices,
 * saves source evidence in OneDrive, notifies the owner, and pauses itself.
 */
export async function monitorYasRivaReserveOfficialPricing(input: {
  trigger: "scheduled" | "manual";
  triggeredBy: string;
  monitorTaskUid?: string;
}) {
  const probe = await probeYasRivaReserveOfficialPricing();
  if (!probe.publishedPrices.length) {
    return {
      captureDate: probe.captureDate,
      sourceUnitCount: probe.sourceUnitCount,
      screenedUnitCount: probe.screenedUnitCount,
      publishedPriceCount: 0,
      importedPriceCount: 0,
      notificationSent: false,
      monitorPaused: false,
    };
  }

  const full = await captureYasRivaReserveOfficialFullPricePatch();
  const priceSync = await applyOfficialUnitPricePatch({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    dataset: "other",
    projectSlug: YAS_RIVA_RESERVE_PROJECT_SLUG,
    prices: full.publishedPrices,
  });
  const archive = await archiveYasRivaReserveOfficialSourceFiles(full.files, full.captureDate);
  const notificationSent = await notifyOwner({
    title: "Yas Riva Reserve: official unit pricing published",
    content: `World of Aldar now returns ${full.publishedPrices.length} valid Yas Riva Reserve unit price${full.publishedPrices.length === 1 ? "" : "s"} after checking ${full.screenedUnitCount} exact official unit records. First detected value: ${full.publishedPrices[0]!.unitName} · AED ${full.publishedPrices[0]!.priceAed.toLocaleString()}. AED 1 placeholders were excluded; source evidence was saved in OneDrive.`,
  });
  let monitorPaused = false;
  if (input.monitorTaskUid) {
    await updateHeartbeatJob(input.monitorTaskUid, { enable: false }, "");
    monitorPaused = true;
  }
  return {
    captureDate: full.captureDate,
    sourceUnitCount: full.sourceUnitCount,
    screenedUnitCount: full.screenedUnitCount,
    publishedPriceCount: full.publishedPrices.length,
    importedPriceCount: priceSync.appliedUnitCount,
    priceRunId: priceSync.runId,
    priceChangeCount: priceSync.counts.priceChanges,
    archive,
    notificationSent,
    monitorPaused,
  };
}
