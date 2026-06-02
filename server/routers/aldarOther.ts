/**
 * Aldar Other Projects router (Yas Island / Reeman / Al Ghadeer / etc.).
 *
 * Visibility: ONLY users with role="master" can call any procedure here.
 * Even regular "admin" users are blocked.
 *
 * Data source: server-side JSON at /server/data/aldar_other.json
 * (loaded once at import time so requests are O(lookup)).
 */
import { TRPCError } from "@trpc/server";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { masterProcedure, router } from "../_core/trpc";
import { areaForProject, orderedAreas, type AreaKey } from "../aldarAreas";

// ---------------------------------------------------------------------------
// Types (mirror the JSON shape produced by consolidate_other.py)
// ---------------------------------------------------------------------------
export type AldarOtherUnit = {
  unit_name: string | null;
  aldar_link: string | null;
  unit_type: string | null;
  unit_category: string | null;
  unit_model: string | null;
  bedrooms: string | null;
  total_rooms: string | null;
  status: string | null;
  price_aed: number | null;
  reservation_amount: number | null;
  online_reservation_fee: number | null;
  plot_area_sqm: number | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
  terrace_area_sqm: number | null;
  balcony_area_sqm: number | null;
  service_charge_aed_sqm: number | null;
  service_charge_escalation_pct: number | null;
  car_parks: number | null;
  unit_finishes: string | null;
  features_spec: string | null;
  inventory_category: string | null;
  property_status: string | null;
  mandatory_pool: boolean | null;
  mandatory_premium: boolean | null;
  darna_applicable: boolean | null;
  virtual_tour: string | null;
  payment_plans: string | null;
  building_section: string | null;
  project_field: string | null;
};

export type AldarOtherBuilding = {
  slug: string;
  name: string;
  unit_count: number;
  available_count: number;
  units: AldarOtherUnit[];
};

export type AldarOtherProject = {
  slug: string;
  name: string;
  area: "other";
  source_file: string;
  unit_count: number;
  available_count: number;
  building_count: number;
  buildings: AldarOtherBuilding[];
};

type Dataset = {
  exported_at: string;
  area: "other";
  project_count: number;
  total_units: number;
  total_available: number;
  projects: AldarOtherProject[];
};

