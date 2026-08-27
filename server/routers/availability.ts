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
  deleteAvailability,
  getAvailabilityById,
  insertAvailability,
  listAvailability,
  updateAvailability,
} from "../db";
import { getAvailabilitySummary, listAvailabilityResults } from "../availabilityResults";

const sourceEnum = z.enum(["nas-luxury", "aldar", "others", "manual"]);
const statusEnum = z.enum(["available", "reserved", "sold", "off-market"]);

export const availabilityRouter = router({
  /** Public summary — counts grouped by community/status/source. */
  summary: publicProcedure.query(async () => {
    return { communities: await getAvailabilitySummary() };
  }),

  /** Public source drill-down. Contact data and protected owner fields are deliberately omitted. */
  results: publicProcedure
    .input(z.object({ source: z.union([sourceEnum, z.literal("any")]).default("any") }).default({ source: "any" }))
    .query(async ({ input }) => listAvailabilityResults(input.source)),

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
