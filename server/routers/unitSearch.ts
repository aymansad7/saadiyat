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
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SearchableUnit = {
  unitName: string;
  projectName: string;
  projectSlug: string;
  buildingName: string | null;
  buildingSlug: string | null;
  dataset: "saadiyat" | "other" | "lagoons";
  status: string | null;
  priceAed: number | null;
  bedrooms: string | null;
  unitType: string | null;
  /** Frontend route to the unit detail page */
  href: string;
};

// ---------------------------------------------------------------------------
// Data loading (cached in-process)
// ---------------------------------------------------------------------------
let UNITS: SearchableUnit[] | null = null;

function loadAllUnits(): SearchableUnit[] {
  if (UNITS) return UNITS;

  const units: SearchableUnit[] = [];

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
          units: { unit_name: string | null; status: string | null; price_aed: number | null; bedrooms: string | null; unit_type: string | null }[];
        }[];
      }[];
    };
    for (const p of saadiyat.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          if (!u.unit_name) continue;
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
            href: `/aldar-saadiyat/${p.slug}/${b.slug}/${encodeURIComponent(u.unit_name)}`,
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
          units: { unit_name: string | null; status: string | null; price_aed: number | null; bedrooms: string | null; unit_type: string | null }[];
        }[];
      }[];
    };
    for (const p of other.projects) {
      for (const b of p.buildings) {
        for (const u of b.units) {
          if (!u.unit_name) continue;
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
            href: `/aldar-other/${p.slug}/${b.slug}/${encodeURIComponent(u.unit_name)}`,
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
      }[];
    };
    for (const v of lagoons.villas) {
      if (!v.unit_name) continue;
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
        href: `/saadiyat-lagoons/${v.cluster}/${v.villa_key}`,
      });
    }
  } catch (err) {
    console.warn("[unitSearch] Failed to load lagoons:", err);
  }

  UNITS = units;
  return units;
}

/** Force-reload the search index (called after data import). */
export function invalidateSearchIndex() {
  UNITS = null;
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
        dataset: z.enum(["saadiyat", "other", "lagoons"]).optional(),
        /** Optionally restrict to a single project slug */
        projectSlug: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      const all = loadAllUnits();
      const q = input.q.toLowerCase();
      const results: SearchableUnit[] = [];

      for (const u of all) {
        if (results.length >= input.limit) break;
        if (input.dataset && u.dataset !== input.dataset) continue;
        if (input.projectSlug && u.projectSlug !== input.projectSlug) continue;
        if (u.unitName.toLowerCase().includes(q)) {
          results.push(u);
        }
      }

      return { results, total: results.length };
    }),

  /**
   * Global filter: find units across ALL projects by status, bedrooms, price range.
   * Public so it can be used without login (behind passcode gate anyway).
   * Use case: "show me all available 1BR units across all projects"
   */
  filter: publicProcedure
    .input(
      z.object({
        availableOnly: z.boolean().optional().default(true),
        bedrooms: z.string().optional(), // "1", "2", "3", "4", "5", "Studio"
        dataset: z.enum(["saadiyat", "other", "lagoons", "all"]).optional().default("all"),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        limit: z.number().int().min(1).max(1000).optional().default(500),
      }),
    )
    .query(({ input }) => {
      const all = loadAllUnits();
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
        results.push(u);
      }
      return { results, total: results.length };
    }),
});
