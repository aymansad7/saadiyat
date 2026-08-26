/**
 * Lagoons tRPC router — serves lagoons data from server-side JSON.
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LagoonsVilla {
  unit_name: string;
  cluster: string;
  [key: string]: any;
}

interface LagoonsDataset {
  total_villas: number;
  summary?: Record<string, any>;
  villas: LagoonsVilla[];
}

export function summarizeLagoonsVillas(villas: LagoonsVilla[]) {
  const summary: Record<string, {
    total: number;
    by_model: Record<string, number>;
    corners: number;
    edges: number;
  }> = {};

  for (const villa of villas) {
    const cluster = villa.cluster;
    if (!summary[cluster]) {
      summary[cluster] = { total: 0, by_model: {}, corners: 0, edges: 0 };
    }
    const current = summary[cluster];
    current.total += 1;
    const model = villa.model || (villa.bedrooms ? `${villa.bedrooms}BHK` : "Unknown");
    current.by_model[model] = (current.by_model[model] ?? 0) + 1;
    if (villa.is_corner === true) current.corners += 1;
    if (villa.is_edge === true) current.edges += 1;
  }

  return summary;
}

let _cache: LagoonsDataset | null = null;
function loadLagoons(): LagoonsDataset {
  if (_cache) return _cache;
  const { resolve } = path;
  const candidates = [
    resolve(__dirname, "..", "data", "lagoons.json"),
    resolve(__dirname, "data", "lagoons.json"),
    resolve(process.cwd(), "server", "data", "lagoons.json"),
    resolve(process.cwd(), "dist", "data", "lagoons.json"),
    resolve(process.cwd(), "data", "lagoons.json"),
  ];
  let raw: string | undefined;
  for (const p of candidates) {
    try {
      raw = fs.readFileSync(p, "utf-8");
      break;
    } catch { /* try next */ }
  }
  if (!raw) throw new Error(`lagoons.json not found in any of: ${candidates.join(", ")}`);
  _cache = JSON.parse(raw) as LagoonsDataset;
  return _cache;
}

export const lagoonsRouter = router({
  /** Get dataset summary (no villa details — lightweight) */
  summary: publicProcedure.query(() => {
    const ds = loadLagoons();
    return { total_villas: ds.total_villas, summary: summarizeLagoonsVillas(ds.villas) };
  }),

  /** Get all villas for a specific cluster */
  villasByCluster: publicProcedure
    .input(z.object({ cluster: z.string() }))
    .query(({ input }) => {
      const ds = loadLagoons();
      return ds.villas.filter(v => v.cluster === input.cluster);
    }),

  /** Get every villa whose Aldar unit/building-section code explicitly identifies an SL phase. */
  villasByPhase: publicProcedure
    .input(z.object({ phase: z.enum(["SL2", "SL3", "SL4", "SL5", "SL7", "SL8"]) }))
    .query(({ input }) => {
      const ds = loadLagoons();
      const expression = new RegExp(`(?:^|[-\\s])${input.phase}(?:[-\\s]|$)`, "i");
      return ds.villas.filter((villa) => {
        const aldar = villa.aldar_data ?? {};
        return expression.test(`${aldar.building_section ?? ""} ${aldar.aldar_unit_name ?? ""}`);
      });
    }),

  /** Get a single villa by unit_name */
  villa: publicProcedure
    .input(z.object({ unitName: z.string() }))
    .query(({ input }) => {
      const ds = loadLagoons();
      return ds.villas.find(v => v.unit_name === input.unitName) ?? null;
    }),

  /** Search villas by unit name */
  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(({ input }) => {
      const ds = loadLagoons();
      const q = input.query.toLowerCase();
      const limit = input.limit ?? 30;
      const results: LagoonsVilla[] = [];
      for (const v of ds.villas) {
        if (v.unit_name?.toLowerCase().includes(q)) {
          results.push(v);
          if (results.length >= limit) break;
        }
      }
      return results;
    }),

  /** Get all villas (paginated) */
  allVillas: publicProcedure
    .input(z.object({ offset: z.number().optional(), limit: z.number().optional() }))
    .query(({ input }) => {
      const ds = loadLagoons();
      const offset = input.offset ?? 0;
      const limit = input.limit ?? 100;
      return {
        villas: ds.villas.slice(offset, offset + limit),
        total: ds.villas.length,
      };
    }),
});
