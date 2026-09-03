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
import { and, asc, desc, eq, gte, lte, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  propertyAccessGrants,
  oneDriveSyncEvents,
  villaListingAudit,
  villaListings,
  type VillaListing,
} from "../../drizzle/schema";
import { getPropertyScope, resolvePropertyPermissions } from "../../shared/propertyAccess";
import { appendActivityAudit } from "../activityAudit";
import { getDb } from "../db";
import { exportUnitRegisterWorkbook } from "../oneDrive";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

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
  | "landAreaSqm"
  | "builtUpAreaSqm"
  | "availableForRent"
  | "rentPriceAed"
  | "phaseKey"
  | "buildingKey"
  | "unitTypeKey"
  | "bedrooms"
  | "inventoryKey"
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
    landAreaSqm: row.landAreaSqm,
    builtUpAreaSqm: row.builtUpAreaSqm,
    availableForRent: row.availableForRent,
    rentPriceAed: row.rentPriceAed,
    phaseKey: row.phaseKey,
    buildingKey: row.buildingKey,
    unitTypeKey: row.unitTypeKey,
    bedrooms: row.bedrooms,
    inventoryKey: row.inventoryKey,
    updatedAt: row.updatedAt,
  };
}

function isMaster(user: { role?: string | null } | null): boolean {
  return user?.role === "master";
}

const masterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isMaster(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Master Admin access required." });
  return next();
});

async function resolveCallerPermissions(
  user: { role?: string | null; email?: string | null } | null | undefined,
  scope: ReturnType<typeof getPropertyScope>,
) {
  if (!user) return null;
  // Master/admin permissions are role-derived. Avoid one grants-table query per
  // listing row when the full Interactive Map loads every property override.
  if (isMaster(user)) {
    return resolvePropertyPermissions(user.role, [], scope);
  }
  const db = await getDb();
  const grants = !db || !user.email
    ? []
    : await db
      .select()
      .from(propertyAccessGrants)
      .where(eq(propertyAccessGrants.email, user.email.toLowerCase()));
  return resolvePropertyPermissions(user.role, grants, scope);
}

function listingScope(row: Pick<VillaListing, "community" | "phaseKey" | "buildingKey" | "unitTypeKey" | "bedrooms" | "inventoryKey">) {
  return {
    ...getPropertyScope(row.community),
    phaseKey: row.phaseKey ?? null,
    buildingKey: row.buildingKey ?? null,
    unitTypeKey: row.unitTypeKey ?? null,
    bedrooms: row.bedrooms ?? null,
    inventoryKey: row.inventoryKey ?? null,
  };
}

function toVisible(
  row: VillaListing,
  permissions: Awaited<ReturnType<typeof resolveCallerPermissions>>,
  includeAdminOnlyFields: boolean,
) {
  if (!permissions) return toPublic(row);
  const base = toPublic(row) as PublicVillaListing & Partial<VillaListing>;
  if (permissions.canViewOwnerName) base.ownerName = row.ownerName;
  if (permissions.canViewOwnerPhone) base.ownerPhone = row.ownerPhone;
  if (includeAdminOnlyFields) {
    // Admin/master permissions include the private operational fields.
    base.ownerEmail = row.ownerEmail;
    base.internalNotes = row.internalNotes;
    base.updatedBy = row.updatedBy;
  }
  return base;
}

