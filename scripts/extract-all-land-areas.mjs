import { drizzle } from "drizzle-orm/mysql2";
import { like } from "drizzle-orm";
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";

const villaFiles = mysqlTable("villa_files", {
  id: int("id").autoincrement().primaryKey(),
  villaKey: varchar("villaKey", { length: 128 }),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

function extractPlotArea(storageKey) {
  const pdfPath = `/tmp/dcr_${storageKey}`;
  const txtPath = `/tmp/dcr_${storageKey}.txt`;
  
  try {
    // Download if not already cached
    if (!existsSync(pdfPath)) {
      execSync(`curl -sL "http://localhost:3000/manus-storage/${storageKey}" -o "${pdfPath}"`, { timeout: 30000 });
    }
    // Extract text
    execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`, { timeout: 10000, stdio: 'pipe' });
    
    const text = readFileSync(txtPath, "utf8");
    // Look for PLOT AREA followed by number and sq.m
    const match = text.match(/PLOT\s+AREA\s+([\d,]+\.?\d*)\s*sq\.m/);
    if (match) {
      const sqm = parseFloat(match[1].replace(/,/g, ""));
      return { sqm, sqft: Math.round(sqm * 10.7639 * 100) / 100 };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const prefix = process.argv[2]; // 'sbv', 'jawaher', or 'st-regis'
  
  let pattern;
  if (prefix === "sbv") pattern = "saadiyat-beach-villas/%";
  else if (prefix === "jawaher") pattern = "jawaher/%";
  else if (prefix === "st-regis") pattern = "st-regis/%";
  else {
    console.log("Usage: node extract-all-land-areas.mjs <sbv|jawaher|st-regis>");
    process.exit(1);
  }
  
  const files = await db.select({ villaKey: villaFiles.villaKey, storageKey: villaFiles.storageKey, filename: villaFiles.filename })
    .from(villaFiles).where(like(villaFiles.villaKey, pattern));
  
  console.log(`Processing ${files.length} ${prefix} DCR files...`);
  
  const results = {};
  let extracted = 0;
  
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const area = extractPlotArea(f.storageKey);
    if (area) {
      results[f.villaKey] = { villaKey: f.villaKey, filename: f.filename, ...area };
      extracted++;
    }
    if ((i + 1) % 50 === 0 || i === files.length - 1) {
      console.log(`  Progress: ${i + 1}/${files.length} (${extracted} extracted)`);
    }
  }
  
  const outPath = `/home/ubuntu/${prefix}_land_areas.json`;
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! Extracted ${extracted}/${files.length} land areas → ${outPath}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
