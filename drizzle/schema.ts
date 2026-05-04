import { bigint, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
