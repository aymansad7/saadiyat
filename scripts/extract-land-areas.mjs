import { drizzle } from "drizzle-orm/mysql2";
import { like } from "drizzle-orm";
import { villaFiles } from "../drizzle/schema.js";
import { writeFileSync } from "fs";

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  // Get all golf-views DCR files
  const golfFiles = await db.select({
    villaKey: villaFiles.villaKey,
    storageKey: villaFiles.storageKey,
    filename: villaFiles.filename,
  })
  .from(villaFiles)
  .where(like(villaFiles.villaKey, "golf-views/%"));
  
  console.log("Golf Views DCR files:", golfFiles.length);
  for (const f of golfFiles) {
    console.log(" ", f.villaKey, "-", f.filename, "-", f.storageKey);
  }

  // Get all SBV DCR files
  const sbvFiles = await db.select({
    villaKey: villaFiles.villaKey,
    storageKey: villaFiles.storageKey,
    filename: villaFiles.filename,
  })
  .from(villaFiles)
  .where(like(villaFiles.villaKey, "saadiyat-beach-villas/%"));
  
  console.log("\nSBV DCR files:", sbvFiles.length);
  for (const f of sbvFiles.slice(0, 5)) {
    console.log(" ", f.villaKey, "-", f.filename);
  }
  console.log("  ... and", sbvFiles.length - 5, "more");

  // Save results
  writeFileSync("/home/ubuntu/dcr_files.json", JSON.stringify({ golfFiles, sbvFiles }, null, 2));
  console.log("\nSaved to /home/ubuntu/dcr_files.json");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
