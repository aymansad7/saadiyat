import {
  bigint,
  boolean,
  double,
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "master"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Files attached to a specific villa or to the global island library.
 *
 * - Per-villa attachment:  scope = "villa",  villaKey = "<communitySlug>/<villaSlug>"
 *                          e.g. "st-regis/villa-12", "saadiyat-beach-villas/gate-2-15"
 * - Global Documents lib:  scope = "global", villaKey = NULL
 *
 * Storage layer holds the actual bytes (S3); we store only the storage key + metadata.
 */
export const villaFiles = mysqlTable(
  "villa_files",
  {
    id: int("id").autoincrement().primaryKey(),
    scope: mysqlEnum("scope", ["villa", "global"]).notNull(),
    /** Compound key identifying the villa (community slug + villa slug). NULL when scope=global. */
    villaKey: varchar("villaKey", { length: 128 }),
    /** Optional secondary tag — e.g. "brochure", "floorplan", "contract", "photo". */
    category: varchar("category", { length: 64 }),
    /** Original filename as uploaded by the user. */
    filename: varchar("filename", { length: 255 }).notNull(),
    /** MIME type (e.g. application/pdf, image/png). */
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    /** File size in bytes. */
    sizeBytes: bigint("sizeBytes", { mode: "number" }).notNull(),
    /** Storage key returned by storagePut — used to build /manus-storage/<key>. */
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    /** Optional human-readable description shown in the UI. */
    description: text("description"),
    /** ID of the user who uploaded the file. */
    uploadedBy: int("uploadedBy").notNull(),
    /** Display name snapshot of uploader (so we don't have to JOIN every list). */
    uploaderName: varchar("uploaderName", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    villaKeyIdx: index("villaFiles_villaKey_idx").on(t.villaKey),
    scopeIdx: index("villaFiles_scope_idx").on(t.scope),
  }),
);

export type VillaFile = typeof villaFiles.$inferSelect;
export type InsertVillaFile = typeof villaFiles.$inferInsert;

/**
 * Singleton key/value store for app settings (current passcode, etc.)
 * Use one row per setting (e.g. key="gate_passcode").
 */
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 64 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AppSetting = typeof appSettings.$inferSelect;

/**
 * Every passcode submission lands here — success or failure.
 */
export const gateAttempts = mysqlTable(
  "gate_attempts",
  {
    id: int("id").autoincrement().primaryKey(),
    success: boolean("success").notNull(),
    /** Best-effort visitor identifier from the X-Visitor-Id cookie. */
    visitorId: varchar("visitorId", { length: 64 }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
    /** Stored only for FAILED attempts so the owner can audit; truncated to 32 chars. */
    submittedValue: varchar("submittedValue", { length: 32 }),
    /** A human label of the rule that caused this attempt to be flagged (e.g. "high_velocity"). */
    flagReason: varchar("flagReason", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => ({
    visitorIdx: index("gate_attempts_visitor_idx").on(t.visitorId),
    ipIdx: index("gate_attempts_ip_idx").on(t.ip),
    createdAtIdx: index("gate_attempts_createdAt_idx").on(t.createdAt),
  }),
);
export type GateAttempt = typeof gateAttempts.$inferSelect;

/**
 * Active visitor sessions — created on a successful unlock, kept fresh by
 * heartbeat from the client. "Who is in" is derived from rows whose
 * lastSeenAt is recent.
 */
export const gateSessions = mysqlTable(
  "gate_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    visitorId: varchar("visitorId", { length: 64 }).notNull().unique(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
    label: varchar("label", { length: 128 }),
    pageHits: int("pageHits").default(0).notNull(),
    firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
    leftAt: timestamp("leftAt"),
  },
  t => ({
    lastSeenIdx: index("gate_sessions_lastSeen_idx").on(t.lastSeenAt),
    ipIdx: index("gate_sessions_ip_idx").on(t.ip),
  }),
);
export type GateSession = typeof gateSessions.$inferSelect;

/**
 * Page-level hit log — one row per route view per visitor.
 */
export const pageHits = mysqlTable(
  "page_hits",
  {
    id: int("id").autoincrement().primaryKey(),
    visitorId: varchar("visitorId", { length: 64 }),
    ip: varchar("ip", { length: 64 }),
    /** The full pathname (e.g. /aldar-saadiyat/the-grove/heart-1). */
    path: varchar("path", { length: 512 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => ({
    visitorIdx: index("page_hits_visitor_idx").on(t.visitorId),
    createdAtIdx: index("page_hits_createdAt_idx").on(t.createdAt),
  }),
);
export type PageHit = typeof pageHits.$inferSelect;

/**
 * Audit log for security events — auto-rotations, manual rotations,
 * suspicious-activity bursts, etc. Surfaces as the “alerts” feed in /admin.
 */
export const securityEvents = mysqlTable(
  "security_events",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Free-form code, e.g. "auto_rotate", "manual_rotate", "high_failure_burst". */
    eventType: varchar("eventType", { length: 64 }).notNull(),
    severity: mysqlEnum("severity", ["info", "warning", "critical"])
      .default("info")
      .notNull(),
    visitorId: varchar("visitorId", { length: 64 }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
    summary: varchar("summary", { length: 512 }).notNull(),
    details: text("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => ({
    typeIdx: index("security_events_type_idx").on(t.eventType),
    createdAtIdx: index("security_events_createdAt_idx").on(t.createdAt),
  }),
);
export type SecurityEvent = typeof securityEvents.$inferSelect;


/**
 * Community-agnostic availability listings.
 *
 * Each row represents a single villa/unit that is currently available (or in
 * some other status) — regardless of which community it belongs to.
 *
 * - `community` is the community slug (e.g. "saadiyat-lagoons", "jawaher",
 *   "saadiyat-beach-villas"). Free-form to accept future communities.
 * - `unitKey` is the canonical unit identifier within the community
 *   (e.g. "Lagoons-AlSidr-V-065-01" for Lagoons, "Jawaher-Plot-83" for Jawaher,
 *   "SBV-Gate2-Plot-15" for Saadiyat Beach Villas). Free-form to keep
 *   flexibility across communities.
 * - `source` distinguishes the data origin:
 *     "nas-luxury" — confirmed with NAS Luxury (green badge)
 *     "aldar"      — from official Aldar resale workbook (amber badge)
 *     "others"     — known to be on the market with other brokers (neutral)
 *     "manual"     — added manually via admin form
 * - `status` is the displayable status:
 *     "available", "reserved", "sold", "off-market"
 */
export const availabilityListings = mysqlTable(
  "availability_listings",
  {
    id: int("id").autoincrement().primaryKey(),
    community: varchar("community", { length: 64 }).notNull(),
    unitKey: varchar("unitKey", { length: 128 }).notNull(),
    source: mysqlEnum("source", [
      "nas-luxury",
      "aldar",
      "others",
      "manual",
    ]).notNull(),
    status: mysqlEnum("status", [
      "available",
      "reserved",
      "sold",
      "off-market",
    ])
      .default("available")
      .notNull(),
    /** Asking price in AED. NULL when unknown. */
    askingPriceAed: bigint("askingPriceAed", { mode: "number" }),
    /** Bedrooms (e.g. 3, 4, 5, 6). NULL when unknown. */
    bedrooms: int("bedrooms"),
    /** Free-form notes (signature deal, finishing, payment plan, etc.). */
    notes: text("notes"),
    /** Optional contact/owner label (NOT shown publicly). */
    contactLabel: varchar("contactLabel", { length: 128 }),
    /** User who added this listing. */
    addedBy: varchar("addedBy", { length: 128 }).notNull(),
    /** Display-name snapshot of the user who added it. */
    addedByName: varchar("addedByName", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    communityIdx: index("availability_listings_community_idx").on(t.community),
    unitKeyIdx: index("availability_listings_unitKey_idx").on(t.unitKey),
    statusIdx: index("availability_listings_status_idx").on(t.status),
    sourceIdx: index("availability_listings_source_idx").on(t.source),
  }),
);
export type AvailabilityListing = typeof availabilityListings.$inferSelect;
export type InsertAvailabilityListing =
  typeof availabilityListings.$inferInsert;


/**
 * Email allowlist — only these addresses can request a magic link.
 *
 * - `role` mirrors `users.role` so admins can be flagged at allowlist time
 *   (the user table is created on first sign-in and inherits this role).
 * - `addedBy` stores the email of the admin who added the entry; this avoids a
 *   chicken-and-egg lookup against `users.id` during the bootstrap seed.
 */
export const allowedEmails = mysqlTable(
  "allowed_emails",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    role: mysqlEnum("role", ["user", "admin", "master"]).default("user").notNull(),
    /** Scrypt-encoded password hash. The raw password is never persisted. */
    passwordHash: varchar("passwordHash", { length: 255 }),
    /** Failed password attempts since the last successful verification. */
    passwordFailedAttempts: int("passwordFailedAttempts").default(0).notNull(),
    /** Temporary lockout timestamp after repeated password failures. */
    passwordLockedUntil: timestamp("passwordLockedUntil"),
    passwordUpdatedAt: timestamp("passwordUpdatedAt"),
    addedBy: varchar("addedBy", { length: 320 }),
    note: varchar("note", { length: 255 }),
    /** Last successful email/password or OAuth verification — used for the admin "last seen" column. */
    lastSeenAt: timestamp("lastSeenAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("allowed_emails_email_idx").on(t.email),
  }),
);
export type AllowedEmail = typeof allowedEmails.$inferSelect;
export type InsertAllowedEmail = typeof allowedEmails.$inferInsert;

/**
 * Outstanding magic-link codes. One row per request; the row is marked
 * `consumedAt` on success or simply expires.
 *
 * We store a SHA-256 hash of the 6-digit code (never the raw code) so a DB
 * leak doesn't immediately compromise pending logins. We rely on TLS to
 * deliver the email, plus a 10-minute expiry.
 */
export const magicLinks = mysqlTable(
  "magic_links",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    /** SHA-256 of the 6-digit code. */
    codeHash: varchar("codeHash", { length: 64 }).notNull(),
    /** Number of failed verification attempts on this code. After 5 we hard-expire it. */
    failedAttempts: int("failedAttempts").default(0).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    consumedAt: timestamp("consumedAt"),
    requestIp: varchar("requestIp", { length: 64 }),
    requestUserAgent: text("requestUserAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("magic_links_email_idx").on(t.email),
    expiresIdx: index("magic_links_expires_idx").on(t.expiresAt),
  }),
);
export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

/**
 * Long-lived bearer cookie sessions issued after a successful magic-link
 * verification. The token is opaque (32 random bytes, hex-encoded) and stored
 * as-is — we just need a fast O(1) lookup; if the DB is compromised the
 * attacker can already impersonate every session anyway.
 */
export const authSessions = mysqlTable(
  "auth_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    token: varchar("token", { length: 128 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    revokedAt: timestamp("revokedAt"),
    lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
  },
  (t) => ({
    emailIdx: index("auth_sessions_email_idx").on(t.email),
    expiresIdx: index("auth_sessions_expires_idx").on(t.expiresAt),
  }),
);
export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;


/**
 * Per-villa "property profile" — one row per real-world villa or plot, holding
 * the latest editable state (price, status, listing partners, owner contact,
 * internal notes). Public fields appear on detail/card views; the
 * `owner*` and `internalNotes` fields are restricted to admin/master.
 *
 * `villaKey` is the same compound key used everywhere else
 * (e.g. "st-regis/villa-12", "saadiyat-beach-villas/Gate2-Plot-1",
 *  "jawaher/Plot-100", "lagoons/<cluster>-<plot>").
 */
export const villaListings = mysqlTable(
  "villa_listings",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Compound key (community-slug/villa-slug). One row per real-world villa. */
    villaKey: varchar("villaKey", { length: 128 }).notNull().unique(),
    /** Community slug for filtering ('st-regis' | 'jawaher' | 'saadiyat-beach-villas' | 'lagoons'). */
    community: varchar("community", { length: 64 }).notNull(),

    /* ------------ public fields ------------ */
    /** Asking / listed price in AED. NULL when not yet listed. */
    askingPriceAed: bigint("askingPriceAed", { mode: "number" }),
    /** Listing status. */
    status: mysqlEnum("status", [
      "draft",
      "available",
      "warm",
      "reserved",
      "sold",
      "off-market",
    ])
      .default("draft")
      .notNull(),
    /** Public listing-partner labels — comma-separated names of brokerages. */
    listingPartners: text("listingPartners"),
    /** Public-facing remarks (finishing, view, payment plan, signature features). */
    publicNotes: text("publicNotes"),
    /** Editable land-area override in square metres. Source data remains unchanged. */
    landAreaSqm: double("landAreaSqm"),
    /** Editable built-up/internal-area override in square metres. Source data remains unchanged. */
    builtUpAreaSqm: double("builtUpAreaSqm"),
    /** Whether this property is currently available for rent. NULL means not specified. */
    availableForRent: boolean("availableForRent"),
    /** Current rent asking price in AED. NULL when unknown or not offered for rent. */
    rentPriceAed: bigint("rentPriceAed", { mode: "number" }),

    /* ------------ admin-only fields ------------ */
    ownerName: varchar("ownerName", { length: 255 }),
    ownerPhone: varchar("ownerPhone", { length: 64 }),
    ownerEmail: varchar("ownerEmail", { length: 320 }),
    /** Free-form internal notes (deal history, motivation, prior offers). */
    internalNotes: text("internalNotes"),

    /* ------------ audit-light fields ------------ */
    /** Email of last user who edited this listing. */
    updatedBy: varchar("updatedBy", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    villaListingsCommunityIdx: index("villa_listings_community_idx").on(t.community),
    villaListingsStatusIdx: index("villa_listings_status_idx").on(t.status),
  }),
);
export type VillaListing = typeof villaListings.$inferSelect;
export type InsertVillaListing = typeof villaListings.$inferInsert;

/**
 * Append-only audit log for `villa_listings` edits. We snapshot the changed
 * fields as JSON-encoded text to keep the schema simple and queries trivial.
 */
export const villaListingAudit = mysqlTable(
  "villa_listing_audit",
  {
    id: int("id").autoincrement().primaryKey(),
    villaKey: varchar("villaKey", { length: 128 }).notNull(),
    /** Email of the actor (from magic-link session or OAuth user). */
    actorEmail: varchar("actorEmail", { length: 320 }).notNull(),
    actorName: varchar("actorName", { length: 255 }),
    /** Free-form summary, e.g. "set askingPriceAed=5,200,000; status=available". */
    summary: text("summary").notNull(),
    /** JSON-encoded {field: {from, to}} payload (trimmed to 8 KB). */
    changesJson: text("changesJson"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    auditVillaIdx: index("villa_listing_audit_villaKey_idx").on(t.villaKey),
    auditActorIdx: index("villa_listing_audit_actor_idx").on(t.actorEmail),
  }),
);
export type VillaListingAuditRow = typeof villaListingAudit.$inferSelect;
export type InsertVillaListingAudit = typeof villaListingAudit.$inferInsert;

/**
 * Master-managed, field-aware property visibility grants. A grant applies to
 * either an area (`areaKey`) or a specific project (`projectKey`). Both must
 * never be blank; enforcement happens in the application so it can derive a
 * property's area/project context from its canonical key.
 */
export const propertyAccessGrants = mysqlTable(
  "property_access_grants",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Recipient email, normalized before persistence. */
    email: varchar("email", { length: 320 }).notNull(),
    /** Broad operational area, e.g. `saadiyat`, `yas-island`, or `dubai`. */
    areaKey: varchar("areaKey", { length: 96 }),
    /** Optional canonical community/project slug; narrows a grant when supplied. */
    projectKey: varchar("projectKey", { length: 128 }),
    /** Optional source-backed phase key; valid only with a project grant. */
    phaseKey: varchar("phaseKey", { length: 64 }),
    /** Field visibility — false by default for sensitive data. */
    canViewOriginalPrice: boolean("canViewOriginalPrice").default(false).notNull(),
    canViewOwnerName: boolean("canViewOwnerName").default(false).notNull(),
    canViewOwnerPhone: boolean("canViewOwnerPhone").default(false).notNull(),
    /** A delegated editor may update property profile fields within this scope. */
    canEditProperties: boolean("canEditProperties").default(false).notNull(),
    createdBy: varchar("createdBy", { length: 320 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    grantEmailIdx: index("property_access_grants_email_idx").on(t.email),
    grantAreaIdx: index("property_access_grants_area_idx").on(t.areaKey),
    grantProjectIdx: index("property_access_grants_project_idx").on(t.projectKey),
    grantPhaseIdx: index("property_access_grants_phase_idx").on(t.projectKey, t.phaseKey),
  }),
);
export type PropertyAccessGrant = typeof propertyAccessGrants.$inferSelect;
export type InsertPropertyAccessGrant = typeof propertyAccessGrants.$inferInsert;

/**
 * OneDrive Business connection metadata. This table deliberately contains no
 * Microsoft password, client secret, bearer token, or refresh token. Secrets
 * are managed only through the server environment. A single `primary` row
 * represents the `Saadiyat Resale Hub` root folder in the owner's drive.
 */
export const oneDriveConnections = mysqlTable(
  "onedrive_connections",
  {
    id: int("id").autoincrement().primaryKey(),
    connectionKey: varchar("connectionKey", { length: 64 }).notNull().unique(),
    provider: mysqlEnum("provider", ["onedrive_business"]).default("onedrive_business").notNull(),
    status: mysqlEnum("status", ["pending", "authorized", "active", "error"]).default("pending").notNull(),
    ownerUpn: varchar("ownerUpn", { length: 320 }).notNull(),
    tenantId: varchar("tenantId", { length: 64 }),
    clientId: varchar("clientId", { length: 64 }),
    driveId: varchar("driveId", { length: 255 }),
    rootItemId: varchar("rootItemId", { length: 512 }),
    rootPath: varchar("rootPath", { length: 512 }).notNull(),
    unitRegisterItemId: varchar("unitRegisterItemId", { length: 512 }),
    lastWorkbookExportAt: timestamp("lastWorkbookExportAt"),
    lastError: text("lastError"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    statusIdx: index("onedriveConnections_status_idx").on(t.status),
  }),
);
export type OneDriveConnection = typeof oneDriveConnections.$inferSelect;
export type InsertOneDriveConnection = typeof oneDriveConnections.$inferInsert;

/**
 * Metadata-only registry for a file stored in OneDrive. The OneDrive drive item
 * is the file authority; document bytes are never duplicated in this database.
 * `websiteVisibility` controls who may receive the item link from the website.
 * A OneDrive `anyone_link` can still be viewed by a person who receives it, so
 * confidential file links are never returned from public card/map APIs.
 */
export const unitDocuments = mysqlTable(
  "unit_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    villaKey: varchar("villaKey", { length: 128 }).notNull(),
    community: varchar("community", { length: 128 }).notNull(),
    phaseKey: varchar("phaseKey", { length: 64 }),
    documentType: mysqlEnum("documentType", [
      "brochure",
      "spa",
      "owner_document",
      "floorplan",
      "source_file",
      "marketing",
      "other",
    ]).notNull(),
    websiteVisibility: mysqlEnum("websiteVisibility", ["card_link", "master_admin"])
      .default("master_admin")
      .notNull(),
    shareAccess: mysqlEnum("shareAccess", ["anyone_link", "restricted"])
      .default("anyone_link")
      .notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    sizeBytes: bigint("sizeBytes", { mode: "number" }),
    description: text("description"),
    driveId: varchar("driveId", { length: 255 }).notNull(),
    itemId: varchar("itemId", { length: 512 }).notNull(),
    parentItemId: varchar("parentItemId", { length: 512 }),
    webUrl: text("webUrl"),
    shareUrl: text("shareUrl"),
    etag: varchar("etag", { length: 512 }),
    versionLabel: varchar("versionLabel", { length: 128 }),
    uploadedBy: varchar("uploadedBy", { length: 320 }).notNull(),
    uploadedByName: varchar("uploadedByName", { length: 255 }),
    removedAt: timestamp("removedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    driveItemUnique: uniqueIndex("unitDocuments_drive_item_unique").on(t.driveId, t.itemId),
    villaIdx: index("unitDocuments_villaKey_idx").on(t.villaKey),
    communityIdx: index("unitDocuments_community_idx").on(t.community),
    typeIdx: index("unitDocuments_type_idx").on(t.documentType),
    visibilityIdx: index("unitDocuments_visibility_idx").on(t.websiteVisibility),
  }),
);
export type UnitDocument = typeof unitDocuments.$inferSelect;
export type InsertUnitDocument = typeof unitDocuments.$inferInsert;

/**
 * Durable OneDrive operation ledger. It provides idempotency, visible error
 * history, and a retryable record for upload, link, and workbook-export work.
 */
export const oneDriveSyncEvents = mysqlTable(
  "onedrive_sync_events",
  {
    id: int("id").autoincrement().primaryKey(),
    connectionKey: varchar("connectionKey", { length: 64 }).notNull(),
    documentId: int("documentId"),
    eventType: mysqlEnum("eventType", [
      "upload",
      "metadata_refresh",
      "share_link_create",
      "workbook_export",
      "failure",
    ]).notNull(),
    status: mysqlEnum("status", ["pending", "success", "error"]).default("pending").notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull().unique(),
    summary: text("summary").notNull(),
    detailsJson: text("detailsJson"),
    errorMessage: text("errorMessage"),
    attemptedAt: timestamp("attemptedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    connectionIdx: index("onedriveSyncEvents_connection_idx").on(t.connectionKey),
    documentIdx: index("onedriveSyncEvents_document_idx").on(t.documentId),
    statusIdx: index("onedriveSyncEvents_status_idx").on(t.status),
  }),
);
export type OneDriveSyncEvent = typeof oneDriveSyncEvents.$inferSelect;
export type InsertOneDriveSyncEvent = typeof oneDriveSyncEvents.$inferInsert;

/**
 * Append-only record of authenticated sign-ins and privileged changes. It is
 * intentionally separate from the per-listing audit table so Master Admin can
 * review activity across properties, user grants, and sessions in one place.
 */
export const activityAudit = mysqlTable(
  "activity_audit",
  {
    id: int("id").autoincrement().primaryKey(),
    eventType: mysqlEnum("eventType", [
      "sign_in",
      "property_edit",
      "access_grant_create",
      "access_grant_update",
      "access_grant_delete",
      "access_role_update",
      "document_create",
      "document_update",
      "document_remove",
      "onedrive_sync",
    ]).notNull(),
    actorEmail: varchar("actorEmail", { length: 320 }).notNull(),
    actorName: varchar("actorName", { length: 255 }),
    targetEmail: varchar("targetEmail", { length: 320 }),
    entityType: varchar("entityType", { length: 64 }),
    entityKey: varchar("entityKey", { length: 191 }),
    summary: text("summary").notNull(),
    /** JSON-encoded before/after data; sensitive fields are kept admin-only. */
    changesJson: text("changesJson"),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    activityCreatedIdx: index("activity_audit_createdAt_idx").on(t.createdAt),
    activityActorIdx: index("activity_audit_actor_idx").on(t.actorEmail),
    activityTargetIdx: index("activity_audit_target_idx").on(t.targetEmail),
    activityEntityIdx: index("activity_audit_entity_idx").on(t.entityType, t.entityKey),
  }),
);
export type ActivityAudit = typeof activityAudit.$inferSelect;
export type InsertActivityAudit = typeof activityAudit.$inferInsert;


