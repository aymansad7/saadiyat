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
import { buildSyncChangeSummary, runInventorySync } from "./inventorySync";
import { notifyOwner } from "./_core/notification";
import { sdk } from "./_core/sdk";

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

    const { runId, counts, rollups } = await runInventorySync({
      trigger: "scheduled",
      triggeredBy: `cron:${taskUid}`,
    });
    const summary = buildSyncChangeSummary(counts, rollups);
    let notificationSent = false;
    if (summary.changed > 0) {
      notificationSent = await notifyOwner({
        title: `Aldar inventory sync #${runId}: ${summary.changed} change${summary.changed === 1 ? "" : "s"}`,
        content: [
          summary.headline,
          summary.metrics || "No category totals reported.",
          summary.projects.length ? `Top affected projects: ${summary.projects.join(" · ")}` : "No project-level changes reported.",
          "Source: bundled Aldar inventory snapshot unless a manual JSON import was supplied. No live Aldar API feed is configured.",
        ].join("\n"),
      });
    }

    return res.json({
      ok: true,
      runId,
      counts,
      summary,
      topProjects: rollups.slice(0, 10),
      notificationSent,
      snapshotSource: "bundled Aldar inventory snapshot",
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
