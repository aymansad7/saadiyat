import { updateHeartbeatJob } from "./_core/heartbeat";
import { notifyOwner } from "./_core/notification";
import { runInventorySync } from "./inventorySync";
import { archiveSeiSaadiyatSourceFiles } from "./seiSaadiyatOfficialExport";
import { captureSeiSaadiyatOfficialSnapshot } from "./seiSaadiyatOfficialCapture";

export const SEI_PRICE_MONITOR_START_AT = "2026-09-08T04:00:00.000Z";

export async function refreshSeiSaadiyatOfficialInventory(input: {
  trigger: "scheduled" | "manual";
  triggeredBy: string;
  monitorTaskUid?: string;
}) {
  if (input.trigger === "scheduled" && Date.now() < Date.parse(SEI_PRICE_MONITOR_START_AT)) {
    return { skipped: "before-monitor-window" as const, captureDate: null, publishedPriceCount: 0 };
  }

  const capture = await captureSeiSaadiyatOfficialSnapshot();
  const sync = await runInventorySync({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    datasets: { saadiyat: capture.dataset as any },
    projectScope: [{ dataset: "saadiyat", projectSlug: "sei-saadiyat" }],
  });
  const seiRollup = sync.rollups.find(row => row.dataset === "saadiyat" && row.projectSlug === "sei-saadiyat");
  const firstOfficialPriceDetected = capture.publishedPriceCount > 0 && (seiRollup?.priceChanges ?? 0) > 0;

  let notificationSent = false;
  let monitorPaused = false;
  if (firstOfficialPriceDetected) {
    await archiveSeiSaadiyatSourceFiles(capture.files, capture.captureDate);
    notificationSent = await notifyOwner({
      title: "Sei Saadiyat: official unit pricing published",
      content: `World of Aldar now publishes ${capture.publishedPriceCount} valid Sei unit price${capture.publishedPriceCount === 1 ? "" : "s"}. The sync recorded ${seiRollup?.priceChanges ?? 0} price event${(seiRollup?.priceChanges ?? 0) === 1 ? "" : "s"}. AED 1 placeholders were ignored. Open Sync History for unit-by-unit values.`,
    });
    if (input.monitorTaskUid) {
      await updateHeartbeatJob(input.monitorTaskUid, { enable: false }, "");
      monitorPaused = true;
    }
  }

  return {
    runId: sync.runId,
    counts: sync.counts,
    rollups: sync.rollups,
    newProjects: sync.newProjects,
    captureDate: capture.captureDate,
    publishedPriceCount: capture.publishedPriceCount,
    firstOfficialPriceDetected,
    notificationSent,
    monitorPaused,
  };
}
