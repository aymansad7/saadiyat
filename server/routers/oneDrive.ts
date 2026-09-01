import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  oneDriveConnections,
  oneDriveSyncEvents,
  propertyAccessGrants,
  propertyOwnerUnits,
  unitDocuments,
  villaListings,
  type UnitDocument,
} from "../../drizzle/schema";
import { getPropertyScope, resolvePropertyPermissions } from "../../shared/propertyAccess";
import { appendActivityAudit } from "../activityAudit";
import { getDb } from "../db";
import {
  createOneDriveViewLink,
  ensureFolderPath,
  exportUnitRegisterWorkbook,
  getConfiguredOneDrive,
  unitFolderPath,
  uploadOneDriveFile,
} from "../oneDrive";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const CONNECTION_KEY = "primary";
const masterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "master") throw new TRPCError({ code: "FORBIDDEN", message: "Master Admin access is required for OneDrive administration." });
  return next({ ctx });
});
const documentTypeSchema = z.enum(["brochure", "spa", "owner_document", "floorplan", "source_file", "marketing", "other"]);
const visibilitySchema = z.enum(["card_link", "master_admin"]);
const villaKeySchema = z.string().min(3).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_\-/]*$/);
const communitySchema = z.string().min(2).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_\-]*$/);

function isSensitive(type: UnitDocument["documentType"]) {
  return type === "spa" || type === "owner_document" || type === "source_file";
}

function isOwnerFile(type: UnitDocument["documentType"]) {
  // A delegated owner-document grant never carries an SPA. SPAs and source
  // records remain Master-only even for an otherwise authorised project user.
  return type === "owner_document";
}

function toSafeCardDocument(row: UnitDocument) {
  return {
    id: row.id,
    villaKey: row.villaKey,
    documentType: row.documentType,
    filename: row.filename,
    description: row.description,
    shareUrl: row.shareUrl,
    updatedAt: row.updatedAt,
  };
}

async function getExactDocumentPermissions(
  user: { role?: string | null; email?: string | null } | null | undefined,
  input: { villaKey: string; community: string },
) {
  if (!user) return null;
  const db = await getDb();
  if (!db) return null;
  const listing = (await db.select().from(villaListings).where(and(
    eq(villaListings.villaKey, input.villaKey),
    eq(villaListings.community, input.community),
  )).limit(1))[0] ?? null;
  const base = getPropertyScope(input.community);
  const scope = {
    ...base,
    buildingKey: listing?.buildingKey ?? null,
    unitTypeKey: listing?.unitTypeKey ?? null,
    bedrooms: listing?.bedrooms ?? null,
  };
  const grants = !user.email
    ? []
    : await db.select().from(propertyAccessGrants).where(eq(propertyAccessGrants.email, user.email.toLowerCase()));
  return resolvePropertyPermissions(user.role, grants, scope);
}

async function recordEvent(input: {
  connectionKey?: string;
  documentId?: number | null;
  eventType: "upload" | "metadata_refresh" | "share_link_create" | "workbook_export" | "failure";
  status: "pending" | "success" | "error";
  idempotencyKey: string;
  summary: string;
  details?: unknown;
  errorMessage?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(oneDriveSyncEvents).values({
    connectionKey: input.connectionKey ?? CONNECTION_KEY,
    documentId: input.documentId ?? null,
    eventType: input.eventType,
    status: input.status,
    idempotencyKey: input.idempotencyKey,
    summary: input.summary,
    detailsJson: input.details === undefined ? null : JSON.stringify(input.details).slice(0, 8_000),
    errorMessage: input.errorMessage ?? null,
    attemptedAt: new Date(),
    completedAt: input.status === "pending" ? null : new Date(),
  }).onDuplicateKeyUpdate({ set: { status: input.status, summary: input.summary, errorMessage: input.errorMessage ?? null, completedAt: new Date() } });
}

async function upsertConnection() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  const configured = await getConfiguredOneDrive();
  await db.insert(oneDriveConnections).values({
    connectionKey: CONNECTION_KEY,
    status: "active",
    ownerUpn: configured.ownerUpn,
    tenantId: process.env.ONEDRIVE_TENANT_ID?.trim() || null,
    clientId: process.env.ONEDRIVE_CLIENT_ID?.trim() || null,
    driveId: configured.drive.id,
    rootItemId: configured.root.id,
    rootPath: configured.rootPath,
    lastError: null,
  }).onDuplicateKeyUpdate({
    set: {
      status: "active",
      driveId: configured.drive.id,
      rootItemId: configured.root.id,
      rootPath: configured.rootPath,
      lastError: null,
    },
  });
  return configured;
}