/* =====================================================================
 * Aldar inventory history / timeline
 *
 * Three tables power the per-unit timeline + change-summary feature:
 *
 *   inventory_sync_runs   — one row per sync (weekly Mon 06:00 or manual import).
 *                           Holds aggregate counts of what changed.
 *   inventory_unit_state  — the LATEST known state of every Aldar unit, keyed by
 *                           unitName. Used as the "previous" side of each diff so
 *                           we never have to re-scan a full historical snapshot.
 *   inventory_unit_events — append-only timeline. One row per detected change
 *                           (first_seen / status_change / price_change / removed)
 *                           for a single unit, tied to the run that detected it.
 *
 * dataset distinguishes the two source files:
 *   "saadiyat" → server/data/aldar_saadiyat.json  (18 projects)
 *   "other"    → server/data/aldar_other.json      (24 projects, master-only)
 * ===================================================================== */

export const inventorySyncRuns = mysqlTable(
  "inventory_sync_runs",
  {
    id: int("id").autoincrement().primaryKey(),
    /** How the run was triggered. */
    trigger: mysqlEnum("trigger", ["scheduled", "manual", "seed"]).notNull(),
    /** Status of the run. */
    status: mysqlEnum("status", ["running", "success", "error"]).default("running").notNull(),
    /** Email/label of who triggered a manual run; "cron" for scheduled; "system" for seed. */
    triggeredBy: varchar("triggeredBy", { length: 320 }),

    /* aggregate diff counts (across both datasets) */
    unitsScanned: int("unitsScanned").default(0).notNull(),
    newUnits: int("newUnits").default(0).notNull(),
    soldUnits: int("soldUnits").default(0).notNull(),
    statusChanges: int("statusChanges").default(0).notNull(),
    priceChanges: int("priceChanges").default(0).notNull(),
    removedUnits: int("removedUnits").default(0).notNull(),
    /** JSON summary of source-complete projects first detected in this run. */
    newProjectsJson: text("newProjectsJson"),

    /** Optional error message when status="error". */
    errorMessage: text("errorMessage"),
    /** JSON-encoded per-project rollup of the most notable changes (trimmed). */
    summaryJson: text("summaryJson"),

    startedAt: timestamp("startedAt").defaultNow().notNull(),
    finishedAt: timestamp("finishedAt"),
  },
  t => ({
    runStatusIdx: index("inventory_sync_runs_status_idx").on(t.status),
    runStartedIdx: index("inventory_sync_runs_startedAt_idx").on(t.startedAt),
  }),
);
export type InventorySyncRun = typeof inventorySyncRuns.$inferSelect;
export type InsertInventorySyncRun = typeof inventorySyncRuns.$inferInsert;

