import { and, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertVillaFile, users, villaFiles } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ---------- Villa file helpers ---------- */

export async function insertVillaFile(file: InsertVillaFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(villaFiles).values(file);
  const [row] = await db
    .select()
    .from(villaFiles)
    .where(eq(villaFiles.storageKey, file.storageKey))
    .limit(1);
  return row;
}

export async function listFilesForVilla(villaKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(villaFiles)
    .where(and(eq(villaFiles.scope, "villa"), eq(villaFiles.villaKey, villaKey)))
    .orderBy(desc(villaFiles.createdAt));
}

export async function listGlobalFiles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(villaFiles)
    .where(and(eq(villaFiles.scope, "global"), isNull(villaFiles.villaKey)))
    .orderBy(desc(villaFiles.createdAt));
}

export async function listAllFiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(villaFiles).orderBy(desc(villaFiles.createdAt));
}

export async function getFileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(villaFiles).where(eq(villaFiles.id, id)).limit(1);
  return rows[0];
}

export async function deleteFileById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(villaFiles).where(eq(villaFiles.id, id));
}


/* ---------- Availability listings helpers ---------- */

import {
  availabilityListings,
  type InsertAvailabilityListing,
} from "../drizzle/schema";

export async function listAvailability(filters?: {
  community?: string;
  status?: "available" | "reserved" | "sold" | "off-market";
  source?: "nas-luxury" | "aldar" | "others" | "manual";
}) {
  const db = await getDb();
  if (!db) return [];
  const conds = [] as ReturnType<typeof eq>[];
  if (filters?.community) conds.push(eq(availabilityListings.community, filters.community));
  if (filters?.status) conds.push(eq(availabilityListings.status, filters.status));
  if (filters?.source) conds.push(eq(availabilityListings.source, filters.source));
  const where = conds.length ? and(...conds) : undefined;
  const q = db.select().from(availabilityListings);
  return where ? q.where(where).orderBy(desc(availabilityListings.updatedAt)) : q.orderBy(desc(availabilityListings.updatedAt));
}

export async function getAvailabilityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(availabilityListings)
    .where(eq(availabilityListings.id, id))
    .limit(1);
  return rows[0];
}

export async function insertAvailability(row: InsertAvailabilityListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(availabilityListings).values(row);
  const [latest] = await db
    .select()
    .from(availabilityListings)
    .where(
      and(
        eq(availabilityListings.community, row.community),
        eq(availabilityListings.unitKey, row.unitKey),
        eq(availabilityListings.source, row.source),
      ),
    )
    .orderBy(desc(availabilityListings.createdAt))
    .limit(1);
  return latest;
}

export async function updateAvailability(
  id: number,
  patch: Partial<Omit<InsertAvailabilityListing, "id">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(availabilityListings)
    .set(patch)
    .where(eq(availabilityListings.id, id));
  return getAvailabilityById(id);
}

export async function deleteAvailability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(availabilityListings).where(eq(availabilityListings.id, id));
}

export async function countAvailabilityByCommunity() {
  const db = await getDb();
  if (!db) return [] as Array<{ community: string; status: string; source: string; count: number }>;
  // Aggregate in JS for simplicity (volume is low):
  const rows = await db
    .select()
    .from(availabilityListings);
  const map = new Map<string, { community: string; status: string; source: string; count: number }>();
  for (const r of rows) {
    const k = `${r.community}|${r.status}|${r.source}`;
    const cur = map.get(k);
    if (cur) cur.count++;
    else map.set(k, { community: r.community, status: r.status, source: r.source, count: 1 });
  }
  return Array.from(map.values());
}
