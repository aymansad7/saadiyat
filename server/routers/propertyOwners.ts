import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { z } from "zod";
import { propertyOwnerImportRecords, propertyOwnerUnits, propertyOwners, unitDocuments, villaListingAudit, villaListings } from "../../drizzle/schema";
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

type UnitContactObservation = {
  kind: "reviewed_owner_link" | "current_card_email" | "historical_card_email";
  role: string;
  sourceLabel: string | null;
  occurredAt: Date;
};

function auditOwnerEmailValues(changesJson: string | null): Array<{ value: string; role: string }> {
  try {
    const parsed = JSON.parse(changesJson ?? "{}") as {
      ownerEmail?: { from?: unknown; to?: unknown };
    };
    const change = parsed.ownerEmail;
    if (!change) return [];
    const values: Array<{ value: unknown; role: string }> = [
      { value: change.from, role: "Previous card contact" },
      { value: change.to, role: "Card contact" },
    ];
    return values.flatMap(({ value, role }) => {
      const email = typeof value === "string" ? value.trim().toLowerCase() : "";
      return email ? [{ value: email, role }] : [];
    });
  } catch {
    return [];
  }
}

function relationshipLabel(relationship: "owner" | "co_owner" | "representative") {
  return relationship === "co_owner" ? "Co-owner" : relationship === "representative" ? "Representative" : "Owner";
}