export const inventoryUnitState = mysqlTable(
  "inventory_unit_state",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Canonical Aldar unit identifier, e.g. "FayaAlSaadiyat-SB45-V-01-01". */
    unitName: varchar("unitName", { length: 191 }).notNull(),
    /** Which source file this unit belongs to. */
    dataset: mysqlEnum("dataset", ["saadiyat", "other"]).notNull(),
    /** Project slug (e.g. "fayaalsaadiyat"). */
    projectSlug: varchar("projectSlug", { length: 128 }).notNull(),
    /** Project display name. */
    projectName: varchar("projectName", { length: 255 }),
    /** Building slug + name for grouping. */
    buildingSlug: varchar("buildingSlug", { length: 128 }),
    buildingName: varchar("buildingName", { length: 255 }),
    /** Deep link back to Aldar. */
    aldarLink: text("aldarLink"),
    /** Latest status as reported by Aldar (Available/Sold/Booked/Reserved/Blocked/New/...). */
    status: varchar("status", { length: 64 }),
    /** Latest price in AED. NULL when unknown. */
    priceAed: bigint("priceAed", { mode: "number" }),
    bedrooms: varchar("bedrooms", { length: 32 }),
    unitType: varchar("unitType", { length: 64 }),
    /** True once a unit disappears from the source (treated as removed). */
    isPresent: boolean("isPresent").default(true).notNull(),
    /** Run that first inserted this unit. */
    firstSeenRunId: int("firstSeenRunId"),
    firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
    /** Run that last touched this unit. */
    lastSeenRunId: int("lastSeenRunId"),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    stateDatasetIdx: index("inventory_unit_state_dataset_idx").on(t.dataset),
    stateProjectIdx: index("inventory_unit_state_project_idx").on(t.projectSlug),
    stateStatusIdx: index("inventory_unit_state_status_idx").on(t.status),
    stateIdentityUnique: uniqueIndex("inventory_unit_state_identity_unique").on(
      t.dataset,
      t.projectSlug,
      t.unitName,
    ),
  }),
);
export type InventoryUnitState = typeof inventoryUnitState.$inferSelect;
export type InsertInventoryUnitState = typeof inventoryUnitState.$inferInsert;

