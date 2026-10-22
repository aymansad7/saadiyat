/**
 * Global unit search — searches across ALL datasets (Saadiyat, Other, Lagoons)
 * by unit name/number substring. Protected: requires at least an authenticated user.
 *
 * Returns up to 30 matching units with project/building context and a deep link
 * so the frontend can navigate directly to the unit detail page.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { propertyAccessGrants } from "../../drizzle/schema";
import { getPropertyScope, resolvePropertyPermissions, type GrantLike, type PropertyScope } from "../../shared/propertyAccess";
import { SAADIYAT_RESERVE_RECORDS } from "../../client/src/data/saadiyatReserve";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SearchableUnit = {
  unitName: string;
  projectName: string;
  projectSlug: string;
  buildingName: string | null;
  buildingSlug: string | null;
  dataset: "saadiyat" | "other" | "lagoons" | "reserve";
  status: string | null;
  priceAed: number | null;
  bedrooms: string | null;
  unitType: string | null;
  areaSqm: number | null;
  areaSqft: number | null;
  /** Frontend route to the unit detail page */
  href: string;
};

/** Internal-only authorization data. It is intentionally removed before any API response. */
export type ScopedSearchableUnit = SearchableUnit & {
  scope: PropertyScope;
  priceAedRequiresOriginalPricePermission: boolean;
};

// ---------------------------------------------------------------------------
// Data loading (cached in-process)
// ---------------------------------------------------------------------------
let UNITS: ScopedSearchableUnit[] | null = null;
const SQFT_PER_SQM = 10.764;

function getAreaSqm(unit: {
  plot_area_sqm?: number | null;
  total_area_sqm?: number | null;
  saleable_area_sqm?: number | null;
}): number | null {
  return unit.plot_area_sqm ?? unit.total_area_sqm ?? unit.saleable_area_sqm ?? null;
}

function matchesAreaSearch(query: string, unit: SearchableUnit): boolean {
  const normalized = query.toLowerCase().replace(/,/g, "").replace(/²/g, "2");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match || unit.areaSqm == null || unit.areaSqft == null) return false;
  const target = Number(match[0]);
  if (!Number.isFinite(target)) return false;
  const explicitSqft = /\b(sq\s*ft|sqft|ft2|feet|foot)\b/.test(normalized);
  const explicitSqm = /\b(sq\s*m|sqm|m2|meter|metre)\b/.test(normalized);
  const numericOnly = /^[\s\d.]+$/.test(normalized);
  if (!explicitSqft && !explicitSqm && !numericOnly) return false;
  const close = (actual: number, minimumTolerance: number) =>
    Math.abs(actual - target) <= Math.max(minimumTolerance, target * 0.001);
  if (explicitSqft) return close(unit.areaSqft, 10);
  if (explicitSqm) return close(unit.areaSqm, 1);
  return close(unit.areaSqm, 1) || close(unit.areaSqft, 10);
}

/** Removes punctuation and spacing so SC 362, SC-362, and SC362 are equivalent. */
export function normalizeUnitSearch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Returns a score only when all meaningful input tokens exist in documented
 * unit, project, building, or type data. It never infers an association.
 */
export function scoreSmartUnitSearch(query: string, unit: SearchableUnit): number {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(normalizeUnitSearch)
    .filter(Boolean);
  if (!tokens.length) return 0;

  const exactUnit = normalizeUnitSearch(unit.unitName);
  const searchable = normalizeUnitSearch(
    [unit.unitName, unit.projectName, unit.projectSlug, unit.buildingName, unit.buildingSlug, unit.unitType, unit.bedrooms]
      .filter(Boolean)
      .join(" "),
  );
  const normalizedQuery = normalizeUnitSearch(query);
  if (!tokens.every((token) => searchable.includes(token))) return 0;

  let score = tokens.length * 10;
  if (exactUnit === normalizedQuery) score += 1_000;
  else if (exactUnit.includes(normalizedQuery)) score += 500;
  if (searchable.includes(normalizedQuery)) score += 200;
  if (tokens.some((token) => /^\d+$/.test(token)) && tokens.some((token) => /[a-z]/.test(token))) score += 75;
  return score;
}

