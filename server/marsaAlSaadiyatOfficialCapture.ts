import { writeFileSync } from "node:fs";
import { extractAllOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";
import type { RawProject } from "./inventorySync";

const DETAIL_ENDPOINT = "https://propertyservice.world.aldar.com/api/v2/units/unit-detail";
const COMMUNITY_PAGE = "https://world.aldar.com/uae/abudhabi";
const OFFICIAL_RELEASE_URL = "https://www.aldar.com/en/news-and-media/aldar-launches-first-homes-at-marsa-al-saadiyat-with-351-exclusive-villas-at-talay";
const REQUEST_TIMEOUT_MS = 15_000;
// Keep live World of Aldar detail traffic deliberately modest. The endpoint
// intermittently refuses large concurrent bursts, especially during launches.
const DETAIL_CONCURRENCY = 4;

type SourceUnit = Record<string, unknown> & {
  unitNumber?: string;
  unitName?: string;
  locationId?: string;
  bedroomCount?: number | string;
  unitStatus?: string;
  unitCategory?: string;
  propertyName?: string;
  unitType?: string;
  unitModel?: string;
  plotArea?: number | string;
  saleableArea?: number | string;
  suiteArea?: number | string;
  balconyArea?: number | string;
  paymentPlan?: string;
  facadeType?: string;
  variantCode?: string;
  variantType?: string;
  isFurnished?: boolean;
  isExplorable?: boolean;
  isInteriorExplorable?: boolean;
};

type DetailPayload = {
  data?: {
    unitDetail?: Record<string, unknown>;
  };
};

type UnitDetail = {
  unitName: string;
  sourceStatus: string;
  priceAed: number;
  reservationAmountAed: number | null;
};

export type MarsaProjectConfig = {
  slug: "talay-at-marsa-al-saadiyat" | "talay-beach-villas";
  name: string;
  projectPath: "talay" | "talaybeach";
  unitPrefix: "Talay-MarsaAlSaadiyat-V-" | "TalayBeach-MarsaAlSaadiyat-V-";
  /** Talay Beach has no verified direct property route at the capture date. */
  hasVerifiedUnitLinks: boolean;
  expectedUnitCount: number;
};

export const TALAY_CONFIG: MarsaProjectConfig = {
  slug: "talay-at-marsa-al-saadiyat",
  name: "Talay at Marsa Al Saadiyat",
  projectPath: "talay",
  unitPrefix: "Talay-MarsaAlSaadiyat-V-",
  hasVerifiedUnitLinks: true,
  expectedUnitCount: 167,
};

export const TALAY_BEACH_CONFIG: MarsaProjectConfig = {
  slug: "talay-beach-villas",
  name: "Talay Beach Villas",
  projectPath: "talaybeach",
  unitPrefix: "TalayBeach-MarsaAlSaadiyat-V-",
  hasVerifiedUnitLinks: false,
  expectedUnitCount: 184,
};

function positiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function nonEmptyText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function positivePrice(value: unknown): number | null {
  const price = positiveNumber(value);
  return price != null && price > 1 ? Math.round(price) : null;
}

function unitCode(unitName: string, config: MarsaProjectConfig): string | null {
  const prefix = config.unitPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${prefix}(\\d{3}-01)$`, "i").exec(unitName);
  return match?.[1] ?? null;
}

function knownDirectAldarLink(unitName: string, config: MarsaProjectConfig): string | null {
  if (!config.hasVerifiedUnitLinks) return null;
  const code = unitCode(unitName, config);
  if (!code) return null;
  return `https://world.aldar.com/uae/abudhabi/talay/property/MarsaAlSaadiyat-${code}/0?unitstate=floorplan&scheme=S1&furnished=true`;
}

function sourceUnitIdentity(unit: SourceUnit): string | null {
  const unitName = nonEmptyText(unit.unitNumber);
  const locationId = nonEmptyText(unit.locationId);
  return unitName && locationId ? unitName : null;
}

export function selectMarsaProductionSourceUnits(units: SourceUnit[], config: MarsaProjectConfig): SourceUnit[] {
  const selected = units.filter(unit => {
    const unitName = nonEmptyText(unit.unitNumber);
    return Boolean(unitName && unitCode(unitName, config));
  });
  const names = new Set(selected.map(unit => String(unit.unitNumber)));
  if (names.size !== selected.length) throw new Error(`${config.name} source contained duplicate unit identities.`);
  if (selected.length !== config.expectedUnitCount) {
    throw new Error(`${config.name} source coverage is ${selected.length}; expected ${config.expectedUnitCount}. No partial snapshot was applied.`);
  }
  return selected.sort((a, b) => String(a.unitNumber).localeCompare(String(b.unitNumber), undefined, { numeric: true }));
}

async function fetchJsonWithTimeout(url: URL): Promise<DetailPayload> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "SaadiyatResaleHub/1.0" },
    });
    if (!response.ok) throw new Error(`World of Aldar unit detail returned HTTP ${response.status}.`);
    return await response.json() as DetailPayload;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOfficialUnitDetail(unit: SourceUnit): Promise<UnitDetail> {
  const unitName = nonEmptyText(unit.unitNumber);
  const locationId = nonEmptyText(unit.locationId);
  if (!unitName || !locationId) throw new Error("Official source unit is missing its immutable identity.");
  const url = new URL(DETAIL_ENDPOINT);
  url.searchParams.set("location_id", locationId);
  url.searchParams.set("kiosk", "false");

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const payload = await fetchJsonWithTimeout(url);
      const detail = payload.data?.unitDetail;
      const detailName = nonEmptyText(detail?.Name);
      const sourceStatus = nonEmptyText(detail?.Status__c) ?? nonEmptyText(unit.unitStatus);
      const priceAed = positivePrice(detail?.SellingPrice__c);
      if (detailName !== unitName) throw new Error(`Detail identity ${detailName ?? "missing"} does not match ${unitName}.`);
      if (!sourceStatus) throw new Error(`${unitName} detail has no official source status.`);
      if (priceAed == null) throw new Error(`${unitName} detail has no valid AED price.`);
      return {
        unitName,
        sourceStatus,
        priceAed,
        reservationAmountAed: positivePrice(detail?.ReservationAmount__c),
      };
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise(resolve => setTimeout(resolve, attempt * 600));
    }
  }
  throw lastError;
}

