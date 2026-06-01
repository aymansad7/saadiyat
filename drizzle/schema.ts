import {
  bigint,
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
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
    addedBy: varchar("addedBy", { length: 320 }),
    note: varchar("note", { length: 255 }),
    /** Last successful magic-link verification — used for the admin "last seen" column. */
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
