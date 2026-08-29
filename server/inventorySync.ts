/**
 * Aldar inventory snapshot + diff engine.
 *
 * Reads the two server-side datasets (Saadiyat + Other Aldar), flattens every
 * unit to a canonical record keyed by `unit_name`, compares it to the LAST known
 * state stored in `inventory_unit_state`, and records every detected change as a
 * row in `inventory_unit_events` (the per-unit timeline). The aggregate counts
 * + a per-project rollup are written onto the `inventory_sync_runs` row.
 *
 * This is intentionally source-agnostic: today the source is the bundled JSON
 * files (which can be refreshed via the admin "import" endpoint or by replacing
 * the files), but the same engine would work against a live Aldar feed if one
 * becomes available — only `loadSnapshotUnits()` would change.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  inventoryImportedProjects,
  inventorySyncRuns,
  inventoryUnitEvents,
  inventoryUnitState,
  type InsertInventoryUnitEvent,
} from "../drizzle/schema";
import { areaForProject } from "./aldarAreas";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type Dataset = "saadiyat" | "other";

/** A single unit flattened from a dataset, ready for diffing. */
export type SnapshotUnit = {
  unitName: string;
  dataset: Dataset;
  projectSlug: string;
  projectName: string | null;
  buildingSlug: string | null;
  buildingName: string | null;
  aldarLink: string | null;
  status: string | null;
  priceAed: number | null;
  bedrooms: string | null;
  unitType: string | null;
};

/* ----------------------------- data loading ----------------------------- */

type RawUnit = {
  unit_name: string | null;
  aldar_link: string | null;
  unit_type: string | null;
  bedrooms: string | number | null;
  status: string | null;
  price_aed: number | null;
};
type RawBuilding = { slug: string; name: string; units: RawUnit[] };
type RawProject = { slug: string; name: string; buildings: RawBuilding[] };
type RawDataset = { projects: RawProject[] };

export type DetectedInventoryProject = {
  dataset: Dataset;
  projectSlug: string;
  projectName: string;
  areaKey: string;
  unitCount: number;
  availableCount: number;
  priceMinAed: number | null;
  priceMaxAed: number | null;
};

