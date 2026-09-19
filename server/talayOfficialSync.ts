import { extractAllOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";
import { applyOfficialUnitPricePatch, applyOfficialUnitSourceStatusPatch } from "./inventorySync";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";

const TALAY_PROJECT_SLUG = "talay-at-marsa-al-saadiyat";
const TALAY_ROUTE = "https://world.aldar.com/uae/abudhabi/talay";
const EXPECTED_TALAY_PRODUCTION_UNIT_COUNT = 167;
const TALAY_UNIT_PATTERN = /^Talay-MarsaAlSaadiyat-V-\d{3}-01$/i;

type TalayRawUnit = Record<string, unknown> & { unitNumber?: string };

type TalayCapturedUnit = {
  unitName: string;
  sourceStatus: string;
  priceAed: number | null;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function publishedPrice(value: unknown): number | null {
  const price = numberOrNull(value);
  return price != null && price > 1 ? price : null;
}

/** Keeps `_TEST` records out of all tracking and fails closed on an unexpected source identity. */
export function selectTalayProductionSourceUnits(source: TalayRawUnit[]): TalayRawUnit[] {
  const testRecords = source.filter(unit => /_TEST$/i.test(text(unit.unitNumber) ?? ""));
  const production = source.filter(unit => TALAY_UNIT_PATTERN.test(text(unit.unitNumber) ?? ""));
  const invalid = source.filter(unit => !TALAY_UNIT_PATTERN.test(text(unit.unitNumber) ?? "") && !/_TEST$/i.test(text(unit.unitNumber) ?? ""));
  if (testRecords.length !== 1) throw new Error(`Talay expected one explicit _TEST source record, received ${testRecords.length}.`);
  if (invalid.length) throw new Error(`Talay source contains unexpected unit codes: ${invalid.map(unit => unit.unitNumber).join(", ")}`);
  if (production.length !== EXPECTED_TALAY_PRODUCTION_UNIT_COUNT) {
    throw new Error(`Talay source coverage is incomplete: expected ${EXPECTED_TALAY_PRODUCTION_UNIT_COUNT} production units, received ${production.length}.`);
  }
  if (new Set(production.map(unit => text(unit.unitNumber))).size !== production.length) throw new Error("Talay source returned duplicate production unit codes.");
  return production;
}

export async function captureTalayOfficialSourceState(fetchImpl: typeof fetch = fetch) {
  const captureDate = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await Promise.race([
      fetchImpl(TALAY_ROUTE, {
        headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
        signal: controller.signal,
      }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Talay official source timed out after 25 seconds.")), 25_500)),
    ]);
    if (!response.ok) throw new Error(`Talay official source returned HTTP ${response.status}.`);
    const html = await response.text();
    const production = selectTalayProductionSourceUnits(extractAllOfficialWorldAldarUnits(html) as TalayRawUnit[]);
    const units: TalayCapturedUnit[] = production.map(unit => {
      const unitName = text(unit.unitNumber);
      const sourceStatus = text(unit.unitStatus) ?? text(unit.status);
      if (!unitName || !sourceStatus) throw new Error(`Talay ${unitName ?? "unknown unit"} omitted an official source status.`);
      return { unitName, sourceStatus, priceAed: publishedPrice(unit.price) };
    });
    return {
      captureDate,
      sourceUnitCount: units.length,
      units,
      files: [
        { filename: `talay-official-source-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
        {
          filename: `talay-official-source-summary-${captureDate}.json`,
          bytes: Buffer.from(JSON.stringify({ sourceUnitCount: units.length, statuses: units.reduce<Record<string, number>>((counts, unit) => { counts[unit.sourceStatus] = (counts[unit.sourceStatus] ?? 0) + 1; return counts; }, {}), publishedPriceCount: units.filter(unit => unit.priceAed != null).length })),
          mimeType: "application/json",
        },
      ],
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function archiveTalayOfficialSourceFiles(files: Array<{ filename: string; bytes: Buffer; mimeType: string }>, captureDate: string) {
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "Talay"]);
  const saved: Array<{ filename: string; itemId: string | null }> = [];
  for (const file of files) {
    const item = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId: folderId, filename: file.filename, bytes: file.bytes, mimeType: file.mimeType });
    saved.push({ filename: file.filename, itemId: item.id ?? null });
  }
  return saved;
}

/** Daily safe Talay refresh: exact source-state and prices only; no inferred availability or removals. */
export async function refreshTalayOfficialInventory(input: { trigger: "scheduled" | "manual"; triggeredBy: string }) {
  const capture = await captureTalayOfficialSourceState();
  const sourceStatusSync = await applyOfficialUnitSourceStatusPatch({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    dataset: "saadiyat",
    projectSlug: TALAY_PROJECT_SLUG,
    statuses: capture.units.map(unit => ({ unitName: unit.unitName, sourceStatus: unit.sourceStatus })),
  });
  const publishedPrices = capture.units.flatMap(unit => unit.priceAed != null ? [{ unitName: unit.unitName, priceAed: unit.priceAed }] : []);
  const priceSync = publishedPrices.length
    ? await applyOfficialUnitPricePatch({
        trigger: input.trigger,
        triggeredBy: input.triggeredBy,
        dataset: "saadiyat",
        projectSlug: TALAY_PROJECT_SLUG,
        prices: publishedPrices,
      })
    : null;
  const archive = await archiveTalayOfficialSourceFiles(capture.files, capture.captureDate);
  return {
    captureDate: capture.captureDate,
    sourceUnitCount: capture.sourceUnitCount,
    statusRunId: sourceStatusSync.runId,
    priceRunId: priceSync?.runId ?? null,
    counts: {
      unitsScanned: sourceStatusSync.counts.unitsScanned,
      newUnits: 0,
      soldUnits: 0,
      statusChanges: 0,
      sourceStatusChanges: sourceStatusSync.counts.sourceStatusChanges,
      priceChanges: priceSync?.counts.priceChanges ?? 0,
      removedUnits: 0,
    },
    rollups: [...sourceStatusSync.rollups, ...(priceSync?.rollups ?? [])],
    sourceStatusChangeCount: sourceStatusSync.appliedUnitCount,
    publishedPriceCount: publishedPrices.length,
    priceChangeCount: priceSync?.appliedUnitCount ?? 0,
    archive,
  };
}
