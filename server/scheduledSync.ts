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
    const [ghadeer, projectDiscovery] = await Promise.allSettled([
      refreshAlGhadeerOfficialInventory({ trigger: "scheduled", triggeredBy: trigger }),
      discoverAndImportOfficialAldarProjects({ trigger: "scheduled", triggeredBy: trigger }),
    ]);
    if (ghadeer.status === "rejected" && projectDiscovery.status === "rejected") {
      throw new Error(`Al Ghadeer refresh failed: ${String(ghadeer.reason)}; official project discovery failed: ${String(projectDiscovery.reason)}`);
    }
    const ghadeerResult = ghadeer.status === "fulfilled" ? ghadeer.value : null;
    const discoveryResult = projectDiscovery.status === "fulfilled" ? projectDiscovery.value : null;
    const counts = ghadeerResult?.counts ?? {
      unitsScanned: 0,
      newUnits: 0,
      soldUnits: 0,
      statusChanges: 0,
      sourceStatusChanges: 0,
      priceChanges: 0,
      removedUnits: 0,
    };
    const rollups = ghadeerResult?.rollups ?? [];
    const newProjects = [...(ghadeerResult?.newProjects ?? []), ...(discoveryResult?.importedProjects ?? [])];
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
          `Source: official World of Aldar directory plus complete Al Ghadeer capture${ghadeerResult ? ` dated ${ghadeerResult.captureDate}` : " (Ghadeer source refresh failed; directory check continued)"}. Raw explorer labels are not NAS availability.`,
        ].join("\n"),
      });
    }

    return res.json({
      ok: true,
      runId: ghadeerResult?.runId ?? null,
      counts,
      summary,
      topProjects: rollups.slice(0, 10),
      newProjects,
      projectDiscovery: discoveryResult ?? { error: String(projectDiscovery.status === "rejected" ? projectDiscovery.reason : "unknown") },
      sourceErrors: {
        alGhadeer: ghadeer.status === "rejected" ? String(ghadeer.reason) : null,
        projectDiscovery: projectDiscovery.status === "rejected" ? String(projectDiscovery.reason) : null,
      },
      notificationSent,
      snapshotSource: "official World of Aldar directory plus World of Aldar Al Ghadeer capture",
      captureDate: ghadeerResult?.captureDate ?? null,
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
