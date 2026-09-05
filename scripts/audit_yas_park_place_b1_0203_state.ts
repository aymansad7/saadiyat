import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const unitName = "YasParkPlace-B1-02-03";
const snapshot = JSON.parse(await readFile(new URL("../server/data/aldar_other.json", import.meta.url), "utf8"));
const project = snapshot.projects.find((candidate: { slug?: string }) => candidate.slug === "yas-park-place");
const sourceUnit = project?.buildings
  ?.flatMap((building: { units?: unknown[] }) => building.units ?? [])
  .find((unit: { unit_name?: string }) => unit.unit_name === unitName) ?? null;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is required for the read-only audit.");
const connection = await mysql.createConnection(dbUrl);
try {
  const [state] = await connection.execute(
    `SELECT unitName, status, sourceStatus, priceAed, isPresent, firstSeenAt, lastSeenAt
       FROM inventory_unit_state
      WHERE dataset = 'other' AND projectSlug = 'yas-park-place' AND unitName = ?`,
    [unitName],
  );
  const [events] = await connection.execute(
    `SELECT id, runId, createdAt, eventType, fromStatus, toStatus, fromPriceAed, toPriceAed
       FROM inventory_unit_events
      WHERE dataset = 'other' AND projectSlug = 'yas-park-place' AND unitName = ?
      ORDER BY createdAt ASC, id ASC`,
    [unitName],
  );
  console.log(JSON.stringify({
    unitName,
    source: sourceUnit ? {
      status: sourceUnit.status ?? null,
      priceAed: sourceUnit.price_aed ?? null,
      aldarLink: sourceUnit.aldar_link ?? null,
    } : null,
    state,
    events,
  }, null, 2));
} finally {
  await connection.end();
}
