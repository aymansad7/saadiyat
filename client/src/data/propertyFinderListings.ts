/**
 * PropertyFinder Active Listings — Scraped 18 Aug 2026
 * Shows which plots are currently listed for sale on PropertyFinder.ae
 * Matched to our plots by land/BUA area (sqft)
 */

export interface PFListing {
  community: "jawaher" | "st-regis" | "saadiyat-beach-villas";
  type: "villa" | "townhouse";
  bedrooms: number;
  bathrooms: string;
  areaSqft: number;
  priceAed: number;
  title: string;
  agent: string;
  agency: string;
  listedAgo: string;
  url: string;
}

export const pfListings: PFListing[] = [
  // === JAWAHER (5 listings) ===
  { community: "jawaher", type: "villa", bedrooms: 5, bathrooms: "6", areaSqft: 13504, priceAed: 35000000, title: "Luxury Family Home. Pool and Landscaping", agent: "Andrew Covill", agency: "Henry Wiltshire", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-jawaher-saadiyat-117248676.html" },
  { community: "jawaher", type: "villa", bedrooms: 4, bathrooms: "7", areaSqft: 10514, priceAed: 25000000, title: "Modified Villa | Near Saadiyat Beach | Private Pool", agent: "Samah Jamal", agency: "PSI", listedAgo: "22 hours", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-jawaher-saadiyat-128813306.html" },
  { community: "jawaher", type: "townhouse", bedrooms: 4, bathrooms: "5", areaSqft: 6748, priceAed: 15000000, title: "Corner | Upgraded Townhouse | Prime Location!", agent: "Samah Jamal", agency: "PSI", listedAgo: "22 hours", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-jawaher-saadiyat.html" },
  { community: "jawaher", type: "villa", bedrooms: 5, bathrooms: "7+", areaSqft: 14694, priceAed: 32000000, title: "Large Backyard | Luxury Lifestyle | Inquire Today", agent: "Ruba Jaffal", agency: "PSI", listedAgo: "11 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-jawaher-saadiyat.html" },
  { community: "jawaher", type: "villa", bedrooms: 5, bathrooms: "7", areaSqft: 15182, priceAed: 50000000, title: "Golf View | Luxurious 5BR | Pool | Ideal Community", agent: "Saer Samir Latouf", agency: "Amlak One", listedAgo: "6+ months", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-jawaher-saadiyat.html" },

  // === ST. REGIS (6 listings) ===
  { community: "st-regis", type: "villa", bedrooms: 5, bathrooms: "6", areaSqft: 8261, priceAed: 50000000, title: "Vacant | Luxury Beachfront Villa | Stunning View", agent: "Tarek Elzeny", agency: "Rose Island Real Estate", listedAgo: "16 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-124291727.html" },
  { community: "st-regis", type: "villa", bedrooms: 5, bathrooms: "7", areaSqft: 8262, priceAed: 50000000, title: "Exclusive Elite 5BR Villa with Golf & Sea Views!!!", agent: "Shumaila Umer", agency: "Oia Properties", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-113722684.html" },
  { community: "st-regis", type: "villa", bedrooms: 4, bathrooms: "5", areaSqft: 10453, priceAed: 35000000, title: "Luxury Golf Course Villa | Saadiyat Living", agent: "Jessica Gane", agency: "Henry Wiltshire", listedAgo: "22 hours", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-131542180.html" },
  { community: "st-regis", type: "villa", bedrooms: 4, bathrooms: "5", areaSqft: 10453, priceAed: 35000000, title: "Luxurious Living | Single Row | Private Pool", agent: "Mohammad Abuisnaineh", agency: "ELIVA Real Estate", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-106401226.html" },
  { community: "st-regis", type: "villa", bedrooms: 6, bathrooms: "7", areaSqft: 10967, priceAed: 60000000, title: "Single Row | Luxurious Villa | Beachfront", agent: "Ahmed Al Ali", agency: "Savills", listedAgo: "27 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-119022802.html" },
  { community: "st-regis", type: "villa", bedrooms: 6, bathrooms: "6", areaSqft: 10968, priceAed: 60000000, title: "Branded Saadiyat Island Villa With Private Beach", agent: "Fehd Alsaidi", agency: "Sotheby's International", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-st-regis-110068271.html" },

  // === SAADIYAT BEACH VILLAS (first 15 of 37) ===
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 4, bathrooms: "5", areaSqft: 8826, priceAed: 14700000, title: "Great Deal | Standalone Villa | Fully Upgraded", agent: "Tarek Elzeny", agency: "Rose Island Real Estate", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-110526173.html" },
  { community: "saadiyat-beach-villas", type: "townhouse", bedrooms: 4, bathrooms: "6", areaSqft: 4273, priceAed: 8000000, title: "Large Garden | Prime Location | Ideal for Families", agent: "Jeddy Pallogan", agency: "LLJ", listedAgo: "28 days", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-118591517.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 6, bathrooms: "7+", areaSqft: 11194, priceAed: 40000000, title: "Vacant | Spacious 6BR+Pool | Prime Area | Unique Living", agent: "Khaled Hamed", agency: "Nationwide Middle East", listedAgo: "25 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-120171495.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 5, bathrooms: "6", areaSqft: 5663, priceAed: 18500000, title: "Extended 5 Bed Villa | Landscaped Garden And Pool", agent: "Jessica Gane", agency: "Henry Wiltshire", listedAgo: "18 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-123359102.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 4, bathrooms: "6", areaSqft: 4833, priceAed: 12950000, title: "Large plot | Landscaped 4 bed villa on Saadiyat", agent: "Jessica Gane", agency: "Henry Wiltshire", listedAgo: "19 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-123358836.html" },
  { community: "saadiyat-beach-villas", type: "townhouse", bedrooms: 3, bathrooms: "4", areaSqft: 3950, priceAed: 9000000, title: "Ready To Move In | Spacious | Prime Location", agent: "Mohamad Yamen", agency: "Betterhomes", listedAgo: "5 days", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-129304363.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 4, bathrooms: "5", areaSqft: 9098, priceAed: 14000000, title: "Luxury Finishes | Extended Corner Plot | Redesign", agent: "Jessica Gane", agency: "Henry Wiltshire", listedAgo: "4 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-129753970.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 3, bathrooms: "4", areaSqft: 4200, priceAed: 10800000, title: "Landscaped 3 bed villa on Saadiyat Island", agent: "Jessica Gane", agency: "Henry Wiltshire", listedAgo: "14 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-125157648.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 4, bathrooms: "6", areaSqft: 3362, priceAed: 7900000, title: "A Home You'll Compare Every Other House To", agent: "Umer Hayat", agency: "Realty and Key", listedAgo: "21 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-121990222.html" },
  { community: "saadiyat-beach-villas", type: "townhouse", bedrooms: 4, bathrooms: "5", areaSqft: 4258, priceAed: 8000000, title: "Mediterranean Style | Vacant | Motivated Seller", agent: "Kruti Patel", agency: "Savills", listedAgo: "5 days", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-129298919.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 5, bathrooms: "7+", areaSqft: 8232, priceAed: 18720000, title: "Hot Deal | Spacious Luxury Villa | Best Price", agent: "Nawaf Ali Mousa", agency: "Royal Lounge Properties", listedAgo: "19 days", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-122900143.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 5, bathrooms: "6", areaSqft: 8232, priceAed: 19000000, title: "HOT Deal | Fully Furnished | Luxurious Living | Own It", agent: "Tarek Elzeny", agency: "Rose Island Real Estate", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-110524424.html" },
  { community: "saadiyat-beach-villas", type: "townhouse", bedrooms: 3, bathrooms: "4", areaSqft: 3914, priceAed: 8700000, title: "Corner 3BR+M | Close To Amenities | Private Garden", agent: "Mohamad Omar", agency: "Metropolitan Capital", listedAgo: "6 days", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-128813306.html" },
  { community: "saadiyat-beach-villas", type: "villa", bedrooms: 6, bathrooms: "7+", areaSqft: 13136, priceAed: 58000000, title: "Golf-Facing and Ultra Luxurious Villa in Saadiyat", agent: "Ahmed Al Ali", agency: "Savills", listedAgo: "1 month", url: "https://www.propertyfinder.ae/en/plp/buy/villa-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-109505160.html" },
  { community: "saadiyat-beach-villas", type: "townhouse", bedrooms: 4, bathrooms: "5", areaSqft: 4348, priceAed: 8000000, title: "Hot Deal | Single Row | Luxurious Living | Own It", agent: "Tarek Elzeny", agency: "Rose Island Real Estate", listedAgo: "3 days", url: "https://www.propertyfinder.ae/en/plp/buy/townhouse-for-sale-abu-dhabi-saadiyat-island-saadiyat-beach-saadiyat-beach-villas-130202767.html" },
];

/** Get listings for a specific community */
export function getListingsForCommunity(community: PFListing["community"]): PFListing[] {
  return pfListings.filter(l => l.community === community);
}

/** Check if a plot area matches any listing (±200 sqft tolerance) */
export function findListingByArea(community: PFListing["community"], areaSqft: number): PFListing | undefined {
  return pfListings.find(l => l.community === community && Math.abs(l.areaSqft - areaSqft) <= 200);
}

export const PF_SUMMARY = {
  lastUpdated: "2026-08-18",
  totalListings: pfListings.length,
  jawaher: pfListings.filter(l => l.community === "jawaher").length,
  stRegis: pfListings.filter(l => l.community === "st-regis").length,
  sbv: pfListings.filter(l => l.community === "saadiyat-beach-villas").length,
};
