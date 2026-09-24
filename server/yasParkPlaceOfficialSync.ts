import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { inventoryImportedProjects } from "../drizzle/schema";
import { extractAllOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";
import { getDb } from "./db";
import { invalidateImportedAldarProjectCache } from "./importedAldarProjects";
import { applyOfficialUnitSourceStatusPatch } from "./inventorySync";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const YAS_PARK_PLACE_CONFIG = {
  dataset: "other" as const,
  projectSlug: "yas-park-place",
  projectName: "Yas Park Place",
  areaKey: "yas-island",
  route: "https://world.aldar.com/uae/abudhabi/yasparkplace",
  expectedUnitCount: 780,
} as const;

type RawWorldUnit = Record<string, unknown> & { unitNumber?: string; unitStatus?: string };
type RawProject = {
  slug: string;
  name: string;
  buildings: Array<{ units?: Array<Record<string, unknown>> }>;
  unit_count?: number;
  available_count?: number;
  [key: string]: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readOtherBaseline(): { projects: RawProject[] } {
  const candidates = [
    resolve(__dirname, "data/aldar_other.json"),
    resolve(__dirname, "../data/aldar_other.json"),
    resolve(process.cwd(), "server/data/aldar_other.json"),
    resolve(process.cwd(), "dist/data/aldar_other.json"),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as { projects: RawProject[] };
    } catch {
      // Try the next deployment-aware candidate.
    }
  }
  throw new Error("Yas Park Place baseline inventory was not found.");
}

export function selectYasParkPlaceSourceUnits(units: RawWorldUnit[]) {
  const selected = units.filter(unit => /^YasParkPlace-B\d+-(?:\d{2}|G)-\d{2}$/i.test(text(unit.unitNumber) ?? ""));
  const exact = new Map<string, string>();
  for (const unit of selected) {
    const unitName = text(unit.unitNumber);
    const sourceStatus = text(unit.unitStatus);
    if (unitName && sourceStatus) exact.set(unitName, sourceStatus);
  }
  return Array.from(exact, ([unitName, sourceStatus]) => ({ unitName, sourceStatus }));
}

export async function captureYasParkPlaceOfficialSourceStatus(fetchImpl: typeof fetch = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetchImpl(YAS_PARK_PLACE_CONFIG.route, {
      headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`World of Aldar returned HTTP ${response.status} for Yas Park Place.`);
    const html = await response.text();
    const sourceUnits = selectYasParkPlaceSourceUnits(extractAllOfficialWorldAldarUnits(html) as RawWorldUnit[]);
    if (sourceUnits.length !== YAS_PARK_PLACE_CONFIG.expectedUnitCount) {
      throw new Error(`Yas Park Place source coverage is ${sourceUnits.length}; expected ${YAS_PARK_PLACE_CONFIG.expectedUnitCount}.`);
    }
    return {
      captureDate: new Date().toISOString(),
      sourceUnits,
      sourceUnitCount: sourceUnits.length,
      evidence: Buffer.from(JSON.stringify({ route: YAS_PARK_PLACE_CONFIG.route, sourceUnits }, null, 2)),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function persistRenderedSourceState(
  statuses: readonly { unitName: string; sourceStatus: string }[],
  capturedAt: string,
  runId: number,
  importedBy: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db
    .select({ id: inventoryImportedProjects.id, sourceJson: inventoryImportedProjects.sourceJson })
    .from(inventoryImportedProjects)
    .where(and(
      eq(inventoryImportedProjects.dataset, YAS_PARK_PLACE_CONFIG.dataset),
      eq(inventoryImportedProjects.projectSlug, YAS_PARK_PLACE_CONFIG.projectSlug),
    ))
    .limit(1);

  const baseline = readOtherBaseline();
  const project = existing
    ? JSON.parse(existing.sourceJson) as RawProject
    : baseline.projects.find(item => item.slug === YAS_PARK_PLACE_CONFIG.projectSlug);
  if (!project || project.slug !== YAS_PARK_PLACE_CONFIG.projectSlug) {
    throw new Error("Yas Park Place project baseline does not match its official source identity.");
  }

  const latest = new Map(statuses.map(item => [item.unitName, item.sourceStatus]));
  let observed = 0;
  let available = 0;
  for (const building of project.buildings ?? []) {
    for (const unit of building.units ?? []) {
      const unitName = text(unit.unit_name);
      const sourceStatus = unitName ? latest.get(unitName) : null;
      if (!sourceStatus) continue;
      unit.source_unit_status = sourceStatus;
      unit.source_captured_at = capturedAt;
      unit.source_route = new URL(YAS_PARK_PLACE_CONFIG.route).pathname;
      observed += 1;
      if (sourceStatus.trim().toLowerCase() === "available") available += 1;
    }
  }
  if (observed !== YAS_PARK_PLACE_CONFIG.expectedUnitCount) {
    throw new Error(`Yas Park Place source matched ${observed}; expected ${YAS_PARK_PLACE_CONFIG.expectedUnitCount} stored units.`);
  }

  project.source_file = `World of Aldar live source status · ${capturedAt}`;
  project.unit_count = observed;
  project.available_count = available;
  await db.insert(inventoryImportedProjects).values({
    dataset: YAS_PARK_PLACE_CONFIG.dataset,
    projectSlug: YAS_PARK_PLACE_CONFIG.projectSlug,
    projectName: YAS_PARK_PLACE_CONFIG.projectName,
    areaKey: YAS_PARK_PLACE_CONFIG.areaKey,
    sourceJson: JSON.stringify(project),
    unitCount: observed,
    availableCount: available,
    firstDetectedRunId: null,
    lastImportedRunId: runId,
    importedBy,
  }).onDuplicateKeyUpdate({
    set: {
      projectName: YAS_PARK_PLACE_CONFIG.projectName,
      areaKey: YAS_PARK_PLACE_CONFIG.areaKey,
      sourceJson: JSON.stringify(project),
      unitCount: observed,
      availableCount: available,
      lastImportedRunId: runId,
      importedBy,
    },
  });
  invalidateImportedAldarProjectCache("other");
  return { observedUnitCount: observed, availableCount: available };
}

/**
 * Refreshes exact published Yas Park Place explorer states. The fixed 780-unit
 * coverage guard prevents a shortened page from being treated as a sale or removal.
 */
export async function refreshYasParkPlaceOfficialInventory(input: { trigger: "scheduled" | "manual"; triggeredBy: string }) {
  const capture = await captureYasParkPlaceOfficialSourceStatus();
  const patch = await applyOfficialUnitSourceStatusPatch({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    dataset: YAS_PARK_PLACE_CONFIG.dataset,
    projectSlug: YAS_PARK_PLACE_CONFIG.projectSlug,
    statuses: capture.sourceUnits,
    legacyStatusFallback: true,
  });
  const rendered = await persistRenderedSourceState(capture.sourceUnits, capture.captureDate, patch.runId, input.triggeredBy);
  return {
    ...patch,
    captureDate: capture.captureDate,
    sourceUnitCount: capture.sourceUnitCount,
    expectedUnitCount: YAS_PARK_PLACE_CONFIG.expectedUnitCount,
    observedUnitCount: rendered.observedUnitCount,
    availableCount: rendered.availableCount,
    evidence: capture.evidence,
  };
}
