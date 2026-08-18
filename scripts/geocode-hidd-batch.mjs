import { makeRequest } from '../server/_core/map.ts';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../server/data/hidd_al_saadiyat.json');
const villas = JSON.parse(readFileSync(dataPath, 'utf-8'));

const results = [];
let success = 0, fail = 0;

// Get unique street+villa combinations
const uniqueAddresses = new Map();
for (const v of villas) {
  const key = `${v.villaNumber}_${v.street}`;
  if (!uniqueAddresses.has(key)) {
    uniqueAddresses.set(key, v);
  }
}

console.log(`Total unique addresses: ${uniqueAddresses.size}`);

// Geocode in batches with rate limiting
const entries = [...uniqueAddresses.values()];

async function geocode(villa) {
  const street = villa.street === 'BOULEVARD' ? 'Boulevard' : `Street ${villa.street}`;
  const address = `Villa ${villa.villaNumber}, ${street}, Hidd Al Saadiyat, Saadiyat Island, Abu Dhabi, UAE`;
  try {
    const data = await makeRequest('/maps/api/geocode/json', { address });
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      const formatted = data.results[0].formatted_address;
      // Only accept if it's actually in the Hidd area (lat ~24.56-24.58, lng ~54.45-54.47)
      if (loc.lat > 24.56 && loc.lat < 24.58 && loc.lng > 54.44 && loc.lng < 54.48) {
        return { villaNumber: villa.villaNumber, street: villa.street, lat: loc.lat, lng: loc.lng, formatted };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Process first 50 to test
const batch = entries.slice(0, 50);
console.log(`Processing batch of ${batch.length}...`);

for (let i = 0; i < batch.length; i++) {
  const result = await geocode(batch[i]);
  if (result) {
    results.push(result);
    success++;
    if (success <= 10 || success % 10 === 0) {
      console.log(`✓ [${i+1}/${batch.length}] Villa ${result.villaNumber} (St ${result.street}): ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);
    }
  } else {
    fail++;
  }
  // Rate limit: 100ms between requests
  await new Promise(r => setTimeout(r, 100));
}

console.log(`\nResults: ${success} success, ${fail} failed out of ${batch.length}`);

// Check if coordinates are unique or all the same
const uniqueCoords = new Set(results.map(r => `${r.lat.toFixed(6)},${r.lng.toFixed(6)}`));
console.log(`Unique coordinates: ${uniqueCoords.size}`);

writeFileSync('/tmp/hidd_coords_batch.json', JSON.stringify(results, null, 2));
console.log('Saved to /tmp/hidd_coords_batch.json');
