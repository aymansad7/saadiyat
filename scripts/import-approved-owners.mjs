/**
 * Imports only `approved_records` from the owner-workbook audit manifest.
 * This is intentionally separate from matching: ambiguous/unmatched records
 * never reach the database. Every changed owner is logged in
 * `villa_listing_audit` before the corresponding upsert.
 */
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const auditPath = new URL("../server/data/owner_workbook_2026_08_26_audit.json", import.meta.url);
const actor = "bulk-owner-import@nasluxury.internal";
const actorName = "Newlagoonsandnoya.xlsx import";
const batchSize = 120;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the owner import");
}

const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));
const records = audit.approved_records ?? [];
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  let changed = 0;
  let unchanged = 0;
  for (let offset = 0; offset < records.length; offset += batchSize) {
    const batch = records.slice(offset, offset + batchSize);
    await connection.beginTransaction();
    try {
      for (const record of batch) {
        const [currentRows] = await connection.execute(
          "SELECT ownerName, ownerPhone FROM villa_listings WHERE villaKey = ? LIMIT 1",
          [record.villa_key],
        );
        const current = currentRows[0];
        const previousName = current?.ownerName ?? null;
        const previousPhone = current?.ownerPhone ?? null;
        const nextName = record.owner_name;
        const nextPhone = record.owner_phone ?? null;
        const differs = previousName !== nextName || previousPhone !== nextPhone;
        if (differs) {
          const changes = JSON.stringify({
            ownerName: { from: previousName, to: nextName },
            ownerPhone: { from: previousPhone, to: nextPhone },
          });
          await connection.execute(
            `INSERT INTO villa_listing_audit (villaKey, actorEmail, actorName, summary, changesJson)
             VALUES (?, ?, ?, ?, ?)`,
            [
              record.villa_key,
              actor,
              actorName,
              `Imported protected owner information from ${record.sheet} row ${record.row}`,
              changes,
            ],
          );
          changed += 1;
        } else {
          unchanged += 1;
        }
        await connection.execute(
          `INSERT INTO villa_listings (villaKey, community, ownerName, ownerPhone, updatedBy)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             ownerName = VALUES(ownerName),
             ownerPhone = VALUES(ownerPhone),
             updatedBy = VALUES(updatedBy)`,
          [record.villa_key, record.community, nextName, nextPhone, actor],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
  console.log(JSON.stringify({ imported: records.length, changed, unchanged, skipped: {
    ambiguous: audit.summary?.ambiguous ?? 0,
    unmatched: audit.summary?.unmatched ?? 0,
    conflicts: audit.summary?.conflicts ?? 0,
  } }, null, 2));
} finally {
  await connection.end();
}
