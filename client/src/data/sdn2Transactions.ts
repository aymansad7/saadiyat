/**
 * SDN2 (Saadiyat Beach District) — ADREC Transaction History
 * Source: Abu Dhabi Real Estate Transactions (ad-transactions.com)
 * Data: Updated 16 Aug 2026, Generated 17 Aug 2026
 *
 * Projects:
 *   - Faya Al Saadiyat: 20 primary sales (Dec 2024 – Jun 2026)
 *   - Saadiyat Beach District (Premium/Plots): 121 secondary sales (Aug 2019 – May 2026)
 *   - Saadiyat Beach Villas: 30 secondary sales (Feb 2019 – Jun 2025)
 * Total: 171 transactions
 */

export interface SDN2Transaction {
  date: string;
  priceAed: number;
  saleType: "primary" | "secondary";
  ratePerSqft: number | null;
  propertyType: string;
  bedrooms: number | null;
  areaSqft: number | null;
  landSqft: number;
  project: string;
}

export interface SDN2PlotHistory {
  landSqft: number;
  project: string;
  transactions: SDN2Transaction[];
}

export const fayaPlotHistories: SDN2PlotHistory[] = [
  { landSqft: 18270.54, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-05", priceAed: 89394097, saleType: "primary", ratePerSqft: 4660, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 18270.54, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 18334.15, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-08", priceAed: 89459797, saleType: "primary", ratePerSqft: 4663, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 18334.15, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 18520.26, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-01", priceAed: 96392323, saleType: "primary", ratePerSqft: 5025, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 18520.26, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 18967.71, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-12", priceAed: 90166117, saleType: "primary", ratePerSqft: 4700, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 18967.71, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 19094.51, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-13", priceAed: 90307477, saleType: "primary", ratePerSqft: 4707, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 19094.51, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 19142.63, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-06-08", priceAed: 87440079, saleType: "primary", ratePerSqft: 4558, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 19142.63, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 19157.27, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-01-16", priceAed: 85030567, saleType: "primary", ratePerSqft: 4432, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 19157.27, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 19171.91, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-06-10", priceAed: 85759803, saleType: "primary", ratePerSqft: 4470, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 19171.91, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 19696.32, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-26", priceAed: 90918697, saleType: "primary", ratePerSqft: 4739, propertyType: "villa", bedrooms: 6, areaSqft: 19184.39, landSqft: 19696.32, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 20881.64, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-09", priceAed: 94305332, saleType: "primary", ratePerSqft: 4551, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 20881.64, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 21654.92, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-10", priceAed: 96831248, saleType: "primary", ratePerSqft: 4672, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 21654.92, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 22080.42, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-28", priceAed: 93099178, saleType: "primary", ratePerSqft: 4492, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 22080.42, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 22581.69, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-09", priceAed: 99399944, saleType: "primary", ratePerSqft: 4796, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 22581.69, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 22591.38, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-13", priceAed: 94781852, saleType: "primary", ratePerSqft: 4574, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 22591.38, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 23346.58, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-08-06", priceAed: 93452068, saleType: "primary", ratePerSqft: 4509, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 23346.58, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 23641.83, project: "Faya Al Saadiyat", transactions: [
    { date: "2024-12-26", priceAed: 97385018, saleType: "primary", ratePerSqft: 4699, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 23641.83, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 23853.99, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-01", priceAed: 94363620, saleType: "primary", ratePerSqft: 4553, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 23853.99, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 25894.39, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-12", priceAed: 100323224, saleType: "primary", ratePerSqft: 4841, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 25894.39, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 31102.18, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-09", priceAed: 96614799, saleType: "primary", ratePerSqft: 4662, propertyType: "villa", bedrooms: 6, areaSqft: 20724.06, landSqft: 31102.18, project: "Faya Al Saadiyat" },
  ] },
  { landSqft: 70624.64, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-12", priceAed: 400808101, saleType: "primary", ratePerSqft: 7268, propertyType: "villa", bedrooms: 6, areaSqft: 55145.5, landSqft: 70624.64, project: "Faya Al Saadiyat" },
  ] },
];

