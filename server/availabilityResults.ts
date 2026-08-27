import { availabilityListings, villaListings } from "../drizzle/schema";
import { pfListings } from "../client/src/data/propertyFinderListings";
import { getDb } from "./db";

export type AvailabilitySource = "nas-luxury" | "aldar" | "others" | "manual";
export type AvailabilitySourceFilter = AvailabilitySource | "any";

export type AvailabilityResult = {
  id: string;
  community: string;
  unitKey: string;
  title: string;
  source: AvailabilitySource;
  provenance: string;
  status: "available";
  priceAed: number | null;
  bedrooms: number | null;
  updatedAt: Date | null;
  href: string | null;
  sourceUrl: string | null;
  exactInternalMatch: boolean;
};

export type AvailabilitySummary = {
  community: string;
  total: number;
  available: number;
  reserved: number;
  sold: number;
  offMarket: number;
  bySource: Record<string, number>;
};

function lagoonsCluster(unitName: string) {
  const normalized = unitName.toLowerCase();
  if (normalized.startsWith("alghaf")) return "al-ghaf";
  if (normalized.startsWith("alsidr")) return "al-sidr";
  if (normalized.startsWith("ethir")) return "ethir";
  return null;
}

function stRegisId(unitKey: string) {
  const match = unitKey.match(/(?:villa[-_/ ]*)?(\d{1,3})$/i);
  return match?.[1] ?? null;
}

/** Resolve known card routes first; otherwise the exact Interactive Map marker is the safe destination. */
export function resolveAvailabilityHref(community: string, unitKey: string): string | null {
  const key = unitKey.replace(/^\/+/, "");
  if (key.startsWith("aldar-saadiyat/") || key.startsWith("aldar-other/")) return `/${key}`;
  if (key.startsWith("lagoons/")) {
    const unitName = key.slice("lagoons/".length);
    const cluster = lagoonsCluster(unitName);
    return cluster ? `/saadiyat-lagoons/${cluster}/${encodeURIComponent(unitName)}` : `/map?plot=${encodeURIComponent(key)}`;
  }
  if (community === "saadiyat-lagoons") {
    const unitName = key.replace(/^lagoons-/i, "").replace(/-v-/i, "-");
    const cluster = lagoonsCluster(unitName);
    return cluster ? `/saadiyat-lagoons/${cluster}/${encodeURIComponent(unitName)}` : null;
  }
  if (community === "jawaher") {
    const match = key.match(/plot[-_/ ]*(\d+)/i);
    return match ? `/jawaher/plot/${match[1]}` : `/map?plot=${encodeURIComponent(key)}`;
  }
  if (community === "st-regis") {
    const villaId = stRegisId(key);
    return villaId ? `/st-regis/villa/${villaId}` : `/map?plot=${encodeURIComponent(key)}`;
  }
  return key.includes("/") ? `/map?plot=${encodeURIComponent(key)}` : null;
}

/** Makes legacy NAS Lagoons forms such as Lagoons-AlSidr-V-176-02 share one identity with lagoons/AlSidr-176-02. */
export function canonicalAvailabilityIdentity(community: string, unitKey: string) {
  let key = unitKey.trim().toLowerCase().replace(/\s+/g, "");
  if (community === "saadiyat-lagoons") {
    key = key.replace(/^lagoons[-/]/, "").replace(/-v-/g, "-").replace(/[^a-z0-9]+/g, "-");
  }
  return `${community}|${key}`;
}

