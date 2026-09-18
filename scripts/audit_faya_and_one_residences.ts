import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { extractAllOfficialWorldAldarUnits } from "../server/alGhadeerOfficialCapture";
import { inventoryUnitEvents, inventoryUnitState } from "../drizzle/schema";

type OfficialRawUnit = Record<string, unknown> & { unitNumber?: string };
type ProjectBaseline = {
  slug: string;
  name: string;
  units: Array<{ unitName: string; route: string | null }>;
};

type Detail = {
  unitName: string;
  locationId: string | null;
  status: string | null;
  priceAed: number | null;
  error: string | null;
};

const USER_AGENT = "SaadiyatResaleHub/1.0";
const TARGET_SLUGS = new Set(["faya-al-saadiyat", "faya-al-saadiyat-ii", "onesaadiyat"]);
const DEFAULT_FAYA_ROUTES = [
  "https://world.aldar.com/uae/abudhabi/fayaalsaadiyat",
  "https://world.aldar.com/uae/abudhabi/faya",
];
const DEFAULT_ONE_ROUTES = [
  "https://world.aldar.com/uae/abudhabi/onesaadiyat",
  "https://world.aldar.com/uae/abudhabi/one-saadiyat",
];

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeOfficialStatus(value: unknown): string | null {
  const status = asText(value);
  return status ? status.trim() : null;
}

function flattenBaselines(): ProjectBaseline[] {
  const dataset = JSON.parse(
    readFileSync(resolve(process.cwd(), "server/data/aldar_saadiyat.json"), "utf8"),
  ) as { projects: Array<Record<string, unknown>> };
  return dataset.projects
    .filter(project => TARGET_SLUGS.has(String(project.slug)))
    .map(project => ({
      slug: String(project.slug),
      name: String(project.name),
      units: ((project.buildings as Array<Record<string, unknown>> | undefined) ?? []).flatMap(building =>
        ((building.units as Array<Record<string, unknown>> | undefined) ?? []).flatMap(unit => {
          const unitName = asText(unit.unit_name);
          return unitName ? [{ unitName, route: asText(unit.source_route) }] : [];
        }),
      ),
    }));
}

function candidateRoutes(project: ProjectBaseline): string[] {
  const fromBaseline = project.units.map(unit => unit.route).filter((route): route is string => Boolean(route));
  const defaults = project.slug === "onesaadiyat" ? DEFAULT_ONE_ROUTES : DEFAULT_FAYA_ROUTES;
  return [...new Set([...fromBaseline.map(route => `https://world.aldar.com${route}`), ...defaults])];
}

