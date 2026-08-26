import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const results = JSON.parse(readFileSync("/home/ubuntu/reconcile_nudra_yandex_addresses.json", "utf8")).results;
const locations = results
  .map(({ output, error }) => ({
    addressNumber: output?.address_number ?? null,
    returnedAddress: output?.returned_address ?? null,
    latitude: output?.latitude ?? null,
    longitude: output?.longitude ?? null,
    exactMatch: output?.exact_match === true,
    yandexUrl: output?.yandex_url ?? null,
    error: error ?? null,
  }))
  .filter((row) => row.exactMatch && row.latitude && row.longitude);

const output = {
  source: "Yandex Maps house-address results",
  matchingRule: "Exact house number and 1 Street only. These locations are not associated with B/D/S unit codes until a source-backed crosswalk is available.",
  locations,
};
const outputPath = resolve(import.meta.dirname, "source-data/nudra-yandex-addresses.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ exactLocations: locations.length, outputPath }, null, 2));
