import { updateHeartbeatJob } from "./_core/heartbeat";
import { notifyOwner } from "./_core/notification";
import { archiveSeiSaadiyatSourceFiles } from "./seiSaadiyatOfficialExport";
import { probeSeiSaadiyatOfficialPricing } from "./seiSaadiyatOfficialCapture";

export const SEI_PRICE_MONITOR_START_AT = "2026-09-08T04:00:00.000Z";

export async function refreshSeiSaadiyatOfficialInventory(input: {
  trigger: "scheduled" | "manual";
  triggeredBy: string;
  monitorTaskUid?: string;
}) {
  if (input.trigger === "scheduled" && Date.now() < Date.parse(SEI_PRICE_MONITOR_START_AT)) {
    return { skipped: "before-monitor-window" as const, captureDate: null, publishedPriceCount: 0 };
  }

  const probe = await probeSeiSaadiyatOfficialPricing();
  const firstOfficialPriceDetected = probe.publishedPrices.length > 0;

  let notificationSent = false;
  let monitorPaused = false;
  if (firstOfficialPriceDetected) {
    await archiveSeiSaadiyatSourceFiles(probe.files, probe.captureDate);
    notificationSent = await notifyOwner({
      title: "Sei Saadiyat: official unit pricing published",
      content: `World of Aldar now returns ${probe.publishedPrices.length} valid sampled Sei unit price${probe.publishedPrices.length === 1 ? "" : "s"} after screening ${probe.screenedUnitCount} official records. First detected value: ${probe.publishedPrices[0]!.unitName} · AED ${probe.publishedPrices[0]!.priceAed.toLocaleString()}. AED 1 placeholders were ignored. Full unit-price capture can now be run as a follow-up source import.`,
    });
    if (input.monitorTaskUid) {
      await updateHeartbeatJob(input.monitorTaskUid, { enable: false }, "");
      monitorPaused = true;
    }
  }

  return {
    runId: null,
    counts: { unitsScanned: probe.sourceUnitCount, newUnits: 0, soldUnits: 0, statusChanges: 0, sourceStatusChanges: 0, priceChanges: 0, removedUnits: 0 },
    rollups: [],
    newProjects: [],
    captureDate: probe.captureDate,
    sourceUnitCount: probe.sourceUnitCount,
    screenedUnitCount: probe.screenedUnitCount,
    monitorMode: "official-price-probe" as const,
    publishedPriceCount: probe.publishedPrices.length,
    detectedPrices: probe.publishedPrices,
    firstOfficialPriceDetected,
    notificationSent,
    monitorPaused,
  };
}
