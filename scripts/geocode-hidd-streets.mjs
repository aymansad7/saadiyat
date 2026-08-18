import { makeRequest } from '../server/_core/map.ts';
import { writeFileSync } from 'fs';

// Test with numbered streets - maybe Google can resolve those better
const testAddresses = [
  { villa: '22', street: '2' },
  { villa: '7', street: '10' },
  { villa: '15', street: '5' },
  { villa: '1', street: '1' },
  { villa: '27', street: '3' },
  { villa: '10', street: '8' },
  { villa: '5', street: '13' },
  { villa: '20', street: '11' },
];

for (const t of testAddresses) {
  const address = `${t.villa} Street ${t.street}, Hidd Al Saadiyat, Abu Dhabi, UAE`;
  try {
    const data = await makeRequest('/maps/api/geocode/json', { address });
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      console.log(`Villa ${t.villa}, St ${t.street}: ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)} → ${data.results[0].formatted_address.substring(0, 60)}`);
    } else {
      console.log(`Villa ${t.villa}, St ${t.street}: NO RESULT`);
    }
  } catch (e) {
    console.log(`Villa ${t.villa}, St ${t.street}: ERROR ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 200));
}
