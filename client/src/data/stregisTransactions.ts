/**
 * St. Regis Saadiyat Island — ADREC Transaction History
 * Source: Abu Dhabi Real Estate Transactions (ad-transactions.com)
 * Data: Updated 16 Aug 2026, Generated 17 Aug 2026
 *
 * Matching methodology: Each transaction is matched to a specific villa
 * by comparing the "Land (sqft)" field in ADREC records with the
 * plotAreaSqm (converted to sqft) from the DMT GeoSmart data.
 * Match tolerance: < 50 sqft difference = confirmed match.
 *
 * Sale types:
 * - PRIMARY: First sale from developer (off-plan or handover)
 * - SECONDARY: Resale between private parties
 */

export interface StRegisTransaction {
  /** Villa ID (1-33) */
  villaId: number;
  /** Sale date (YYYY-MM-DD) */
  date: string;
  /** Sale price in AED */
  priceAed: number;
  /** PRIMARY = developer sale, SECONDARY = resale */
  saleType: "primary" | "secondary";
  /** Rate in AED per sqft of BUA */
  ratePerSqft: number;
  /** Property type from ADREC */
  propertyType: string;
  /** Bedrooms listed in transaction */
  bedrooms: number;
  /** BUA in sqft */
  areaSqft: number;
  /** Land area in sqft (used for matching) */
  landSqft: number;
}

/**
 * All 17 recorded transactions for St. Regis Saadiyat Island villas.
 * Sorted by date (newest first).
 */
export const stRegisTransactions: StRegisTransaction[] = [
  // --- 2025 ---
  { villaId: 27, date: "2025-04-17", priceAed: 22345902, saleType: "secondary", ratePerSqft: 2705, propertyType: "villa", bedrooms: 4, areaSqft: 8260.11, landSqft: 10967.66 },
  // --- 2023 ---
  { villaId: 9,  date: "2023-06-06", priceAed: 25000000, saleType: "secondary", ratePerSqft: 2903, propertyType: "villa", bedrooms: 5, areaSqft: 8612.41, landSqft: 15770.08 },
  { villaId: 12, date: "2023-02-01", priceAed: 22000000, saleType: "secondary", ratePerSqft: 2681, propertyType: "villa", bedrooms: 4, areaSqft: 8207.15, landSqft: 11855.47 },
  // --- 2022 ---
  { villaId: 11, date: "2022-08-11", priceAed: 18500000, saleType: "secondary", ratePerSqft: 2239, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 9825.93 },
  // --- 2021 (Primary launch — developer handover sales) ---
  { villaId: 22, date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2179, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 12908.93 },
  { villaId: 3,  date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2107, propertyType: "townhouse / attached villa", bedrooms: 2, areaSqft: 8541.37, landSqft: 10193.95 },
  { villaId: 4,  date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2193, propertyType: "villa", bedrooms: 4, areaSqft: 8207.15, landSqft: 10997.58 },
  { villaId: 1,  date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2179, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 12604.53 },
  { villaId: 33, date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2179, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 11066.69 },
  { villaId: 6,  date: "2021-06-10", priceAed: 20000000, saleType: "primary", ratePerSqft: 2322, propertyType: "villa", bedrooms: 5, areaSqft: 8612.41, landSqft: 14136.55 },
  { villaId: 29, date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2179, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 12351.36 },
  { villaId: 21, date: "2021-06-10", priceAed: 18000000, saleType: "primary", ratePerSqft: 2179, propertyType: "villa", bedrooms: 4, areaSqft: 8260.11, landSqft: 12170.20 },
  { villaId: 31, date: "2021-03-01", priceAed: 13500000, saleType: "primary", ratePerSqft: 1634, propertyType: "villa", bedrooms: 4, areaSqft: 8260.11, landSqft: 10418.70 },
  // --- 2020 (Secondary / resale) ---
  { villaId: 30, date: "2020-09-23", priceAed: 22500000, saleType: "secondary", ratePerSqft: 2723, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 10863.57 },
  { villaId: 19, date: "2020-06-15", priceAed: 35000000, saleType: "secondary", ratePerSqft: 4064, propertyType: "villa", bedrooms: 5, areaSqft: 8612.41, landSqft: 16668.76 },
  // --- 2019 ---
  { villaId: 23, date: "2019-11-06", priceAed: 16000000, saleType: "secondary", ratePerSqft: 1937, propertyType: "villa", bedrooms: 4, areaSqft: 8260.11, landSqft: 11950.73 },
  { villaId: 30, date: "2019-04-23", priceAed: 19000000, saleType: "secondary", ratePerSqft: 2300, propertyType: "villa", bedrooms: 4, areaSqft: 8261.83, landSqft: 10863.57 },
];

/**
 * Get all transactions for a specific villa, sorted by date (oldest first).
 */
export function getVillaTransactions(villaId: number): StRegisTransaction[] {
  return stRegisTransactions
    .filter((tx) => tx.villaId === villaId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if a villa has any recorded transactions.
 */
export function hasTransactions(villaId: number): boolean {
  return stRegisTransactions.some((tx) => tx.villaId === villaId);
}

/**
 * Get the primary (developer) sale for a villa, if recorded.
 */
export function getPrimarySale(villaId: number): StRegisTransaction | undefined {
  return stRegisTransactions.find(
    (tx) => tx.villaId === villaId && tx.saleType === "primary"
  );
}

/**
 * Get all secondary (resale) transactions for a villa, sorted by date.
 */
export function getSecondarySales(villaId: number): StRegisTransaction[] {
  return stRegisTransactions
    .filter((tx) => tx.villaId === villaId && tx.saleType === "secondary")
    .sort((a, b) => a.date.localeCompare(b.date));
}
