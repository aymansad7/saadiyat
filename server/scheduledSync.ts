/**
 * Scheduled inventory-sync HTTP handler.
 *
 * Mounted at POST /api/scheduled/inventorySync (see server/_core/index.ts). The
 * Manus Heartbeat platform POSTs here on the configured daily cron (06:00 Asia/
 * Dubai = 02:00 UTC). The platform gateway restricts /api/scheduled/* to cron
 * callers, and we additionally require the cron task-uid header that Heartbeat
 * injects, so the endpoint can't be triggered by ordinary site traffic.
 *
 * The handler is idempotent: running it twice in a row simply records a second
 * run with (usually) zero changes. Errors are JSON-encoded on 500 so the
 * platform Investigate flow can surface them verbatim.
 */
import type { Request, Response } from "express";
import { buildSyncChangeSummary, shouldNotifyInventoryOwner } from "./inventorySync";
import { notifyOwner } from "./_core/notification";
import { sdk } from "./_core/sdk";
import { refreshAlGhadeerOfficialInventory } from "./alGhadeerOfficialSync";
import { discoverAndImportOfficialAldarProjects } from "./aldarProjectDiscovery";
import { refreshSeiSaadiyatOfficialInventory } from "./seiSaadiyatOfficialSync";
import { refreshTalayOfficialInventory } from "./talayOfficialSync";
import { monitorYasRivaReserveOfficialPricing, refreshYasRivaReserveOfficialInventory } from "./yasRivaReserveOfficialSync";

/** Header Heartbeat sets to the triggering cron task UID. */
const CRON_TASK_HEADER = "x-manus-cron-task-uid";