export const sbdPlotsPlotHistories: SDN2PlotHistory[] = [
  { landSqft: 3361.57, project: "Saadiyat Beach District", transactions: [
    { date: "2023-04-05", priceAed: 5350000, saleType: "secondary", ratePerSqft: 1230, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3361.57, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3364.47, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1035, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3364.47, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3366.3, project: "Saadiyat Beach District", transactions: [
    { date: "2022-11-02", priceAed: 5500000, saleType: "secondary", ratePerSqft: 1265, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3366.3, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3403.11, project: "Saadiyat Beach District", transactions: [
    { date: "2024-09-24", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3403.11, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3429.27, project: "Saadiyat Beach District", transactions: [
    { date: "2024-08-01", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3429.27, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3505.16, project: "Saadiyat Beach District", transactions: [
    { date: "2026-05-19", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1679, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3505.16, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3562.42, project: "Saadiyat Beach District", transactions: [
    { date: "2026-01-21", priceAed: 7700000, saleType: "secondary", ratePerSqft: 1771, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3562.42, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3615.7, project: "Saadiyat Beach District", transactions: [
    { date: "2022-07-01", priceAed: 5250000, saleType: "secondary", ratePerSqft: 1207, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3615.7, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3616.67, project: "Saadiyat Beach District", transactions: [
    { date: "2026-03-03", priceAed: 8400000, saleType: "secondary", ratePerSqft: 2323, propertyType: "plot for villa", bedrooms: null, areaSqft: 3616.67, landSqft: 3616.67, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3848.52, project: "Saadiyat Beach District", transactions: [
    { date: "2024-05-17", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1588, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3848.52, project: "Saadiyat Beach District" },
    { date: "2025-06-13", priceAed: 8200000, saleType: "secondary", ratePerSqft: 2170, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3848.52, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3854.01, project: "Saadiyat Beach District", transactions: [
    { date: "2021-03-16", priceAed: 4350000, saleType: "secondary", ratePerSqft: 1000, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3854.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3876.4, project: "Saadiyat Beach District", transactions: [
    { date: "2023-09-27", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1219, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3876.4, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3899.01, project: "Saadiyat Beach District", transactions: [
    { date: "2025-06-02", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1667, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3899.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3914.94, project: "Saadiyat Beach District", transactions: [
    { date: "2021-12-07", priceAed: 4600000, saleType: "secondary", ratePerSqft: 1218, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3914.94, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 3984.8, project: "Saadiyat Beach District", transactions: [
    { date: "2024-01-16", priceAed: 5700000, saleType: "secondary", ratePerSqft: 1509, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3984.8, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4109.01, project: "Saadiyat Beach District", transactions: [
    { date: "2022-01-25", priceAed: 4932885, saleType: "secondary", ratePerSqft: 1201, propertyType: "plot for villa", bedrooms: null, areaSqft: 4109.01, landSqft: 4109.01, project: "Saadiyat Beach District" },
    { date: "2022-04-15", priceAed: 5000000, saleType: "secondary", ratePerSqft: 1323, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4109.01, project: "Saadiyat Beach District" },
    { date: "2026-04-22", priceAed: 8400000, saleType: "secondary", ratePerSqft: 2044, propertyType: "plot for villa", bedrooms: null, areaSqft: 4109.01, landSqft: 4109.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4171.98, project: "Saadiyat Beach District", transactions: [
    { date: "2020-10-14", priceAed: 6659400, saleType: "secondary", ratePerSqft: 1596, propertyType: "plot for villa", bedrooms: null, areaSqft: 4171.98, landSqft: 4171.98, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4258.2, project: "Saadiyat Beach District", transactions: [
    { date: "2022-12-08", priceAed: 6100000, saleType: "secondary", ratePerSqft: 1403, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4258.2, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4274.02, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-28", priceAed: 5600000, saleType: "secondary", ratePerSqft: 1288, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4274.02, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4317.72, project: "Saadiyat Beach District", transactions: [
    { date: "2023-05-01", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1403, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4317.72, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4354.0, project: "Saadiyat Beach District", transactions: [
    { date: "2021-11-08", priceAed: 4900000, saleType: "secondary", ratePerSqft: 1297, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4354.0, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4440.32, project: "Saadiyat Beach District", transactions: [
    { date: "2024-09-25", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1771, propertyType: "villa", bedrooms: 5, areaSqft: 4122.57, landSqft: 4440.32, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4551.95, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-30", priceAed: 4950000, saleType: "secondary", ratePerSqft: 1310, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4551.95, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4605.01, project: "Saadiyat Beach District", transactions: [
    { date: "2024-11-11", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1771, propertyType: "villa", bedrooms: 5, areaSqft: 4122.57, landSqft: 4605.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4761.3, project: "Saadiyat Beach District", transactions: [
    { date: "2022-04-15", priceAed: 5500000, saleType: "secondary", ratePerSqft: 1456, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4761.3, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 4766.79, project: "Saadiyat Beach District", transactions: [
    { date: "2024-03-11", priceAed: 6400000, saleType: "secondary", ratePerSqft: 1694, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4766.79, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 5069.26, project: "Saadiyat Beach District", transactions: [
    { date: "2024-10-15", priceAed: 7500000, saleType: "secondary", ratePerSqft: 1985, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5069.26, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 5140.84, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-15", priceAed: 6450000, saleType: "secondary", ratePerSqft: 1707, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5140.84, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 5146.65, project: "Saadiyat Beach District", transactions: [
    { date: "2023-06-02", priceAed: 5900000, saleType: "secondary", ratePerSqft: 1562, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5146.65, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 5490.77, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-21", priceAed: 5900000, saleType: "secondary", ratePerSqft: 1431, propertyType: "villa", bedrooms: 4, areaSqft: 4122.57, landSqft: 5490.77, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 5748.89, project: "Saadiyat Beach District", transactions: [
    { date: "2021-11-21", priceAed: 3250000, saleType: "secondary", ratePerSqft: 860, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5748.89, project: "Saadiyat Beach District" },
    { date: "2023-01-25", priceAed: 3530000, saleType: "secondary", ratePerSqft: 934, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5748.89, project: "Saadiyat Beach District" },
    { date: "2023-07-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1191, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5748.89, project: "Saadiyat Beach District" },
    { date: "2024-06-05", priceAed: 6050000, saleType: "secondary", ratePerSqft: 1601, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5748.89, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8231.05, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-02", priceAed: 9500000, saleType: "secondary", ratePerSqft: 2251, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8231.05, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8232.88, project: "Saadiyat Beach District", transactions: [
    { date: "2024-12-27", priceAed: 9000000, saleType: "secondary", ratePerSqft: 1608, propertyType: "villa", bedrooms: 6, areaSqft: 5597.23, landSqft: 8232.88, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8377.22, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 6320000, saleType: "secondary", ratePerSqft: 1498, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8377.22, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8391.21, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 9600000, saleType: "secondary", ratePerSqft: 1715, propertyType: "villa", bedrooms: 6, areaSqft: 5597.23, landSqft: 8391.21, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8473.88, project: "Saadiyat Beach District", transactions: [
    { date: "2024-05-20", priceAed: 11220000, saleType: "secondary", ratePerSqft: 2659, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8473.88, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8561.82, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-17", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1273, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 8561.82, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 8726.08, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 6320000, saleType: "secondary", ratePerSqft: 1498, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8726.08, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 9088.07, project: "Saadiyat Beach District", transactions: [
    { date: "2022-05-17", priceAed: 9900000, saleType: "secondary", ratePerSqft: 1769, propertyType: "villa", bedrooms: 6, areaSqft: 5597.23, landSqft: 9088.07, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 9335.42, project: "Saadiyat Beach District", transactions: [
    { date: "2021-09-22", priceAed: 8500000, saleType: "secondary", ratePerSqft: 1803, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 9335.42, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 9458.45, project: "Saadiyat Beach District", transactions: [
    { date: "2025-09-11", priceAed: 15000000, saleType: "secondary", ratePerSqft: 2680, propertyType: "villa", bedrooms: 6, areaSqft: 5597.23, landSqft: 9458.45, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 9654.68, project: "Saadiyat Beach District", transactions: [
    { date: "2024-03-05", priceAed: 8300000, saleType: "secondary", ratePerSqft: 1483, propertyType: "villa", bedrooms: 6, areaSqft: 5597.23, landSqft: 9654.68, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 10019.47, project: "Saadiyat Beach District", transactions: [
    { date: "2022-12-08", priceAed: 9000000, saleType: "secondary", ratePerSqft: 1909, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 10019.47, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 10064.78, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-09", priceAed: 6200000, saleType: "secondary", ratePerSqft: 1315, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 10064.78, project: "Saadiyat Beach District" },
    { date: "2022-01-06", priceAed: 8000000, saleType: "secondary", ratePerSqft: 1697, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 10064.78, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 10402.34, project: "Saadiyat Beach District", transactions: [
    { date: "2019-09-16", priceAed: 7000000, saleType: "secondary", ratePerSqft: 1485, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 10402.34, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11009.42, project: "Saadiyat Beach District", transactions: [
    { date: "2025-12-10", priceAed: 3765000, saleType: "secondary", ratePerSqft: 892, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 11009.42, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11193.7, project: "Saadiyat Beach District", transactions: [
    { date: "2024-04-01", priceAed: 11800000, saleType: "secondary", ratePerSqft: 1218, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 11193.7, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11332.02, project: "Saadiyat Beach District", transactions: [
    { date: "2020-09-29", priceAed: 5650000, saleType: "secondary", ratePerSqft: 1198, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 11332.02, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11369.15, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-23", priceAed: 12862293, saleType: "secondary", ratePerSqft: 1669, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 11369.15, project: "Saadiyat Beach District" },
    { date: "2023-02-09", priceAed: 3000000, saleType: "secondary", ratePerSqft: 389, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 11369.15, project: "Saadiyat Beach District" },
    { date: "2025-03-20", priceAed: 12000000, saleType: "secondary", ratePerSqft: 1557, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 11369.15, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11575.28, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-16", priceAed: 9500000, saleType: "secondary", ratePerSqft: 1233, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 11575.28, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 11721.13, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-08", priceAed: 9500000, saleType: "secondary", ratePerSqft: 1233, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 11721.13, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 12288.71, project: "Saadiyat Beach District", transactions: [
    { date: "2023-08-03", priceAed: 9400000, saleType: "secondary", ratePerSqft: 1994, propertyType: "villa", bedrooms: 5, areaSqft: 4714.59, landSqft: 12288.71, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 12578.69, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-08", priceAed: 13000000, saleType: "secondary", ratePerSqft: 1687, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 12578.69, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 12768.57, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-18", priceAed: 12013990, saleType: "secondary", ratePerSqft: 941, propertyType: "plot for villa", bedrooms: null, areaSqft: 12768.57, landSqft: 12768.57, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 13136.37, project: "Saadiyat Beach District", transactions: [
    { date: "2024-10-07", priceAed: 22000000, saleType: "secondary", ratePerSqft: 2271, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 13136.37, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 13138.63, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-02", priceAed: 15000000, saleType: "secondary", ratePerSqft: 1548, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 13138.63, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 13824.18, project: "Saadiyat Beach District", transactions: [
    { date: "2022-09-28", priceAed: 14190821, saleType: "secondary", ratePerSqft: 1027, propertyType: "plot for villa", bedrooms: null, areaSqft: 13824.18, landSqft: 13824.18, project: "Saadiyat Beach District" },
    { date: "2023-04-27", priceAed: 18500000, saleType: "secondary", ratePerSqft: 2400, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 13824.18, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 13848.08, project: "Saadiyat Beach District", transactions: [
    { date: "2024-07-02", priceAed: 20400000, saleType: "secondary", ratePerSqft: 2129, propertyType: "villa", bedrooms: 6, areaSqft: 9579.87, landSqft: 13848.08, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 14016.86, project: "Saadiyat Beach District", transactions: [
    { date: "2023-07-17", priceAed: 14000000, saleType: "secondary", ratePerSqft: 1817, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 14016.86, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 14051.84, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-16", priceAed: 14700000, saleType: "secondary", ratePerSqft: 1517, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 14051.84, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 14474.97, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-08", priceAed: 12500000, saleType: "secondary", ratePerSqft: 1290, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 14474.97, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 16294.82, project: "Saadiyat Beach District", transactions: [
    { date: "2026-03-24", priceAed: 23500000, saleType: "secondary", ratePerSqft: 3049, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 16294.82, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 16331.74, project: "Saadiyat Beach District", transactions: [
    { date: "2024-04-23", priceAed: 16000000, saleType: "secondary", ratePerSqft: 2076, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 16331.74, project: "Saadiyat Beach District" },
    { date: "2024-06-13", priceAed: 19600000, saleType: "secondary", ratePerSqft: 2543, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 16331.74, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 17752.36, project: "Saadiyat Beach District", transactions: [
    { date: "2024-05-23", priceAed: 20000000, saleType: "secondary", ratePerSqft: 2065, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 17752.36, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 18296.15, project: "Saadiyat Beach District", transactions: [
    { date: "2024-01-30", priceAed: 17500000, saleType: "secondary", ratePerSqft: 1436, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 18296.15, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 19041.98, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-07", priceAed: 18200000, saleType: "secondary", ratePerSqft: 1492, propertyType: "villa", bedrooms: 6, areaSqft: 12195.5, landSqft: 19041.98, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 19997.5, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-01", priceAed: 13671945, saleType: "secondary", ratePerSqft: 1411, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 19997.5, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 20742.14, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 10479907, saleType: "secondary", ratePerSqft: 505, propertyType: "plot for villa", bedrooms: null, areaSqft: 20742.14, landSqft: 20742.14, project: "Saadiyat Beach District" },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 723, propertyType: "plot for villa", bedrooms: null, areaSqft: 20742.14, landSqft: 20742.14, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 21022.65, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 9445410, saleType: "secondary", ratePerSqft: 449, propertyType: "plot for villa", bedrooms: null, areaSqft: 21022.65, landSqft: 21022.65, project: "Saadiyat Beach District" },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 714, propertyType: "plot for villa", bedrooms: null, areaSqft: 21022.65, landSqft: 21022.65, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 21160.54, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 9264373, saleType: "secondary", ratePerSqft: 438, propertyType: "plot for villa", bedrooms: null, areaSqft: 21160.54, landSqft: 21160.54, project: "Saadiyat Beach District" },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 709, propertyType: "plot for villa", bedrooms: null, areaSqft: 21160.54, landSqft: 21160.54, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 21979.99, project: "Saadiyat Beach District", transactions: [
    { date: "2019-10-03", priceAed: 17692223, saleType: "secondary", ratePerSqft: 805, propertyType: "plot for villa", bedrooms: null, areaSqft: 21979.99, landSqft: 21979.99, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 22277.94, project: "Saadiyat Beach District", transactions: [
    { date: "2023-03-02", priceAed: 23000000, saleType: "secondary", ratePerSqft: 1888, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 22277.94, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 22456.94, project: "Saadiyat Beach District", transactions: [
    { date: "2024-06-04", priceAed: 22000000, saleType: "secondary", ratePerSqft: 1804, propertyType: "villa", bedrooms: 6, areaSqft: 12195.5, landSqft: 22456.94, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 23388.99, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-13", priceAed: 8167281, saleType: "secondary", ratePerSqft: 349, propertyType: "plot for villa", bedrooms: null, areaSqft: 23388.99, landSqft: 23388.99, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 23650.01, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-25", priceAed: 15000000, saleType: "secondary", ratePerSqft: 1231, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 23650.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 24047.52, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-15", priceAed: 35000000, saleType: "secondary", ratePerSqft: 2872, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 24047.52, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 24109.95, project: "Saadiyat Beach District", transactions: [
    { date: "2025-11-14", priceAed: 26000000, saleType: "secondary", ratePerSqft: 2132, propertyType: "villa", bedrooms: 6, areaSqft: 12195.5, landSqft: 24109.95, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 24447.72, project: "Saadiyat Beach District", transactions: [
    { date: "2023-10-04", priceAed: 24000000, saleType: "secondary", ratePerSqft: 1970, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 24447.72, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 24854.38, project: "Saadiyat Beach District", transactions: [
    { date: "2023-05-29", priceAed: 8000000, saleType: "secondary", ratePerSqft: 549, propertyType: "villa", bedrooms: 6, areaSqft: 14574.32, landSqft: 24854.38, project: "Saadiyat Beach District" },
    { date: "2023-07-27", priceAed: 27250000, saleType: "secondary", ratePerSqft: 1870, propertyType: "villa", bedrooms: 6, areaSqft: 14574.32, landSqft: 24854.38, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 25246.62, project: "Saadiyat Beach District", transactions: [
    { date: "2020-04-14", priceAed: 8789479, saleType: "secondary", ratePerSqft: 348, propertyType: "villa", bedrooms: 5, areaSqft: 25246.62, landSqft: 25246.62, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 25247.8, project: "Saadiyat Beach District", transactions: [
    { date: "2022-04-05", priceAed: 8778234, saleType: "secondary", ratePerSqft: 348, propertyType: "plot for villa", bedrooms: null, areaSqft: 25247.8, landSqft: 25247.8, project: "Saadiyat Beach District" },
    { date: "2024-03-18", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2178, propertyType: "villa", bedrooms: 6, areaSqft: 25247.8, landSqft: 25247.8, project: "Saadiyat Beach District" },
    { date: "2024-05-30", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2178, propertyType: "villa", bedrooms: 6, areaSqft: 25247.8, landSqft: 25247.8, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 25879.21, project: "Saadiyat Beach District", transactions: [
    { date: "2020-01-05", priceAed: 9933803, saleType: "secondary", ratePerSqft: 384, propertyType: "plot for villa", bedrooms: null, areaSqft: 25879.21, landSqft: 25879.21, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 26478.76, project: "Saadiyat Beach District", transactions: [
    { date: "2023-07-13", priceAed: 22000000, saleType: "secondary", ratePerSqft: 1804, propertyType: "villa", bedrooms: 6, areaSqft: 12195.5, landSqft: 26478.76, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 27050.33, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 9007650, saleType: "secondary", ratePerSqft: 333, propertyType: "plot for villa", bedrooms: null, areaSqft: 27050.33, landSqft: 27050.33, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 27468.07, project: "Saadiyat Beach District", transactions: [
    { date: "2021-03-25", priceAed: 9149125, saleType: "secondary", ratePerSqft: 333, propertyType: "plot for villa", bedrooms: null, areaSqft: 27468.07, landSqft: 27468.07, project: "Saadiyat Beach District" },
    { date: "2022-08-23", priceAed: 22000000, saleType: "secondary", ratePerSqft: 966, propertyType: "villa", bedrooms: null, areaSqft: 22777.06, landSqft: 27468.07, project: "Saadiyat Beach District" },
    { date: "2025-11-28", priceAed: 76500000, saleType: "secondary", ratePerSqft: 3359, propertyType: "villa", bedrooms: null, areaSqft: 22777.06, landSqft: 27468.07, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 28295.28, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-05", priceAed: 9846465, saleType: "secondary", ratePerSqft: 348, propertyType: "plot for villa", bedrooms: null, areaSqft: 28295.28, landSqft: 28295.28, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 28602.91, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 9958910, saleType: "secondary", ratePerSqft: 440, propertyType: "villa", bedrooms: null, areaSqft: 22617.11, landSqft: 28602.91, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 30488.85, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-19", priceAed: 10109373, saleType: "secondary", ratePerSqft: 332, propertyType: "plot for villa", bedrooms: null, areaSqft: 30488.85, landSqft: 30488.85, project: "Saadiyat Beach District" },
    { date: "2024-03-27", priceAed: 75000000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 30488.85, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 30559.36, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-17", priceAed: 10134361, saleType: "secondary", ratePerSqft: 332, propertyType: "plot for villa", bedrooms: null, areaSqft: 30559.36, landSqft: 30559.36, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 30624.91, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-28", priceAed: 10173628, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 30624.91, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 31803.34, project: "Saadiyat Beach District", transactions: [
    { date: "2025-12-29", priceAed: 10000000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 31803.34, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 32282.55, project: "Saadiyat Beach District", transactions: [
    { date: "2022-03-04", priceAed: 23500000, saleType: "secondary", ratePerSqft: 1929, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 32282.55, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 32296.01, project: "Saadiyat Beach District", transactions: [
    { date: "2022-01-17", priceAed: 24000000, saleType: "secondary", ratePerSqft: 1631, propertyType: "villa", bedrooms: 6, areaSqft: 14714.25, landSqft: 32296.01, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 32323.35, project: "Saadiyat Beach District", transactions: [
    { date: "2025-12-29", priceAed: 10000000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 32323.35, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 34369.99, project: "Saadiyat Beach District", transactions: [
    { date: "2025-07-23", priceAed: 30000000, saleType: "secondary", ratePerSqft: 2058, propertyType: "villa", bedrooms: 6, areaSqft: 14574.32, landSqft: 34369.99, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 39267.57, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 13699593, saleType: "secondary", ratePerSqft: 349, propertyType: "plot for villa", bedrooms: null, areaSqft: 39267.57, landSqft: 39267.57, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 39526.76, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-02", priceAed: 15558891, saleType: "secondary", ratePerSqft: 394, propertyType: "plot for villa", bedrooms: null, areaSqft: 39526.76, landSqft: 39526.76, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 40014.58, project: "Saadiyat Beach District", transactions: [
    { date: "2023-06-07", priceAed: 13931980, saleType: "secondary", ratePerSqft: 348, propertyType: "plot for villa", bedrooms: null, areaSqft: 40014.58, landSqft: 40014.58, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 52370.89, project: "Saadiyat Beach District", transactions: [
    { date: "2019-11-17", priceAed: 18242386, saleType: "secondary", ratePerSqft: 348, propertyType: "plot for villa", bedrooms: null, areaSqft: 52370.89, landSqft: 52370.89, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 57587.51, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-11", priceAed: 20026518, saleType: "secondary", ratePerSqft: 348, propertyType: "plot for villa", bedrooms: null, areaSqft: 57587.51, landSqft: 57587.51, project: "Saadiyat Beach District" },
  ] },
  { landSqft: 65152.49, project: "Saadiyat Beach District", transactions: [
    { date: "2019-08-29", priceAed: 23837854, saleType: "secondary", ratePerSqft: 366, propertyType: "plot for villa", bedrooms: null, areaSqft: 65152.49, landSqft: 65152.49, project: "Saadiyat Beach District" },
  ] },
];

export const sbvPlotsPlotHistories: SDN2PlotHistory[] = [
  { landSqft: 3359.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-10-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1035, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3359.31, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3362.21, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-08-11", priceAed: 4400000, saleType: "secondary", ratePerSqft: 1011, propertyType: "townhouse", bedrooms: 4, areaSqft: 4352.71, landSqft: 3362.21, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3362.53, project: "Saadiyat Beach Villas", transactions: [
    { date: "2023-09-14", priceAed: 5400000, saleType: "secondary", ratePerSqft: 1242, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3362.53, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3376.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-02-22", priceAed: 5200000, saleType: "secondary", ratePerSqft: 1196, propertyType: "townhouse", bedrooms: 5, areaSqft: 4348.62, landSqft: 3376.31, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3502.03, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-05-11", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1219, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3502.03, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3541.86, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-10-05", priceAed: 4150000, saleType: "secondary", ratePerSqft: 954, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3541.86, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3611.72, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-09-20", priceAed: 4200000, saleType: "secondary", ratePerSqft: 966, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 3611.72, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 3816.13, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-01-26", priceAed: 4000000, saleType: "secondary", ratePerSqft: 1059, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 3816.13, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 4106.32, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-02-28", priceAed: 4600000, saleType: "secondary", ratePerSqft: 1058, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4106.32, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 4308.68, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-08-11", priceAed: 5850000, saleType: "secondary", ratePerSqft: 1345, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4308.68, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 4394.04, project: "Saadiyat Beach Villas", transactions: [
    { date: "2025-02-06", priceAed: 7000000, saleType: "secondary", ratePerSqft: 1853, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 4394.04, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 4974.32, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-08-15", priceAed: 5100000, saleType: "secondary", ratePerSqft: 1173, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4974.32, project: "Saadiyat Beach Villas" },
    { date: "2024-05-27", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449, propertyType: "villa", bedrooms: 5, areaSqft: 4348.62, landSqft: 4974.32, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 5069.26, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-07-01", priceAed: 5750000, saleType: "secondary", ratePerSqft: 1522, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5069.26, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 5134.6, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-06-29", priceAed: 4700000, saleType: "secondary", ratePerSqft: 1244, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5134.6, project: "Saadiyat Beach Villas" },
    { date: "2025-06-13", priceAed: 6900000, saleType: "secondary", ratePerSqft: 1826, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5134.6, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 5291.75, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-02-04", priceAed: 4550039, saleType: "secondary", ratePerSqft: 1204, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5291.75, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 5661.81, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-01-07", priceAed: 4900000, saleType: "secondary", ratePerSqft: 1297, propertyType: "villa", bedrooms: 4, areaSqft: 3778.13, landSqft: 5661.81, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 8473.88, project: "Saadiyat Beach Villas", transactions: [
    { date: "2023-01-31", priceAed: 7400000, saleType: "secondary", ratePerSqft: 1754, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8473.88, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 8574.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-07-14", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1422, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 8574.31, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 9093.45, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-10-07", priceAed: 5700000, saleType: "secondary", ratePerSqft: 1351, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 9093.45, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 10586.4, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-02-22", priceAed: 9800000, saleType: "secondary", ratePerSqft: 1012, propertyType: "villa", bedrooms: 6, areaSqft: 9687.51, landSqft: 10586.4, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 11009.42, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-09-02", priceAed: 5000000, saleType: "secondary", ratePerSqft: 1185, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 11009.42, project: "Saadiyat Beach Villas" },
    { date: "2021-10-14", priceAed: 6450000, saleType: "secondary", ratePerSqft: 1529, propertyType: "villa", bedrooms: 4, areaSqft: 4219.45, landSqft: 11009.42, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 14016.86, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-10-23", priceAed: 8000000, saleType: "secondary", ratePerSqft: 1038, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 14016.86, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 14447.52, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-04-29", priceAed: 10500000, saleType: "secondary", ratePerSqft: 1096, propertyType: "villa", bedrooms: 6, areaSqft: 9579.87, landSqft: 14447.52, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 14462.38, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-06-01", priceAed: 14000000, saleType: "secondary", ratePerSqft: 1461, propertyType: "villa", bedrooms: 6, areaSqft: 9579.87, landSqft: 14462.38, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 16826.77, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-03-21", priceAed: 13500000, saleType: "secondary", ratePerSqft: 1752, propertyType: "villa", bedrooms: 6, areaSqft: 7706.95, landSqft: 16826.77, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 18296.15, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-07-13", priceAed: 16000000, saleType: "secondary", ratePerSqft: 1313, propertyType: "villa", bedrooms: 6, areaSqft: 12184.73, landSqft: 18296.15, project: "Saadiyat Beach Villas" },
  ] },
  { landSqft: 20298.24, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-03-24", priceAed: 21000000, saleType: "secondary", ratePerSqft: 1722, propertyType: "villa", bedrooms: 6, areaSqft: 12195.5, landSqft: 20298.24, project: "Saadiyat Beach Villas" },
  ] },
];

/** All SDN2 plot histories combined */
export const allSDN2PlotHistories: SDN2PlotHistory[] = [...fayaPlotHistories, ...sbdPlotsPlotHistories, ...sbvPlotsPlotHistories];

/** All SDN2 transactions flat */
export const allSDN2Transactions: SDN2Transaction[] = allSDN2PlotHistories.flatMap(p => p.transactions);

/** Get transactions for a specific plot by land area */
export function getSDN2PlotTransactions(landSqft: number): SDN2Transaction[] {
  const plot = allSDN2PlotHistories.find(p => Math.abs(p.landSqft - landSqft) < 50);
  return plot?.transactions ?? [];
}

/** Summary stats */
export const SDN2_TX_SUMMARY = {
  totalTransactions: 171,
  fayaCount: 20,
  sbdCount: 121,
  sbvCount: 30,
  uniquePlots: 148,
  dateRange: { from: "2019-02-04", to: "2026-06-08" },
};
