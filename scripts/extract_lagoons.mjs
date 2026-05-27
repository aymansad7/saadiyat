// Extract LAGOONS_DATASET from client TS into a JSON file the server can read.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const srcPath = path.join(root, "client/src/data/lagoons.ts");
const outPath = path.join(root, "server/data/lagoons.json");

const txt = fs.readFileSync(srcPath, "utf-8");
const startMarker = "export const LAGOONS_DATASET: LagoonsDataset =";
const endMarker = "} as LagoonsDataset;";
const start = txt.indexOf(startMarker);
const end = txt.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.error("markers not found");
  process.exit(1);
}
const body = txt.slice(start + startMarker.length, end + 1).trim(); // includes the closing }
const ds = (0, eval)("(" + body + ")");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify({ total_villas: ds.total_villas, villas: ds.villas }),
);
console.log("villas:", ds.villas.length, "→", outPath);
