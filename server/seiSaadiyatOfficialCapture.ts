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
/** Latest independently verified full World of Aldar coverage before temporary page variants began appearing. */
const MINIMUM_VERIFIED_SEI_UNIT_COUNT = 948;

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

type SeiBuilding = Record<string, unknown> & { slug?: string; name?: string; units?: SeiUnit[] };

export type SeiOfficialPriceProbe = {
  captureDate: string;
  sourceUnitCount: number;
  screenedUnitCount: number;
  publishedPrices: Array<{ unitName: string; priceAed: number }>;
  files: Array<{ filename: string; bytes: Buffer; mimeType: string }>;
};

export type SeiOfficialFullPriceCapture = SeiOfficialPriceProbe & {
  detailResponseCount: number;
  detailFailureCount: number;
  /** True only when the live page preserves the previously verified coverage. */
  hasCompleteSourceCoverage: boolean;
};

/** A partial page can safely update source labels for units it still names. */
export type SeiOfficialSourceStatusCapture = {
  captureDate: string;
  sourceUnitCount: number;
  statuses: Array<{ unitName: string; sourceStatus: string }>;
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

export function parseSeiUnitDetailPayload(input: { unitName: string; locationId: string }, payload: unknown): OfficialUnitDetail {
  const detail = (payload as { data?: { unitDetail?: Record<string, unknown> } } | null)?.data?.unitDetail;
  // Aldar currently returns HTTP 200 plus a "No unit details found" message for
  // certain published location IDs. It is not a price release and must not stop
  // the whole scheduled price probe.
  if (!detail) {
    return { unitName: input.unitName, locationId: input.locationId, status: null, sellingPrice: null, reservationAmount: null };
  }
  if (text(detail.Name) !== input.unitName) throw new Error(`Sei Saadiyat ${input.unitName}: unit-detail identity mismatch.`);
  return {
    unitName: input.unitName,
    locationId: input.locationId,
    status: text(detail.Status__c),
    sellingPrice: publishedPriceFromSeiDetail(payload),
    reservationAmount: numberOrNull(detail.ReservationAmount__c),
  };
}

function validSeiCode(value: unknown): value is string {
  return typeof value === "string" && /^SeiSaadiyat-T[1-6]-(?:\d{2}|G)-\d{2}$/i.test(value);
}

function sourceBuildingNumber(value: unknown) {
  return typeof value === "string" ? /^SeiSaadiyat-T([1-6])-/.exec(value)?.[1] ?? null : null;
}

/** Never let a temporary abbreviated World of Aldar page shrink a persisted Sei inventory. */
export function assertSeiSourceCoverage(sourceUnitCount: number, storedUnitCount: number) {
  const minimumExpected = Math.max(MINIMUM_VERIFIED_SEI_UNIT_COUNT, storedUnitCount);
  if (sourceUnitCount < minimumExpected) {
    throw new Error(`Sei Saadiyat: official source count ${sourceUnitCount} is lower than verified coverage ${minimumExpected}.`);
  }
}

function sourceUnitAsBaselineUnit(source: SourceUnit, captureDate: string): SeiUnit {
  const unitName = text(source.unitNumber);
  if (!validSeiCode(unitName)) throw new Error("Sei Saadiyat: source contains an invalid unit code.");
  const fallbackPrice = numberOrNull(source.price);
  return {
    unit_name: unitName,
    aldar_link: null,
    unit_type: text(source.unitType),
    unit_category: text(source.unitCategory),
    unit_model: text(source.propertyName) ?? text(source.unitModel),
    bedrooms: numberOrNull(source.bedroomCount) == null ? null : String(numberOrNull(source.bedroomCount)),
    total_rooms: text(source.propertyName),
    price_aed: isPublishedSeiUnitPrice(fallbackPrice) ? fallbackPrice : null,
    plot_area_sqm: numberOrNull(source.plotArea),
    saleable_area_sqm: numberOrNull(source.saleableArea),
    total_area_sqm: numberOrNull(source.suiteArea) ?? numberOrNull(source.saleableArea),
    balcony_area_sqm: numberOrNull(source.balconyArea),
    payment_plans: text(source.paymentPlan),
    source_location_id: text(source.locationId),
    source_unit_status: text(source.unitStatus) ?? text(source.status),
    source_captured_at: captureDate,
    source_route: new URL(SEI_ROUTE).pathname,
    project_field: "Captured from the official Sei Saadiyat World of Aldar release. AED 1, zero, and blank values are not stored as prices.",
  };
}

/**
 * Reads exact raw World of Aldar source labels without treating a temporarily
 * partial page as an inventory replacement. This can never remove a unit.
 */
export async function captureSeiSaadiyatOfficialSourceStatusPatch(fetchImpl: typeof fetch = fetch): Promise<SeiOfficialSourceStatusCapture> {
  const captureDate = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await Promise.race([
      fetchImpl(SEI_ROUTE, {
        headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
        signal: controller.signal,
      }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Sei Saadiyat official source timed out after 20 seconds.")), 20_500)),
    ]);
    if (!response.ok) throw new Error(`Sei Saadiyat: World of Aldar returned HTTP ${response.status}.`);
    const html = await response.text();
    const sourceUnits = extractOfficialWorldAldarUnits(html, SEI_PREFIX) as SourceUnit[];
    if (!sourceUnits.length) throw new Error("Sei Saadiyat: official project page returned no unit records.");
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");
    const statuses = sourceUnits.map(unit => {
      const unitName = text(unit.unitNumber);
      const sourceStatus = text(unit.unitStatus) ?? text(unit.status);
      if (!unitName || !sourceStatus) throw new Error(`Sei Saadiyat: ${unitName ?? "unknown unit"} omitted an official source state.`);
      return { unitName, sourceStatus };
    });
    return {
      captureDate,
      sourceUnitCount: statuses.length,
      statuses,
      files: [
        { filename: `sei-saadiyat-source-status-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
        { filename: `sei-saadiyat-source-status-${captureDate}.json`, bytes: Buffer.from(JSON.stringify({ sourceUnitCount: statuses.length, statuses })), mimeType: "application/json" },
      ],
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Adds source-only Sei units to their exact existing building without treating stored units as removed. */
export function mergeOfficialSeiSourceUnits(project: Record<string, unknown>, sourceUnits: SourceUnit[], captureDate: string) {
  const buildings = (project.buildings as SeiBuilding[] | undefined) ?? [];
  const knownUnitNames = new Set(buildings.flatMap(building => (building.units ?? []).map(unit => unit.unit_name).filter((value): value is string => Boolean(value))));
  let added = 0;
  for (const source of sourceUnits) {
    const unitName = text(source.unitNumber);
    if (!unitName || knownUnitNames.has(unitName)) continue;
    const buildingNumber = sourceBuildingNumber(unitName);
    const building = buildings.find(item => String(item.slug) === `sei-saadiyat-building-${buildingNumber}`);
    if (!building) throw new Error(`Sei Saadiyat: no stored building matches official source unit ${unitName}.`);
    const units = building.units ?? [];
    units.push(sourceUnitAsBaselineUnit(source, captureDate));
    building.units = units;
    building.unit_count = units.length;
    knownUnitNames.add(unitName);
    added += 1;
  }
  project.unit_count = buildings.reduce((total, building) => total + (building.units?.length ?? 0), 0);
  return added;
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
    return parseSeiUnitDetailPayload({ unitName, locationId }, payload);
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

/** A transient failure in one official detail endpoint must not discard valid prices from other sampled units. */
export function fulfilledSeiUnitDetails(results: PromiseSettledResult<OfficialUnitDetail>[]): OfficialUnitDetail[] {
  return results.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
}

/**
 * Merges direct project-page prices with unit-detail responses. Detail prices
 * take precedence when both are valid because they are unit-specific.
 */
export function collectPublishedSeiPrices(sourceUnits: SourceUnit[], details: OfficialUnitDetail[]) {
  const prices = new Map<string, number>();
  for (const source of sourceUnits) {
    const unitName = text(source.unitNumber);
    const price = numberOrNull(source.price);
    if (unitName && isPublishedSeiUnitPrice(price)) prices.set(unitName, price);
  }
  for (const detail of details) {
    if (isPublishedSeiUnitPrice(detail.sellingPrice)) prices.set(detail.unitName, detail.sellingPrice);
  }
  return Array.from(prices, ([unitName, priceAed]) => ({ unitName, priceAed })).sort((a, b) => a.unitName.localeCompare(b.unitName));
}

/**
 * Full, price-only capture for an owner-requested refresh. A temporary World
 * of Aldar page can list fewer than the persisted 948 units; this capture may
 * update valid prices for the units it does list, but it never publishes a
 * replacement snapshot and therefore cannot remove unseen units or change
 * their status. Any failed detail call is recorded as coverage, not guessed.
 */
export async function captureSeiSaadiyatOfficialFullPricePatch(fetchImpl: typeof fetch = fetch): Promise<SeiOfficialFullPriceCapture> {
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
    if (!sourceUnits.length) throw new Error("Sei Saadiyat: official project page returned no unit records.");
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");

    const detailResults: PromiseSettledResult<OfficialUnitDetail>[] = [];
    for (let start = 0; start < sourceUnits.length; start += DETAIL_CONCURRENCY) {
      detailResults.push(...await Promise.allSettled(sourceUnits.slice(start, start + DETAIL_CONCURRENCY).map(unit => fetchOfficialSeiUnitDetail(unit, fetchImpl))));
    }
    const details = fulfilledSeiUnitDetails(detailResults);
    const publishedPrices = collectPublishedSeiPrices(sourceUnits, details);
    return {
      captureDate,
      sourceUnitCount: sourceUnits.length,
      screenedUnitCount: sourceUnits.length,
      publishedPrices,
      detailResponseCount: details.length,
      detailFailureCount: detailResults.length - details.length,
      hasCompleteSourceCoverage: sourceUnits.length >= MINIMUM_VERIFIED_SEI_UNIT_COUNT,
      files: [
        { filename: `sei-saadiyat-full-price-page-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
        {
          filename: `sei-saadiyat-full-price-capture-${captureDate}.json`,
          bytes: Buffer.from(JSON.stringify({
            sourceUnitCount: sourceUnits.length,
            detailResponseCount: details.length,
            detailFailureCount: detailResults.length - details.length,
            hasCompleteSourceCoverage: sourceUnits.length >= MINIMUM_VERIFIED_SEI_UNIT_COUNT,
            publishedPrices,
          })),
          mimeType: "application/json",
        },
      ],
    };
  } finally {
    clearTimeout(timeout);
  }
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
    if (!sourceUnits.length) throw new Error("Sei Saadiyat: official project page returned no unit records.");
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");

    const directPrices = sourceUnits.flatMap(unit => {
      const price = numberOrNull(unit.price);
      const unitName = text(unit.unitNumber);
      return unitName && isPublishedSeiUnitPrice(price) ? [{ unitName, priceAed: price }] : [];
    });
    const probes = directPrices.length ? [] : selectSeiPriceProbeUnits(sourceUnits);
    const detailResults = probes.length
      ? await Promise.allSettled(probes.map(unit => fetchOfficialSeiUnitDetail(unit, fetchImpl)))
      : [];
    const details = fulfilledSeiUnitDetails(detailResults);
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

/**
 * Captures only newly published Sei unit identities and source fields. It is
 * deliberately separate from the detail-price capture, whose endpoint may be
 * unavailable before Aldar releases commercial unit details.
 */
export async function captureSeiSaadiyatOfficialSourceExpansion(fetchImpl: typeof fetch = fetch) {
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
    if (!sourceUnits.length) throw new Error("Sei Saadiyat: official project page returned no unit records.");
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");
    const baseline = readSaadiyatDataset();
    const project = baseline.projects.find(item => item.slug === SEI_PROJECT_SLUG);
    if (!project || !Array.isArray(project.buildings)) throw new Error("Sei Saadiyat is absent from the Saadiyat baseline dataset.");
    const storedUnitCount = (project.buildings as SeiBuilding[]).reduce((total, building) => total + (building.units?.length ?? 0), 0);
    assertSeiSourceCoverage(sourceUnits.length, storedUnitCount);
    const addedUnitCount = mergeOfficialSeiSourceUnits(project, sourceUnits, captureDate);
    return {
      captureDate,
      sourceUnitCount: sourceUnits.length,
      addedUnitCount,
      dataset: { projects: [project] },
      files: addedUnitCount ? [{ filename: `sei-saadiyat-source-expansion-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" }] : [],
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
    if (!sourceUnits.length) throw new Error("Sei Saadiyat: official project page returned no unit records.");
    if (new Set(sourceUnits.map(unit => unit.unitNumber)).size !== sourceUnits.length) throw new Error("Sei Saadiyat: duplicate official unit code.");

    let baseline = readSaadiyatDataset();
    const project = baseline.projects.find(item => item.slug === SEI_PROJECT_SLUG);
    if (!project || !Array.isArray(project.buildings)) throw new Error("Sei Saadiyat is absent from the Saadiyat baseline dataset.");
    const storedUnitCount = (project.buildings as SeiBuilding[]).reduce((total, building) => total + (building.units?.length ?? 0), 0);
    assertSeiSourceCoverage(sourceUnits.length, storedUnitCount);
    mergeOfficialSeiSourceUnits(project, sourceUnits, captureDate);
    const sourceByCode = new Map(sourceUnits.map(unit => [String(unit.unitNumber), unit]));
    const details = await fetchOfficialSeiUnitDetails(sourceUnits, fetchImpl);
    if (details.length !== sourceUnits.length) throw new Error("Sei Saadiyat: incomplete unit-detail capture.");
    const detailsByCode = new Map(details.map(detail => [detail.unitName, detail]));
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
