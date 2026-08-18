import { makeRequest } from '../server/_core/map.ts';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../server/data/hidd_al_saadiyat.json');
const villas = JSON.parse(readFileSync(dataPath, 'utf-8'));

// Step 1: Get street-level coordinates for each unique street
const streets = [...new Set(villas.map(v => v.street))].filter(s => s !== 'CC2');
console.log(`Streets to geocode: ${streets.join(', ')}`);

const streetCoords = new Map();

for (const street of streets) {
  const streetName = street === 'BOULEVARD' ? 'Boulevard' : `Street ${street}`;
  // Try geocoding with a villa number to get the street location
  const villasOnStreet = villas.filter(v => v.street === street);
  const midVilla = villasOnStreet[Math.floor(villasOnStreet.length / 2)];
  const address = `${midVilla.villaNumber} ${streetName}, Hidd Al Saadiyat, Abu Dhabi, UAE`;
  
  try {
    const data = await makeRequest('/maps/api/geocode/json', { address });
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      if (loc.lat > 24.56 && loc.lat < 24.58 && loc.lng > 54.44 && loc.lng < 54.48) {
        streetCoords.set(street, { lat: loc.lat, lng: loc.lng });
        console.log(`  ✓ ${streetName}: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
      } else {
        console.log(`  ✗ ${streetName}: outside area (${loc.lat}, ${loc.lng})`);
      }
    } else {
      console.log(`  ✗ ${streetName}: no result`);
    }
  } catch (e) {
    console.log(`  ✗ ${streetName}: error ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 300));
}

// Also try to get start and end points for longer streets
// by geocoding the first and last villa on each street
const streetEndpoints = new Map();

for (const street of streets) {
  if (!streetCoords.has(street)) continue;
  const villasOnStreet = villas.filter(v => v.street === street);
  const nums = villasOnStreet.map(v => parseInt(v.villaNumber) || 0).filter(n => n > 0).sort((a,b) => a-b);
  if (nums.length < 3) continue;
  
  const streetName = street === 'BOULEVARD' ? 'Boulevard' : `Street ${street}`;
  
  // Geocode first villa
  const firstAddr = `${nums[0]} ${streetName}, Hidd Al Saadiyat, Abu Dhabi, UAE`;
  const lastAddr = `${nums[nums.length-1]} ${streetName}, Hidd Al Saadiyat, Abu Dhabi, UAE`;
  
  try {
    const [d1, d2] = await Promise.all([
      makeRequest('/maps/api/geocode/json', { address: firstAddr }),
      makeRequest('/maps/api/geocode/json', { address: lastAddr })
    ]);
    
    const loc1 = d1.results?.[0]?.geometry?.location;
    const loc2 = d2.results?.[0]?.geometry?.location;
    
    if (loc1 && loc2) {
      streetEndpoints.set(street, { start: loc1, end: loc2, minNum: nums[0], maxNum: nums[nums.length-1] });
    }
  } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
}

// Step 2: Distribute villas along each street
// For streets where Google gives the same point for all villas,
// we'll spread them along a line perpendicular to the main road direction

const output = [];
const SPREAD = 0.0002; // ~20m spread between adjacent villas

for (const villa of villas) {
  if (villa.street === 'CC2') continue; // Skip cafe
  
  const center = streetCoords.get(villa.street);
  if (!center) continue;
  
  const villasOnStreet = villas.filter(v => v.street === villa.street);
  const nums = villasOnStreet.map(v => parseInt(v.villaNumber) || 0).filter(n => n > 0).sort((a,b) => a-b);
  const villaNum = parseInt(villa.villaNumber) || 0;
  if (villaNum === 0) continue;
  
  const idx = nums.indexOf(villaNum);
  const total = nums.length;
  
  // Spread villas along the street direction
  // Streets in Hidd run roughly east-west, so spread along longitude
  const offset = (idx - total / 2) * SPREAD * 0.5;
  
  // Add slight latitude variation based on odd/even (villas on both sides of street)
  const sideOffset = (villaNum % 2 === 0 ? 1 : -1) * 0.00008;
  
  output.push({
    villaNumber: villa.villaNumber,
    street: villa.street,
    lat: center.lat + sideOffset,
    lng: center.lng + offset
  });
}

console.log(`\nGenerated coordinates for ${output.length} villas`);

// Write TypeScript data file
const tsContent = `/**
 * Hidd Al Saadiyat villa coordinates
 * Generated from Google Maps geocoding (street-level) + interpolation
 * Each villa is placed at an approximate position along its street
 */

export interface HiddVillaCoord {
  villaNumber: string;
  street: string;
  lat: number;
  lng: number;
}

export const hiddVillaCoords: HiddVillaCoord[] = ${JSON.stringify(output, null, 2)};

export function findHiddCoord(villaNumber: string, street: string): HiddVillaCoord | undefined {
  return hiddVillaCoords.find(c => c.villaNumber === villaNumber && c.street === street);
}
`;

const outPath = resolve(__dirname, '../client/src/data/hiddCoordinates.ts');
writeFileSync(outPath, tsContent);
console.log(`Written to ${outPath}`);
console.log(`Street coords found: ${streetCoords.size}/${streets.length}`);
