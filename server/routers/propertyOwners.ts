import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { z } from "zod";
import { propertyOwnerUnits, propertyOwners, unitDocuments, villaListings } from "../../drizzle/schema";
import { appendActivityAudit } from "../activityAudit";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const key = z.string().min(3).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_\-/]*$/);
const community = z.string().min(2).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);
const masterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "master") throw new TRPCError({ code: "FORBIDDEN", message: "Master Admin access required." });
  return next();
});

const ownerInput = z.object({
  displayName: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(64).nullable().optional(),
  email: z.string().trim().email().max(320).nullable().optional(),
  internalNotes: z.string().max(8_000).nullable().optional(),
  sourceLabel: z.string().trim().max(255).nullable().optional(),
});

export const propertyOwnersRouter = router({
  list: masterProcedure
    .input(z.object({ q: z.string().max(128).optional(), limit: z.number().int().min(1).max(500).default(200) }).default({ limit: 200 }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const q = input.q?.trim();
      const where = q ? or(like(propertyOwners.displayName, `%${q}%`), like(propertyOwners.phone, `%${q}%`), like(propertyOwners.email, `%${q}%`)) : undefined;
      return db.select().from(propertyOwners).where(where).orderBy(desc(propertyOwners.updatedAt)).limit(input.limit);
    }),

  create: masterProcedure.input(ownerInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const result = await db.insert(propertyOwners).values({
      displayName: input.displayName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      internalNotes: input.internalNotes ?? null,
      sourceLabel: input.sourceLabel ?? null,
      createdBy: ctx.user.email ?? "master",
      createdByName: ctx.user.name ?? null,
    });
    const ownerId = Number(result[0].insertId);
    const row = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, ownerId)).limit(1))[0]!;
    await appendActivityAudit({
      eventType: "owner_create",
      actorEmail: ctx.user.email ?? "master",
      actorName: ctx.user.name ?? null,
      entityType: "property_owner",
      entityKey: String(ownerId),
      summary: `Created owner record ${row.displayName}`,
    });
    return row;
  }),

  update: masterProcedure.input(z.object({ id: z.number().int().positive(), ...ownerInput.shape })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const before = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, input.id)).limit(1))[0];
    if (!before) throw new TRPCError({ code: "NOT_FOUND" });
    const update = { ...input } as Record<string, unknown>;
    delete update.id;
    await db.update(propertyOwners).set(update).where(eq(propertyOwners.id, input.id));
    await appendActivityAudit({
      eventType: "owner_update",
      actorEmail: ctx.user.email ?? "master",
      actorName: ctx.user.name ?? null,
      entityType: "property_owner",
      entityKey: String(input.id),
      summary: `Updated owner record ${before.displayName}`,
    });
    return { ok: true as const };
  }),

  linkUnit: masterProcedure.input(z.object({
    ownerId: z.number().int().positive(),
    villaKey: key,
    community,
    relationship: z.enum(["owner", "co_owner", "representative"]).default("owner"),
    sourceLabel: z.string().trim().max(255).nullable().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const owner = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, input.ownerId)).limit(1))[0];
    if (!owner) throw new TRPCError({ code: "NOT_FOUND", message: "Owner record was not found." });
    await db.insert(propertyOwnerUnits).values({
      ownerId: input.ownerId,
      villaKey: input.villaKey,
      community: input.community,
      relationship: input.relationship,
      sourceLabel: input.sourceLabel ?? null,
      linkedBy: ctx.user.email ?? "master",
      linkedByName: ctx.user.name ?? null,
    }).onDuplicateKeyUpdate({ set: { relationship: input.relationship, sourceLabel: input.sourceLabel ?? null, linkedBy: ctx.user.email ?? "master", linkedByName: ctx.user.name ?? null } });
    // The Master-reviewed relation also feeds the existing protected card/map
    // override. A new row remains draft: an owner link is never evidence that a
    // property is listed or available for resale.
    if (input.relationship === "owner") {
      await db.insert(villaListings).values({
        villaKey: input.villaKey,
        community: input.community,
        status: "draft",
        ownerName: owner.displayName,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        updatedBy: ctx.user.email ?? "master",
      }).onDuplicateKeyUpdate({ set: {
        ownerName: owner.displayName,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        updatedBy: ctx.user.email ?? "master",
      } });
    }
    await appendActivityAudit({
      eventType: "owner_unit_link",
      actorEmail: ctx.user.email ?? "master",
      actorName: ctx.user.name ?? null,
      entityType: "property_owner_unit",
      entityKey: `${input.community}/${input.villaKey}`,
      summary: `Linked owner ${owner.displayName} to exact unit ${input.villaKey}`,
    });
    return { ok: true as const };
  }),

  unlinkUnit: masterProcedure.input(z.object({ ownerId: z.number().int().positive(), villaKey: key })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(propertyOwnerUnits).where(and(eq(propertyOwnerUnits.ownerId, input.ownerId), eq(propertyOwnerUnits.villaKey, input.villaKey)));
    return { ok: true as const };
  }),

  /** Full owner record and documents are Master Admin only. */
  detail: masterProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const owner = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, input.id)).limit(1))[0] ?? null;
    if (!owner) return null;
    const links = await db.select().from(propertyOwnerUnits).where(eq(propertyOwnerUnits.ownerId, input.id)).orderBy(desc(propertyOwnerUnits.updatedAt));
    const unitKeys = links.map(link => link.villaKey);
    const documents = unitKeys.length
      ? await db.select().from(unitDocuments).where(and(inArray(unitDocuments.villaKey, unitKeys), eq(unitDocuments.ownerId, input.id), isNull(unitDocuments.removedAt))).orderBy(desc(unitDocuments.updatedAt))
      : [];
    return { owner, links, documents };
  }),
});