export async function inventorySyncScheduledHandler(req: Request, res: Response) {
  try {
    const caller = await sdk.authenticateRequest(req);
    if (!caller.isCron || !caller.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    const headerTaskUid =
      (req.headers[CRON_TASK_HEADER] as string | undefined) ||
      (req.headers["x-manus-task-uid"] as string | undefined) ||
      null;
    const taskUid = caller.taskUid;

    console.log("[scheduledSync] triggered", {
      taskUid,
      headerMatchesIdentity: !headerTaskUid || headerTaskUid === taskUid,
    });

    const trigger = `cron:${taskUid}`;
    const [ghadeer, projectDiscovery, sei, talay, yasRivaReserve] = await Promise.allSettled([
      refreshAlGhadeerOfficialInventory({ trigger: "scheduled", triggeredBy: trigger }),
      discoverAndImportOfficialAldarProjects({ trigger: "scheduled", triggeredBy: trigger }),
      refreshSeiSaadiyatOfficialInventory({ trigger: "scheduled", triggeredBy: trigger }),
      refreshTalayOfficialInventory({ trigger: "scheduled", triggeredBy: trigger }),
      refreshYasRivaReserveOfficialInventory({ trigger: "scheduled", triggeredBy: trigger }),
    ]);
    if ([ghadeer, projectDiscovery, sei, talay, yasRivaReserve].every(result => result.status === "rejected")) {
      throw new Error("Every official inventory source failed during the scheduled refresh.");
    }
    const ghadeerResult = ghadeer.status === "fulfilled" ? ghadeer.value : null;
    const discoveryResult = projectDiscovery.status === "fulfilled" ? projectDiscovery.value : null;
    const seiResult = sei.status === "fulfilled" ? sei.value : null;
    const talayResult = talay.status === "fulfilled" ? talay.value : null;
    const yasRivaReserveResult = yasRivaReserve.status === "fulfilled" ? yasRivaReserve.value : null;
    const zeroCounts = { unitsScanned: 0, newUnits: 0, soldUnits: 0, statusChanges: 0, sourceStatusChanges: 0, priceChanges: 0, removedUnits: 0 };
    const ghadeerCounts = ghadeerResult?.counts ?? zeroCounts;
    const seiCounts = seiResult && "counts" in seiResult && seiResult.counts ? seiResult.counts : zeroCounts;
    const talayCounts = talayResult?.counts ?? zeroCounts;
    const yasRivaReserveCounts = yasRivaReserveResult?.counts ?? zeroCounts;
    const sourceCounts: Array<typeof zeroCounts> = [ghadeerCounts, seiCounts, talayCounts, yasRivaReserveCounts];
    const counts = sourceCounts.reduce((total, next) => ({
      unitsScanned: total.unitsScanned + next.unitsScanned,
      newUnits: total.newUnits + next.newUnits,
      soldUnits: total.soldUnits + next.soldUnits,
      statusChanges: total.statusChanges + next.statusChanges,
      sourceStatusChanges: total.sourceStatusChanges + next.sourceStatusChanges,
      priceChanges: total.priceChanges + next.priceChanges,
      removedUnits: total.removedUnits + next.removedUnits,
    }), { unitsScanned: 0, newUnits: 0, soldUnits: 0, statusChanges: 0, sourceStatusChanges: 0, priceChanges: 0, removedUnits: 0 });
    const seiRollups = seiResult && "rollups" in seiResult && Array.isArray(seiResult.rollups) ? seiResult.rollups : [];
    const rollups = [
      ...(ghadeerResult?.rollups ?? []),
      ...seiRollups,
      ...(talayResult?.rollups ?? []),
      ...(yasRivaReserveResult?.rollups ?? []),
    ];
    const newProjects = [...(ghadeerResult?.newProjects ?? []), ...(yasRivaReserveResult?.newProjects ?? []), ...(discoveryResult?.importedProjects ?? [])];
    const newDirectoryProjects = discoveryResult?.newlyDetected ?? [];
    const summary = buildSyncChangeSummary(counts, rollups);
    let notificationSent = false;
    if (shouldNotifyInventoryOwner(counts, newProjects) || newDirectoryProjects.length > 0) {
      notificationSent = await notifyOwner({
        title: newDirectoryProjects.length
          ? `Aldar: ${newDirectoryProjects.length} new official project${newDirectoryProjects.length === 1 ? "" : "s"} detected`
          : `Aldar inventory sync: ${summary.changed} change${summary.changed === 1 ? "" : "s"}`,
        content: [
          summary.headline,
          summary.metrics || "No category totals reported.",
          newProjects.length
            ? `New source-complete projects: ${newProjects.map(project => `${project.projectName} [${project.areaKey}] · ${project.unitCount} units · ${project.availableCount} available${project.priceMinAed != null ? ` · AED ${project.priceMinAed.toLocaleString()}–${(project.priceMaxAed ?? project.priceMinAed).toLocaleString()}` : " · price not published"}`).join("\n")}`
            : "No new source-complete project detected.",
          newDirectoryProjects.length
            ? `New official directory projects: ${newDirectoryProjects.map(project => `${project.projectName} · ${project.status === "imported" ? "imported as a project" : project.status === "incomplete" ? "published but unit data is not complete yet" : "discovery check needs retry"}`).join("\n")}`
            : "No newly listed official directory project detected.",
          summary.projects.length ? `Top affected projects: ${summary.projects.join(" · ")}` : "No project-level changes reported.",
          `Sources: World of Aldar directory; Al Ghadeer${ghadeerResult ? ` (${ghadeerResult.captureDate})` : " (refresh failed)"}; Sei Saadiyat${seiResult ? ` (${seiResult.captureDate})` : " (refresh failed)"}; Talay${talayResult ? ` (${talayResult.captureDate})` : " (refresh failed)"}; Yas Riva Reserve${yasRivaReserveResult ? ` (${yasRivaReserveResult.captureDate})` : " (refresh failed)"}. Raw explorer labels are not NAS availability.`,
        ].join("\n"),
      });
    }

    return res.json({
      ok: true,
      runId: ghadeerResult?.runId ?? (seiResult && "runId" in seiResult ? seiResult.runId : null) ?? talayResult?.statusRunId ?? null,
      counts,
      summary,
      topProjects: rollups.slice(0, 10),
      newProjects,
      projectDiscovery: discoveryResult ?? { error: String(projectDiscovery.status === "rejected" ? projectDiscovery.reason : "unknown") },
      sourceErrors: {
        alGhadeer: ghadeer.status === "rejected" ? String(ghadeer.reason) : null,
        projectDiscovery: projectDiscovery.status === "rejected" ? String(projectDiscovery.reason) : null,
        seiSaadiyat: sei.status === "rejected" ? String(sei.reason) : seiResult && "sourceStatusError" in seiResult ? seiResult.sourceStatusError ?? null : null,
        talay: talay.status === "rejected" ? String(talay.reason) : null,
        yasRivaReserve: yasRivaReserve.status === "rejected" ? String(yasRivaReserve.reason) : null,
      },
      notificationSent,
      snapshotSource: "official World of Aldar directory plus Al Ghadeer, Sei Saadiyat, Talay, and Yas Riva Reserve captures",
      captureDate: ghadeerResult?.captureDate ?? seiResult?.captureDate ?? talayResult?.captureDate ?? yasRivaReserveResult?.captureDate ?? null,
    });
  } catch (err) {
    const e = err as Error;
    return res.status(500).json({
      error: e?.message ?? String(err),
      stack: e?.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}

/** Hourly official Sei price monitor. The cron disables itself after first valid pricing. */
export async function seiPriceMonitorScheduledHandler(req: Request, res: Response) {
  try {
    const caller = await sdk.authenticateRequest(req);
    if (!caller.isCron || !caller.taskUid) return res.status(403).json({ error: "cron-only" });
    const result = await refreshSeiSaadiyatOfficialInventory({
      trigger: "scheduled",
      triggeredBy: `cron:${caller.taskUid}`,
      monitorTaskUid: caller.taskUid,
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    const e = err as Error;
    return res.status(500).json({
      error: e?.message ?? String(err),
      stack: e?.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}

/** Hourly official Yas Riva Reserve price monitor. It pauses after a valid price release. */
export async function yasRivaReservePriceMonitorScheduledHandler(req: Request, res: Response) {
  try {
    const caller = await sdk.authenticateRequest(req);
    if (!caller.isCron || !caller.taskUid) return res.status(403).json({ error: "cron-only" });
    const result = await monitorYasRivaReserveOfficialPricing({
      trigger: "scheduled",
      triggeredBy: `cron:${caller.taskUid}`,
      monitorTaskUid: caller.taskUid,
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    const e = err as Error;
    return res.status(500).json({
      error: e?.message ?? String(err),
      stack: e?.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}