/** Preserve the established, manually verified availability record when it duplicates a computed NAS row. */
export function dedupeAvailabilityResults(rows: AvailabilityResult[]) {
  const seen = new Set<string>();
  return rows.filter(row => {
    const identity = `${row.source}|${canonicalAvailabilityIdentity(row.community, row.unitKey)}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function displayTitle(unitKey: string) {
  return unitKey.split("/").at(-1)?.replace(/[-_]+/g, " ") || unitKey;
}

function isExactPropertyRoute(href: string | null) {
  return Boolean(href && !href.startsWith("/map?"));
}

export async function listAvailabilityResults(source: AvailabilitySourceFilter = "any") {
  const db = await getDb();
  const rows: AvailabilityResult[] = [];

  if (db) {
    const curated = await db.select().from(availabilityListings);
    for (const row of curated) {
      if (row.status !== "available") continue;
      rows.push({
        id: `availability:${row.id}`,
        community: row.community,
        unitKey: row.unitKey,
        title: displayTitle(row.unitKey),
        source: row.source,
        provenance: row.source === "others" ? "Documented broker listing record" : "Admin-verified listing record",
        status: "available",
        priceAed: row.askingPriceAed,
        bedrooms: row.bedrooms,
        updatedAt: row.updatedAt,
        href: resolveAvailabilityHref(row.community, row.unitKey),
        sourceUrl: null,
        exactInternalMatch: isExactPropertyRoute(resolveAvailabilityHref(row.community, row.unitKey)),
      });
    }

    // A stored property status is the canonical NAS availability signal. It is computed at read time,
    // so changing an editor status away from Available removes it immediately with no second write path.
    const managed = await db.select().from(villaListings);
    for (const row of managed) {
      if (row.status !== "available") continue;
      rows.push({
        id: `property-status:${row.id}`,
        community: row.community,
        unitKey: row.villaKey,
        title: displayTitle(row.villaKey),
        source: "nas-luxury",
        provenance: "Stored property status: Available",
        status: "available",
        priceAed: row.askingPriceAed,
        bedrooms: null,
        updatedAt: row.updatedAt,
        href: resolveAvailabilityHref(row.community, row.villaKey),
        sourceUrl: null,
        exactInternalMatch: isExactPropertyRoute(resolveAvailabilityHref(row.community, row.villaKey)),
      });
    }
  }

  // This is the repository's documented PropertyFinder snapshot, not a live scrape. A source URL is
  // retained for every row, while the internal route is added only for explicitly matched plots.
  for (const listing of pfListings) {
    rows.push({
      id: `propertyfinder:${listing.url}`,
      community: listing.community,
      unitKey: listing.matchedVillaKey ?? listing.url,
      title: listing.title,
      source: "others",
      provenance: `PropertyFinder snapshot · 18 Aug 2026 · ${listing.agency}`,
      status: "available",
      priceAed: listing.priceAed,
      bedrooms: listing.bedrooms,
      updatedAt: new Date("2026-08-18T00:00:00.000Z"),
      href: listing.matchedVillaKey ? resolveAvailabilityHref(listing.community, listing.matchedVillaKey) : null,
      sourceUrl: listing.url,
      exactInternalMatch: Boolean(listing.matchedVillaKey),
    });
  }

  const unique = dedupeAvailabilityResults(rows)
    .filter(row => source === "any" || row.source === source)
    .sort((a, b) => `${a.community}|${a.title}`.localeCompare(`${b.community}|${b.title}`));
  return unique;
}

export function summarizeAvailabilityResults(rows: AvailabilityResult[]): AvailabilitySummary[] {
  const byCommunity = new Map<string, AvailabilitySummary>();
  for (const row of rows) {
    const summary = byCommunity.get(row.community) ?? {
      community: row.community,
      total: 0,
      available: 0,
      reserved: 0,
      sold: 0,
      offMarket: 0,
      bySource: {},
    };
    summary.total += 1;
    summary.available += 1;
    summary.bySource[row.source] = (summary.bySource[row.source] ?? 0) + 1;
    byCommunity.set(row.community, summary);
  }
  return Array.from(byCommunity.values());
}

export async function getAvailabilitySummary(): Promise<AvailabilitySummary[]> {
  return summarizeAvailabilityResults(await listAvailabilityResults("any"));
}
