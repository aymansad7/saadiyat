/**
 * publicResale router — fully public, no authentication, no passcode.
 *
 * This powers the external Resale Filter that any visitor can use from the
 * passcode screen or the Landing page. It aggregates two sources:
 *
 *   1) Aldar's own Resale workbook — owner-listed asking prices that Aldar
 *      itself promotes (we ingested 119 UAE rows; 111 matched to inventory).
 *      We expose them under source = "aldar-resale".
 *
 *   2) Live primary inventory across every project we have ingested
 *      (Saadiyat 18 projects + Other Aldar 24 projects), filtered to
 *      live statuses (Available / New / Booked / Blocked / Reserved).
 *      We expose them under source = "primary-live".
 *
 * The public endpoint deliberately does NOT include Sold rows from the
 * primary inventory: the goal is to show what is actually available right
 * now, across all areas, with one filter.
 *
 * IMPORTANT: this procedure only reveals public-facing fields (area, project
 * name, unit number, status, asking/list price, beds, sqft, aldar link). It
 * does NOT expose the sensitive original prices for sold inventory etc.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import type { ResaleItem } from "./resale";
import { _internal as resaleInternal } from "./resale";

// ---------------------------------------------------------------------------
// Loaders for primary inventory (Saadiyat + Other Aldar)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));

type RawUnit = {
  unit_name: string | null;
  status: string | null;
  price_aed: number | null;
  bedrooms: string | number | null;
  saleable_area_sqm: number | null;
  unit_type: string | null;
  aldar_link: string | null;
};
type RawBuilding = { slug: string; name: string; units: RawUnit[] };
type RawProject = {
  slug: string;
  name: string;
  buildings: RawBuilding[];
};
type RawDataset = { projects: RawProject[] };

let SAADIYAT: RawDataset | null = null;
let OTHER: RawDataset | null = null;
let LAGOONS: { villas: any[] } | null = null;

function readJsonFromCandidates(candidates: string[]): string {
  let lastErr: unknown = null;
  for (const p of candidates) {
    try {
      return readFileSync(p, "utf-8");
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    "Public resale dataset not found, last error: " + String(lastErr),
  );
}

function loadSaadiyat(): RawDataset {
  if (SAADIYAT) return SAADIYAT;
  const raw = readJsonFromCandidates([
    resolve(__dirname, "..", "data", "aldar_saadiyat.json"),
    resolve(__dirname, "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "server", "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "dist", "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "data", "aldar_saadiyat.json"),
  ]);
  SAADIYAT = JSON.parse(raw) as RawDataset;
  return SAADIYAT;
}

function loadOther(): RawDataset {
  if (OTHER) return OTHER;
  const raw = readJsonFromCandidates([
    resolve(__dirname, "..", "data", "aldar_other.json"),
    resolve(__dirname, "data", "aldar_other.json"),
    resolve(process.cwd(), "server", "data", "aldar_other.json"),
    resolve(process.cwd(), "dist", "data", "aldar_other.json"),
    resolve(process.cwd(), "data", "aldar_other.json"),
  ]);
  OTHER = JSON.parse(raw) as RawDataset;
  return OTHER;
}

function loadLagoons(): { villas: any[] } {
  if (LAGOONS) return LAGOONS;
  try {
    const raw = readJsonFromCandidates([
      resolve(__dirname, "..", "data", "lagoons.json"),
      resolve(__dirname, "data", "lagoons.json"),
      resolve(process.cwd(), "server", "data", "lagoons.json"),
      resolve(process.cwd(), "dist", "data", "lagoons.json"),
      resolve(process.cwd(), "data", "lagoons.json"),
    ]);
    LAGOONS = JSON.parse(raw) as { villas: any[] };
  } catch {
    LAGOONS = { villas: [] };
  }
  return LAGOONS;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
const LIVE_STATUSES = new Set([
  "available",
  "new",
  "booked",
  "blocked",
  "reserved",
]);
function isLive(s: string | null) {
  return LIVE_STATUSES.has((s || "").toLowerCase().trim());
}

function statusGroup(s: string | null) {
  return (s || "").toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Public listing shape — single uniform card type for the UI
// ---------------------------------------------------------------------------
export type PublicListing = {
  id: string;
  source: "aldar-resale" | "primary-live";
  area: "saadiyat" | "yas-island" | "al-ghadeer" | "other";
  area_label: string;
  project_name: string;
  project_slug: string | null;
  building_name: string | null;
  unit_number: string;
  unit_type: string | null;
  bedrooms: number | null;
  saleable_area_sqft: number | null;
  status: string | null;
  /** Aldar resale rows = asking price from owner. Primary rows = original price. */
  price_aed: number | null;
  price_label: "Asking price" | "List price";
  aldar_url: string | null;
  /** Internal href to a unit page (only when authed/passcoded later) */
  internal_href: string | null;
};

