import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { activityAudit, propertyAccessGrants } from "../../drizzle/schema";
import { getPropertyScope, resolvePropertyPermissions } from "../../shared/propertyAccess";
import { appendActivityAudit } from "../activityAudit";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const emailSchema = z.string().email().max(320).transform(value => value.trim().toLowerCase());
const scopeValue = z.string().min(2).max(128).regex(/^[a-z0-9][a-z0-9-]*$/);
const scopeInput = z
  .object({ areaKey: scopeValue.nullable().optional(), projectKey: scopeValue.nullable().optional() })
  .refine(value => Boolean(value.areaKey || value.projectKey), "Choose an area or a project.");
const flagsInput = z.object({
  canViewOriginalPrice: z.boolean().default(false),
  canViewOwnerName: z.boolean().default(false),
  canViewOwnerPhone: z.boolean().default(false),
  canEditProperties: z.boolean().default(false),
});

function actor(ctx: { user: { email?: string | null; name?: string | null } }) {
  return { actorEmail: ctx.user.email ?? "master", actorName: ctx.user.name ?? null };
}

const masterOnlyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "master") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Master Admin access required." });
  }
  return next({ ctx });
});

export const propertyAccessRouter = router({
  /** Used by any authenticated property UI to decide whether it can reveal a field or offer Edit. */
  permissions: protectedProcedure
    .input(z.object({ projects: z.array(scopeValue).min(1).max(100) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const email = ctx.user.email?.toLowerCase();
      const grants = !db || !email
        ? []
        : await db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.email, email));
      return input.projects.map(projectKey => ({
        projectKey,
        scope: getPropertyScope(projectKey),
        permissions: resolvePropertyPermissions(ctx.user.role, grants, getPropertyScope(projectKey)),
      }));
    }),

  grants: router({
    list: masterOnlyProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(propertyAccessGrants).orderBy(desc(propertyAccessGrants.updatedAt));
    }),

    create: masterOnlyProcedure
      .input(z.object({ email: emailSchema, ...scopeInput.shape, ...flagsInput.shape }))
      .mutation(async ({ input, ctx }) => {
        if (!input.areaKey && !input.projectKey) throw new TRPCError({ code: "BAD_REQUEST" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const grant = {
          email: input.email,
          areaKey: input.areaKey ?? null,
          projectKey: input.projectKey ?? null,
          canViewOriginalPrice: input.canViewOriginalPrice,
          canViewOwnerName: input.canViewOwnerName,
          canViewOwnerPhone: input.canViewOwnerPhone,
          canEditProperties: input.canEditProperties,
          createdBy: actor(ctx).actorEmail,
        };
        const result = await db.insert(propertyAccessGrants).values(grant);
        const rows = await db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.id, Number(result[0].insertId))).limit(1);
        const row = rows[0]!;
        await appendActivityAudit({
          eventType: "access_grant_create",
          ...actor(ctx),
          targetEmail: row.email,
          entityType: "property_access_grant",
          entityKey: String(row.id),
          summary: `Created ${row.projectKey ? `project ${row.projectKey}` : `area ${row.areaKey}`} grant`,
          changes: row,
        });
        return row;
      }),

    update: masterOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), ...scopeInput.shape, ...flagsInput.shape }))
      .mutation(async ({ input, ctx }) => {
        if (!input.areaKey && !input.projectKey) throw new TRPCError({ code: "BAD_REQUEST" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const before = await db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.id, input.id)).limit(1);
        if (!before[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const update = {
          areaKey: input.areaKey ?? null,
          projectKey: input.projectKey ?? null,
          canViewOriginalPrice: input.canViewOriginalPrice,
          canViewOwnerName: input.canViewOwnerName,
          canViewOwnerPhone: input.canViewOwnerPhone,
          canEditProperties: input.canEditProperties,
        };
        await db.update(propertyAccessGrants).set(update).where(eq(propertyAccessGrants.id, input.id));
        await appendActivityAudit({
          eventType: "access_grant_update",
          ...actor(ctx),
          targetEmail: before[0].email,
          entityType: "property_access_grant",
          entityKey: String(input.id),
          summary: "Updated property access grant",
          changes: { from: before[0], to: update },
        });
        return { ok: true as const };
      }),

    remove: masterOnlyProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const before = await db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.id, input.id)).limit(1);
        if (!before[0]) throw new TRPCError({ code: "NOT_FOUND" });
        await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.id, input.id));
        await appendActivityAudit({
          eventType: "access_grant_delete",
          ...actor(ctx),
          targetEmail: before[0].email,
          entityType: "property_access_grant",
          entityKey: String(input.id),
          summary: "Deleted property access grant",
          changes: before[0],
        });
        return { ok: true as const };
      }),
  }),

  activity: masterOnlyProcedure
    .input(z.object({ limit: z.number().int().min(1).max(500).default(200), eventTypes: z.array(z.string()).max(6).optional() }).default({ limit: 200 }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const where = input.eventTypes?.length ? inArray(activityAudit.eventType, input.eventTypes as any) : undefined;
      return db.select().from(activityAudit).where(where).orderBy(desc(activityAudit.createdAt)).limit(input.limit);
    }),
});