const upsertInput = z.object({
  villaKey: villaKeySchema,
  community: communitySchema,
  askingPriceAed: z.number().int().nonnegative().max(10_000_000_000).nullable().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  listingPartners: z.string().max(2_000).nullable().optional(),
  publicNotes: z.string().max(8_000).nullable().optional(),
  landAreaSqm: z.number().nonnegative().max(10_000_000).nullable().optional(),
  builtUpAreaSqm: z.number().nonnegative().max(10_000_000).nullable().optional(),
  availableForRent: z.boolean().nullable().optional(),
  rentPriceAed: z.number().int().nonnegative().max(10_000_000_000).nullable().optional(),
  phaseKey: z.string().max(64).nullable().optional(),
  buildingKey: z.string().max(128).nullable().optional(),
  unitTypeKey: z.string().max(128).nullable().optional(),
  bedrooms: z.number().int().min(0).max(30).nullable().optional(),
  inventoryKey: z.string().max(128).nullable().optional(),
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
    "landAreaSqm",
    "builtUpAreaSqm",
    "availableForRent",
    "rentPriceAed",
    "phaseKey",
    "buildingKey",
    "unitTypeKey",
    "bedrooms",
    "inventoryKey",
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
      const permissions = await resolveCallerPermissions(ctx.user, listingScope(row));
      return toVisible(row, permissions, isMaster(ctx.user));
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
      if (!ctx.user) return rows.map(toPublic);
      return Promise.all(rows.map(async row => {
        const permissions = await resolveCallerPermissions(ctx.user, listingScope(row));
        return toVisible(row, permissions, isMaster(ctx.user));
      }));
    }),

  /** Admin index. Filters:
   *  - community: exact community slug
   *  - status: enum filter
   *  - priceMin/priceMax (AED): inclusive bounds, applied only to non-null askingPriceAed
   *  - q: case-insensitive substring matched across `villaKey`, `ownerName`, and `internalNotes`
   */
  adminList: masterProcedure
    .input(
      z
        .object({
          community: communitySchema.optional(),
          status: z.enum(STATUS_VALUES).optional(),
          priceMin: z.number().int().nonnegative().max(10_000_000_000).optional(),
          priceMax: z.number().int().nonnegative().max(10_000_000_000).optional(),
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
      if (input.priceMin !== undefined) {
        where.push(gte(villaListings.askingPriceAed, input.priceMin));
      }
      if (input.priceMax !== undefined) {
        where.push(lte(villaListings.askingPriceAed, input.priceMax));
      }
      if (input.q && input.q.trim()) {
        const term = `%${input.q.trim()}%`;
        where.push(
          or(
            like(villaListings.villaKey, term),
            like(villaListings.ownerName, term),
            like(villaListings.internalNotes, term),
          ),
        );
      }
      return db
        .select()
        .from(villaListings)
        .where(where.length ? and(...where) : undefined)
        .orderBy(desc(villaListings.updatedAt))
        .limit(input.limit);
    }),

  /** Aggregate counts by status per community — for the admin dashboard. */
  stats: masterProcedure.query(async () => {
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

  upsert: protectedProcedure.input(upsertInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const before = await db
      .select()
      .from(villaListings)
      .where(eq(villaListings.villaKey, input.villaKey))
      .limit(1);
    const beforeRow: VillaListing | null = before[0] ?? null;
    const existingScope = beforeRow ? listingScope(beforeRow) : {
      ...getPropertyScope(input.community),
      phaseKey: input.phaseKey ?? null,
      buildingKey: input.buildingKey ?? null,
      unitTypeKey: input.unitTypeKey ?? null,
      bedrooms: input.bedrooms ?? null,
      inventoryKey: input.inventoryKey ?? null,
    };
    const permissions = await resolveCallerPermissions(ctx.user, existingScope);
    if (!permissions?.canEditProperties) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You do not have edit access to this project." });
    }
    const writesOwnerName = "ownerName" in input;
    const writesOwnerPhone = "ownerPhone" in input;
    const writesOwnerEmail = "ownerEmail" in input;
    if (
      !isMaster(ctx.user) &&
      ((writesOwnerName && !permissions.canViewOwnerName) ||
        (writesOwnerPhone && !permissions.canViewOwnerPhone) ||
        writesOwnerEmail)
    ) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to edit this owner contact field." });
    }
    const updateSet: Partial<VillaListing> = {};
    for (const k of [
      "askingPriceAed",
      "status",
      "listingPartners",
      "publicNotes",
      "landAreaSqm",
      "builtUpAreaSqm",
      "availableForRent",
      "rentPriceAed",
      "phaseKey",
      "buildingKey",
      "unitTypeKey",
      "bedrooms",
      "inventoryKey",
      "ownerName",
      "ownerPhone",
      "ownerEmail",
      "internalNotes",
    ] as const) {
      if (k in input) (updateSet as any)[k] = (input as any)[k] ?? null;
    }
    updateSet.updatedBy = ctx.user?.email ?? "admin";
    const becomingAvailable = input.status === "available" && beforeRow?.status !== "available";
    if (becomingAvailable && !beforeRow?.publishedAt) {
      updateSet.publishedAt = new Date();
      updateSet.publishedBy = ctx.user?.email ?? "admin";
      updateSet.publishedByName = ctx.user?.name ?? null;
    }

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
      await appendActivityAudit({
        eventType: "property_edit",
        actorEmail: ctx.user?.email ?? "editor",
        actorName: ctx.user?.name ?? null,
        entityType: "property",
        entityKey: input.villaKey,
        summary: `Updated property ${input.villaKey}: ${summary}`,
        changes: diff,
      });
      // The site is the operational editor. A successful property update
      // therefore exports the current register to OneDrive, without ever
      // reading back an Excel edit. A storage failure must not roll back the
      // already-audited property change.
      if (process.env.NODE_ENV !== "test") {
        try {
          const workbook = await exportUnitRegisterWorkbook();
          await db.insert(oneDriveSyncEvents).values({
            connectionKey: "primary",
            eventType: "workbook_export",
            status: "success",
            idempotencyKey: `property-export:${after.id}:${workbook.itemId}:${workbook.etag ?? "unknown"}`,
            summary: `Exported Unit Register after updating ${input.villaKey}.`,
            detailsJson: JSON.stringify({ villaKey: input.villaKey, profileCount: workbook.profileCount }),
            attemptedAt: new Date(),
            completedAt: new Date(),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to export Unit Register.";
          await db.insert(oneDriveSyncEvents).values({
            connectionKey: "primary",
            eventType: "failure",
            status: "error",
            idempotencyKey: `property-export-failure:${after.id}:${Date.now()}`,
            summary: `Unit Register export failed after updating ${input.villaKey}.`,
            errorMessage: message,
            attemptedAt: new Date(),
            completedAt: new Date(),
          });
          await appendActivityAudit({
            eventType: "onedrive_sync",
            actorEmail: ctx.user?.email ?? "editor",
            actorName: ctx.user?.name ?? null,
            entityType: "onedrive_workbook",
            entityKey: input.villaKey,
            summary: `OneDrive Unit Register export failed after property update: ${message}`,
          });
        }
      }
    }

    return after;
  }),

  audit: masterProcedure
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