function readJsonFromCandidates(file: string): string {
  const candidates = [
    resolve(__dirname, "data", file),
    resolve(__dirname, "..", "data", file),
    resolve(process.cwd(), "server", "data", file),
    resolve(process.cwd(), "dist", "data", file),
    resolve(process.cwd(), "data", file),
  ];
  let lastErr: unknown = null;
  for (const p of candidates) {
    try {
      return readFileSync(p, "utf-8");
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`Inventory dataset ${file} not found: ${String(lastErr)}`);
}

function flatten(raw: RawDataset, dataset: Dataset): SnapshotUnit[] {
  const out: SnapshotUnit[] = [];
  for (const project of raw.projects || []) {
    for (const building of project.buildings || []) {
      const buildingSlug = building.slug || (
        project.slug === "the-canopies" && /^B[1-6]$/i.test(building.name || "")
          ? building.name.toLowerCase()
          : null
      );
      for (const u of building.units || []) {
        if (!u.unit_name) continue;
        out.push({
          unitName: u.unit_name,
          dataset,
          projectSlug: project.slug,
          projectName: project.name ?? null,
          buildingSlug,
          buildingName: building.name ?? null,
          aldarLink: u.aldar_link ?? null,
          status: u.status ?? null,
          priceAed: typeof u.price_aed === "number" ? Math.round(u.price_aed) : null,
          bedrooms: u.bedrooms == null ? null : String(u.bedrooms),
          unitType: u.unit_type ?? null,
        });
      }
    }
  }
  return out;
}

/**
 * Load the full current snapshot of every unit across both datasets.
 * Optionally accepts in-memory datasets (used by the manual import endpoint so
 * a freshly-uploaded JSON can be diffed without writing it to disk first).
 */
function loadSnapshotDatasets(opts?: {
  saadiyat?: RawDataset;
  other?: RawDataset;
}): { saadiyat: RawDataset; other: RawDataset } {
  const saadiyat =
    opts?.saadiyat ??
    (JSON.parse(readJsonFromCandidates("aldar_saadiyat.json")) as RawDataset);
  const other =
    opts?.other ??
    (JSON.parse(readJsonFromCandidates("aldar_other.json")) as RawDataset);
  return { saadiyat, other };
}

export function loadSnapshotUnits(opts?: {
  saadiyat?: RawDataset;
  other?: RawDataset;
}): SnapshotUnit[] {
  const { saadiyat, other } = loadSnapshotDatasets(opts);
  return [...flatten(saadiyat, "saadiyat"), ...flatten(other, "other")];
}

/** Stable source identity; Aldar unit names are not unique across projects. */
export function inventoryUnitKey(unit: Pick<SnapshotUnit, "dataset" | "projectSlug" | "unitName">): string {
  return `${unit.dataset}::${unit.projectSlug}::${unit.unitName}`;
}

function inventoryProjectKey(dataset: Dataset, projectSlug: string): string {
  return `${dataset}::${projectSlug}`;
}

function sourceProjects(datasets: { saadiyat: RawDataset; other: RawDataset }): Array<{
  dataset: Dataset;
  raw: RawProject;
  summary: DetectedInventoryProject;
}> {
  const output: Array<{ dataset: Dataset; raw: RawProject; summary: DetectedInventoryProject }> = [];
  for (const [dataset, rawDataset] of Object.entries(datasets) as Array<[Dataset, RawDataset]>) {
    for (const project of rawDataset.projects ?? []) {
      const units = flatten({ projects: [project] }, dataset);
      if (!project.slug || !project.name || units.length === 0) continue;
      const prices = units.map(unit => unit.priceAed).filter((value): value is number => value != null && value > 0);
      output.push({
        dataset,
        raw: project,
        summary: {
          dataset,
          projectSlug: project.slug,
          projectName: project.name,
          areaKey: dataset === "saadiyat" ? "saadiyat" : areaForProject(project.slug),
          unitCount: units.length,
          availableCount: units.filter(unit => isSaleAvailableStatus(unit.status)).length,
          priceMinAed: prices.length ? Math.min(...prices) : null,
          priceMaxAed: prices.length ? Math.max(...prices) : null,
        },
      });
    }
  }
  return output;
}

/** Detect only complete source projects absent from both the state and import ledgers. */
export function detectNewInventoryProjects(
  datasets: { saadiyat: RawDataset; other: RawDataset },
  knownProjectKeys: Iterable<string>,
): DetectedInventoryProject[] {
  const known = new Set(knownProjectKeys);
  return sourceProjects(datasets)
    .map(item => item.summary)
    .filter(project => !known.has(inventoryProjectKey(project.dataset, project.projectSlug)));
}

/** A scheduled owner alert is meaningful only for a recorded inventory change or new project. */
export function shouldNotifyInventoryOwner(counts: Pick<RunCounts, "newUnits" | "soldUnits" | "statusChanges" | "priceChanges" | "removedUnits">, newProjects: readonly DetectedInventoryProject[]): boolean {
  return counts.newUnits + counts.soldUnits + counts.statusChanges + counts.priceChanges + counts.removedUnits > 0 || newProjects.length > 0;
}

/* ----------------------------- status helpers ----------------------------- */

export function normStatus(status: string | null): string {
  return (status || "").trim().toLowerCase();
}

const SOLD_STATUSES = new Set(["sold"]);
const SALE_AVAILABLE_STATUSES = new Set(["available", "new"]);
/** True when a status represents a "gone / no longer purchasable" state. */
export function isSoldStatus(status: string | null): boolean {
  return SOLD_STATUSES.has(normStatus(status));
}

/**
 * Aldar labels both confirmed Available units and New-release units as
 * purchasable inventory. The original source label remains visible in the UI.
 */
export function isSaleAvailableStatus(status: string | null): boolean {
  return SALE_AVAILABLE_STATUSES.has(normStatus(status));
}

/** Build the exact internal card/detail route for a stored Aldar unit. */
export function getInventoryUnitHref(
  unit: Pick<SnapshotUnit, "dataset" | "projectSlug" | "buildingSlug" | "unitName">,
): string | null {
  if (!unit.projectSlug || !unit.buildingSlug || !unit.unitName) return null;
  const prefix = unit.dataset === "saadiyat" ? "/aldar-saadiyat" : "/aldar-other";
  return `${prefix}/${unit.projectSlug}/${unit.buildingSlug}/${encodeURIComponent(unit.unitName)}`;
}

/* ----------------------------- diff core ----------------------------- */

export type DiffEvent = {
  unitName: string;
  dataset: Dataset;
  projectSlug: string;
  projectName: string | null;
  eventType: "first_seen" | "status_change" | "price_change" | "removed" | "reappeared";
  fromStatus: string | null;
  toStatus: string | null;
  fromPriceAed: number | null;
  toPriceAed: number | null;
};

export type PrevState = {
  id?: number;
  unitName: string;
  dataset?: Dataset;
  projectSlug?: string;
  status: string | null;
  priceAed: number | null;
  isPresent: boolean;
};

/**
 * Pure diff function — given the previous state map and the new snapshot,
 * produce the list of timeline events. No DB access, fully unit-testable.
 */
export function computeDiff(
  prev: Map<string, PrevState>,
  current: SnapshotUnit[],
): DiffEvent[] {
  const events: DiffEvent[] = [];
  const seen = new Set<string>();

  for (const u of current) {
    const key = inventoryUnitKey(u);
    seen.add(key);
    const p = prev.get(key);

    if (!p) {
      // brand-new unit we have never recorded
      events.push({
        unitName: u.unitName,
        dataset: u.dataset,
        projectSlug: u.projectSlug,
        projectName: u.projectName,
        eventType: "first_seen",
        fromStatus: null,
        toStatus: u.status,
        fromPriceAed: null,
        toPriceAed: u.priceAed,
      });
      continue;
    }

    // a previously-removed unit that is back in the feed
    if (!p.isPresent) {
      events.push({
        unitName: u.unitName,
        dataset: u.dataset,
        projectSlug: u.projectSlug,
        projectName: u.projectName,
        eventType: "reappeared",
        fromStatus: p.status,
        toStatus: u.status,
        fromPriceAed: p.priceAed,
        toPriceAed: u.priceAed,
      });
    }

    // status change
    if (normStatus(p.status) !== normStatus(u.status)) {
      events.push({
        unitName: u.unitName,
        dataset: u.dataset,
        projectSlug: u.projectSlug,
        projectName: u.projectName,
        eventType: "status_change",
        fromStatus: p.status,
        toStatus: u.status,
        fromPriceAed: null,
        toPriceAed: null,
      });
    }

    // price change (only when both numbers are known and differ)
    if (
      p.priceAed != null &&
      u.priceAed != null &&
      p.priceAed !== u.priceAed
    ) {
      events.push({
        unitName: u.unitName,
        dataset: u.dataset,
        projectSlug: u.projectSlug,
        projectName: u.projectName,
        eventType: "price_change",
        fromStatus: null,
        toStatus: null,
        fromPriceAed: p.priceAed,
        toPriceAed: u.priceAed,
      });
    }
  }

  // units that were present before but are gone now
  prev.forEach((p, key) => {
    if (seen.has(key)) return;
    if (!p.isPresent) return; // already marked removed
    events.push({
      unitName: p.unitName,
      dataset: p.dataset ?? "saadiyat",
      projectSlug: p.projectSlug ?? "",
      projectName: null,
      eventType: "removed",
      fromStatus: p.status,
      toStatus: null,
      fromPriceAed: p.priceAed,
      toPriceAed: null,
    });
  });

  return events;
}

/* ----------------------------- run aggregation ----------------------------- */

export type RunCounts = {
  unitsScanned: number;
  newUnits: number;
  soldUnits: number;
  statusChanges: number;
  priceChanges: number;
  removedUnits: number;
};

export type ProjectRollup = {
  projectSlug: string;
  projectName: string | null;
  dataset: Dataset;
  newUnits: number;
  sold: number;
  statusChanges: number;
  priceChanges: number;
  removed: number;
  examples: string[]; // short human strings, capped
};

/** Human-readable, source-safe summary for the admin desk and scheduled alert. */
export function buildSyncChangeSummary(
  counts: Pick<RunCounts, "unitsScanned" | "newUnits" | "soldUnits" | "statusChanges" | "priceChanges" | "removedUnits">,
  rollups: ProjectRollup[],
) {
  const changed = counts.newUnits + counts.soldUnits + counts.statusChanges + counts.priceChanges + counts.removedUnits;
  const headline = changed === 0
    ? `No changes detected across ${counts.unitsScanned.toLocaleString()} Aldar inventory records.`
    : `${changed.toLocaleString()} change${changed === 1 ? "" : "s"} across ${counts.unitsScanned.toLocaleString()} Aldar inventory records.`;
  const metrics = [
    counts.newUnits ? `${counts.newUnits} new` : null,
    counts.soldUnits ? `${counts.soldUnits} sold` : null,
    counts.statusChanges ? `${counts.statusChanges} status` : null,
    counts.priceChanges ? `${counts.priceChanges} price` : null,
    counts.removedUnits ? `${counts.removedUnits} removed` : null,
  ].filter(Boolean).join(" · ");
  const projects = rollups.slice(0, 5).map(row => {
    const activity = [
      row.newUnits ? `${row.newUnits} new` : null,
      row.sold ? `${row.sold} sold` : null,
      row.statusChanges ? `${row.statusChanges} status` : null,
      row.priceChanges ? `${row.priceChanges} price` : null,
      row.removed ? `${row.removed} removed` : null,
    ].filter(Boolean).join(", ");
    return activity ? `${row.projectName ?? row.projectSlug}: ${activity}` : null;
  }).filter((project): project is string => Boolean(project));
  return { changed, headline, metrics, projects };
}

export function summarize(events: DiffEvent[]): {
  counts: RunCounts;
  rollups: ProjectRollup[];
} {
  const counts: RunCounts = {
    unitsScanned: 0,
    newUnits: 0,
    soldUnits: 0,
    statusChanges: 0,
    priceChanges: 0,
    removedUnits: 0,
  };
  const byProject = new Map<string, ProjectRollup>();
  const keyOf = (e: DiffEvent) => `${e.dataset}::${e.projectSlug}`;
  const ensure = (e: DiffEvent): ProjectRollup => {
    const k = keyOf(e);
    let r = byProject.get(k);
    if (!r) {
      r = {
        projectSlug: e.projectSlug,
        projectName: e.projectName,
        dataset: e.dataset,
        newUnits: 0,
        sold: 0,
        statusChanges: 0,
        priceChanges: 0,
        removed: 0,
        examples: [],
      };
      byProject.set(k, r);
    }
    return r;
  };

  for (const e of events) {
    const r = ensure(e);
    switch (e.eventType) {
      case "first_seen":
        counts.newUnits += 1;
        r.newUnits += 1;
        if (r.examples.length < 5)
          r.examples.push(`new: ${e.unitName} (${e.toStatus ?? "?"})`);
        break;
      case "reappeared":
        // treat as a status note; not double-counted as new
        if (r.examples.length < 5) r.examples.push(`back: ${e.unitName}`);
        break;
      case "status_change":
        counts.statusChanges += 1;
        r.statusChanges += 1;
        if (isSoldStatus(e.toStatus)) {
          counts.soldUnits += 1;
          r.sold += 1;
          if (r.examples.length < 5)
            r.examples.push(`SOLD: ${e.unitName}`);
        } else if (r.examples.length < 5) {
          r.examples.push(`${e.unitName}: ${e.fromStatus ?? "?"}→${e.toStatus ?? "?"}`);
        }
        break;
      case "price_change":
        counts.priceChanges += 1;
        r.priceChanges += 1;
        if (r.examples.length < 5)
          r.examples.push(
            `price: ${e.unitName} ${fmtAed(e.fromPriceAed)}→${fmtAed(e.toPriceAed)}`,
          );
        break;
      case "removed":
        counts.removedUnits += 1;
        r.removed += 1;
        if (r.examples.length < 5) r.examples.push(`removed: ${e.unitName}`);
        break;
    }
  }

  const rollups = Array.from(byProject.values()).sort(
    (a, b) =>
      b.sold + b.newUnits + b.statusChanges + b.priceChanges + b.removed -
      (a.sold + a.newUnits + a.statusChanges + a.priceChanges + a.removed),
  );
  return { counts, rollups };
}

function fmtAed(n: number | null): string {
  if (n == null) return "?";
  return new Intl.NumberFormat("en-US").format(n);
}

/* ----------------------------- persistence ----------------------------- */

/**
 * Execute a full sync: load current snapshot, diff against DB state, persist
 * events + updated state, and write the run row. Returns the run summary.
 */
export async function runInventorySync(opts: {
  trigger: "scheduled" | "manual" | "seed";
  triggeredBy?: string;
  datasets?: { saadiyat?: RawDataset; other?: RawDataset };
}): Promise<{
  runId: number;
  counts: RunCounts;
  rollups: ProjectRollup[];
  newProjects: DetectedInventoryProject[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // open the run row
  await db.insert(inventorySyncRuns).values({
    trigger: opts.trigger,
    status: "running",
    triggeredBy: opts.triggeredBy ?? (opts.trigger === "scheduled" ? "cron" : "system"),
  });
  const [run] = await db
    .select()
    .from(inventorySyncRuns)
    .orderBy(desc(inventorySyncRuns.id))
    .limit(1);
  const runId = run.id;

  try {
    const datasets = loadSnapshotDatasets(opts.datasets);
    const current = [...flatten(datasets.saadiyat, "saadiyat"), ...flatten(datasets.other, "other")];

    // load previous state
    const prevRows = await db.select().from(inventoryUnitState);
    const prev = new Map<string, PrevState>();
    const prevMeta = new Map<string, { dataset: Dataset; projectSlug: string; projectName: string | null }>();
    for (const r of prevRows) {
      const key = inventoryUnitKey(r);
      prev.set(key, {
        id: r.id,
        unitName: r.unitName,
        dataset: r.dataset,
        projectSlug: r.projectSlug,
        status: r.status,
        priceAed: r.priceAed,
        isPresent: r.isPresent,
      });
      prevMeta.set(key, {
        dataset: r.dataset,
        projectSlug: r.projectSlug,
        projectName: r.projectName,
      });
    }

    const knownProjectKeys = new Set(prevRows.map(row => inventoryProjectKey(row.dataset, row.projectSlug)));
    const priorImportedProjects = await db
      .select({ dataset: inventoryImportedProjects.dataset, projectSlug: inventoryImportedProjects.projectSlug })
      .from(inventoryImportedProjects);
    for (const row of priorImportedProjects) knownProjectKeys.add(inventoryProjectKey(row.dataset, row.projectSlug));
    const incomingProjects = sourceProjects(datasets);
    const newProjects = detectNewInventoryProjects(datasets, knownProjectKeys);

    const events = computeDiff(prev, current);

    // backfill dataset/project for "removed" events from stored metadata
    for (const e of events) {
      if (e.eventType === "removed") {
        const m = prevMeta.get(inventoryUnitKey(e));
        if (m) {
          e.dataset = m.dataset;
          e.projectSlug = m.projectSlug;
          e.projectName = m.projectName;
        }
      }
    }

    // persist events in batches
    if (events.length > 0) {
      const rows: InsertInventoryUnitEvent[] = events.map(e => ({
        unitName: e.unitName,
        dataset: e.dataset,
        projectSlug: e.projectSlug,
        projectName: e.projectName,
        eventType: e.eventType,
        fromStatus: e.fromStatus,
        toStatus: e.toStatus,
        fromPriceAed: e.fromPriceAed,
        toPriceAed: e.toPriceAed,
        runId,
      }));
      for (let i = 0; i < rows.length; i += 500) {
        await db.insert(inventoryUnitEvents).values(rows.slice(i, i + 500));
      }
    }

    // upsert current state for every present unit
    const now = new Date();
    for (let i = 0; i < current.length; i += 500) {
      const batch = current.slice(i, i + 500);
      await db
        .insert(inventoryUnitState)
        .values(
          batch.map(u => ({
            unitName: u.unitName,
            dataset: u.dataset,
            projectSlug: u.projectSlug,
            projectName: u.projectName,
            buildingSlug: u.buildingSlug,
            buildingName: u.buildingName,
            aldarLink: u.aldarLink,
            status: u.status,
            priceAed: u.priceAed,
            bedrooms: u.bedrooms,
            unitType: u.unitType,
            isPresent: true,
            firstSeenRunId: runId,
            lastSeenRunId: runId,
            lastSeenAt: now,
          })),
        )
        .onDuplicateKeyUpdate({
          set: {
            dataset: sqlValues("dataset"),
            projectSlug: sqlValues("projectSlug"),
            projectName: sqlValues("projectName"),
            buildingSlug: sqlValues("buildingSlug"),
            buildingName: sqlValues("buildingName"),
            aldarLink: sqlValues("aldarLink"),
            status: sqlValues("status"),
            priceAed: sqlValues("priceAed"),
            bedrooms: sqlValues("bedrooms"),
            unitType: sqlValues("unitType"),
            isPresent: sqlValues("isPresent"),
            lastSeenRunId: sqlValues("lastSeenRunId"),
            lastSeenAt: sqlValues("lastSeenAt"),
          },
        });
    }

    // Preserve every complete official source project so it can be rendered as
    // a real project/unit record rather than an inferred card.
    for (const { dataset, raw, summary } of incomingProjects) {
        const firstDetected = newProjects.some(project =>
          project.dataset === dataset && project.projectSlug === summary.projectSlug,
        );
        await db
          .insert(inventoryImportedProjects)
          .values({
            dataset,
            projectSlug: summary.projectSlug,
            projectName: summary.projectName,
            areaKey: summary.areaKey,
            sourceJson: JSON.stringify(raw),
            unitCount: summary.unitCount,
            availableCount: summary.availableCount,
            firstDetectedRunId: firstDetected ? runId : null,
            lastImportedRunId: runId,
            importedBy: opts.triggeredBy ?? "system",
          })
          .onDuplicateKeyUpdate({
            set: {
              projectName: summary.projectName,
              areaKey: summary.areaKey,
              sourceJson: JSON.stringify(raw),
              unitCount: summary.unitCount,
              availableCount: summary.availableCount,
              lastImportedRunId: runId,
              importedBy: opts.triggeredBy ?? "system",
            },
          });
    }

    // mark removed units as not present
    const removedIds = events
      .filter(e => e.eventType === "removed")
      .map(event => prev.get(inventoryUnitKey(event))?.id)
      .filter((id): id is number => typeof id === "number");
    for (let i = 0; i < removedIds.length; i += 500) {
      const batch = removedIds.slice(i, i + 500);
      if (batch.length === 0) continue;
      await db
        .update(inventoryUnitState)
        .set({ isPresent: false, lastSeenRunId: runId })
        .where(inArray(inventoryUnitState.id, batch));
    }

    const { counts, rollups } = summarize(events);
    counts.unitsScanned = current.length;

    await db
      .update(inventorySyncRuns)
      .set({
        status: "success",
        unitsScanned: counts.unitsScanned,
        newUnits: counts.newUnits,
        soldUnits: counts.soldUnits,
        statusChanges: counts.statusChanges,
        priceChanges: counts.priceChanges,
        removedUnits: counts.removedUnits,
        summaryJson: JSON.stringify(rollups).slice(0, 60000),
        newProjectsJson: JSON.stringify(newProjects).slice(0, 60000),
        finishedAt: new Date(),
      })
      .where(eq(inventorySyncRuns.id, runId));

    return { runId, counts, rollups, newProjects };
  } catch (err) {
    await db
      .update(inventorySyncRuns)
      .set({
        status: "error",
        errorMessage: String((err as Error)?.message ?? err).slice(0, 2000),
        finishedAt: new Date(),
      })
      .where(eq(inventorySyncRuns.id, runId));
    throw err;
  }
}

/**
 * `VALUES(col)` helper for MySQL ON DUPLICATE KEY UPDATE with drizzle.
 */
function sqlValues(col: string) {
  return sql.raw(`VALUES(\`${col}\`)`);
}

/* ----------------------------- read helpers ----------------------------- */

/** Timeline events for one unit, newest first. */
export async function getUnitTimeline(unitName: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inventoryUnitEvents)
    .where(eq(inventoryUnitEvents.unitName, unitName))
    .orderBy(desc(inventoryUnitEvents.createdAt), desc(inventoryUnitEvents.id));
}

/** Latest sync run (any status). */
export async function getLatestRun() {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(inventorySyncRuns)
    .orderBy(desc(inventorySyncRuns.id))
    .limit(1);
  return row ?? null;
}

/** Recent successful runs for the history page. */
export async function listRuns(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inventorySyncRuns)
    .orderBy(desc(inventorySyncRuns.id))
    .limit(limit);
}

