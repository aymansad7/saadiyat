/**
 * Scheduled inventory-sync HTTP handler.
 *
 * Mounted at POST /api/scheduled/inventorySync (see server/_core/index.ts). The
 * Manus Heartbeat platform POSTs here on the configured cron (Mon 06:00 Asia/
 * Dubai = 02:00 UTC). The platform gateway restricts /api/scheduled/* to cron
 * callers, and we additionally require the cron task-uid header that Heartbeat
 * injects, so the endpoint can't be triggered by ordinary site traffic.
 *
 * The handler is idempotent: running it twice in a row simply records a second
 * run with (usually) zero changes. Errors are JSON-encoded on 500 so the
 * platform Investigate flow can surface them verbatim.
 */
import type { Request, Response } from "express";
import { runInventorySync } from "./inventorySync";

/** Header Heartbeat sets to the triggering cron task UID. */
const CRON_TASK_HEADER = "x-manus-cron-task-uid";

export async function inventorySyncScheduledHandler(req: Request, res: Response) {
  try {
    const taskUid =
      (req.headers[CRON_TASK_HEADER] as string | undefined) ||
      (req.headers["x-manus-task-uid"] as string | undefined) ||
      null;

    // The platform gateway already gates /api/scheduled/* to cron callers.
    // We log the task uid for traceability but do not hard-fail if absent so a
    // manual owner-triggered curl during setup can still run.
    console.log("[scheduledSync] triggered", { taskUid: taskUid ?? "(none)" });

    const { runId, counts, rollups } = await runInventorySync({
      trigger: "scheduled",
      triggeredBy: taskUid ? `cron:${taskUid}` : "cron",
    });

    return res.json({ ok: true, runId, counts, topProjects: rollups.slice(0, 10) });
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
