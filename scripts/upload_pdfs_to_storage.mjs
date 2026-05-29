// Upload all locally-downloaded DCR PDFs to S3 storage + record in villa_files DB table.
// Maps each PDF to community + plot id and stores under villaKey "<community>/<plotKey>".

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { createConnection } from "mysql2/promise";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL.replace(/\/+$/, "");
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DB_URL = process.env.DATABASE_URL;
const RAW_DIR = "/home/ubuntu/backups/raw";

if (!FORGE_URL || !FORGE_KEY || !DB_URL) {
  console.error("Missing env: FORGE/DB");
  process.exit(1);
}

// gate-folder -> community key + plot key transformer
const GATES = {
  jawaher: { community: "jawaher", plotKeyOf: (fname) => fname.replace(/^SDN1_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_gate1: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Gate1-" + fname.replace(/^SDN2_6_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_gate2: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Gate2-" + fname.replace(/^SDN2_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_gate3: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Gate3-" + fname.replace(/^SDN2_2_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_gate4: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Gate4-" + fname.replace(/^SDN2_3_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_gate7: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Gate7-" + fname.replace(/^SDN4_1_/, "Plot-").replace(/\.pdf$/, "") },
  sbv_premium: { community: "saadiyat-beach-villas", plotKeyOf: (fname) => "Premium-" + fname.replace(/\.pdf$/, "") },
};

async function presignPut(key) {
  const url = new URL("v1/storage/presign/put", FORGE_URL + "/");
  url.searchParams.set("path", key);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${FORGE_KEY}` } });
  if (!r.ok) throw new Error(`presign ${r.status}: ${await r.text()}`);
  const { url: s3 } = await r.json();
  return s3;
}

function hashSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

async function uploadOne(localPath, key) {
  const buf = readFileSync(localPath);
  const s3Url = await presignPut(key);
  const r = await fetch(s3Url, { method: "PUT", body: buf, headers: { "Content-Type": "application/pdf" } });
  if (!r.ok) throw new Error(`s3 ${r.status}`);
  return buf.length;
}

async function main() {
  const conn = await createConnection(DB_URL);
  // Owner user as uploadedBy (look up by OWNER_OPEN_ID).
  const [users] = await conn.query("SELECT id, name FROM users WHERE openId = ? LIMIT 1", [process.env.OWNER_OPEN_ID]);
  if (!users.length) {
    console.error("Owner user not found in DB. Visit the site once while signed in as owner, then re-run.");
    await conn.end();
    process.exit(1);
  }
  const ownerId = users[0].id;
  const ownerName = users[0].name ?? "Owner";

  let total = 0, uploaded = 0, skipped = 0, failed = 0;
  const mapping = [];

  for (const [gate, cfg] of Object.entries(GATES)) {
    const dir = `${RAW_DIR}/${gate}`;
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter(f => f.endsWith(".pdf"));
    for (const f of files) {
      total++;
      const plotKey = cfg.plotKeyOf(f);
      const villaKey = `${cfg.community}/${plotKey}`;
      // Skip if already in DB (by villaKey + filename match)
      const [exists] = await conn.query(
        "SELECT id, storageKey FROM villa_files WHERE villaKey = ? AND filename = ? LIMIT 1",
        [villaKey, f]
      );
      if (exists.length > 0) {
        skipped++;
        mapping.push({ villaKey, filename: f, storageKey: exists[0].storageKey, url: `/manus-storage/${exists[0].storageKey}` });
        continue;
      }
      const localPath = `${dir}/${f}`;
      const storageKey = `dcr/${cfg.community}/${plotKey}_${hashSuffix()}.pdf`;
      try {
        const size = await uploadOne(localPath, storageKey);
        await conn.query(
          `INSERT INTO villa_files (scope, villaKey, category, filename, mimeType, sizeBytes, storageKey, description, uploadedBy, uploaderName)
           VALUES ('villa', ?, 'dcr', ?, 'application/pdf', ?, ?, 'DMT DCR document', ?, ?)`,
          [villaKey, f, size, storageKey, ownerId, ownerName]
        );
        uploaded++;
        mapping.push({ villaKey, filename: f, storageKey, url: `/manus-storage/${storageKey}` });
        if (uploaded % 25 === 0) console.log(`uploaded=${uploaded} skipped=${skipped} failed=${failed} (of ${total})`);
      } catch (err) {
        failed++;
        console.error(`FAIL ${villaKey}/${f}: ${err.message}`);
      }
    }
  }

  writeFileSync(
    "/home/ubuntu/saadiyat/scripts/pdf_storage_mapping.json",
    JSON.stringify(mapping, null, 2)
  );

  console.log(`\nDone. total=${total} uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
