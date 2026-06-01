/**
 * Per-villa listings router.
 *
 *   - `byKey(villaKey)`     — public; returns public fields only for non-admin
 *   - `listByCommunity`     — public; bulk fetch for a community/gate prefix
 *   - `mine`                — admin; returns full rows
 *   - `upsert(villaKey, ...)` — admin; updates fields, writes audit row
 *   - `audit(villaKey)`     — admin; returns audit log
 *
 * Public callers see only: `villaKey`, `community`, `askingPriceAed`,
 * `status`, `listingPartners`, `publicNotes`, `updatedAt`.
 * Admin callers (role admin/master) additionally see: `ownerName`,
 * `ownerPhone`, `ownerEmail`, `internalNotes`, `updatedBy`.
 */
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import {
  villaListingAudit,
  villaListings,
  type VillaListing,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

/** Anything that is not a "real" community slug we still allow — the UI is the
 * source of truth for which communities exist. We only validate shape. */
const villaKeySchema = z
  .string()
  .min(3)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_\-/]*$/);
const communitySchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_\-]*$/);

const STATUS_VALUES = [
  "draft",
  "available",
  "warm",
  "reserved",
  "sold",
  "off-market",
] as const;

type PublicVillaListing = Pick<
  VillaListing,
  | "id"
  | "villaKey"
  | "community"
  | "askingPriceAed"
  | "status"
  | "listingPartners"
  | "publicNotes"
  | "updatedAt"
>;

function toPublic(row: VillaListing): PublicVillaListing {
  return {
    id: row.id,
    villaKey: row.villaKey,
    community: row.community,
    askingPriceAed: row.askingPriceAed,
    status: row.status,
    listingPartners: row.listingPartners,
    publicNotes: row.publicNotes,
    updatedAt: row.updatedAt,
  };
}

function isAdmin(user: { role?: string | null } | null): boolean {
  return user?.role === "admin" || user?.role === "master";
}

const upsertInput = z.object({
  villaKey: villaKeySchema,
  community: communitySchema,
  askingPriceAed: z.number().int().nonnegative().max(10_000_000_000).nullable().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  listingPartners: z.string().max(2_000).nullable().optional(),
  publicNotes: z.string().max(8_000).nullable().optional(),
  ownerName: z.string().max(255).nullable().optional(),
  ownerPhone: z.string().max(64).nullable().optional(),
  ownerEmail: z.string().max(320).nullable().optional(),
  internalNotes: z.string().max(8_000).nullable().optional(),
});

function diffChanges(
  before: VillaListing | null,
  after: Partial<VillaListing>,
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const fields: (keyof VillaListing)[] = [
    "askingPriceAed",
    "status",
    "listingPartners",
    "publicNotes",
    "ownerName",
    "ownerPhone",
    "ownerEmail",
    "internalNotes",
  ];
  for (const f of fields) {
    if (!(f in after)) continue;
    const fromVal = before?.[f] ?? null;
    const toVal = (after as any)[f] ?? null;
    if (fromVal !== toVal) {
      diff[f as string] = { from: fromVal, to: toVal };
    }
  }
  return diff;
}

function buildSummary(diff: Record<string, { from: unknown; to: unknown }>): string {
  const parts = Object.entries(diff).map(([k, v]) => {
    const to =
      typeof v.to === "string" && v.to.length > 30
        ? `${v.to.slice(0, 30)}…`
        : String(v.to);
    return `${k}=${to}`;
  });
  return parts.join("; ") || "no-op";
}

export const villaListingsRouter = router({
  byKey: publicProcedure
    .input(z.object({ villaKey: villaKeySchema }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(villaListings)
        .where(eq(villaListings.villaKey, input.villaKey))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return isAdmin(ctx.user) ? row : toPublic(row);
    }),

  /** Returns either an exact-community match or a prefix match (for SBV gates).
   * Pass `prefix` to filter by `villaKey LIKE 'prefix%'`. */
  listByCommunity: publicProcedure
    .input(
      z.object({
        community: communitySchema.optional(),
        prefix: z.string().max(128).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const where = [] as any[];
      if (input.community) where.push(eq(villaListings.community, input.community));
      if (input.prefix) where.push(like(villaListings.villaKey, `${input.prefix}%`));
      const rows = await db
        .select()
        .from(villaListings)
        .where(where.length ? and(...where) : undefined)
        .orderBy(asc(villaListings.villaKey));
      return isAdmin(ctx.user) ? rows : rows.map(toPublic);
    }),

  /** Admin index. Filters: community/status/q (substring on villaKey or notes). */
  adminList: adminProcedure
    .input(
      z
        .object({
          community: communitySchema.optional(),
          status: z.enum(STATUS_VALUES).optional(),
          q: z.string().max(128).optional(),
          limit: z.number().int().min(1).max(500).default(200),
        })
        .default({ limit: 200 }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const where = [] as any[];
      if (input.community) where.push(eq(villaListings.community, input.community));
      if (input.status) where.push(eq(villaListings.status, input.status));
      if (input.q && input.q.trim()) {
        where.push(like(villaListings.villaKey, `%${input.q.trim()}%`));
      }
      return db
        .select()
        .from(villaListings)
        .where(where.length ? and(...where) : undefined)
        .orderBy(desc(villaListings.updatedAt))
        .limit(input.limit);
    }),

  /** Aggregate counts by status per community — for the admin dashboard. */
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        community: villaListings.community,
        status: villaListings.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(villaListings)
      .groupBy(villaListings.community, villaListings.status);
  }),

  upsert: adminProcedure.input(upsertInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const before = await db
      .select()
      .from(villaListings)
      .where(eq(villaListings.villaKey, input.villaKey))
      .limit(1);
    const beforeRow: VillaListing | null = before[0] ?? null;

    const updateSet: Partial<VillaListing> = {};
    for (const k of [
      "askingPriceAed",
      "status",
      "listingPartners",
      "publicNotes",
      "ownerName",
      "ownerPhone",
      "ownerEmail",
      "internalNotes",
    ] as const) {
      if (k in input) (updateSet as any)[k] = (input as any)[k] ?? null;
    }
    updateSet.updatedBy = ctx.user?.email ?? "admin";

    if (beforeRow) {
      await db
        .update(villaListings)
        .set(updateSet)
        .where(eq(villaListings.id, beforeRow.id));
    } else {
      await db.insert(villaListings).values({
        villaKey: input.villaKey,
        community: input.community,
        ...updateSet,
      });
    }

    const rows = await db
      .select()
      .from(villaListings)
      .where(eq(villaListings.villaKey, input.villaKey))
      .limit(1);
    const after = rows[0]!;

    const diff = diffChanges(beforeRow, after);
    const summary = buildSummary(diff);
    if (Object.keys(diff).length > 0) {
      const truncatedJson = JSON.stringify(diff).slice(0, 8_000);
      await db.insert(villaListingAudit).values({
        villaKey: input.villaKey,
        actorEmail: ctx.user?.email ?? "admin",
        actorName: ctx.user?.name ?? null,
        summary,
        changesJson: truncatedJson,
      });
    }

    return after;
  }),

  audit: adminProcedure
    .input(z.object({ villaKey: villaKeySchema, limit: z.number().int().min(1).max(200).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(villaListingAudit)
        .where(eq(villaListingAudit.villaKey, input.villaKey))
        .orderBy(desc(villaListingAudit.createdAt))
        .limit(input.limit);
    }),
});
