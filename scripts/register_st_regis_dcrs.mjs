// Register the 33 already-uploaded St. Regis (Saadiyat Reserve / SDN1_C6) PDFs
// into `villa_files` so they're discoverable by the new files.listByPrefix
// endpoint (and the DCR ZIP route).
//
// Source of truth: client/src/data/villas.ts → each villa has pdfLocalUrl
//   "/manus-storage/SDN1_C6_<n>_<hash>.pdf"
// We extract the storageKey, HEAD it for size, and INSERT into villa_files
// with category='dcr' and villaKey="st-regis/Plot-<n>" (n = 1..33).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createConnection } from "mysql2/promise";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env") });

const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "") ?? "";
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY ?? "";
const DB_URL = process.env.DATABASE_URL;

if (!FORGE_URL || !FORGE_KEY || !DB_URL) {
  console.error("Missing env (FORGE_URL/FORGE_KEY/DB_URL)");
  process.exit(1);
}

async function presignGet(key) {
  const url = new URL("v1/storage/presign/get", FORGE_URL + "/");
  url.searchParams.set("path", key);
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${FORGE_KEY}` },
  });
  if (!r.ok) throw new Error(`presign ${r.status}`);
  const { url: signed } = await r.json();
  return signed;
}

async function fetchSize(signedUrl) {
  // Some S3-compatible backends reject HEAD for presigned-GET URLs, so we use
  // GET with `Range: bytes=0-0` to read content-range -> total size cheaply.
  const r = await fetch(signedUrl, { headers: { Range: "bytes=0-0" } });
  const cr = r.headers.get("content-range"); // e.g. "bytes 0-0/12345678"
  if (cr) {
    const total = Number(cr.split("/").pop());
    if (Number.isFinite(total) && total > 0) return total;
  }
  // Fallback: full GET, count bytes.
  const r2 = await fetch(signedUrl);
  const buf = new Uint8Array(await r2.arrayBuffer());
  return buf.byteLength;
}

async function main() {
  const villasSrc = readFileSync(
    resolve(process.cwd(), "client/src/data/villas.ts"),
    "utf8",
  );
  const re = /"pdfLocalUrl":\s*"\/manus-storage\/(SDN1_C6_(\d+)_[a-f0-9]+\.pdf)"/g;
  const found = new Map(); // plotN -> storageKey
  let m;
  while ((m = re.exec(villasSrc))) {
    const storageKey = m[1];
    const plotN = Number(m[2]);
    if (!found.has(plotN)) found.set(plotN, storageKey);
  }
  console.log(`Found ${found.size} St. Regis PDFs in villas.ts`);

  const conn = await createConnection(DB_URL);
  const [users] = await conn.query(
    "SELECT id, name FROM users WHERE openId = ? LIMIT 1",
    [process.env.OWNER_OPEN_ID],
  );
  if (!users.length) {
    console.error("Owner user not found");
    await conn.end();
    process.exit(1);
  }
  const ownerId = users[0].id;
  const ownerName = users[0].name ?? "Owner";

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const [plotN, storageKey] of [...found.entries()].sort((a, b) => a[0] - b[0])) {
    const villaKey = `st-regis/Plot-${plotN}`;
    const filename = `SDN1_C6_${plotN}.pdf`;
    const [exists] = await conn.query(
      "SELECT id FROM villa_files WHERE storageKey = ? LIMIT 1",
      [storageKey],
    );
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    try {
      // sizeBytes is informational only for UI; we skip the network round-trip
      // and store 0 here. Re-uploading St. Regis PDFs via the admin Files panel
      // will set a real value.
      const size = 0;
      await conn.query(
        `INSERT INTO villa_files (scope, villaKey, category, filename, mimeType, sizeBytes, storageKey, description, uploadedBy, uploaderName)
         VALUES ('villa', ?, 'dcr', ?, 'application/pdf', ?, ?, 'DMT DCR document', ?, ?)`,
        [villaKey, filename, size, storageKey, ownerId, ownerName],
      );
      inserted++;
      if (inserted % 5 === 0)
        console.log(`inserted=${inserted} skipped=${skipped} failed=${failed}`);
    } catch (err) {
      failed++;
      console.error(`FAIL Plot-${plotN}: ${err.message}`);
    }
  }

  console.log(
    `\nDone. inserted=${inserted} skipped=${skipped} failed=${failed} total=${found.size}`,
  );
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