/** All events detected by a specific run, newest first. */
export async function listEventsForRun(runId: number, limit = 2000) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inventoryUnitEvents)
    .where(eq(inventoryUnitEvents.runId, runId))
    .orderBy(desc(inventoryUnitEvents.id))
    .limit(limit);
}

export type InventoryEventRow = {
  id: number;
  runId: number;
  createdAt: Date;
  dataset: Dataset;
  projectSlug: string;
  projectName: string | null;
  unitName: string;
  eventType: DiffEvent["eventType"];
  fromStatus: string | null;
  toStatus: string | null;
  fromPriceAed: number | null;
  toPriceAed: number | null;
  href: string | null;
  buildingName: string | null;
  bedrooms: string | null;
  unitType: string | null;
};

type StoredInventoryEvent = Omit<InventoryEventRow, "href" | "buildingName" | "bedrooms" | "unitType">;

/**
 * Enrich an append-only historical event with an exact card route only when its
 * current snapshot record still identifies a project, building, and unit. This
 * keeps removed records visible without inventing a destination.
 */
export function decorateInventoryEvents(
  events: StoredInventoryEvent[],
  snapshot: SnapshotUnit[] = loadSnapshotUnits(),
): InventoryEventRow[] {
  const unitsByKey = new Map(
    snapshot.map(unit => [`${unit.dataset}:${unit.projectSlug}:${unit.unitName}`, unit]),
  );
  return events.map(event => {
    const unit = unitsByKey.get(`${event.dataset}:${event.projectSlug}:${event.unitName}`);
    return {
      ...event,
      href: unit ? getInventoryUnitHref(unit) : null,
      buildingName: unit?.buildingName ?? null,
      bedrooms: unit?.bedrooms ?? null,
      unitType: unit?.unitType ?? null,
    };
  });
}

