#!/usr/bin/env node
/**
 * Seed the availability_listings table with the 9 NAS Luxury Lagoons villas.
 * Idempotent: skips rows already present (community, unitKey, source unique).
 */
import { drizzle } from "drizzle-orm/mysql2";
import { and, eq } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = drizzle(url);

// Inline minimal table definition matching schema:
import { mysqlTable, int, varchar, mysqlEnum, bigint, text, timestamp } from "drizzle-orm/mysql-core";
const availabilityListings = mysqlTable("availability_listings", {
  id: int("id").autoincrement().primaryKey(),
  community: varchar("community", { length: 64 }).notNull(),
  unitKey: varchar("unitKey", { length: 128 }).notNull(),
  source: mysqlEnum("source", ["nas-luxury", "aldar", "others", "manual"]).notNull(),
  status: mysqlEnum("status", ["available", "reserved", "sold", "off-market"]).notNull(),
  askingPriceAed: bigint("askingPriceAed", { mode: "number" }),
  bedrooms: int("bedrooms"),
  notes: text("notes"),
  contactLabel: varchar("contactLabel", { length: 128 }),
  addedBy: int("addedBy").notNull(),
  addedByName: varchar("addedByName", { length: 255 }),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

const raw = JSON.parse(
  readFileSync(resolve(__dirname, "../server/data/nas_luxury_lagoons.json"), "utf-8"),
);

const COMMUNITY = "saadiyat-lagoons";
const OWNER_ID = parseInt(process.env.OWNER_ID || "1", 10);
const OWNER_NAME = process.env.OWNER_NAME || "System";

let inserted = 0;
let skipped = 0;

for (const l of raw.listings) {
  const unitKey = l.lagoons_unit_number || l.aldar_unit_name;
  if (!unitKey) continue;

  // Check if exists:
  const existing = await db
    .select()
    .from(availabilityListings)
    .where(
      and(
        eq(availabilityListings.community, COMMUNITY),
        eq(availabilityListings.unitKey, unitKey),
        eq(availabilityListings.source, "nas-luxury"),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    skipped++;
    continue;
  }

  const notesParts = [];
  if (l.position) notesParts.push(`Position: ${l.position}`);
  if (l.specification) notesParts.push(`Spec: ${l.specification}`);
  if (l.finishing) notesParts.push(l.finishing);
  if (l.plot_sqm) notesParts.push(`Plot: ${l.plot_sqm} sqm`);
  if (l.built_up_sqft) notesParts.push(`BUA: ${l.built_up_sqft} sqft`);
  if (l.payment_plan) notesParts.push(`Payment: ${l.payment_plan}`);
  if (l.paid_percent != null) notesParts.push(`Paid: ${l.paid_percent}%`);
  if (l.signature_deal) notesParts.push("Signature deal");
  if (l.highlights) notesParts.push(`Note: ${l.highlights}`);

  await db.insert(availabilityListings).values({
    community: COMMUNITY,
    unitKey,
    source: "nas-luxury",
    status: "available",
    askingPriceAed: l.selling_price_aed ?? null,
    bedrooms: l.bedrooms ?? null,
    notes: notesParts.join(" · ") || null,
    contactLabel: raw.agent?.name ?? null,
    addedBy: OWNER_ID,
    addedByName: OWNER_NAME,
  });
  inserted++;
  console.log(`Inserted: ${unitKey} (option ${l.option})`);
}

console.log(`\nDone. Inserted: ${inserted}, Skipped (already present): ${skipped}`);
process.exit(0);
