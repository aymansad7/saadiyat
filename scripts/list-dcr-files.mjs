import { drizzle } from "drizzle-orm/mysql2";
import { like } from "drizzle-orm";
import { mysqlTable, int, varchar, mysqlEnum, bigint, text } from "drizzle-orm/mysql-core";
import { writeFileSync } from "fs";

const villaFiles = mysqlTable("villa_files", {
  id: int("id").autoincrement().primaryKey(),
  villaKey: varchar("villaKey", { length: 128 }),
  category: varchar("category", { length: 64 }),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  const sbvFiles = await db.select({ villaKey: villaFiles.villaKey, storageKey: villaFiles.storageKey, filename: villaFiles.filename })
    .from(villaFiles).where(like(villaFiles.villaKey, "saadiyat-beach-villas/%"));
  console.log("SBV DCR files:", sbvFiles.length);

  const jawaherFiles = await db.select({ villaKey: villaFiles.villaKey, storageKey: villaFiles.storageKey, filename: villaFiles.filename })
    .from(villaFiles).where(like(villaFiles.villaKey, "jawaher/%"));
  console.log("Jawaher DCR files:", jawaherFiles.length);

  const stregisFiles = await db.select({ villaKey: villaFiles.villaKey, storageKey: villaFiles.storageKey, filename: villaFiles.filename })
    .from(villaFiles).where(like(villaFiles.villaKey, "stregis/%"));
  console.log("St. Regis DCR files:", stregisFiles.length);

  writeFileSync("/home/ubuntu/all_dcr_files.json", JSON.stringify({ sbvFiles, jawaherFiles, stregisFiles }, null, 2));
  console.log("Saved to /home/ubuntu/all_dcr_files.json");
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
