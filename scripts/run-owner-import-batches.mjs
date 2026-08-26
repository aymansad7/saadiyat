/** Run the pre-reviewed owner SQL batches quickly through mysql2 multi-statements. */
import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const directory = new URL("../tmp/owner-import-sql/", import.meta.url);
const files = (await fs.readdir(directory))
  .filter(name => /^owner_import_\d+\.sql$/.test(name))
  .sort();
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });

try {
  for (const filename of files) {
    const query = await fs.readFile(path.join(directory.pathname, filename), "utf8");
    await connection.query(query);
    console.log(`completed ${filename}`);
  }
  console.log(JSON.stringify({ completed_batches: files.length }));
} finally {
  await connection.end();
}
