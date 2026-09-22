import { extractAllOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";
import type { RawProject, RawUnit } from "./inventorySync";

export const YAS_RIVA_RESERVE_PROJECT_SLUG = "yas-riva-reserve";
export const YAS_RIVA_RESERVE_ROUTE = "https://world.aldar.com/uae/abudhabi/yasrivareserve/community";
export const YAS_RIVA_RESERVE_DETAIL_ROUTE = "https://propertyservice.world.aldar.com/api/v2/units/unit-detail";
export const EXPECTED_YAS_RIVA_RESERVE_UNIT_COUNT = 292;
const UNIT_PATTERN = /^YasRivaReserve-(IL|WF)-V-(\d{3})-01$/i;
const DETAIL_CONCURRENCY = 8;

type SourceUnit = Record<string, unknown> & {
  unitNumber?: string;
  locationId?: string;
};

type YasRivaReserveUnit = RawUnit & {
  unit_category?: string | null;
  unit_model?: string | null;
  total_rooms?: string | null;
  reservation_amount?: number | null;
  plot_area_sqm?: number | null;
  saleable_area_sqm?: number | null;
  total_area_sqm?: number | null;
  terrace_area_sqm?: number | null;
  balcony_area_sqm?: number | null;
  source_location_id?: string | null;
  source_captured_at?: string | null;
  source_route?: string | null;
  project_field?: string | null;
};

export type YasRivaReserveCapturedUnit = {
  unitName: string;
  locationId: string;
  sourceStatus: string;
  sourcePriceAed: number | null;
  raw: SourceUnit;
};

export type YasRivaReservePrice = {
  unitName: string;
  priceAed: number;
};

export type YasRivaReserveSourceCapture = {
  captureDate: string;
  sourceUnitCount: number;
  units: YasRivaReserveCapturedUnit[];
  project: RawProject;
  files: Array<{ filename: string; bytes: Buffer; mimeType: string }>;
};

export type YasRivaReservePriceProbe = {
  captureDate: string;
  sourceUnitCount: number;
  screenedUnitCount: number;
  publishedPrices: YasRivaReservePrice[];
  files: Array<{ filename: string; bytes: Buffer; mimeType: string }>;
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

/** AED 1 is an Aldar placeholder and must never be presented as a published price. */
export function isPublishedYasRivaReservePrice(value: unknown): value is number {
  const price = numberOrNull(value);
  return price != null && price > 1;
}

function sourceIdentity(value: unknown): { cluster: "Inland" | "Waterfront"; code: string } | null {
  const raw = text(value);
  const match = raw ? UNIT_PATTERN.exec(raw) : null;
  if (!match) return null;
  const prefix = match[1].toUpperCase();
  return {
    cluster: prefix === "IL" ? "Inland" : "Waterfront",
    code: `${prefix}-${match[2]}-01`,
  };
}

function unitDetailUrl(code: string) {
  return `${YAS_RIVA_RESERVE_ROUTE.replace(/\/community$/, "")}/property/${encodeURIComponent(code)}/0?unitstate=floorplan&scheme=S1&furnished=true`;
}

function rawUnitFromSource(source: SourceUnit, captureDate: string): YasRivaReserveUnit {
  const unitName = text(source.unitNumber);
  const identity = sourceIdentity(unitName);
  if (!unitName || !identity) throw new Error(`Yas Riva Reserve: unexpected official unit code ${unitName ?? "(missing)"}.`);
  const pagePrice = numberOrNull(source.price);
  const saleableArea = numberOrNull(source.saleableArea);
  return {
    unit_name: unitName,
    aldar_link: unitDetailUrl(identity.code),
    unit_type: text(source.unitType),
    unit_category: text(source.unitCategory),
    unit_model: text(source.propertyName) ?? text(source.unitModel),
    total_rooms: text(source.propertyName),
    bedrooms: numberOrNull(source.bedroomCount) == null ? null : String(numberOrNull(source.bedroomCount)),
    // The raw Aldar explorer label is intentionally kept separate from NAS resale availability.
    status: null,
    source_unit_status: text(source.unitStatus) ?? text(source.status),
    price_aed: isPublishedYasRivaReservePrice(pagePrice) ? pagePrice : null,
    reservation_amount: numberOrNull(source.reservationAmount),
    plot_area_sqm: numberOrNull(source.plotArea),
    saleable_area_sqm: saleableArea,
    total_area_sqm: numberOrNull(source.suiteArea) ?? saleableArea,
    terrace_area_sqm: numberOrNull(source.terraceArea),
    balcony_area_sqm: numberOrNull(source.balconyArea),
    source_location_id: text(source.locationId),
    source_captured_at: captureDate,
    source_route: new URL(YAS_RIVA_RESERVE_ROUTE).pathname,
    project_field: "Captured from the official Yas Riva Reserve World of Aldar release. Raw Aldar Explorer state is not NAS resale availability. AED 1, zero, and blank values are not stored as prices.",
  };
}

export function buildYasRivaReserveProject(sourceUnits: SourceUnit[], captureDate: string): RawProject & Record<string, unknown> {
  const buildings = ["Inland", "Waterfront"].map(cluster => {
    const units = sourceUnits
      .filter(unit => sourceIdentity(unit.unitNumber)?.cluster === cluster)
      .map(unit => rawUnitFromSource(unit, captureDate));
    return {
      slug: `yas-riva-reserve-${cluster.toLowerCase()}`,
      name: cluster,
      unit_count: units.length,
      available_count: 0,
      units,
    };
  }).filter(building => building.units.length > 0);

  return {
    slug: YAS_RIVA_RESERVE_PROJECT_SLUG,
    name: "Yas Riva Reserve",
    area: "yas-island",
    source_file: "World of Aldar · Yas Riva Reserve official community source",
    unit_count: buildings.reduce((total, building) => total + building.units.length, 0),
    available_count: 0,
    building_count: buildings.length,
    buildings,
  } as RawProject & Record<string, unknown>;
}

function normalizeSourceUnits(source: SourceUnit[]): YasRivaReserveCapturedUnit[] {
  const invalid = source.filter(unit => !sourceIdentity(unit.unitNumber));
  if (invalid.length) {
    throw new Error(`Yas Riva Reserve: official source contained unexpected unit codes (${invalid.slice(0, 5).map(unit => String(unit.unitNumber)).join(", ")}).`);
  }
  if (source.length !== EXPECTED_YAS_RIVA_RESERVE_UNIT_COUNT) {
    throw new Error(`Yas Riva Reserve: source coverage ${source.length} does not match verified coverage ${EXPECTED_YAS_RIVA_RESERVE_UNIT_COUNT}.`);
  }
  if (new Set(source.map(unit => text(unit.unitNumber))).size !== source.length) {
    throw new Error("Yas Riva Reserve: official source returned duplicate unit codes.");
  }
  return source.map(raw => {
    const unitName = text(raw.unitNumber)!;
    const locationId = text(raw.locationId);
    const sourceStatus = text(raw.unitStatus) ?? text(raw.status);
    if (!locationId || !sourceStatus) throw new Error(`Yas Riva Reserve ${unitName}: official source omitted location ID or source state.`);
    const pagePrice = numberOrNull(raw.price);
    return {
      unitName,
      locationId,
      sourceStatus,
      sourcePriceAed: isPublishedYasRivaReservePrice(pagePrice) ? pagePrice : null,
      raw,
    };
  });
}

async function fetchOfficialPage(fetchImpl: typeof fetch): Promise<{ html: string; sourceUnits: SourceUnit[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetchImpl(YAS_RIVA_RESERVE_ROUTE, {
      headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Yas Riva Reserve: World of Aldar returned HTTP ${response.status}.`);
    const html = await response.text();
    const sourceUnits = extractAllOfficialWorldAldarUnits(html) as SourceUnit[];
    if (!sourceUnits.length) throw new Error("Yas Riva Reserve: official page returned no unit records.");
    return { html, sourceUnits };
  } finally {
    clearTimeout(timeout);
  }
}

export async function captureYasRivaReserveOfficialSource(fetchImpl: typeof fetch = fetch): Promise<YasRivaReserveSourceCapture> {
  const captureDate = new Date().toISOString().slice(0, 10);
  const { html, sourceUnits } = await fetchOfficialPage(fetchImpl);
  const units = normalizeSourceUnits(sourceUnits);
  const project = buildYasRivaReserveProject(sourceUnits, captureDate);
  return {
    captureDate,
    sourceUnitCount: units.length,
    units,
    project,
    files: [
      { filename: `yas-riva-reserve-source-${captureDate}.html`, bytes: Buffer.from(html), mimeType: "text/html" },
      {
        filename: `yas-riva-reserve-source-summary-${captureDate}.json`,
        bytes: Buffer.from(JSON.stringify({
          sourceUnitCount: units.length,
          clusters: units.reduce<Record<string, number>>((counts, unit) => {
            const key = sourceIdentity(unit.unitName)?.cluster ?? "Unknown";
            counts[key] = (counts[key] ?? 0) + 1;
            return counts;
          }, {}),
          bedroomMix: units.reduce<Record<string, number>>((counts, unit) => {
            const key = String(unit.raw.bedroomCount ?? "Unknown");
            counts[key] = (counts[key] ?? 0) + 1;
            return counts;
          }, {}),
          sourceStatuses: units.reduce<Record<string, number>>((counts, unit) => {
            counts[unit.sourceStatus] = (counts[unit.sourceStatus] ?? 0) + 1;
            return counts;
          }, {}),
          publishedPagePriceCount: units.filter(unit => unit.sourcePriceAed != null).length,
        })),
        mimeType: "application/json",
      },
    ],
  };
}

type OfficialDetail = { unitName: string; priceAed: number | null };

function detailPrice(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const detail = (payload as { data?: { unitDetail?: Record<string, unknown> } }).data?.unitDetail;
  if (!detail || detail.CurrencyIsoCode !== "AED") return null;
  const price = numberOrNull(detail.SellingPrice__c);
  return isPublishedYasRivaReservePrice(price) ? price : null;
}

async function fetchOfficialDetail(unit: YasRivaReserveCapturedUnit, fetchImpl: typeof fetch): Promise<OfficialDetail> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const url = new URL(YAS_RIVA_RESERVE_DETAIL_ROUTE);
    url.searchParams.set("location_id", unit.locationId);
    url.searchParams.set("kiosk", "false");
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json", "User-Agent": "SaadiyatResaleHub/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Yas Riva Reserve ${unit.unitName}: unit-detail returned HTTP ${response.status}.`);
    const payload = await response.json() as { data?: { unitDetail?: Record<string, unknown> } };
    const returnedName = text(payload.data?.unitDetail?.Name);
    const expectedName = unit.unitName.replace(/-01$/i, "");
    if (returnedName && returnedName.toLowerCase() !== expectedName.toLowerCase()) {
      throw new Error(`Yas Riva Reserve ${unit.unitName}: unit-detail identity mismatch.`);
    }
    return { unitName: unit.unitName, priceAed: detailPrice(payload) };
  } finally {
    clearTimeout(timeout);
  }
}

/** A representative release detector across both clusters and every published villa typology. */
export function selectYasRivaReservePriceProbeUnits(units: YasRivaReserveCapturedUnit[]): YasRivaReserveCapturedUnit[] {
  const groups = new Map<string, YasRivaReserveCapturedUnit[]>();
  for (const unit of units) {
    const category = text(unit.raw.unitCategory) ?? "Unknown";
    const group = groups.get(category) ?? [];
    group.push(unit);
    groups.set(category, group);
  }
  const selected: YasRivaReserveCapturedUnit[] = [];
  for (const category of Array.from(groups.keys()).sort()) {
    const members = groups.get(category) ?? [];
    for (const position of [0, Math.floor((members.length - 1) / 2), members.length - 1]) {
      const unit = members[position];
      if (unit && !selected.includes(unit)) selected.push(unit);
    }
  }
  return selected;
}

async function fetchPrices(units: YasRivaReserveCapturedUnit[], fetchImpl: typeof fetch): Promise<YasRivaReservePrice[]> {
  const results: PromiseSettledResult<OfficialDetail>[] = [];
  for (let index = 0; index < units.length; index += DETAIL_CONCURRENCY) {
    results.push(...await Promise.allSettled(units.slice(index, index + DETAIL_CONCURRENCY).map(unit => fetchOfficialDetail(unit, fetchImpl))));
  }
  return results.flatMap(result => result.status === "fulfilled" && result.value.priceAed != null
    ? [{ unitName: result.value.unitName, priceAed: result.value.priceAed }]
    : []);
}

/** Quick hourly release check: project page plus a representative exact-unit sample. */
export async function probeYasRivaReserveOfficialPricing(fetchImpl: typeof fetch = fetch): Promise<YasRivaReservePriceProbe> {
  const capture = await captureYasRivaReserveOfficialSource(fetchImpl);
  const directPrices = capture.units.flatMap(unit => unit.sourcePriceAed != null ? [{ unitName: unit.unitName, priceAed: unit.sourcePriceAed }] : []);
  const probeUnits = directPrices.length ? [] : selectYasRivaReservePriceProbeUnits(capture.units);
  const detailPrices = probeUnits.length ? await fetchPrices(probeUnits, fetchImpl) : [];
  const publishedPrices = Array.from(new Map([...directPrices, ...detailPrices].map(price => [price.unitName, price])).values());
  return {
    captureDate: capture.captureDate,
    sourceUnitCount: capture.sourceUnitCount,
    screenedUnitCount: directPrices.length ? capture.units.length : probeUnits.length,
    publishedPrices,
    files: publishedPrices.length ? capture.files : [],
  };
}

/** Full exact-unit price patch used only after the release detector finds a valid official price. */
export async function captureYasRivaReserveOfficialFullPricePatch(fetchImpl: typeof fetch = fetch): Promise<YasRivaReservePriceProbe> {
  const capture = await captureYasRivaReserveOfficialSource(fetchImpl);
  const detailPrices = await fetchPrices(capture.units, fetchImpl);
  const allPrices = new Map<string, YasRivaReservePrice>();
  for (const unit of capture.units) if (unit.sourcePriceAed != null) allPrices.set(unit.unitName, { unitName: unit.unitName, priceAed: unit.sourcePriceAed });
  for (const price of detailPrices) allPrices.set(price.unitName, price);
  return {
    captureDate: capture.captureDate,
    sourceUnitCount: capture.sourceUnitCount,
    screenedUnitCount: capture.units.length,
    publishedPrices: Array.from(allPrices.values()).sort((a, b) => a.unitName.localeCompare(b.unitName)),
    files: capture.files,
  };
}

export function officialYasRivaReserveUnitUrl(unitName: string): string | null {
  const identity = sourceIdentity(unitName);
  return identity ? unitDetailUrl(identity.code) : null;
}

export function verifiedYasRivaReserveSourceStatusPatch(units: YasRivaReserveCapturedUnit[]) {
  return units.map(unit => ({ unitName: unit.unitName, sourceStatus: unit.sourceStatus }));
}

export function sourceProjectFromCapture(capture: YasRivaReserveSourceCapture) {
  return capture.project;
}

export { fetchOfficialDetail };