/**
 * Latest complete project payload from an administrator-imported Aldar source.
 * The source is retained as provided so a newly detected project can appear in
 * the existing Aldar project/unit pages without inventing fields or prices.
 */
export const inventoryImportedProjects = mysqlTable(
  "inventory_imported_projects",
  {
    id: int("id").autoincrement().primaryKey(),
    dataset: mysqlEnum("dataset", ["saadiyat", "other"]).notNull(),
    projectSlug: varchar("projectSlug", { length: 128 }).notNull(),
    projectName: varchar("projectName", { length: 255 }).notNull(),
    /** Saadiyat is explicit; unknown non-Saadiyat projects remain Other Areas pending review. */
    areaKey: varchar("areaKey", { length: 64 }).notNull(),
    /** Complete source project object only; never user-entered listing or owner data. */
    sourceJson: longtext("sourceJson").notNull(),
    unitCount: int("unitCount").default(0).notNull(),
    availableCount: int("availableCount").default(0).notNull(),
    firstDetectedRunId: int("firstDetectedRunId"),
    lastImportedRunId: int("lastImportedRunId").notNull(),
    importedBy: varchar("importedBy", { length: 320 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    importedProjectIdentityUnique: uniqueIndex("inventory_imported_projects_identity_unique").on(
      t.dataset,
      t.projectSlug,
    ),
    importedProjectAreaIdx: index("inventory_imported_projects_area_idx").on(t.areaKey),
    importedProjectRunIdx: index("inventory_imported_projects_run_idx").on(t.lastImportedRunId),
  }),
);
export type InventoryImportedProject = typeof inventoryImportedProjects.$inferSelect;

export const inventoryUnitEvents = mysqlTable(
  "inventory_unit_events",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Canonical Aldar unit identifier. */
    unitName: varchar("unitName", { length: 191 }).notNull(),
    dataset: mysqlEnum("dataset", ["saadiyat", "other"]).notNull(),
    projectSlug: varchar("projectSlug", { length: 128 }).notNull(),
    projectName: varchar("projectName", { length: 255 }),
    /** Event kind. */
    eventType: mysqlEnum("eventType", [
      "first_seen",
      "status_change",
      "price_change",
      "removed",
      "reappeared",
    ]).notNull(),
    /** Status before/after (for status_change & first_seen.toStatus). */
    fromStatus: varchar("fromStatus", { length: 64 }),
    toStatus: varchar("toStatus", { length: 64 }),
    /** Price before/after in AED (for price_change & first_seen.toPrice). */
    fromPriceAed: bigint("fromPriceAed", { mode: "number" }),
    toPriceAed: bigint("toPriceAed", { mode: "number" }),
    /** The sync run that detected this event. */
    runId: int("runId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => ({
    eventsUnitIdx: index("inventory_unit_events_unit_idx").on(t.unitName),
    eventsProjectIdx: index("inventory_unit_events_project_idx").on(t.projectSlug),
    eventsTypeIdx: index("inventory_unit_events_type_idx").on(t.eventType),
    eventsRunIdx: index("inventory_unit_events_run_idx").on(t.runId),
    eventsCreatedIdx: index("inventory_unit_events_createdAt_idx").on(t.createdAt),
  }),
);
export type InventoryUnitEvent = typeof inventoryUnitEvents.$inferSelect;
export type InsertInventoryUnitEvent = typeof inventoryUnitEvents.$inferInsert;
