import { readFileSync } from "node:fs";
import { and, eq, inArray } from "drizzle-orm";
import { propertyOwnerUnits, villaListings } from "../drizzle/schema";
import { getDb } from "../server/db";

const APPLY = process.env.APPLY === "1";

function scopeKeyPart(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || null;
}

function parseCoordinatePhaseByUnit() {
  const source = readFileSync("client/src/data/lagoonsCoordinates.ts", "utf8");
  const start = source.indexOf("[", source.indexOf("="));
  const end = source.lastIndexOf("];") + 1;
  const rows = JSON.parse(source.slice(start, end)) as { unit_name: string; sl_phase?: string | null }[];
  return new Map(rows.map(row => [row.unit_name, row.sl_phase ?? null]));
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const dataset = JSON.parse(readFileSync("server/data/lagoons.json", "utf8")) as {
    villas: { unit_name: string; cluster: string; variant?: string | null; bedrooms?: number | null; aldar_data?: { unit_type?: string | null } | null }[];
  };
  const phaseByUnit = parseCoordinatePhaseByUnit();
  const sourceByKey = new Map(dataset.villas.map(villa => [`lagoons/${villa.unit_name}`, villa]));
  const ownerLinks = await db.select({ villaKey: propertyOwnerUnits.villaKey })
    .from(propertyOwnerUnits)
    .where(and(eq(propertyOwnerUnits.community, "lagoons"), eq(propertyOwnerUnits.relationship, "owner")));
  const keys = [...new Set(ownerLinks.map(row => row.villaKey))];
  const listings = keys.length
    ? await db.select().from(villaListings).where(and(eq(villaListings.community, "lagoons"), inArray(villaListings.villaKey, keys)))
    : [];
  let ready = 0;
  let sourceMissing = 0;
  let conflicts = 0;
  for (const listing of listings) {
    const villa = sourceByKey.get(listing.villaKey);
    if (!villa) { sourceMissing += 1; continue; }
    const expected = {
      phaseKey: phaseByUnit.get(villa.unit_name) ?? null,
      buildingKey: scopeKeyPart(`cluster-${villa.cluster}`),
      unitTypeKey: scopeKeyPart(villa.aldar_data?.unit_type ?? villa.variant),
      bedrooms: villa.bedrooms ?? null,
    };
    const contradictory = Object.entries(expected).some(([field, value]) => {
      const existing = listing[field as keyof typeof expected];
      return existing != null && value != null && existing !== value;
    });
    if (contradictory) { conflicts += 1; continue; }
    ready += 1;
    if (APPLY) {
      await db.update(villaListings).set({
        phaseKey: listing.phaseKey ?? expected.phaseKey,
        buildingKey: listing.buildingKey ?? expected.buildingKey,
        unitTypeKey: listing.unitTypeKey ?? expected.unitTypeKey,
        bedrooms: listing.bedrooms ?? expected.bedrooms,
      }).where(eq(villaListings.id, listing.id));
    }
  }
  console.log(JSON.stringify({ dryRun: !APPLY, reviewedOwnerListings: listings.length, ready, sourceMissing, conflicts }, null, 2));
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
