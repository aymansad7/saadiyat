/**
 * Aldar Saadiyat Projects router.
 * Serves data from server/data/aldar_saadiyat.json via tRPC so the frontend
 * does NOT need to bundle the 7.8 MB JSON file.
 */
import { TRPCError } from "@trpc/server";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

// Reuse types from the Other router (same JSON shape)
export type SaadiyatUnit = {
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
type SaadiyatBuilding = {
  slug: string;
  name: string;
  unit_count: number;
  available_count: number;
  units: SaadiyatUnit[];
};
type SaadiyatProject = {
  slug: string;
  name: string;
  source_file: string;
  unit_count: number;
  available_count: number;
  building_count: number;
  buildings: SaadiyatBuilding[];
};
type Dataset = {
  exported_at: string;
  project_count: number;
  total_units: number;
  total_available: number;
  projects: SaadiyatProject[];
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
let DATA: Dataset | null = null;

export function getSaadiyatDataset(): Dataset {
  if (DATA) return DATA;
  const candidates = [
    resolve(__dirname, "..", "data", "aldar_saadiyat.json"),
    resolve(__dirname, "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "server", "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "dist", "data", "aldar_saadiyat.json"),
    resolve(process.cwd(), "data", "aldar_saadiyat.json"),
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
    console.error("[aldarSaadiyat] Failed to load aldar_saadiyat.json from any of:", candidates, lastErr);
    throw new Error("Aldar Saadiyat dataset not found on server");
  }
  DATA = JSON.parse(raw) as Dataset;
  return DATA;
}

function statusGroup(status: string | null): string {
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
  available: number; new: number; booked: number; blocked: number;
  reserved: number; sold: number; other: number; total: number;
};

function breakdown(units: { status: string | null }[]): StatusBreakdown {
  const out: StatusBreakdown = { available: 0, new: 0, booked: 0, blocked: 0, reserved: 0, sold: 0, other: 0, total: 0 };
  for (const u of units) {
    const k = statusGroup(u.status) as keyof Omit<StatusBreakdown, "total">;
    out[k] += 1;
    out.total += 1;
  }
  return out;
}

const LIVE_STATUSES = new Set(["available", "new", "booked", "blocked", "reserved"]);
function isLive(s: string | null) { return LIVE_STATUSES.has(statusGroup(s)); }

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const aldarSaadiyatRouter = router({
  /** List all projects with breakdowns (no unit-level detail). */
  listProjects: publicProcedure.query(() => {
    const data = getSaadiyatDataset();
    const projects = data.projects.map(p => {
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

  /** Project details: buildings with breakdowns. */
  getProject: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(128) }))
    .query(({ input }) => {
      const data = getSaadiyatDataset();
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
  getBuilding: publicProcedure
    .input(z.object({
      projectSlug: z.string().min(1).max(128),
      buildingSlug: z.string().min(1).max(128),
    }))
    .query(({ input }) => {
      const data = getSaadiyatDataset();
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

  /** Single unit detail. */
  getUnit: publicProcedure
    .input(z.object({
      projectSlug: z.string().min(1).max(128),
      buildingSlug: z.string().min(1).max(128),
      unitName: z.string().min(1).max(256),
    }))
    .query(({ input }) => {
      const data = getSaadiyatDataset();
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

  /** Search units by name. */
  searchUnits: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(128),
      liveOnly: z.boolean().optional().default(false),
      limit: z.number().int().min(1).max(200).optional().default(100),
    }))
    .query(({ input }) => {
      const data = getSaadiyatDataset();
      const q = input.query.trim().toLowerCase();
      const hits: Array<{
        projectSlug: string; projectName: string;
        buildingSlug: string; buildingName: string;
        unitName: string; status: string | null;
        price_aed: number | null; bedrooms: string | null;
      }> = [];
      outer: for (const p of data.projects) {
        for (const b of p.buildings) {
          for (const u of b.units) {
            if (!u.unit_name) continue;
            if (!u.unit_name.toLowerCase().includes(q)) continue;
            if (input.liveOnly && !isLive(u.status)) continue;
            hits.push({
              projectSlug: p.slug, projectName: p.name,
              buildingSlug: b.slug, buildingName: b.name,
              unitName: u.unit_name, status: u.status,
              price_aed: u.price_aed, bedrooms: u.bedrooms,
            });
            if (hits.length >= input.limit) break outer;
          }
        }
      }
      return { results: hits, total: hits.length };
    }),
});