// ---------------------------------------------------------------------------
// Loader (cached for the lifetime of the process)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
let DATA: Dataset | null = null;
export function getDataset(): Dataset {
  if (DATA) return DATA;
  // Try multiple plausible locations so the file is found both in
  // development (tsx + server/data) and after esbuild bundling (dist/data).
  const candidates = [
    resolve(__dirname, "..", "data", "aldar_other.json"),
    resolve(__dirname, "data", "aldar_other.json"),
    resolve(process.cwd(), "server", "data", "aldar_other.json"),
    resolve(process.cwd(), "dist", "data", "aldar_other.json"),
    resolve(process.cwd(), "data", "aldar_other.json"),
  ];
  let raw: string | null = null;
  let lastErr: unknown = null;
  for (const p of candidates) {
    try {
      raw = readFileSync(p, "utf-8");
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!raw) {
    console.error("[aldarOther] Failed to load aldar_other.json from any of:", candidates, lastErr);
    throw new Error("Aldar Other dataset not found on server");
  }
  DATA = JSON.parse(raw) as Dataset;
  return DATA;
}

export function statusGroup(status: string | null): string {
  const s = (status || "").trim().toLowerCase();
  if (s === "available") return "available";
  if (s === "new") return "new";
  if (s === "booked") return "booked";
  if (s === "blocked") return "blocked";
  if (s === "reserved") return "reserved";
  if (s === "sold") return "sold";
  return "other";
}

type StatusBreakdown = {
  available: number;
  new: number;
  booked: number;
  blocked: number;
  reserved: number;
  sold: number;
  other: number;
  total: number;
};

export function breakdown(units: { status: string | null }[]): StatusBreakdown {
  const out: StatusBreakdown = {
    available: 0,
    new: 0,
    booked: 0,
    blocked: 0,
    reserved: 0,
    sold: 0,
    other: 0,
    total: 0,
  };
  for (const u of units) {
    const k = statusGroup(u.status) as keyof Omit<StatusBreakdown, "total">;
    out[k] += 1;
    out.total += 1;
  }
  return out;
}

const LIVE_STATUSES = new Set(["available", "new", "booked", "blocked", "reserved"]);
export function isLive(s: string | null) {
  return LIVE_STATUSES.has(statusGroup(s));
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const aldarOtherRouter = router({
  /**
   * Projects grouped by Area, with optional filters applied to the per-project
   * aggregates. Each project carries a price range (min/max over live units),
   * status breakdown, and live/available counts so the UI can render rich cards
   * and filter without fetching unit-level detail.
   *
   * Filters:
   *  - availableOnly: keep only projects that have >=1 available unit
   *  - priceMin/priceMax (AED): keep projects whose live price range overlaps
   *  - q: case-insensitive match on project name
   */
  listByArea: masterProcedure
    .input(
      z
        .object({
          availableOnly: z.boolean().optional().default(false),
          priceMin: z.number().int().min(0).optional(),
          priceMax: z.number().int().min(0).optional(),
          q: z.string().max(128).optional(),
        })
        .optional()
        .default(() => ({ availableOnly: false })),
    )
    .query(({ input }) => {
      const data = getDataset();
      const q = (input.q || "").trim().toLowerCase();

      type ProjectCard = {
        slug: string;
        name: string;
        area: AreaKey;
        unit_count: number;
        building_count: number;
        breakdown: ReturnType<typeof breakdown>;
        live_count: number;
        available_count: number;
        price_min: number | null;
        price_max: number | null;
      };

      const cards: ProjectCard[] = [];
      for (const p of data.projects) {
        const allUnits = p.buildings.flatMap(b => b.units);
        const liveUnits = allUnits.filter(u => isLive(u.status));
        const livePrices = liveUnits
          .map(u => u.price_aed)
          .filter((n): n is number => typeof n === "number" && n > 0);
        const priceMin = livePrices.length ? Math.min(...livePrices) : null;
        const priceMax = livePrices.length ? Math.max(...livePrices) : null;
        const availableCount = allUnits.filter(u => statusGroup(u.status) === "available").length;

        // Apply filters at the project level.
        if (input.availableOnly && availableCount === 0) continue;
        if (q && !p.name.toLowerCase().includes(q)) continue;
        if (input.priceMin != null || input.priceMax != null) {
          // Need a price range to compare; drop projects without live prices.
          if (priceMin == null || priceMax == null) continue;
          if (input.priceMin != null && priceMax < input.priceMin) continue;
          if (input.priceMax != null && priceMin > input.priceMax) continue;
        }

        cards.push({
          slug: p.slug,
          name: p.name,
          area: areaForProject(p.slug),
          unit_count: p.unit_count,
          building_count: p.building_count,
          breakdown: breakdown(allUnits),
          live_count: liveUnits.length,
          available_count: availableCount,
          price_min: priceMin,
          price_max: priceMax,
        });
      }

      // Group into ordered areas; drop empty areas.
      const areas = orderedAreas()
        .map(meta => {
          const projects = cards
            .filter(c => c.area === meta.key)
            .sort(
              (a, b) =>
                b.available_count - a.available_count ||
                b.live_count - a.live_count ||
                a.name.localeCompare(b.name),
            );
          const areaAvailable = projects.reduce((s, c) => s + c.available_count, 0);
          const areaLive = projects.reduce((s, c) => s + c.live_count, 0);
          const areaUnits = projects.reduce((s, c) => s + c.unit_count, 0);
          return {
            key: meta.key,
            name: meta.name,
            nameAr: meta.nameAr,
            project_count: projects.length,
            unit_count: areaUnits,
            live_count: areaLive,
            available_count: areaAvailable,
            projects,
          };
        })
        .filter(a => a.project_count > 0);

      return {
        exported_at: data.exported_at,
        total_units: data.total_units,
        total_available: data.total_available,
        matched_projects: cards.length,
        areas,
      };
    }),

  /** Lightweight summary across all projects (no per-unit detail). */
  listProjects: masterProcedure.query(() => {
    const data = getDataset();
    const projects = data.projects.map(p => {
      // Aggregate breakdown across all buildings
      const allUnits = p.buildings.flatMap(b => b.units);
      return {
        slug: p.slug,
        name: p.name,
        unit_count: p.unit_count,
        building_count: p.building_count,
        breakdown: breakdown(allUnits),
        live_count: allUnits.filter(u => isLive(u.status)).length,
      };
    });
    projects.sort((a, b) => b.live_count - a.live_count || a.name.localeCompare(b.name));
    return {
      exported_at: data.exported_at,
      project_count: data.project_count,
      total_units: data.total_units,
      total_available: data.total_available,
      projects,
    };
  }),

  /** Project details: buildings (with breakdowns) but no per-unit detail. */
  getProject: masterProcedure
    .input(z.object({ slug: z.string().min(1).max(128) }))
    .query(({ input }) => {
      const data = getDataset();
      const p = data.projects.find(pp => pp.slug === input.slug);
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      return {
        slug: p.slug,
        name: p.name,
        source_file: p.source_file,
        unit_count: p.unit_count,
        building_count: p.building_count,
        buildings: p.buildings.map(b => ({
          slug: b.slug,
          name: b.name,
          unit_count: b.unit_count,
          breakdown: breakdown(b.units),
          live_count: b.units.filter(u => isLive(u.status)).length,
        })),
      };
    }),

  /** Building details: full unit list. */
  getBuilding: masterProcedure
    .input(
      z.object({
        projectSlug: z.string().min(1).max(128),
        buildingSlug: z.string().min(1).max(128),
      }),
    )
    .query(({ input }) => {
      const data = getDataset();
      const p = data.projects.find(pp => pp.slug === input.projectSlug);
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      const b = p.buildings.find(bb => bb.slug === input.buildingSlug);
      if (!b) throw new TRPCError({ code: "NOT_FOUND", message: "Building not found" });
      return {
        project: { slug: p.slug, name: p.name },
        slug: b.slug,
        name: b.name,
        unit_count: b.unit_count,
        breakdown: breakdown(b.units),
        units: b.units,
      };
    }),

  /** Single unit. */
  getUnit: masterProcedure
    .input(
      z.object({
        projectSlug: z.string().min(1).max(128),
        buildingSlug: z.string().min(1).max(128),
        unitName: z.string().min(1).max(256),
      }),
    )
    .query(({ input }) => {
      const data = getDataset();
      const p = data.projects.find(pp => pp.slug === input.projectSlug);
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      const b = p.buildings.find(bb => bb.slug === input.buildingSlug);
      if (!b) throw new TRPCError({ code: "NOT_FOUND", message: "Building not found" });
      const u = b.units.find(uu => uu.unit_name === input.unitName);
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Unit not found" });
      return {
        project: { slug: p.slug, name: p.name },
        building: { slug: b.slug, name: b.name },
        unit: u,
      };
    }),

  /**
   * Cross-project search by unit name. Returns up to 100 matches with the
   * minimum fields needed to render a result card and navigate.
   */
  searchUnits: masterProcedure
    .input(
      z.object({
        query: z.string().min(1).max(128),
        liveOnly: z.boolean().optional().default(false),
        limit: z.number().int().min(1).max(200).optional().default(100),
      }),
    )
    .query(({ input }) => {
      const data = getDataset();
      const q = input.query.trim().toLowerCase();
      const hits: Array<{
        projectSlug: string;
        projectName: string;
        buildingSlug: string;
        buildingName: string;
        unitName: string;
        status: string | null;
        price_aed: number | null;
        bedrooms: string | null;
        plot_area_sqm: number | null;
        total_area_sqm: number | null;
      }> = [];

      outer: for (const p of data.projects) {
        for (const b of p.buildings) {
          for (const u of b.units) {
            if (!u.unit_name) continue;
            if (!u.unit_name.toLowerCase().includes(q)) continue;
            if (input.liveOnly && !isLive(u.status)) continue;
            hits.push({
              projectSlug: p.slug,
              projectName: p.name,
              buildingSlug: b.slug,
              buildingName: b.name,
              unitName: u.unit_name,
              status: u.status,
              price_aed: u.price_aed,
              bedrooms: u.bedrooms,
              plot_area_sqm: u.plot_area_sqm,
              total_area_sqm: u.total_area_sqm,
            });
            if (hits.length >= input.limit) break outer;
          }
        }
      }
      return { hits };
    }),
});
