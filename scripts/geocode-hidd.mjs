import { makeRequest } from '../server/_core/map.ts';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../server/data/hidd_al_saadiyat.json');
const villas = JSON.parse(readFileSync(dataPath, 'utf-8'));

// Group by street and villa number
const results = [];
let successCount = 0;
let failCount = 0;

// Process in batches of 5 with delay
async function geocodeVilla(villa) {
  const street = villa.street === 'BOULEVARD' ? 'Boulevard' : `${villa.street} St`;
  const address = `${villa.villaNumber}, ${street}, Hidd Al Saadiyat, Abu Dhabi, UAE`;
  try {
    const data = await makeRequest('/maps/api/geocode/json', { address });
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { villaNumber: villa.villaNumber, street: villa.street, lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  // Test with first 10 villas
  const testBatch = villas.slice(0, 10);
  console.log(`Testing geocoding for ${testBatch.length} villas...`);
  
  for (const villa of testBatch) {
    const result = await geocodeVilla(villa);
    if (result) {
      results.push(result);
      successCount++;
      console.log(`✓ Villa ${result.villaNumber} (St ${villa.street}): ${result.lat}, ${result.lng}`);
    } else {
      failCount++;
      console.log(`✗ Villa ${villa.villaNumber} (St ${villa.street}): no result`);
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\nResults: ${successCount} success, ${failCount} failed`);
  writeFileSync('/tmp/hidd_coords_test.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