function lagoonsPhaseFromSource(unit: { aldar_data?: { building_section?: string | null; aldar_unit_name?: string | null } | null }): string | null {
  const source = `${unit.aldar_data?.building_section ?? ""} ${unit.aldar_data?.aldar_unit_name ?? ""}`;
  return source.match(/(?:^|[-\s])(SL(?:2|3|4|5|7|8))(?:[-\s]|$)/i)?.[1]?.toUpperCase() ?? null;
}

function loadAllUnits(): ScopedSearchableUnit[] {
  if (UNITS) return UNITS;

  const units: ScopedSearchableUnit[] = [];

  // Helper to resolve files from multiple candidate paths
  function readJson(file: string): string {
    const candidates = [
      resolve(__dirname, "..", "data", file),
      resolve(__dirname, "data", file),
      resolve(process.cwd(), "server", "data", file),
      resolve(process.cwd(), "dist", "data", file),
      resolve(process.cwd(), "data", file),
    ];
    for (const p of candidates) {
      try {
        return readFileSync(p, "utf-8");
      } catch {
        /* try next */
      }
    }
    throw new Error(`${file} not found`);
  }

  // --- Saadiyat ---
  try {
    const saadiyat = JSON.parse(readJson("aldar_saadiyat.json")) as {
      projects: {
        slug: string;
        name: string;
        buildings: {
          slug: string;
          name: string;
          units: { unit_name: string | null; status: string | null; price_aed: number | null; bedrooms: string | null; unit_type: string | null; plot_area_sqm?: number | null; total_area_sqm?: number | null; saleable_area_sqm?: number | null }[];
        }[];
      }[];
    };
    for (const p of saadiyat.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          if (!u.unit_name) continue;
          const areaSqm = getAreaSqm(u);
          units.push({
            unitName: u.unit_name,
            projectName: p.name,
            projectSlug: p.slug,
            buildingName: b.name,
            buildingSlug: b.slug,
            dataset: "saadiyat",
            status: u.status,
            priceAed: u.price_aed,
            bedrooms: u.bedrooms,
            unitType: u.unit_type,
            areaSqm,
            areaSqft: areaSqm != null ? Math.round(areaSqm * SQFT_PER_SQM * 100) / 100 : null,
            href: `/aldar-saadiyat/${p.slug}/${b.slug}/${encodeURIComponent(u.unit_name)}`,
            scope: {
              ...getPropertyScope(p.slug),
              buildingKey: b.slug,
              unitTypeKey: u.unit_type ?? null,
              bedrooms: u.bedrooms != null && /^\d+$/.test(u.bedrooms) ? Number(u.bedrooms) : null,
            },
            priceAedRequiresOriginalPricePermission: true,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[unitSearch] Failed to load saadiyat:", err);
  }

  // --- Other ---
  try {
    const other = JSON.parse(readJson("aldar_other.json")) as {
      projects: {
        slug: string;
        name: string;
        buildings: {
          slug: string;
          name: string;
          units: { unit_name: string | null; status: string | null; price_aed: number | null; bedrooms: string | null; unit_type: string | null; plot_area_sqm?: number | null; total_area_sqm?: number | null; saleable_area_sqm?: number | null }[];
        }[];
      }[];
    };
    for (const p of other.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          if (!u.unit_name) continue;
          const areaSqm = getAreaSqm(u);
          units.push({
            unitName: u.unit_name,
            projectName: p.name,
            projectSlug: p.slug,
            buildingName: b.name,
            buildingSlug: b.slug,
            dataset: "other",
            status: u.status,
            priceAed: u.price_aed,
            bedrooms: u.bedrooms,
            unitType: u.unit_type,
            areaSqm,
            areaSqft: areaSqm != null ? Math.round(areaSqm * SQFT_PER_SQM * 100) / 100 : null,
            href: `/aldar-other/${p.slug}/${b.slug}/${encodeURIComponent(u.unit_name)}`,
            scope: {
              ...getPropertyScope(p.slug),
              buildingKey: b.slug,
              unitTypeKey: u.unit_type ?? null,
              bedrooms: u.bedrooms != null && /^\d+$/.test(u.bedrooms) ? Number(u.bedrooms) : null,
            },
            priceAedRequiresOriginalPricePermission: true,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[unitSearch] Failed to load other:", err);
  }

  // --- Lagoons ---
  try {
    const lagoons = JSON.parse(readJson("lagoons.json")) as {
      villas: {
        unit_name: string;
        villa_key: string;
        cluster: string;
        cluster_label: string;
        status: string | null;
        price_aed?: number | null;
        bedrooms?: number | null;
        type?: string | null;
        plot_area_sqm?: number | null;
        total_area_sqm?: number | null;
        saleable_area_sqm?: number | null;
        aldar_data?: { building_section?: string | null; aldar_unit_name?: string | null } | null;
      }[];
    };
    for (const v of lagoons.villas) {
      if (!v.unit_name) continue;
      const areaSqm = getAreaSqm(v);
      units.push({
        unitName: v.unit_name,
        projectName: "Saadiyat Lagoons",
        projectSlug: "saadiyat-lagoons",
        buildingName: v.cluster_label || v.cluster,
        buildingSlug: v.cluster,
        dataset: "lagoons",
        status: v.status,
        priceAed: v.price_aed ?? null,
        bedrooms: v.bedrooms != null ? String(v.bedrooms) : null,
        unitType: v.type ?? "Villa",
            areaSqm,
            areaSqft: areaSqm != null ? Math.round(areaSqm * SQFT_PER_SQM * 100) / 100 : null,
            href: `/saadiyat-lagoons/${v.cluster}/${v.villa_key}`,
            scope: {
              ...getPropertyScope("lagoons"),
              phaseKey: lagoonsPhaseFromSource(v),
              buildingKey: v.cluster,
              unitTypeKey: v.type ?? null,
              bedrooms: v.bedrooms ?? null,
            },
            priceAedRequiresOriginalPricePermission: true,
          });
    }
  } catch (err) {
    console.warn("[unitSearch] Failed to load lagoons:", err);
  }

  // Reserve and Dunes are maintained in their official master-plan registry,
  // rather than the generic Aldar catalogue. Include them by exact plot/villa
  // identity so a scoped user can search the same units they may open.
  for (const record of SAADIYAT_RESERVE_RECORDS) {
    const unitName = record.dunes?.unitName ?? record.label;
    const bedrooms = record.dunes?.bedrooms ?? record.saleInventory?.bedrooms ?? null;
    const unitType = record.dunes?.villaType ?? record.saleInventory?.unitType ?? "Residential Land";
    const areaSqm = record.dunes?.totalAreaSqm ?? record.saleInventory?.landAreaSqm ?? record.plotAreaSqm;
    units.push({
      unitName,
      projectName: "Saadiyat Reserve",
      projectSlug: "saadiyat-reserve",
      buildingName: `Phase ${record.phase}`,
      buildingSlug: `phase-${record.phase}`,
      dataset: "reserve",
      status: record.availability === "available_for_sale" ? "Available" : record.availability === "sold" ? "Sold" : record.dunes?.launchStatus ?? null,
      priceAed: record.askingPriceAed ?? record.dunes?.launchPriceAed ?? null,
      bedrooms: bedrooms != null ? String(bedrooms) : null,
      unitType,
      areaSqm,
      areaSqft: areaSqm != null ? Math.round(areaSqm * SQFT_PER_SQM * 100) / 100 : null,
      href: `/saadiyat-reserve?plot=${record.plotNumber}`,
      scope: {
        ...getPropertyScope("saadiyat-reserve"),
        phaseKey: `PHASE-${record.phase}`,
        unitTypeKey: unitType,
        bedrooms,
        inventoryKey: record.inventoryKind,
      },
      priceAedRequiresOriginalPricePermission: true,
    });
  }

  UNITS = units;
  return units;
}

/** Force-reload the search index (called after data import). */
export function invalidateSearchIndex() {
  UNITS = null;
}

async function grantsForEmail(email: string | null | undefined): Promise<GrantLike[]> {
  if (!email) return [];
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.email, email.toLowerCase()));
}

function publicSearchResult(unit: ScopedSearchableUnit, canViewOriginalPrice: boolean): SearchableUnit {
  const { scope: _scope, priceAedRequiresOriginalPricePermission, ...result } = unit;
  return {
    ...result,
    priceAed: priceAedRequiresOriginalPricePermission && !canViewOriginalPrice ? null : result.priceAed,
  };
}

/**
 * Server-authoritative search projection. It prevents a result from exposing an
 * inaccessible unit or returning a link which that user cannot subsequently open.
 * Other Aldar remains Master-only until its underlying routers use the same
 * scope-aware guard.
 */
export function visibleSearchUnitsForUser(
  units: readonly ScopedSearchableUnit[],
  role: string | null | undefined,
  grants: GrantLike[],
): SearchableUnit[] {
  return units.flatMap(unit => {
    if (unit.dataset === "other" && role !== "master") return [];
    const permissions = resolvePropertyPermissions(role, grants, unit.scope);
    return permissions.canAccess ? [publicSearchResult(unit, permissions.canViewOriginalPrice)] : [];
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const unitSearchRouter = router({
  /**
   * Search units by name/number substring. Case-insensitive.
   * Returns up to `limit` results (default 30, max 100).
   */
  search: protectedProcedure
    .input(
      z.object({
        q: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(100).optional().default(30),
        /** Optionally restrict to a single dataset */
        dataset: z.enum(["saadiyat", "other", "lagoons", "reserve"]).optional(),
        /** Optionally restrict to a single project slug */
        projectSlug: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const grants = await grantsForEmail(ctx.user.email);
      const all = visibleSearchUnitsForUser(loadAllUnits(), ctx.user.role, grants);
      const rankedResults: Array<{ unit: SearchableUnit; score: number }> = [];

      for (const u of all) {
        if (input.dataset && u.dataset !== input.dataset) continue;
        if (input.projectSlug && u.projectSlug !== input.projectSlug) continue;
        const smartScore = scoreSmartUnitSearch(input.q, u);
        if (smartScore > 0) rankedResults.push({ unit: u, score: smartScore });
        else if (matchesAreaSearch(input.q, u)) rankedResults.push({ unit: u, score: 1 });
      }

      const results = rankedResults
        .sort((a, b) => b.score - a.score || a.unit.projectName.localeCompare(b.unit.projectName) || a.unit.unitName.localeCompare(b.unit.unitName))
        .slice(0, input.limit)
        .map(({ unit }) => unit);
      return { results, total: results.length };
    }),

  /**
   * Global filter: find units across ALL projects by status, bedrooms, price range.
   * Public so it can be used without login (behind passcode gate anyway).
   * Use case: "show me all available 1BR units across all projects"
   */
  filter: protectedProcedure
    .input(
      z.object({
        availableOnly: z.boolean().optional().default(true),
        bedrooms: z.string().optional(), // "1", "2", "3", "4", "5", "Studio"
        dataset: z.enum(["saadiyat", "other", "lagoons", "reserve", "all"]).optional().default("all"),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        areaMinSqm: z.number().nonnegative().optional(),
        areaMaxSqm: z.number().nonnegative().optional(),
        limit: z.number().int().min(1).max(1000).optional().default(500),
      }),
    )
    .query(async ({ input, ctx }) => {
      const grants = await grantsForEmail(ctx.user.email);
      const all = visibleSearchUnitsForUser(loadAllUnits(), ctx.user.role, grants);
      const results: SearchableUnit[] = [];
      for (const u of all) {
        if (results.length >= input.limit) break;
        if (input.dataset !== "all" && u.dataset !== input.dataset) continue;
        if (input.availableOnly) {
          const s = (u.status ?? "").toLowerCase();
          if (s !== "available" && s !== "new") continue;
        }
        if (input.bedrooms) {
          const bed = (u.bedrooms ?? "").toLowerCase();
          const target = input.bedrooms.toLowerCase();
          if (target === "studio") {
            if (bed !== "studio" && bed !== "0") continue;
          } else {
            if (bed !== target) continue;
          }
        }
        if (input.priceMin != null && (u.priceAed == null || u.priceAed < input.priceMin)) continue;
        if (input.priceMax != null && (u.priceAed == null || u.priceAed > input.priceMax)) continue;
        if (input.areaMinSqm != null && (u.areaSqm == null || u.areaSqm < input.areaMinSqm)) continue;
        if (input.areaMaxSqm != null && (u.areaSqm == null || u.areaSqm > input.areaMaxSqm)) continue;
        results.push(u);
      }
      return { results, total: results.length };
    }),
});