async function fetchProjectPage(project: ProjectBaseline) {
  const attempts: Array<{ url: string; status: number; unitCount: number }> = [];
  for (const url of candidateRoutes(project)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html", "User-Agent": USER_AGENT },
        signal: controller.signal,
      });
      const html = await response.text();
      const units = response.ok ? extractAllOfficialWorldAldarUnits(html) : [];
      attempts.push({ url, status: response.status, unitCount: units.length });
      if (response.ok && units.length > 0) return { url, html, units, attempts };
    } catch (error) {
      attempts.push({ url, status: 0, unitCount: 0 });
      console.error(`Page request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`${project.name}: World of Aldar did not return unit records. Attempts: ${JSON.stringify(attempts)}`);
}

async function fetchUnitDetail(source: OfficialRawUnit): Promise<Detail> {
  const unitName = asText(source.unitNumber);
  const locationId = asText(source.locationId);
  if (!unitName) return { unitName: "", locationId, status: null, priceAed: null, error: "Missing unitNumber" };
  if (!locationId) {
    return {
      unitName,
      locationId: null,
      status: normalizeOfficialStatus(source.unitStatus) ?? normalizeOfficialStatus(source.status),
      priceAed: asNumber(source.price),
      error: "Missing locationId; used only page fields",
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const url = new URL("https://propertyservice.world.aldar.com/api/v2/units/unit-detail");
    url.searchParams.set("location_id", locationId);
    url.searchParams.set("kiosk", "false");
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json() as { data?: { unitDetail?: Record<string, unknown> } };
    const detail = payload.data?.unitDetail;
    if (!detail) {
      return {
        unitName,
        locationId,
        status: normalizeOfficialStatus(source.unitStatus) ?? normalizeOfficialStatus(source.status),
        priceAed: asNumber(source.price),
        error: "No unitDetail; used only page fields",
      };
    }
    const returnedName = asText(detail.Name);
    if (returnedName && returnedName !== unitName) throw new Error(`Identity mismatch: ${returnedName}`);
    const currency = asText(detail.CurrencyIsoCode);
    const detailPrice = currency === "AED" ? asNumber(detail.SellingPrice__c) : null;
    return {
      unitName,
      locationId,
      status: normalizeOfficialStatus(detail.Status__c) ?? normalizeOfficialStatus(source.unitStatus) ?? normalizeOfficialStatus(source.status),
      priceAed: detailPrice != null && detailPrice > 1 ? detailPrice : asNumber(source.price),
      error: null,
    };
  } catch (error) {
    return {
      unitName,
      locationId,
      status: normalizeOfficialStatus(source.unitStatus) ?? normalizeOfficialStatus(source.status),
      priceAed: asNumber(source.price),
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function parallel<T, R>(items: readonly T[], limit: number, worker: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += limit) {
    results.push(...await Promise.all(items.slice(index, index + limit).map(worker)));
  }
  return results;
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const capturedAt = new Date().toISOString();
  const baselines = flattenBaselines();
  const report: Record<string, unknown> = { capturedAt, projects: [] as unknown[] };

  for (const project of baselines) {
    const live = await fetchProjectPage(project);
    const baselineNames = new Set(project.units.map(unit => unit.unitName));
    const liveTargetUnits = live.units.filter(unit => {
      const name = asText(unit.unitNumber);
      return Boolean(name && baselineNames.has(name));
    });
    const details = await parallel(liveTargetUnits, 8, fetchUnitDetail);
    const detailMap = new Map(details.map(detail => [detail.unitName, detail]));
    const unitNames = [...baselineNames];
    const states = unitNames.length
      ? await db.select().from(inventoryUnitState).where(and(eq(inventoryUnitState.dataset, "saadiyat"), eq(inventoryUnitState.projectSlug, project.slug), inArray(inventoryUnitState.unitName, unitNames)))
      : [];
    const stateMap = new Map(states.map(state => [state.unitName, state]));
    const events = unitNames.length
      ? await db.select().from(inventoryUnitEvents)
        .where(and(eq(inventoryUnitEvents.dataset, "saadiyat"), eq(inventoryUnitEvents.projectSlug, project.slug), inArray(inventoryUnitEvents.unitName, unitNames)))
        .orderBy(desc(inventoryUnitEvents.createdAt), desc(inventoryUnitEvents.id))
      : [];

    const compared = Array.from(baselineNames).sort().map(unitName => {
      const stored = stateMap.get(unitName);
      const current = detailMap.get(unitName) ?? null;
      const livePrice = current?.priceAed ?? null;
      const storedPrice = stored?.priceAed ?? null;
      const liveStatus = current?.status ?? null;
      const storedStatus = stored?.status ?? null;
      return {
        unitName,
        stored: stored ? { status: storedStatus, sourceStatus: stored.sourceStatus, priceAed: storedPrice, isPresent: stored.isPresent, lastSeenAt: stored.lastSeenAt } : null,
        live: current ? { status: liveStatus, priceAed: livePrice, detailError: current.error } : null,
        priceChange: livePrice != null && storedPrice != null && livePrice !== storedPrice ? { fromAed: storedPrice, toAed: livePrice, deltaAed: livePrice - storedPrice } : null,
        statusChange: liveStatus != null && storedStatus != null && liveStatus.toLowerCase() !== storedStatus.toLowerCase() ? { from: storedStatus, to: liveStatus } : null,
      };
    });

    const liveKnown = compared.filter(row => row.live);
    const changedPrices = compared.filter(row => row.priceChange);
    const changedStatuses = compared.filter(row => row.statusChange);
    const liveSold = liveKnown.filter(row => row.live?.status?.trim().toLowerCase() === "sold");
    const liveAvailable = liveKnown.filter(row => ["available", "new"].includes(row.live?.status?.trim().toLowerCase() ?? ""));
    const liveOther = liveKnown.filter(row => !liveSold.includes(row) && !liveAvailable.includes(row));
    const eventSummary = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
      return acc;
    }, {});

    (report.projects as unknown[]).push({
      project: { slug: project.slug, name: project.name, storedUnitCount: baselineNames.size },
      source: { route: live.url, attempts: live.attempts, pageUnitCount: live.units.length, matchedOfficialUnitCount: liveTargetUnits.length, unmatchedPageUnitCount: live.units.length - liveTargetUnits.length, detailResponseCount: details.filter(detail => !detail.error).length, detailFallbackOrErrorCount: details.filter(detail => detail.error).length },
      current: {
        sold: liveSold.map(row => row.unitName),
        availableOrNew: liveAvailable.map(row => row.unitName),
        otherStatus: liveOther.map(row => ({ unitName: row.unitName, status: row.live?.status ?? null })),
        notReturnedOnLivePage: compared.filter(row => !row.live).map(row => row.unitName),
      },
      changesSinceStoredState: { prices: changedPrices, statuses: changedStatuses },
      storedEventLedger: { count: events.length, byType: eventSummary, events: events.map(event => ({ unitName: event.unitName, eventType: event.eventType, fromStatus: event.fromStatus, toStatus: event.toStatus, fromPriceAed: event.fromPriceAed, toPriceAed: event.toPriceAed, runId: event.runId, createdAt: event.createdAt })) },
      units: compared,
    });
  }

  mkdirSync(resolve(process.cwd(), "private-audits"), { recursive: true });
  const filename = resolve(process.cwd(), "private-audits", `faya-one-residences-official-audit-${capturedAt.slice(0, 10)}.json`);
  writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportFile: filename, capturedAt, projects: (report.projects as Array<Record<string, unknown>>).map(project => ({ project: project.project, source: project.source, current: project.current, priceChangeCount: (project.changesSinceStoredState as { prices: unknown[] }).prices.length, statusChangeCount: (project.changesSinceStoredState as { statuses: unknown[] }).statuses.length, storedEventLedger: project.storedEventLedger })) }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
