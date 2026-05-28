/**
 * Community-agnostic availability router.
 *
 * Public:
 *   - summary: counts per community per status per source (safe for landing page).
 *   - listForCommunity: lightweight listings (no contact info) for a community.
 *
 * Admin:
 *   - listAll: full rows for the admin panel.
 *   - create / update / delete: manage availability listings.
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  countAvailabilityByCommunity,
  deleteAvailability,
  getAvailabilityById,
  insertAvailability,
  listAvailability,
  updateAvailability,
} from "../db";

const sourceEnum = z.enum(["nas-luxury", "aldar", "others", "manual"]);
const statusEnum = z.enum(["available", "reserved", "sold", "off-market"]);

export const availabilityRouter = router({
  /** Public summary — counts grouped by community/status/source. */
  summary: publicProcedure.query(async () => {
    const rows = await countAvailabilityByCommunity();
    // Aggregate into a friendly shape:
    const byCommunity = new Map<
      string,
      {
        community: string;
        total: number;
        available: number;
        reserved: number;
        sold: number;
        offMarket: number;
        bySource: Record<string, number>;
      }
    >();
    for (const r of rows) {
      const cur =
        byCommunity.get(r.community) ?? {
          community: r.community,
          total: 0,
          available: 0,
          reserved: 0,
          sold: 0,
          offMarket: 0,
          bySource: {} as Record<string, number>,
        };
      cur.total += r.count;
      if (r.status === "available") cur.available += r.count;
      if (r.status === "reserved") cur.reserved += r.count;
      if (r.status === "sold") cur.sold += r.count;
      if (r.status === "off-market") cur.offMarket += r.count;
      cur.bySource[r.source] = (cur.bySource[r.source] ?? 0) + r.count;
      byCommunity.set(r.community, cur);
    }
    return {
      communities: Array.from(byCommunity.values()),
    };
  }),

  /** Public — visible listings for a community (no contactLabel). */
  listForCommunity: publicProcedure
    .input(
      z.object({
        community: z.string().min(1),
        status: statusEnum.optional(),
        source: sourceEnum.optional(),
      }),
    )
    .query(async ({ input }) => {
      const rows = await listAvailability({
        community: input.community,
        status: input.status,
        source: input.source,
      });
      // Strip contactLabel for non-admins:
      return rows.map(r => ({
        id: r.id,
        community: r.community,
        unitKey: r.unitKey,
        source: r.source,
        status: r.status,
        askingPriceAed: r.askingPriceAed,
        bedrooms: r.bedrooms,
        notes: r.notes,
        addedByName: r.addedByName,
        updatedAt: r.updatedAt,
        createdAt: r.createdAt,
      }));
    }),

  /** Admin — full rows. */
  listAll: adminProcedure
    .input(
      z
        .object({
          community: z.string().optional(),
          status: statusEnum.optional(),
          source: sourceEnum.optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return listAvailability(input);
    }),

  /** Admin — fetch one. */
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const row = await getAvailabilityById(input.id);
      if (!row) throw new Error("Listing not found");
      return row;
    }),

  /** Admin — create. */
  create: adminProcedure
    .input(
      z.object({
        community: z.string().min(1).max(64),
        unitKey: z.string().min(1).max(128),
        source: sourceEnum,
        status: statusEnum.default("available"),
        askingPriceAed: z.number().int().positive().nullable().optional(),
        bedrooms: z.number().int().positive().nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        contactLabel: z.string().max(128).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await insertAvailability({
        community: input.community,
        unitKey: input.unitKey,
        source: input.source,
        status: input.status,
        askingPriceAed: input.askingPriceAed ?? null,
        bedrooms: input.bedrooms ?? null,
        notes: input.notes ?? null,
        contactLabel: input.contactLabel ?? null,
        addedBy: String(ctx.user!.id),
        addedByName: ctx.user!.name ?? null,
      });
      return row;
    }),

  /** Admin — update. */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        community: z.string().min(1).max(64).optional(),
        unitKey: z.string().min(1).max(128).optional(),
        source: sourceEnum.optional(),
        status: statusEnum.optional(),
        askingPriceAed: z.number().int().positive().nullable().optional(),
        bedrooms: z.number().int().positive().nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        contactLabel: z.string().max(128).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...patch } = input;
      const row = await updateAvailability(id, patch);
      if (!row) throw new Error("Listing not found after update");
      return row;
    }),

  /** Admin — delete. */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await deleteAvailability(input.id);
      return { ok: true as const };
    }),
});