function sqftFromSqm(sqm: number | null | undefined): number | null {
  if (typeof sqm !== "number" || !Number.isFinite(sqm) || sqm <= 0) return null;
  return Math.round(sqm * 10.7639);
}

function inferAreaFromCommunity(loc: string | null): PublicListing["area"] {
  const s = (loc || "").toLowerCase();
  if (s.includes("saadiyat")) return "saadiyat";
  if (s.includes("yas")) return "yas-island";
  if (s.includes("ghadeer")) return "al-ghadeer";
  return "other";
}

function areaLabel(a: PublicListing["area"]): string {
  if (a === "saadiyat") return "Saadiyat Island";
  if (a === "yas-island") return "Yas Island";
  if (a === "al-ghadeer") return "Al Ghadeer";
  return "Other";
}

function parseBedrooms(b: string | number | null): number | null {
  if (typeof b === "number") return Number.isFinite(b) ? b : null;
  if (!b) return null;
  const m = String(b).match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

// ---------------------------------------------------------------------------
// Source converters
// ---------------------------------------------------------------------------
function fromAldarResale(item: ResaleItem): PublicListing {
  const area = inferAreaFromCommunity(item.community_location);
  // Build internal href if matched to inventory
  let href: string | null = null;
  if (item.matched && item.project_slug && item.building_slug) {
    const root =
      item.area === "other" ? "/aldar-other" : "/aldar-saadiyat";
    href = `${root}/${item.project_slug}/${item.building_slug}/${encodeURIComponent(item.unit_number)}`;
  }
  return {
    id: `resale-${item.property_id}-${item.unit_number}`,
    source: "aldar-resale",
    area,
    area_label: item.community_location || areaLabel(area),
    project_name: item.project_resale_name,
    project_slug: item.project_slug ?? null,
    building_name: item.building_name ?? null,
    unit_number: item.unit_number,
    unit_type: item.unit_type,
    bedrooms: parseBedrooms(item.bedrooms as any),
    saleable_area_sqft: item.saleable_area_sqft
      ? Math.round(item.saleable_area_sqft)
      : null,
    status: "Resale",
    price_aed: item.asking_price_aed,
    price_label: "Asking price",
    aldar_url: item.aldar_url,
    internal_href: href,
  };
}

function fromPrimaryUnit(
  ds: RawDataset,
  area: "saadiyat" | "other",
  project: RawProject,
  building: RawBuilding,
  u: RawUnit,
): PublicListing | null {
  if (!u.unit_name) return null;
  if (!isLive(u.status)) return null;
  const a: PublicListing["area"] = area === "saadiyat" ? "saadiyat" : "other";
  // Best-effort area label for "other"
  const lbl =
    area === "saadiyat"
      ? "Saadiyat Island"
      : guessAreaLabelFromProjectName(project.name);
  return {
    id: `live-${area}-${project.slug}-${building.slug}-${u.unit_name}`,
    source: "primary-live",
    area: area === "saadiyat" ? "saadiyat" : guessAreaCodeFromProjectName(project.name),
    area_label: lbl,
    project_name: project.name,
    project_slug: project.slug,
    building_name: building.name,
    unit_number: u.unit_name,
    unit_type: u.unit_type,
    bedrooms: parseBedrooms(u.bedrooms ?? null),
    saleable_area_sqft: sqftFromSqm(u.saleable_area_sqm),
    status: u.status,
    price_aed: u.price_aed,
    price_label: "List price",
    aldar_url: u.aldar_link,
    internal_href:
      area === "saadiyat"
        ? `/aldar-saadiyat/${project.slug}/${building.slug}/${encodeURIComponent(u.unit_name)}`
        : `/aldar-other/${project.slug}/${building.slug}/${encodeURIComponent(u.unit_name)}`,
  };
}

function guessAreaLabelFromProjectName(name: string): string {
  const s = name.toLowerCase();
  if (s.includes("yas")) return "Yas Island";
  if (s.includes("ghadeer")) return "Al Ghadeer";
  if (s.includes("reeman")) return "Al Reeman";
  if (s.includes("athlon")) return "Athlon";
  if (s.includes("noya")) return "Noya";
  if (s.includes("alreeman") || s.includes("al-reeman")) return "Al Reeman";
  return "Aldar";
}

function guessAreaCodeFromProjectName(name: string): PublicListing["area"] {
  const s = name.toLowerCase();
  if (s.includes("yas")) return "yas-island";
  if (s.includes("ghadeer")) return "al-ghadeer";
  return "other";
}

// ---------------------------------------------------------------------------
// Build the canonical public listing array (cached for the lifetime of the
// process — datasets are static).
// ---------------------------------------------------------------------------
let CACHE: PublicListing[] | null = null;
function getAllListings(): PublicListing[] {
  if (CACHE) return CACHE;
  const out: PublicListing[] = [];

  // 1) Aldar Resale — these are owner asking prices (the headline source).
  try {
    const ds = resaleInternal.loadDataset();
    for (const it of ds.items) {
      // Skip rows we deliberately ignored (defensive — they shouldn't be in
      // the JSON anyway because build_resale.py filtered them out).
      const loc = (it.community_location || "").toLowerCase();
      if (
        loc.includes("dubai") ||
        loc.includes("egypt") ||
        loc.includes("london") ||
        loc.includes("marjan")
      ) {
        continue;
      }
      out.push(fromAldarResale(it));
    }
  } catch (err) {
    console.error("[publicResale] aldar_resale load failed:", err);
  }

  // 2) Saadiyat primary inventory (live only).
  try {
    const sa = loadSaadiyat();
    for (const p of sa.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          const card = fromPrimaryUnit(sa, "saadiyat", p, b, u);
          if (card) out.push(card);
        }
      }
    }
  } catch (err) {
    console.error("[publicResale] aldar_saadiyat load failed:", err);
  }

  // 3) Other Aldar primary inventory (live only). Public-safe: only project
  // name, unit number, beds, sqft, list price, status.
  try {
    const ot = loadOther();
    for (const p of ot.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          const card = fromPrimaryUnit(ot, "other", p, b, u);
          if (card) out.push(card);
        }
      }
    }
  } catch (err) {
    console.error("[publicResale] aldar_other load failed:", err);
  }

  CACHE = out;
  return out;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const publicResaleRouter = router({
  /**
   * Public summary — counts per area and source.
   */
  summary: publicProcedure.query(() => {
    const all = getAllListings();
    const byArea: Record<string, number> = {
      saadiyat: 0,
      "yas-island": 0,
      "al-ghadeer": 0,
      other: 0,
    };
    let aldarResale = 0;
    let primaryLive = 0;
    for (const it of all) {
      byArea[it.area] = (byArea[it.area] ?? 0) + 1;
      if (it.source === "aldar-resale") aldarResale += 1;
      else primaryLive += 1;
    }
    return {
      total: all.length,
      aldar_resale: aldarResale,
      primary_live: primaryLive,
      by_area: byArea,
    };
  }),

  /**
   * Public list — applies filters and returns a paginated card array.
   * No login or passcode required.
   */
  list: publicProcedure
    .input(
      z
        .object({
          query: z.string().max(128).optional(),
          source: z
            .enum(["all", "aldar-resale", "primary-live"])
            .optional()
            .default("all"),
          area: z
            .enum(["all", "saadiyat", "yas-island", "al-ghadeer", "other"])
            .optional()
            .default("all"),
          bedrooms: z
            .enum(["all", "studio", "1", "2", "3", "4", "5+"])
            .optional()
            .default("all"),
          minPrice: z.number().int().nonnegative().optional(),
          maxPrice: z.number().int().nonnegative().optional(),
          sort: z
            .enum(["price-asc", "price-desc", "area"])
            .optional()
            .default("price-desc"),
          limit: z.number().int().min(1).max(2000).optional().default(800),
        })
        .optional()
        .default(() => ({
          source: "all" as const,
          area: "all" as const,
          bedrooms: "all" as const,
          sort: "price-desc" as const,
          limit: 800,
        })),
    )
    .query(({ input }) => {
      const all = getAllListings();
      const q = (input.query ?? "").trim().toLowerCase();
      let items = all.slice();
      if (input.source !== "all") items = items.filter(it => it.source === input.source);
      if (input.area !== "all") items = items.filter(it => it.area === input.area);
      if (input.bedrooms !== "all") {
        items = items.filter(it => {
          const b = it.bedrooms;
          if (input.bedrooms === "studio") return b === 0;
          if (input.bedrooms === "5+") return typeof b === "number" && b >= 5;
          const want = parseInt(input.bedrooms, 10);
          return b === want;
        });
      }
      if (input.minPrice != null) {
        items = items.filter(
          it => (it.price_aed ?? Number.POSITIVE_INFINITY) >= input.minPrice!,
        );
      }
      if (input.maxPrice != null) {
        items = items.filter(
          it => (it.price_aed ?? Number.NEGATIVE_INFINITY) <= input.maxPrice!,
        );
      }
      if (q) {
        items = items.filter(it => {
          const hay = [
            it.unit_number,
            it.project_name,
            it.area_label,
            it.unit_type,
            it.building_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
      }
      // Sort
      items.sort((a, b) => {
        if (input.sort === "area") {
          if (a.area !== b.area) return a.area.localeCompare(b.area);
          return a.project_name.localeCompare(b.project_name);
        }
        const av = a.price_aed ?? -1;
        const bv = b.price_aed ?? -1;
        if (input.sort === "price-asc") return av - bv;
        return bv - av;
      });
      const truncated = items.length > input.limit;
      return {
        total_in_dataset: all.length,
        total_after_filters: items.length,
        truncated,
        items: items.slice(0, input.limit),
      };
    }),
});

// Exposed for tests / introspection
export const _internal = { getAllListings };
