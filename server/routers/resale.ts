/**
 * Resale router — surfaces Aldar resale asking prices and matches each row to
 * the corresponding unit/villa in our inventory (Saadiyat + Other).
 *
 * Visibility:
 *   - admin & master can read any resale data scoped to Saadiyat
 *   - master can additionally read resale rows for Other Aldar projects
 *
 * Data source: server/data/aldar_resale.json (built by aldar_resale/build_resale.py)
 */
import { TRPCError } from "@trpc/server";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { adminProcedure, masterProcedure, router } from "../_core/trpc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ResaleItem = {
  property_id: number | string;
  unit_number: string;
  project_resale_name: string;
  community_location: string;
  asking_price_aed: number | null;
  reservation_amount: number | null;
  unit_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  saleable_area_sqft: number | null;
  car_park: number | null;
  completion_date: string | null;
  launch_date: string | null;
  off_plan: boolean;
  is_resale: boolean;
  digital_sales: boolean;
  aldar_url: string | null;
  matched: boolean;
  area?: "saadiyat" | "other";
  project_slug?: string;
  project_name?: string;
  building_slug?: string | null;
  building_name?: string | null;
  inventory_status?: string | null;
  inventory_price_aed?: number | null;
};

type Dataset = {
  exported_at: string;
  total: number;
  matched: number;
  unmatched: number;
  ignored: number;
  items: ResaleItem[];
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
let DATA: Dataset | null = null;
let BY_UNIT: Map<string, ResaleItem[]> | null = null;

function loadDataset(): Dataset {
  if (DATA) return DATA;
  const candidates = [
    resolve(__dirname, "..", "data", "aldar_resale.json"),
    resolve(__dirname, "data", "aldar_resale.json"),
    resolve(process.cwd(), "server", "data", "aldar_resale.json"),
    resolve(process.cwd(), "dist", "data", "aldar_resale.json"),
    resolve(process.cwd(), "data", "aldar_resale.json"),
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
    console.error(
      "[resale] Failed to load aldar_resale.json from any of:",
      candidates,
      lastErr,
    );
    throw new Error("Resale dataset not found on server");
  }
  DATA = JSON.parse(raw) as Dataset;
  // Build index by unit_number for O(1) lookups
  BY_UNIT = new Map();
  for (const item of DATA.items) {
    if (!item.unit_number) continue;
    const key = item.unit_number;
    const arr = BY_UNIT.get(key) ?? [];
    arr.push(item);
    BY_UNIT.set(key, arr);
  }
  return DATA;
}

function getIndex(): Map<string, ResaleItem[]> {
  if (!BY_UNIT) loadDataset();
  return BY_UNIT!;
}

function isOtherArea(item: ResaleItem) {
  return item.matched && item.area === "other";
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const resaleRouter = router({
  /**
   * Get resale rows for a specific unit (by inventory unit_name OR aldar_unit_name).
   * Admins see Saadiyat-only; masters see everything.
   */
  forUnit: adminProcedure
    .input(
      z.object({
        unitNames: z.array(z.string().min(1).max(256)).min(1).max(8),
      }),
    )
    .query(({ ctx, input }) => {
      const idx = getIndex();
      const role = ctx.user.role;
      const isMaster = role === "master";
      const out: ResaleItem[] = [];
      for (const name of input.unitNames) {
        const hits = idx.get(name) ?? [];
        for (const h of hits) {
          if (!isMaster && isOtherArea(h)) continue;
          out.push(h);
        }
      }
      return { items: out };
    }),

  /**
   * Browse all resale rows. Admins see Saadiyat only; masters see all.
   * Supports search and basic filters. Capped at 500 items.
   */
  list: adminProcedure
    .input(
      z
        .object({
          query: z.string().max(128).optional(),
          area: z.enum(["all", "saadiyat", "other"]).optional().default("all"),
          matchedOnly: z.boolean().optional().default(false),
          minPrice: z.number().int().nonnegative().optional(),
          maxPrice: z.number().int().nonnegative().optional(),
          limit: z.number().int().min(1).max(1000).optional().default(500),
        })
        .optional()
        .default(() => ({
          area: "all" as const,
          matchedOnly: false,
          limit: 500,
        })),
    )
    .query(({ ctx, input }) => {
      const data = loadDataset();
      const role = ctx.user.role;
      const isMaster = role === "master";
      const q = (input.query ?? "").trim().toLowerCase();

      let items = data.items.slice();
      if (!isMaster) items = items.filter(it => !isOtherArea(it));
      if (input.area === "saadiyat")
        items = items.filter(
          it => it.matched && it.area === "saadiyat",
        );
      if (input.area === "other")
        items = items.filter(it => it.matched && it.area === "other");
      if (input.matchedOnly) items = items.filter(it => it.matched);
      if (input.minPrice != null)
        items = items.filter(
          it => (it.asking_price_aed ?? Number.POSITIVE_INFINITY) >= input.minPrice!,
        );
      if (input.maxPrice != null)
        items = items.filter(
          it => (it.asking_price_aed ?? Number.NEGATIVE_INFINITY) <= input.maxPrice!,
        );
      if (q.length > 0) {
        items = items.filter(it => {
          const hay = [
            it.unit_number,
            it.project_resale_name,
            it.project_name,
            it.community_location,
            it.unit_type,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
      }
      // Sort by asking price descending, nulls last
      items.sort((a, b) => {
        const av = a.asking_price_aed ?? -1;
        const bv = b.asking_price_aed ?? -1;
        return bv - av;
      });

      const truncated = items.length > input.limit;
      return {
        exported_at: data.exported_at,
        total_in_dataset: data.items.length,
        total_after_filters: items.length,
        truncated,
        items: items.slice(0, input.limit),
      };
    }),

  /** Aggregate counts. Useful for the dashboard rail. */
  summary: adminProcedure.query(({ ctx }) => {
    const data = loadDataset();
    const isMaster = ctx.user.role === "master";
    const visible = isMaster
      ? data.items
      : data.items.filter(it => !isOtherArea(it));
    let saadiyat = 0;
    let other = 0;
    let unmatched = 0;
    let totalAsking = 0;
    let priceCount = 0;
    for (const it of visible) {
      if (it.matched) {
        if (it.area === "saadiyat") saadiyat += 1;
        else if (it.area === "other") other += 1;
      } else {
        unmatched += 1;
      }
      if (typeof it.asking_price_aed === "number" && it.asking_price_aed > 0) {
        totalAsking += it.asking_price_aed;
        priceCount += 1;
      }
    }
    return {
      exported_at: data.exported_at,
      visible: visible.length,
      saadiyat,
      other,
      unmatched,
      avg_asking_aed: priceCount ? Math.round(totalAsking / priceCount) : 0,
    };
  }),

  /**
   * Master-only: full unmatched list so we can investigate keying issues.
   */
  unmatched: masterProcedure.query(() => {
    const data = loadDataset();
    return {
      items: data.items.filter(it => !it.matched),
    };
  }),
});

// Exposed for tests
export const _internal = { loadDataset, getIndex };