/** Recent persisted per-unit changes for the daily Inventory History table. */
export async function listRecentInventoryEvents(input?: {
  limit?: number;
  projectSlug?: string;
  eventType?: DiffEvent["eventType"];
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (input?.projectSlug) conditions.push(eq(inventoryUnitEvents.projectSlug, input.projectSlug));
  if (input?.eventType) conditions.push(eq(inventoryUnitEvents.eventType, input.eventType));
  const base = db.select().from(inventoryUnitEvents);
  const rows = conditions.length > 0
    ? await base.where(and(...conditions)).orderBy(desc(inventoryUnitEvents.createdAt), desc(inventoryUnitEvents.id)).limit(input?.limit ?? 500)
    : await base.orderBy(desc(inventoryUnitEvents.createdAt), desc(inventoryUnitEvents.id)).limit(input?.limit ?? 500);
  const storedUnits = await listStoredSnapshotUnits();
  return decorateInventoryEvents(rows, storedUnits.length ? storedUnits : loadSnapshotUnits());
}

/**
 * Current purchasable Aldar units for the admin sales desk.
 * The database state is preferred because a manual JSON import is persisted
 * there. A bundled-data fallback keeps the first-run experience useful while
 * explicitly reporting that it has not yet been synced.
 */
export function toCurrentSaleInventoryUnits(rows: SnapshotUnit[]) {
  return rows
    .filter(unit => isSaleAvailableStatus(unit.status))
    .map(unit => ({
      dataset: unit.dataset,
      projectSlug: unit.projectSlug,
      projectName: unit.projectName,
      buildingSlug: unit.buildingSlug,
      buildingName: unit.buildingName,
      unitName: unit.unitName,
      aldarLink: unit.aldarLink,
      status: unit.status,
      priceAed: unit.priceAed,
      bedrooms: unit.bedrooms,
      unitType: unit.unitType,
      lastSeenAt: null,
      href: getInventoryUnitHref(unit),
    }))
    .sort((a, b) =>
      `${a.projectName ?? a.projectSlug}|${a.buildingName ?? ""}|${a.unitName}`.localeCompare(
        `${b.projectName ?? b.projectSlug}|${b.buildingName ?? ""}|${b.unitName}`,
      ),
    );
}

export async function listCurrentSaleInventory() {
  const storedUnits = await listStoredSnapshotUnits();
  if (storedUnits.length) {
    return { source: "latest-recorded-import" as const, units: toCurrentSaleInventoryUnits(storedUnits) };
  }
  return { source: "deployed-bundled-snapshot" as const, units: toCurrentSaleInventoryUnits(loadSnapshotUnits()) };
}

async function listStoredSnapshotUnits(): Promise<SnapshotUnit[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(inventoryUnitState)
    .where(eq(inventoryUnitState.isPresent, true));
  return rows.map(row => ({
    dataset: row.dataset,
    projectSlug: row.projectSlug,
    projectName: row.projectName ?? row.projectSlug,
    buildingSlug: row.buildingSlug,
    buildingName: row.buildingName,
    unitName: row.unitName,
    aldarLink: row.aldarLink,
    status: row.status,
    priceAed: row.priceAed,
    bedrooms: row.bedrooms,
    unitType: row.unitType,
  }));
}