export const propertyOwnersRouter = router({
  /**
   * Master-only, exact-unit contact provenance. This keeps any email that is
   * still evidenced by a reviewed owner relation or by the append-only card
   * audit, even when the unit later becomes sold or off-market.
   */
  unitContacts: masterProcedure
    .input(z.object({ villaKey: key, community }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const [links, listingRows, audits] = await Promise.all([
        db.select().from(propertyOwnerUnits).where(and(
          eq(propertyOwnerUnits.villaKey, input.villaKey),
          eq(propertyOwnerUnits.community, input.community),
        )).orderBy(desc(propertyOwnerUnits.updatedAt)),
        db.select().from(villaListings).where(eq(villaListings.villaKey, input.villaKey)).limit(1),
        db.select().from(villaListingAudit).where(eq(villaListingAudit.villaKey, input.villaKey)).orderBy(desc(villaListingAudit.createdAt)),
      ]);
      const ownerIds = Array.from(new Set(links.map(link => link.ownerId)));
      const owners = ownerIds.length
        ? await db.select().from(propertyOwners).where(inArray(propertyOwners.id, ownerIds))
        : [];
      const ownersById = new Map(owners.map(owner => [owner.id, owner]));
      const contacts = new Map<string, {
        email: string;
        displayName: string | null;
        roles: string[];
        firstSeenAt: Date;
        lastSeenAt: Date;
        observations: UnitContactObservation[];
      }>();
      const add = (inputContact: {
        email: string | null;
        displayName?: string | null;
        role: string;
        kind: UnitContactObservation["kind"];
        sourceLabel: string | null;
        occurredAt: Date;
      }) => {
        const email = inputContact.email?.trim().toLowerCase() ?? "";
        if (!email) return;
        const existing = contacts.get(email);
        const observation: UnitContactObservation = {
          kind: inputContact.kind,
          role: inputContact.role,
          sourceLabel: inputContact.sourceLabel,
          occurredAt: inputContact.occurredAt,
        };
        if (!existing) {
          contacts.set(email, {
            email,
            displayName: inputContact.displayName ?? null,
            roles: [inputContact.role],
            firstSeenAt: inputContact.occurredAt,
            lastSeenAt: inputContact.occurredAt,
            observations: [observation],
          });
          return;
        }
        if (inputContact.displayName && !existing.displayName) existing.displayName = inputContact.displayName;
        if (!existing.roles.includes(inputContact.role)) existing.roles.push(inputContact.role);
        if (inputContact.occurredAt < existing.firstSeenAt) existing.firstSeenAt = inputContact.occurredAt;
        if (inputContact.occurredAt > existing.lastSeenAt) existing.lastSeenAt = inputContact.occurredAt;
        existing.observations.push(observation);
      };

      for (const link of links) {
        const owner = ownersById.get(link.ownerId);
        add({
          email: owner?.email ?? null,
          displayName: owner?.displayName ?? null,
          role: relationshipLabel(link.relationship),
          kind: "reviewed_owner_link",
          sourceLabel: link.sourceLabel,
          occurredAt: link.createdAt,
        });
      }
      const listing = listingRows[0];
      if (listing) {
        add({
          email: listing.ownerEmail,
          displayName: listing.ownerName,
          role: "Current card contact",
          kind: "current_card_email",
          sourceLabel: "Current unit card",
          occurredAt: listing.updatedAt,
        });
      }
      for (const audit of audits) {
        for (const email of auditOwnerEmailValues(audit.changesJson)) {
          add({
            email: email.value,
            role: email.role,
            kind: "historical_card_email",
            sourceLabel: `Card audit · ${audit.actorEmail}`,
            occurredAt: audit.createdAt,
          });
        }
      }
      return Array.from(contacts.values())
        .map(contact => ({
          ...contact,
          roles: contact.roles.sort(),
          observations: contact.observations.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()),
        }))
        .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
    }),

  list: masterProcedure
    .input(z.object({ q: z.string().max(128).optional(), limit: z.number().int().min(1).max(5_000).default(200) }).default({ limit: 200 }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const q = input.q?.trim();
      const sourceOwnerIds = q
        ? Array.from(new Set((await db.select({ ownerId: propertyOwnerImportRecords.ownerId }).from(propertyOwnerImportRecords).where(or(
          like(propertyOwnerImportRecords.sourceUnit, `%${q}%`),
          like(propertyOwnerImportRecords.sourceProject, `%${q}%`),
          like(propertyOwnerImportRecords.sourceFile, `%${q}%`),
          like(propertyOwnerImportRecords.villaKey, `%${q}%`),
          like(propertyOwnerImportRecords.community, `%${q}%`),
        ))).map(row => row.ownerId).filter((id): id is number => id != null)))
        : [];
      const where = q
        ? sourceOwnerIds.length
          ? or(like(propertyOwners.displayName, `%${q}%`), like(propertyOwners.phone, `%${q}%`), like(propertyOwners.email, `%${q}%`), inArray(propertyOwners.id, sourceOwnerIds))
          : or(like(propertyOwners.displayName, `%${q}%`), like(propertyOwners.phone, `%${q}%`), like(propertyOwners.email, `%${q}%`))
        : undefined;
      const owners = await db.select().from(propertyOwners).where(where).orderBy(desc(propertyOwners.updatedAt)).limit(input.limit);
      if (!owners.length) return [];
      const ids = owners.map(owner => owner.id);
      const [links, imports] = await Promise.all([
        db.select().from(propertyOwnerUnits).where(inArray(propertyOwnerUnits.ownerId, ids)).orderBy(desc(propertyOwnerUnits.updatedAt)),
        db.select().from(propertyOwnerImportRecords).where(inArray(propertyOwnerImportRecords.ownerId, ids)).orderBy(desc(propertyOwnerImportRecords.updatedAt)),
      ]);
      const linksByOwner = new Map<number, typeof links>();
      const importsByOwner = new Map<number, typeof imports>();
      const sourceStats = new Map<number, { total: number; linked: number; unlinked: number; conflict: number; files: string[]; projects: string[] }>();
      for (const link of links) linksByOwner.set(link.ownerId, [...(linksByOwner.get(link.ownerId) ?? []), link]);
      for (const record of imports) {
        if (record.ownerId == null) continue;
        importsByOwner.set(record.ownerId, [...(importsByOwner.get(record.ownerId) ?? []), record]);
        const stats = sourceStats.get(record.ownerId) ?? { total: 0, linked: 0, unlinked: 0, conflict: 0, files: [], projects: [] };
        stats.total += 1;
        if (record.matchStatus === "linked") stats.linked += 1;
        if (record.matchStatus === "unlinked") stats.unlinked += 1;
        if (record.matchStatus === "conflict") stats.conflict += 1;
        if (!stats.files.includes(record.sourceFile)) stats.files.push(record.sourceFile);
        if (record.sourceProject && !stats.projects.includes(record.sourceProject)) stats.projects.push(record.sourceProject);
        sourceStats.set(record.ownerId, stats);
      }
      return owners.map(owner => ({
        ...owner,
        links: linksByOwner.get(owner.id) ?? [],
        importRecords: importsByOwner.get(owner.id) ?? [],
        linkCount: linksByOwner.get(owner.id)?.length ?? 0,
        sourceRecordCount: sourceStats.get(owner.id)?.total ?? 0,
        linkedSourceCount: sourceStats.get(owner.id)?.linked ?? 0,
        unlinkedSourceCount: sourceStats.get(owner.id)?.unlinked ?? 0,
        conflictSourceCount: sourceStats.get(owner.id)?.conflict ?? 0,
        sourceFiles: sourceStats.get(owner.id)?.files ?? [],
        sourceProjects: sourceStats.get(owner.id)?.projects ?? [],
      }));
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

  reviewQueue: masterProcedure.input(z.object({ sourceFile: z.string().max(255).optional(), limit: z.number().int().min(1).max(2_000).default(500) }).default({ limit: 500 })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const filters = [or(eq(propertyOwnerImportRecords.matchStatus, "unlinked"), eq(propertyOwnerImportRecords.matchStatus, "conflict"))];
    if (input.sourceFile) filters.push(eq(propertyOwnerImportRecords.sourceFile, input.sourceFile));
    return db.select().from(propertyOwnerImportRecords).where(and(...filters)).orderBy(desc(propertyOwnerImportRecords.updatedAt)).limit(input.limit);
  }),

  resolveImport: masterProcedure.input(z.object({
    importRecordId: z.number().int().positive(),
    villaKey: key,
    community,
    relationship: z.enum(["owner", "co_owner", "representative"]).default("owner"),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const sourceRecord = (await db.select().from(propertyOwnerImportRecords).where(eq(propertyOwnerImportRecords.id, input.importRecordId)).limit(1))[0];
    if (!sourceRecord) throw new TRPCError({ code: "NOT_FOUND", message: "Imported source row was not found." });
    if (!sourceRecord.ownerId) throw new TRPCError({ code: "BAD_REQUEST", message: "This source row is not associated with an owner record." });
    const owner = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, sourceRecord.ownerId)).limit(1))[0];
    if (!owner) throw new TRPCError({ code: "NOT_FOUND", message: "Source owner record was not found." });
    const sourceLabel = `${sourceRecord.sourceFile} · ${sourceRecord.sourceSheet} row ${sourceRecord.sourceRow}`;
    await db.insert(propertyOwnerUnits).values({
      ownerId: owner.id,
      villaKey: input.villaKey,
      community: input.community,
      relationship: input.relationship,
      sourceLabel,
      linkedBy: ctx.user.email ?? "master",
      linkedByName: ctx.user.name ?? null,
    }).onDuplicateKeyUpdate({ set: { relationship: input.relationship, sourceLabel, linkedBy: ctx.user.email ?? "master", linkedByName: ctx.user.name ?? null } });
    if (input.relationship === "owner") {
      await db.insert(villaListings).values({
        villaKey: input.villaKey,
        community: input.community,
        status: "draft",
        ownerName: owner.displayName,
        ownerPhone: owner.phone,
        ownerEmail: owner.email,
        updatedBy: ctx.user.email ?? "master",
      }).onDuplicateKeyUpdate({ set: { ownerName: owner.displayName, ownerPhone: owner.phone, ownerEmail: owner.email, updatedBy: ctx.user.email ?? "master" } });
    }
    await db.update(propertyOwnerImportRecords).set({
      villaKey: input.villaKey,
      community: input.community,
      matchStatus: "linked",
      matchReason: "master_confirmed_exact_link",
      importedBy: ctx.user.email ?? "master",
    }).where(eq(propertyOwnerImportRecords.id, sourceRecord.id));
    await appendActivityAudit({
      eventType: "owner_unit_link",
      actorEmail: ctx.user.email ?? "master",
      actorName: ctx.user.name ?? null,
      entityType: "owner_import_record",
      entityKey: String(sourceRecord.id),
      summary: `Master confirmed source row ${sourceLabel} for exact unit ${input.villaKey}`,
    });
    return { ok: true as const };
  }),

  /** Full owner record and documents are Master Admin only. */
  detail: masterProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const owner = (await db.select().from(propertyOwners).where(eq(propertyOwners.id, input.id)).limit(1))[0] ?? null;
    if (!owner) return null;
    const links = await db.select().from(propertyOwnerUnits).where(eq(propertyOwnerUnits.ownerId, input.id)).orderBy(desc(propertyOwnerUnits.updatedAt));
    const imports = await db.select().from(propertyOwnerImportRecords).where(eq(propertyOwnerImportRecords.ownerId, input.id)).orderBy(desc(propertyOwnerImportRecords.updatedAt));
    const unitKeys = links.map(link => link.villaKey);
    const documents = unitKeys.length
      ? await db.select().from(unitDocuments).where(and(inArray(unitDocuments.villaKey, unitKeys), eq(unitDocuments.ownerId, input.id), isNull(unitDocuments.removedAt))).orderBy(desc(unitDocuments.updatedAt))
      : [];
    return { owner, links, imports, documents };
  }),
});
