import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const coordinatePath = resolve(root, "client/src/data/hiddCoordinates.ts");
const outputPath = resolve(root, "tmp/hidd-yandex-inputs.json");
const source = readFileSync(coordinatePath, "utf8");
const match = source.match(/hiddVillaCoords:\s*HiddVillaCoord\[\]\s*=\s*(\[[\s\S]*?\])\s*;\s*\n\s*export function/);
if (!match) throw new Error("Could not locate hiddVillaCoords array");

const coordinates = JSON.parse(match[1]);
const inputs = coordinates.filter(({ positionSource }) => !["user_supplied_coordinate", "yandex_exact_address_match"].includes(positionSource)).map(({ villaNumber, street }) => ({
  key: `${villaNumber}|${street}`,
  query: `${villaNumber}, ${street === "BOULEVARD" ? "Al Dhiba Street" : `${street} Street`}, Saadiyat Island`,
}));

writeFileSync(outputPath, JSON.stringify(inputs, null, 2));
console.log(JSON.stringify({ count: inputs.length, outputPath, first: inputs.slice(0, 3), last: inputs.slice(-3) }, null, 2));
