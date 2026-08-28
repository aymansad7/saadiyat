import { readFileSync, writeFileSync } from "node:fs";

const sourceUrl = "https://www.propertyfinder.ae/en/search?l=2005&c=2&t=35&fu=0&rp=y&ob=mr";
const listings = [
  { id: "129292635", areaSqft: 21523, rentAed: 1700000, beds: "6", title: "Full Sea View| Private Garden| Direct Beach Access" },
  { id: "125166334", areaSqft: 20099, rentAed: 3500000, beds: "7", title: "Luxurious Beachfront Villa in Hidd Al Saadiyat" },
  { id: "125166256", areaSqft: 11539, rentAed: 3000000, beds: "5", title: "Stunning Beachfront Villa in Hidd Al Saadiyat" },
  { id: "122916828", areaSqft: 7211, rentAed: 750000, beds: "5", title: "LUXURY 5-BEDROOM VILLA WITH POOL/ PREMIUM COMMUNIT" },
  { id: "127474205", areaSqft: 8194, rentAed: 850000, beds: "5", title: "Upcoming |Corner |Big Plot | Type 6 | Beach Access" },
  { id: "130212983", areaSqft: 20099, rentAed: 3500000, beds: "7", title: "Luxury Villa | Vacant | Perfect Location" },
  { id: "128365239", areaSqft: 7321, rentAed: 682000, beds: "5", title: "Upcoming l Type 6 l Near To Beach l Swimming Pool" },
  { id: "120171160", areaSqft: 6798, rentAed: 630000, beds: "5", title: "Upcoming in NOV | Luxury Villa | Large Plot" },
  { id: "107308440", areaSqft: 6808, rentAed: 600000, beds: "5", title: "Upcoming in August | Private Garden | Beach Access" },
  { id: "132488337", areaSqft: 6890, rentAed: 780000, beds: "5", title: "Minute Walk to beach! Private Pool and Landscaped." },
  { id: "132487246", areaSqft: 13000, rentAed: 1800000, beds: "6", title: "Stunning views over looking Beach" },
  { id: "112302102", areaSqft: 4556, rentAed: 600000, beds: "4", title: "Exquisite 4-BR Villa | Beachside Living | Vacant" },
  { id: "120640434", areaSqft: 7599, rentAed: 900000, beds: "5", title: "Prestigious Villa | Premium | Sophisticated Living" },
];

const records = JSON.parse(readFileSync(new URL("../server/data/hidd_al_saadiyat.json", import.meta.url), "utf8"));
const numeric = (value) => Number.parseFloat(String(value ?? "").replace(/,/g, ""));
const fields = [
  ["plotAreaSqFt", "plot area"],
  ["buaAreaSqFt", "documented BUA"],
  ["newBuaArea", "recorded new BUA"],
];

function candidatesFor(listing) {
  const candidates = records.flatMap((record) => fields.map(([field, label]) => {
    const value = numeric(record[field]);
    if (!Number.isFinite(value)) return null;
    const difference = Math.abs(value - listing.areaSqft);
    return {
      villaNumber: String(record.villaNumber),
      street: record.street || "—",
      villaType: record.villaType || "—",
      bedrooms: String(record.bedrooms || "—"),
      field,
      fieldLabel: label,
      value,
      difference,
      differencePct: Number(((difference / listing.areaSqft) * 100).toFixed(2)),
      bedroomMatch: String(record.bedrooms || "").startsWith(listing.beds),
    };
  }).filter(Boolean));

  return candidates.sort((a, b) => a.difference - b.difference || Number(b.bedroomMatch) - Number(a.bedroomMatch)).slice(0, 8);
}

const audit = listings.map((listing) => ({ ...listing, sourceUrl, candidates: candidatesFor(listing) }));
writeFileSync(new URL("../tmp/hidd-rental-area-match-audit.json", import.meta.url), JSON.stringify(audit, null, 2));

const lines = [
  "# Hidd rental advertised-area matching audit",
  "",
  `Source search: ${sourceUrl}`,
  "",
  "Property Finder labels the published measure simply **Area**; it does not call it plot area. The table therefore reports plot-area matches first, then documented BUA alternatives, and does not confirm a unit solely on an approximate match.",
  "",
  "| Listing | Advertised area | Beds | Nearest documented field | Candidate villa | Difference |",
  "|---|---:|---:|---|---:|---:|",
  ...audit.map((listing) => {
    const candidate = listing.candidates[0];
    return `| ${listing.id} | ${listing.areaSqft.toLocaleString()} sqft | ${listing.beds} | ${candidate?.fieldLabel ?? "—"} | ${candidate?.villaNumber ?? "—"} | ${candidate?.difference?.toLocaleString() ?? "—"} sqft |`;
  }),
  "",
  "## Full candidate details",
  "",
  ...audit.flatMap((listing) => [
    `### ${listing.id} — ${listing.areaSqft.toLocaleString()} sqft`,
    ...listing.candidates.map((candidate) => `- Villa ${candidate.villaNumber}, ${candidate.street}, ${candidate.bedrooms} BR, ${candidate.fieldLabel} ${candidate.value.toLocaleString()} sqft; difference ${candidate.difference.toLocaleString()} sqft (${candidate.differencePct}%).`),
    "",
  ]),
];
writeFileSync(new URL("../tmp/hidd-rental-area-match-audit.md", import.meta.url), lines.join("\n"));
console.log(`Audited ${audit.length} listings against ${records.length} Hidd records.`);