export const oneDriveRouter = router({
  /** Public cards receive only deliberately public brochure/floorplan/marketing links. */
  cardLinks: publicProcedure
    .input(z.object({ villaKey: villaKeySchema }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(unitDocuments).where(and(
        eq(unitDocuments.villaKey, input.villaKey),
        eq(unitDocuments.websiteVisibility, "card_link"),
        inArray(unitDocuments.documentType, ["brochure", "floorplan", "marketing"]),
        isNull(unitDocuments.removedAt),
      )).orderBy(desc(unitDocuments.updatedAt));
      return rows.filter(row => Boolean(row.shareUrl)).map(toSafeCardDocument);
    }),

  forVilla: protectedProcedure
    .input(z.object({ villaKey: villaKeySchema, community: communitySchema }))
    .query(async ({ input, ctx }) => {
      const permissions = await getExactDocumentPermissions(ctx.user, input);
      if (!permissions?.canAccess) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this project." });
      }
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(unitDocuments).where(and(
        eq(unitDocuments.villaKey, input.villaKey),
        eq(unitDocuments.community, input.community),
        isNull(unitDocuments.removedAt),
      )).orderBy(desc(unitDocuments.updatedAt));
      const isMaster = ctx.user?.role === "master";
      return rows.filter(row => isMaster || !isSensitive(row.documentType) || (isOwnerFile(row.documentType) && permissions.canViewOwnerDocuments)).map(row => ({
        ...row,
        shareUrl: isMaster || !isSensitive(row.documentType) || (isOwnerFile(row.documentType) && permissions.canViewOwnerDocuments) ? row.shareUrl : null,
        webUrl: isMaster || !isSensitive(row.documentType) || (isOwnerFile(row.documentType) && permissions.canViewOwnerDocuments) ? row.webUrl : null,
      }));
    }),

  status: masterProcedure.query(async () => {
    const db = await getDb();
    const connection = db
      ? (await db.select().from(oneDriveConnections).where(eq(oneDriveConnections.connectionKey, CONNECTION_KEY)).limit(1))[0] ?? null
      : null;
    const documentCounts = db
      ? await db.select({ documentType: unitDocuments.documentType, count: sql<number>`COUNT(*)` }).from(unitDocuments).where(isNull(unitDocuments.removedAt)).groupBy(unitDocuments.documentType)
      : [];
    return { connection, documentCounts };
  }),

  initialise: masterProcedure.mutation(async ({ ctx }) => {
    try {
      const configured = await upsertConnection();
      await recordEvent({ eventType: "metadata_refresh", status: "success", idempotencyKey: `initialise:${configured.drive.id}:${configured.root.id}`, summary: "Verified OneDrive drive and Saadiyat root folder." });
      await appendActivityAudit({
        eventType: "onedrive_sync",
        actorEmail: ctx.user.email ?? "admin",
        actorName: ctx.user.name,
        entityType: "onedrive_connection",
        entityKey: CONNECTION_KEY,
        summary: "Verified OneDrive Business connection and root folder.",
      });
      return { driveId: configured.drive.id, rootItemId: configured.root.id, rootPath: configured.rootPath };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to initialize OneDrive.";
      await recordEvent({ eventType: "failure", status: "error", idempotencyKey: `initialise-failure:${Date.now()}`, summary: "Could not verify OneDrive connection.", errorMessage: message });
      throw new TRPCError({ code: "BAD_REQUEST", message });
    }
  }),

  list: masterProcedure
    .input(z.object({ q: z.string().max(128).optional(), limit: z.number().int().min(1).max(500).default(100) }).default({ limit: 100 }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(unitDocuments).where(isNull(unitDocuments.removedAt)).orderBy(desc(unitDocuments.updatedAt)).limit(input.limit);
      const query = input.q?.trim().toLowerCase();
      return query ? rows.filter(row => [row.villaKey, row.community, row.phaseKey, row.filename, row.documentType].filter(Boolean).join(" ").toLowerCase().includes(query)) : rows;
    }),

  upload: masterProcedure
    .input(z.object({
      villaKey: villaKeySchema,
      community: communitySchema,
      phaseKey: z.string().max(64).nullable().optional(),
      ownerId: z.number().int().positive().nullable().optional(),
      documentType: documentTypeSchema,
      websiteVisibility: visibilitySchema.default("master_admin"),
      filename: z.string().min(1).max(255),
      mimeType: z.string().min(3).max(128),
      description: z.string().max(2_000).nullable().optional(),
      fileBase64: z.string().min(4).max(35_000_000),
    }))
    .mutation(async ({ input, ctx }) => {
      if (isSensitive(input.documentType) && input.websiteVisibility === "card_link") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "SPA, owner documents, and source files cannot be exposed on property cards." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.ownerId != null) {
        const relation = (await db.select().from(propertyOwnerUnits).where(and(
          eq(propertyOwnerUnits.ownerId, input.ownerId),
          eq(propertyOwnerUnits.villaKey, input.villaKey),
          eq(propertyOwnerUnits.community, input.community),
        )).limit(1))[0];
        if (!relation) throw new TRPCError({ code: "BAD_REQUEST", message: "Owner files require an existing, reviewed owner-to-unit relationship." });
      }
      const encoded = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
      const bytes = Buffer.from(encoded, "base64");
      if (!bytes.length || bytes.length > 25 * 1024 * 1024) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Document files must be between 1 byte and 25 MB." });
      }
      const configured = await upsertConnection();
      const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath(input));
      const item = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId: folderId, filename: input.filename, bytes, mimeType: input.mimeType });
      if (!item.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OneDrive did not return a document identifier." });
      const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
      await db.insert(unitDocuments).values({
        villaKey: input.villaKey,
        ownerId: input.ownerId ?? null,
        community: input.community,
        phaseKey: input.phaseKey ?? null,
        documentType: input.documentType,
        websiteVisibility: input.websiteVisibility,
        shareAccess: "anyone_link",
        filename: item.name || input.filename,
        mimeType: item.file?.mimeType || input.mimeType,
        sizeBytes: item.size ?? bytes.length,
        description: input.description ?? null,
        driveId: configured.drive.id,
        itemId: item.id,
        parentItemId: folderId,
        webUrl: item.webUrl ?? null,
        shareUrl,
        etag: item.eTag ?? null,
        uploadedBy: ctx.user.email ?? "admin",
        uploadedByName: ctx.user.name ?? null,
      }).onDuplicateKeyUpdate({
        set: {
          filename: item.name || input.filename,
          mimeType: item.file?.mimeType || input.mimeType,
          sizeBytes: item.size ?? bytes.length,
          description: input.description ?? null,
          ownerId: input.ownerId ?? null,
          parentItemId: folderId,
          webUrl: item.webUrl ?? null,
          shareUrl,
          etag: item.eTag ?? null,
          documentType: input.documentType,
          websiteVisibility: input.websiteVisibility,
          uploadedBy: ctx.user.email ?? "admin",
          uploadedByName: ctx.user.name ?? null,
          removedAt: null,
        },
      });
      const stored = (await db.select().from(unitDocuments).where(and(eq(unitDocuments.driveId, configured.drive.id), eq(unitDocuments.itemId, item.id))).limit(1))[0]!;
      await recordEvent({ eventType: "upload", status: "success", documentId: stored.id, idempotencyKey: `upload:${configured.drive.id}:${item.id}:${item.eTag ?? "unknown"}`, summary: `Uploaded ${stored.documentType} for ${stored.villaKey}.`, details: { documentType: stored.documentType, villaKey: stored.villaKey } });
      await appendActivityAudit({
        eventType: "document_create",
        actorEmail: ctx.user.email ?? "admin",
        actorName: ctx.user.name,
        entityType: "unit_document",
        entityKey: `${stored.villaKey}:${stored.id}`,
        summary: `Added ${stored.documentType} document to ${stored.villaKey}.`,
        changes: { documentType: stored.documentType, websiteVisibility: stored.websiteVisibility },
      });
      return stored;
    }),

  archive: masterProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const row = (await db.select().from(unitDocuments).where(eq(unitDocuments.id, input.id)).limit(1))[0];
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    await db.update(unitDocuments).set({ removedAt: new Date() }).where(eq(unitDocuments.id, input.id));
    await appendActivityAudit({
      eventType: "document_remove",
      actorEmail: ctx.user.email ?? "admin",
      actorName: ctx.user.name,
      entityType: "unit_document",
      entityKey: `${row.villaKey}:${row.id}`,
      summary: `Archived ${row.documentType} registration for ${row.villaKey}; the OneDrive file remains intact.`,
    });
    return { success: true };
  }),

  exportWorkbook: masterProcedure.mutation(async ({ ctx }) => {
    const result = await exportUnitRegisterWorkbook();
    await recordEvent({ eventType: "workbook_export", status: "success", idempotencyKey: `workbook:${result.itemId}:${result.etag ?? Date.now()}`, summary: `Exported ${result.profileCount} operational unit profiles to the OneDrive workbook.`, details: { profileCount: result.profileCount } });
    await appendActivityAudit({
      eventType: "onedrive_sync",
      actorEmail: ctx.user.email ?? "admin",
      actorName: ctx.user.name,
      entityType: "onedrive_workbook",
      entityKey: result.itemId,
      summary: `Exported Saadiyat Unit Register with ${result.profileCount} profiles.`,
    });
    return result;
  }),

  events: masterProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).default({ limit: 50 }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(oneDriveSyncEvents).orderBy(desc(oneDriveSyncEvents.createdAt)).limit(input.limit);
    }),
});
