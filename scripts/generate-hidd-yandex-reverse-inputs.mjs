import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const coordinatesSource = readFileSync(resolve(root, "client/src/data/hiddCoordinates.ts"), "utf8");
const coordinateMatch = coordinatesSource.match(/hiddVillaCoords:\s*HiddVillaCoord\[\]\s*=\s*(\[[\s\S]*?\])\s*;\s*\n\s*export function/);
if (!coordinateMatch) throw new Error("Could not read hiddVillaCoords");

const coordinates = JSON.parse(coordinateMatch[1]);
const inputs = coordinates
  .filter((item) => ["street_control_calibrated", "shape_control_calibrated"].includes(item.positionSource))
  .map(({ villaNumber, street, lat, lng }) => ({
    key: `${villaNumber}|${street}`,
    latitude: lat,
    longitude: lng,
    whatshereUrl: `https://yandex.com/maps/11498/abu-dhabi/?mode=whatshere&whatshere%5Bpoint%5D=${lng}%2C${lat}&whatshere%5Bzoom%5D=18`,
  }));

const outputPath = resolve(root, "tmp/hidd-yandex-reverse-inputs.json");
writeFileSync(outputPath, JSON.stringify(inputs, null, 2));
console.log(JSON.stringify({ count: inputs.length, outputPath, first: inputs.slice(0, 3), last: inputs.slice(-3) }, null, 2));
