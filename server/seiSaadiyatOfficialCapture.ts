import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEI_PROJECT_SLUG = "sei-saadiyat";
const SEI_ROUTE = "https://world.aldar.com/uae/abudhabi/seisaadiyat";
const SEI_UNIT_DETAIL_ROUTE = "https://propertyservice.world.aldar.com/api/v2/units/unit-detail";
const SEI_PREFIX = "SeiSaadiyat-";
const DETAIL_CONCURRENCY = 8;
const PRICE_PROBE_SAMPLES_PER_BUILDING = 4;

type SourceUnit = Record<string, unknown> & { unitNumber?: string; locationId?: string };
type SeiUnit = Record<string, unknown> & { unit_name?: string | null; price_aed?: number | null };
type SeiDataset = { projects: Array<Record<string, unknown>> };
type OfficialUnitDetail = {
  unitName: string;
  locationId: string;
  status: string | null;
  sellingPrice: number | null;
  reservationAmount: number | null;
};

export type SeiOfficialPriceProbe = {
  captureDate: string;
  sourceUnitCount: number;
  screenedUnitCount: number;
  publishedPrices: Array<{ unitName: string; priceAed: number }>;
  files: Array<{ filename: string; bytes: Buffer; mimeType: string }>;
};

function readSaadiyatDataset(): SeiDataset {
  const candidates = [
    resolve(__dirname, "data/aldar_saadiyat.json"),
    resolve(__dirname, "../data/aldar_saadiyat.json"),
    resolve(process.cwd(), "server/data/aldar_saadiyat.json"),
    resolve(process.cwd(), "dist/data/aldar_saadiyat.json"),
  ];
  for (const path of candidates) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as SeiDataset;
    } catch {
      // Try the next deployment-safe data location.
    }
  }
  throw new Error("Sei Saadiyat baseline dataset was not found.");
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** AED 1 is the known placeholder supplied before Sei unit prices are released. */
export function isPublishedSeiUnitPrice(value: unknown): value is number {
  const price = numberOrNull(value);
  return price != null && price > 1;
}

/** Keep a price only when Aldar unit-detail identifies it as an AED value above the known placeholder. */
export function publishedPriceFromSeiDetail(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const detail = (payload as { data?: { unitDetail?: Record<string, unknown> } }).data?.unitDetail;
  if (!detail || detail.CurrencyIsoCode !== "AED") return null;
  const price = numberOrNull(detail.SellingPrice__c);
  return isPublishedSeiUnitPrice(price) ? price : null;
}

function validSeiCode(value: unknown): value is string {
  return typeof value === "string" && /^SeiSaadiyat-T[1-6]-(?:\d{2}|G)-\d{2}$/i.test(value);
}

