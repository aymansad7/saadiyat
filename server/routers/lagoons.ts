/**
 * Lagoons tRPC router — serves lagoons data from server-side JSON.
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import fs from "fs";
import path from "path";

interface LagoonsVilla {
  unit_name: string;
  cluster: string;
  [key: string]: any;
}

interface LagoonsDataset {
  total_villas: number;
  summary: Record<string, any>;
  villas: LagoonsVilla[];
}

let _cache: LagoonsDataset | null = null;
function loadLagoons(): LagoonsDataset {
  if (_cache) return _cache;
  const p = path.resolve(import.meta.dirname, "../data/lagoons.json");
  _cache = JSON.parse(fs.readFileSync(p, "utf-8")) as LagoonsDataset;
  return _cache;
}

export const lagoonsRouter = router({
  /** Get dataset summary (no villa details — lightweight) */
  summary: publicProcedure.query(() => {
    const ds = loadLagoons();
    return { total_villas: ds.total_villas, summary: ds.summary };
  }),

  /** Get all villas for a specific cluster */
  villasByCluster: publicProcedure
    .input(z.object({ cluster: z.string() }))
    .query(({ input }) => {
      const ds = loadLagoons();
      return ds.villas.filter(v => v.cluster === input.cluster);
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
