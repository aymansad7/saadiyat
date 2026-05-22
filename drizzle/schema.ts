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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
