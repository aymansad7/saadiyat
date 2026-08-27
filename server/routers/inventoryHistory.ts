/**
 * Inventory history router — surfaces the per-unit timeline + change-summary
 * data produced by the sync engine, and lets admins trigger a sync / import a
 * fresh Aldar JSON dump manually.
 *
 * Procedures:
 *   timeline(unitName)        public — events for one unit (used on unit cards)
 *   latestRun()               public — headline "last updated / what changed"
 *   runs(limit)               admin  — sync-run history
 *   runDetail(runId)          admin  — all events + parsed rollups for a run
 *   syncNow()                 admin  — run a sync against the on-disk datasets
 *   importDataset(...)        admin  — diff an uploaded JSON without writing disk
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getLatestRun,
  getUnitTimeline,
  buildSyncChangeSummary,
  listCurrentSaleInventory,
  listEventsForRun,
  listRuns,
  runInventorySync,
} from "../inventorySync";

/** Loose schema for an uploaded Aldar dataset (projects → buildings → units). */
const rawDatasetSchema = z
  .object({
    projects: z.array(z.any()),
  })
  .passthrough();

export const inventoryHistoryRouter = router({
  /** Timeline for a single Aldar unit. Public so it can render on unit pages. */
  timeline: publicProcedure
    .input(z.object({ unitName: z.string().min(1).max(191) }))
    .query(async ({ input }) => {
      const events = await getUnitTimeline(input.unitName);
      return { unitName: input.unitName, events };
    }),

  /** Headline of the most recent sync (counts + parsed per-project rollups). */
  latestRun: publicProcedure.query(async () => {
    const run = await getLatestRun();
    if (!run) return null;
    let rollups: unknown[] = [];
    try {
      rollups = run.summaryJson ? JSON.parse(run.summaryJson) : [];
    } catch {
      rollups = [];
    }
    return { run, rollups };
  }),

  /** Current purchasable Aldar units, with exact internal detail links. */
  currentSaleInventory: adminProcedure.query(async () => {
    return listCurrentSaleInventory();
  }),

  /** Sync-run history for the admin monitoring page. */
  runs: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }).optional())
    .query(async ({ input }) => {
      return listRuns(input?.limit ?? 30);
    }),

  /** Full detail for one run: events + parsed rollups. */
  runDetail: adminProcedure
    .input(z.object({ runId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const events = await listEventsForRun(input.runId);
      return { events };
    }),

  /** Manually run a sync against the datasets currently on disk. */
  syncNow: adminProcedure.mutation(async ({ ctx }) => {
    const who = ctx.user?.email || ctx.user?.name || "admin";
    const { runId, counts, rollups } = await runInventorySync({
      trigger: "manual",
      triggeredBy: who,
    });
    return { runId, counts, rollups, summary: buildSyncChangeSummary(counts, rollups) };
  }),

  /**
   * Import a fresh Aldar JSON dump and diff it against the last snapshot.
   * The uploaded JSON is diffed in-memory; we do NOT overwrite the on-disk
   * files (those remain the build-time baseline). Pass either/both datasets.
   */
  importDataset: adminProcedure
    .input(
      z.object({
        saadiyat: rawDatasetSchema.optional(),
        other: rawDatasetSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.saadiyat && !input.other) {
        throw new Error("Provide at least one dataset (saadiyat or other).");
      }
      const who = ctx.user?.email || ctx.user?.name || "admin";
      const { runId, counts, rollups } = await runInventorySync({
        trigger: "manual",
        triggeredBy: who,
        datasets: {
          saadiyat: input.saadiyat as any,
          other: input.other as any,
        },
      });
      return { runId, counts, rollups, summary: buildSyncChangeSummary(counts, rollups) };
    }),
});