async function mapWithConcurrency<T, R>(values: readonly T[], mapper: (value: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(DETAIL_CONCURRENCY, values.length) }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      results[index] = await mapper(values[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function fetchMarsaCommunityHtml(config: MarsaProjectConfig) {
  const sourceUrl = `${COMMUNITY_PAGE}/${config.projectPath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(sourceUrl, { signal: controller.signal, headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" } });
    if (!response.ok) throw new Error(`${config.name} community page returned HTTP ${response.status}.`);
    return { sourceUrl, html: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function buildFeatures(unit: SourceUnit): string | null {
  const features = [
    nonEmptyText(unit.variantCode) ? `Variant: ${nonEmptyText(unit.variantCode)}` : null,
    nonEmptyText(unit.variantType) ? `Type code: ${nonEmptyText(unit.variantType)}` : null,
    nonEmptyText(unit.facadeType) ? `Facade: ${nonEmptyText(unit.facadeType)}` : null,
    unit.isExplorable === true ? "Floor plan published" : null,
    unit.isInteriorExplorable === true ? "Interior explorer published" : null,
  ].filter((value): value is string => Boolean(value));
  return features.length ? features.join(" · ") : null;
}

function groupedPriceSummary(units: Array<{ bedrooms: number; priceAed: number }>) {
  return [4, 5, 6].map(bedrooms => {
    const matches = units.filter(unit => unit.bedrooms === bedrooms).map(unit => unit.priceAed);
    const min = Math.min(...matches);
    const max = Math.max(...matches);
    return {
      unit_type: `${bedrooms}-Bedroom Villas`,
      bedrooms,
      starting_price_aed: min,
      max_price_aed: max,
    };
  });
}

function buildProject(
  config: MarsaProjectConfig,
  sourceUnits: SourceUnit[],
  details: UnitDetail[],
  capturedAt: string,
): RawProject & Record<string, unknown> {
  const detailsByName = new Map(details.map(detail => [detail.unitName, detail]));
  const units = sourceUnits.map(source => {
    const unitName = String(source.unitNumber);
    const detail = detailsByName.get(unitName);
    if (!detail) throw new Error(`${config.name} missing detail result for ${unitName}.`);
    const bedrooms = Number(source.bedroomCount);
    const saleableArea = positiveNumber(source.saleableArea);
    return {
      unit_name: unitName,
      aldar_link: knownDirectAldarLink(unitName, config),
      unit_type: nonEmptyText(source.unitType) ?? "Villa",
      unit_category: nonEmptyText(source.unitCategory),
      unit_model: nonEmptyText(source.propertyName) ?? nonEmptyText(source.unitModel),
      bedrooms: Number.isFinite(bedrooms) ? String(bedrooms) : null,
      total_rooms: Number.isFinite(bedrooms) ? String(bedrooms) : null,
      status: detail.sourceStatus,
      source_unit_status: detail.sourceStatus,
      price_aed: detail.priceAed,
      reservation_amount: detail.reservationAmountAed,
      online_reservation_fee: null,
      plot_area_sqm: positiveNumber(source.plotArea),
      saleable_area_sqm: saleableArea,
      total_area_sqm: saleableArea,
      terrace_area_sqm: null,
      balcony_area_sqm: positiveNumber(source.balconyArea),
      service_charge_aed_sqm: null,
      service_charge_escalation_pct: null,
      car_parks: null,
      unit_finishes: source.isFurnished === true ? "Furnished" : null,
      features_spec: buildFeatures(source),
      inventory_category: nonEmptyText(source.propertyName) ?? "Villa",
      property_status: detail.sourceStatus,
      mandatory_pool: null,
      mandatory_premium: null,
      darna_applicable: null,
      virtual_tour: null,
      payment_plans: nonEmptyText(source.paymentPlan),
      building_section: "Official villa registry",
      project_field: config.name,
    };
  });
  const prices = groupedPriceSummary(units.map(unit => ({ bedrooms: Number(unit.bedrooms), priceAed: unit.price_aed })));
  const sourceUrl = `${COMMUNITY_PAGE}/${config.projectPath}`;
  return {
    slug: config.slug,
    name: config.name,
    source_file: `World of Aldar live ${config.name} capture`,
    source_url: sourceUrl,
    unit_count: units.length,
    available_count: units.filter(unit => unit.source_unit_status?.toLowerCase() === "available").length,
    building_count: 1,
    release_summary: {
      phase_status: "Live official unit registry and pricing",
      unit_registry_status: `${units.length} exact villas captured from World of Aldar on ${capturedAt.slice(0, 10)}.`,
      price_notice: "Every card uses its current exact World of Aldar unit-detail price and source status. These official values are distinct from NAS resale availability and are updated by the daily official sync.",
      total_villas: units.length,
      location: "Marsa Al Saadiyat · Saadiyat Island",
      developer: "Aldar",
      payment_plan: "Not published in the current official unit feed",
      source_urls: [
        { label: "World of Aldar community", url: sourceUrl, classification: "Official inventory source" },
        { label: "Aldar launch release", url: OFFICIAL_RELEASE_URL, classification: "Official release · 17 Sep 2026" },
      ],
      typologies: prices.map(price => ({
        label: price.unit_type,
        bedrooms: price.bedrooms,
        count: units.filter(unit => Number(unit.bedrooms) === price.bedrooms).length,
        villa_area_sqm: null,
        plot_area_sqm: null,
        starting_price_aed: price.starting_price_aed,
        price_status: `Current unit range AED ${price.starting_price_aed.toLocaleString("en-US")}–${price.max_price_aed.toLocaleString("en-US")}`,
      })),
    },
    published_starting_prices: {
      label: "Current official unit pricing",
      source: "World of Aldar exact unit-detail API",
      source_url: sourceUrl,
      captured_at: capturedAt.slice(0, 10),
      price_notice: "The figures below are the current lowest exact unit prices by bedroom count. Open a unit card for its exact price, status, areas, source configuration, and reservation amount.",
      prices,
    },
    buildings: [{
      slug: "official-villas",
      name: "Official Villa Registry",
      unit_count: units.length,
      available_count: units.filter(unit => unit.source_unit_status?.toLowerCase() === "available").length,
      units,
    } as any],
  };
}

export async function captureMarsaAlSaadiyatOfficialProject(config: MarsaProjectConfig) {
  const capturedAt = new Date().toISOString();
  const { sourceUrl, html } = await fetchMarsaCommunityHtml(config);
  const sourceUnits = selectMarsaProductionSourceUnits(extractAllOfficialWorldAldarUnits(html) as SourceUnit[], config);
  const details = await mapWithConcurrency(sourceUnits, fetchOfficialUnitDetail);
  const project = buildProject(config, sourceUnits, details, capturedAt);
  const evidence = {
    config,
    capturedAt,
    sourceUrl,
    sourceUnitCount: sourceUnits.length,
    unitDetails: details,
  };
  return {
    captureDate: capturedAt,
    sourceUrl,
    sourceUnitCount: sourceUnits.length,
    publishedPriceCount: details.length,
    project,
    evidence,
    files: [
      {
        filename: `${config.slug}-official-source-${capturedAt.slice(0, 10)}.html`,
        bytes: Buffer.from(html),
        mimeType: "text/html",
      },
      {
        filename: `${config.slug}-official-detail-summary-${capturedAt.slice(0, 10)}.json`,
        bytes: Buffer.from(JSON.stringify(evidence, null, 2)),
        mimeType: "application/json",
      },
    ],
  };
}

/**
 * A partial capture deliberately supports only source-status and exact-price
 * patches. It does not return a project snapshot and therefore cannot add,
 * remove, or otherwise reclassify an unseen unit.
 */
export async function captureMarsaAlSaadiyatOfficialPartialPatch(config: MarsaProjectConfig) {
  const capturedAt = new Date().toISOString();
  const { sourceUrl, html } = await fetchMarsaCommunityHtml(config);
  const candidates = (extractAllOfficialWorldAldarUnits(html) as SourceUnit[]).filter(unit => {
    const unitName = nonEmptyText(unit.unitNumber);
    return Boolean(unitName && unitCode(unitName, config) && nonEmptyText(unit.locationId));
  });
  const unique = new Map(candidates.map(unit => [String(unit.unitNumber), unit]));
  if (!unique.size) throw new Error(`${config.name} partial source returned no exact production units.`);
  const sourceUnits = Array.from(unique.values()).sort((a, b) => String(a.unitNumber).localeCompare(String(b.unitNumber), undefined, { numeric: true }));
  const details = await mapWithConcurrency(sourceUnits, fetchOfficialUnitDetail);
  const evidence = {
    config,
    capturedAt,
    sourceUrl,
    sourceUnitCount: sourceUnits.length,
    expectedUnitCount: config.expectedUnitCount,
    mode: "partial-patch",
    unitDetails: details,
  };
  return {
    captureDate: capturedAt,
    sourceUrl,
    sourceUnitCount: sourceUnits.length,
    expectedUnitCount: config.expectedUnitCount,
    publishedPriceCount: details.length,
    details,
    sourceUnits,
    evidence,
    files: [
      {
        filename: `${config.slug}-official-partial-source-${capturedAt.slice(0, 10)}.html`,
        bytes: Buffer.from(html),
        mimeType: "text/html",
      },
      {
        filename: `${config.slug}-official-partial-detail-summary-${capturedAt.slice(0, 10)}.json`,
        bytes: Buffer.from(JSON.stringify(evidence, null, 2)),
        mimeType: "application/json",
      },
    ],
  };
}

export function archiveMarsaAlSaadiyatOfficialCapture(capture: {
  captureDate: string;
  evidence: { config: MarsaProjectConfig } & Record<string, unknown>;
}) {
  const filename = `private-audits/${capture.evidence.config.slug}-official-capture-${capture.captureDate.slice(0, 10)}.json`;
  writeFileSync(filename, JSON.stringify(capture.evidence, null, 2));
  return filename;
}

export const __testables = {
  unitCode,
  knownDirectAldarLink,
  groupedPriceSummary,
};