async function fetchOfficialSeiUnitDetail(source: SourceUnit, fetchImpl: typeof fetch): Promise<OfficialUnitDetail> {
  const unitName = text(source.unitNumber);
  const locationId = text(source.locationId);
  if (!unitName || !locationId) throw new Error("Sei Saadiyat: source unit omitted unitNumber or locationId.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const url = new URL(SEI_UNIT_DETAIL_ROUTE);
    url.searchParams.set("location_id", locationId);
    url.searchParams.set("kiosk", "false");
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Sei Saadiyat ${unitName}: unit-detail returned HTTP ${response.status}.`);
    const payload = await response.json() as { data?: { unitDetail?: Record<string, unknown> } };
    const detail = payload.data?.unitDetail;
    if (!detail || text(detail.Name) !== unitName) throw new Error(`Sei Saadiyat ${unitName}: unit-detail identity mismatch.`);
    return {
      unitName,
      locationId,
      status: text(detail.Status__c),
      sellingPrice: publishedPriceFromSeiDetail(payload),
      reservationAmount: numberOrNull(detail.ReservationAmount__c),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOfficialSeiUnitDetails(sourceUnits: SourceUnit[], fetchImpl: typeof fetch): Promise<OfficialUnitDetail[]> {
  const operations = sourceUnits.map(source => () => fetchOfficialSeiUnitDetail(source, fetchImpl));
  const details: OfficialUnitDetail[] = [];
  for (let start = 0; start < operations.length; start += DETAIL_CONCURRENCY) {
    details.push(...await Promise.all(operations.slice(start, start + DETAIL_CONCURRENCY).map(operation => operation())));
  }
  return details;
}

/**
 * Picks a representative set across all six official buildings. This is a
 * release detector, not an inventory import: it stays within Heartbeat's
 * callback window and never treats unprobed units as removed.
 */
export function selectSeiPriceProbeUnits(sourceUnits: SourceUnit[]): SourceUnit[] {
  const groups = new Map<string, SourceUnit[]>();
  for (const unit of sourceUnits) {
    const code = text(unit.unitNumber);
    const match = code ? /^SeiSaadiyat-T([1-6])-/.exec(code) : null;
    if (!match) continue;
    const group = groups.get(match[1]!) ?? [];
    group.push(unit);
    groups.set(match[1]!, group);
  }
  const selected: SourceUnit[] = [];
  for (const building of ["1", "2", "3", "4", "5", "6"]) {
    const units = groups.get(building) ?? [];
    if (!units.length) continue;
    for (let index = 0; index < PRICE_PROBE_SAMPLES_PER_BUILDING; index += 1) {
      const position = Math.round((index * (units.length - 1)) / Math.max(1, PRICE_PROBE_SAMPLES_PER_BUILDING - 1));
      const unit = units[position];
      if (unit && !selected.includes(unit)) selected.push(unit);
    }
  }
  return selected;
}

/**
 * Fast official release detector for the hourly monitor and the Sync Now UI.
 * It checks the full official project page, then representative exact unit
 * details across Buildings 1–6. AED 1, zero, and blank values remain invalid.
 */
export async function probeSeiSaadiyatOfficialPricing(fetchImpl: typeof fetch = fetch): Promise<SeiOfficialPriceProbe> {
  const captureDate = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetchImpl(SEI_ROUTE, {
      headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Sei Saadiyat: World of Aldar returned HTTP ${response.status}.`);
    const html = await response.text();
    const sourceUnits = extractOfficialWorldAldarUnits(html, SEI_PREFIX) as SourceUnit[];
    if (sourceUnits.length !== 778) throw new Error(`Sei Saadiyat: expected 778 official units, received ${sourceUnits.length}.`);
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");

    const directPrices = sourceUnits.flatMap(unit => {
      const price = numberOrNull(unit.price);
      const unitName = text(unit.unitNumber);
      return unitName && isPublishedSeiUnitPrice(price) ? [{ unitName, priceAed: price }] : [];
    });
    const probes = directPrices.length ? [] : selectSeiPriceProbeUnits(sourceUnits);
    const details = probes.length ? await Promise.all(probes.map(unit => fetchOfficialSeiUnitDetail(unit, fetchImpl))) : [];
    const detailPrices = details.flatMap(detail => detail.sellingPrice != null ? [{ unitName: detail.unitName, priceAed: detail.sellingPrice }] : []);
    const publishedPrices = [...directPrices, ...detailPrices];
    return {
      captureDate,
      sourceUnitCount: sourceUnits.length,
      screenedUnitCount: directPrices.length ? sourceUnits.length : probes.length,
      publishedPrices,
      files: publishedPrices.length
        ? [
            { filename: `sei-saadiyat-live-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
            { filename: `sei-saadiyat-price-probe-${captureDate}.json`, bytes: Buffer.from(JSON.stringify({ screenedUnitCount: probes.length, publishedPrices, details })), mimeType: "application/json" },
          ]
        : [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function captureSeiSaadiyatOfficialSnapshot(fetchImpl: typeof fetch = fetch) {
  const captureDate = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetchImpl(SEI_ROUTE, {
      headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Sei Saadiyat: World of Aldar returned HTTP ${response.status}.`);
    const html = await response.text();
    const sourceUnits = extractOfficialWorldAldarUnits(html, SEI_PREFIX) as SourceUnit[];
    if (sourceUnits.length !== 778) throw new Error(`Sei Saadiyat: expected 778 official units, received ${sourceUnits.length}.`);
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");

    const sourceByCode = new Map(sourceUnits.map(unit => [String(unit.unitNumber), unit]));
    const details = await fetchOfficialSeiUnitDetails(sourceUnits, fetchImpl);
    if (details.length !== sourceUnits.length) throw new Error("Sei Saadiyat: incomplete unit-detail capture.");
    const detailsByCode = new Map(details.map(detail => [detail.unitName, detail]));
    let baseline = readSaadiyatDataset();
    const project = baseline.projects.find(item => item.slug === SEI_PROJECT_SLUG);
    if (!project || !Array.isArray(project.buildings)) throw new Error("Sei Saadiyat is absent from the Saadiyat baseline dataset.");
    // Release the full Saadiyat baseline before the diff; only Sei is relevant.
    baseline = { projects: [] };
    const dataset: SeiDataset = { projects: [project] };

    let publishedPriceCount = 0;
    for (const building of project.buildings as Array<Record<string, unknown>>) {
      if (!Array.isArray(building.units)) continue;
      building.units = (building.units as SeiUnit[]).map(unit => {
        const unitName = unit.unit_name;
        if (!validSeiCode(unitName)) throw new Error("Sei Saadiyat: baseline contains an invalid unit code.");
        const source = sourceByCode.get(unitName);
        const detail = detailsByCode.get(unitName);
        if (!source || !detail) throw new Error(`Sei Saadiyat: official source omitted ${unitName}.`);
        const fallbackPrice = numberOrNull(source.price);
        const officialPrice = detail.sellingPrice ?? (isPublishedSeiUnitPrice(fallbackPrice) ? fallbackPrice : null);
        const priceAed = officialPrice ?? (isPublishedSeiUnitPrice(unit.price_aed) ? unit.price_aed : null);
        if (priceAed != null) publishedPriceCount += 1;
        return {
          ...unit,
          price_aed: priceAed,
          price_source: detail.sellingPrice != null ? "World of Aldar unit-detail API" : (officialPrice != null ? "World of Aldar live capture" : unit.price_source ?? null),
          price_source_captured_at: officialPrice != null ? captureDate : unit.price_source_captured_at ?? null,
          reservation_amount: detail.reservationAmount ?? unit.reservation_amount ?? null,
          // Price monitoring must never erase workbook-backed plans/promotions
          // merely because the live unit-detail endpoint omits them.
          payment_plans: unit.payment_plans ?? null,
          offer_and_promotions: unit.offer_and_promotions ?? null,
          source_location_id: detail.locationId,
          source_unit_status: detail.status ?? (text(source.unitStatus) ?? unit.source_unit_status ?? null),
          source_captured_at: captureDate,
          source_route: new URL(SEI_ROUTE).pathname,
        };
      });
    }

    return {
      captureDate,
      dataset,
      publishedPriceCount,
      files: [
        { filename: `sei-saadiyat-live-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
        { filename: `sei-saadiyat-unit-detail-${captureDate}.json`, bytes: Buffer.from(JSON.stringify(details)), mimeType: "application/json" },
      ],
    };
  } finally {
    clearTimeout(timeout);
  }
}
