/**
 * SDN2 Transaction History — indexed by land area for plot matching
 * Source: Abu Dhabi Real Estate Transactions (ad-transactions.com)
 * Updated 16 Aug 2026, Generated 17 Aug 2026
 *
 * 171 transactions across 148 unique plots (by land area)
 * Projects: Faya Al Saadiyat (20), Saadiyat Beach District (121), Saadiyat Beach Villas (30)
 */

import type { PlotTransaction } from "@/components/SimplePlotCard";

export interface SDN2PlotRecord {
  landSqft: number;
  project: string;
  transactions: PlotTransaction[];
}

/** All SDN2 plots with their transaction histories, indexed by land area */
export const sdn2PlotRecords: SDN2PlotRecord[] = [
  { landSqft: 3359.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-10-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1035 },
  ] },
  { landSqft: 3361.57, project: "Saadiyat Beach District", transactions: [
    { date: "2023-04-05", priceAed: 5350000, saleType: "secondary", ratePerSqft: 1230 },
  ] },
  { landSqft: 3362.21, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-08-11", priceAed: 4400000, saleType: "secondary", ratePerSqft: 1011 },
  ] },
  { landSqft: 3362.53, project: "Saadiyat Beach Villas", transactions: [
    { date: "2023-09-14", priceAed: 5400000, saleType: "secondary", ratePerSqft: 1242 },
  ] },
  { landSqft: 3364.47, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1035 },
  ] },
  { landSqft: 3366.3, project: "Saadiyat Beach District", transactions: [
    { date: "2022-11-02", priceAed: 5500000, saleType: "secondary", ratePerSqft: 1265 },
  ] },
  { landSqft: 3376.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-02-22", priceAed: 5200000, saleType: "secondary", ratePerSqft: 1196 },
  ] },
  { landSqft: 3403.11, project: "Saadiyat Beach District", transactions: [
    { date: "2024-09-24", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449 },
  ] },
  { landSqft: 3429.27, project: "Saadiyat Beach District", transactions: [
    { date: "2024-08-01", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449 },
  ] },
  { landSqft: 3502.03, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-05-11", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1219 },
  ] },
  { landSqft: 3505.16, project: "Saadiyat Beach District", transactions: [
    { date: "2026-05-19", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1679 },
  ] },
  { landSqft: 3541.86, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-10-05", priceAed: 4150000, saleType: "secondary", ratePerSqft: 954 },
  ] },
  { landSqft: 3562.42, project: "Saadiyat Beach District", transactions: [
    { date: "2026-01-21", priceAed: 7700000, saleType: "secondary", ratePerSqft: 1771 },
  ] },
  { landSqft: 3611.72, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-09-20", priceAed: 4200000, saleType: "secondary", ratePerSqft: 966 },
  ] },
  { landSqft: 3615.7, project: "Saadiyat Beach District", transactions: [
    { date: "2022-07-01", priceAed: 5250000, saleType: "secondary", ratePerSqft: 1207 },
  ] },
  { landSqft: 3616.67, project: "Saadiyat Beach District", transactions: [
    { date: "2026-03-03", priceAed: 8400000, saleType: "secondary", ratePerSqft: 2323 },
  ] },
  { landSqft: 3816.13, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-01-26", priceAed: 4000000, saleType: "secondary", ratePerSqft: 1059 },
  ] },
  { landSqft: 3848.52, project: "Saadiyat Beach District", transactions: [
    { date: "2024-05-17", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1588 },
    { date: "2025-06-13", priceAed: 8200000, saleType: "secondary", ratePerSqft: 2170 },
  ] },
  { landSqft: 3854.01, project: "Saadiyat Beach District", transactions: [
    { date: "2021-03-16", priceAed: 4350000, saleType: "secondary", ratePerSqft: 1000 },
  ] },
  { landSqft: 3876.4, project: "Saadiyat Beach District", transactions: [
    { date: "2023-09-27", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1219 },
  ] },
  { landSqft: 3899.01, project: "Saadiyat Beach District", transactions: [
    { date: "2025-06-02", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1667 },
  ] },
  { landSqft: 3914.94, project: "Saadiyat Beach District", transactions: [
    { date: "2021-12-07", priceAed: 4600000, saleType: "secondary", ratePerSqft: 1218 },
  ] },
  { landSqft: 3984.8, project: "Saadiyat Beach District", transactions: [
    { date: "2024-01-16", priceAed: 5700000, saleType: "secondary", ratePerSqft: 1509 },
  ] },
  { landSqft: 4106.32, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-02-28", priceAed: 4600000, saleType: "secondary", ratePerSqft: 1058 },
  ] },
  { landSqft: 4109.01, project: "Saadiyat Beach District", transactions: [
    { date: "2022-01-25", priceAed: 4932885, saleType: "secondary", ratePerSqft: 1201 },
    { date: "2022-04-15", priceAed: 5000000, saleType: "secondary", ratePerSqft: 1323 },
    { date: "2026-04-22", priceAed: 8400000, saleType: "secondary", ratePerSqft: 2044 },
  ] },
  { landSqft: 4171.98, project: "Saadiyat Beach District", transactions: [
    { date: "2020-10-14", priceAed: 6659400, saleType: "secondary", ratePerSqft: 1596 },
  ] },
  { landSqft: 4258.2, project: "Saadiyat Beach District", transactions: [
    { date: "2022-12-08", priceAed: 6100000, saleType: "secondary", ratePerSqft: 1403 },
  ] },
  { landSqft: 4274.02, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-28", priceAed: 5600000, saleType: "secondary", ratePerSqft: 1288 },
  ] },
  { landSqft: 4308.68, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-08-11", priceAed: 5850000, saleType: "secondary", ratePerSqft: 1345 },
  ] },
  { landSqft: 4317.72, project: "Saadiyat Beach District", transactions: [
    { date: "2023-05-01", priceAed: 5300000, saleType: "secondary", ratePerSqft: 1403 },
  ] },
  { landSqft: 4354.0, project: "Saadiyat Beach District", transactions: [
    { date: "2021-11-08", priceAed: 4900000, saleType: "secondary", ratePerSqft: 1297 },
  ] },
  { landSqft: 4394.04, project: "Saadiyat Beach Villas", transactions: [
    { date: "2025-02-06", priceAed: 7000000, saleType: "secondary", ratePerSqft: 1853 },
  ] },
  { landSqft: 4440.32, project: "Saadiyat Beach District", transactions: [
    { date: "2024-09-25", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1771 },
  ] },
  { landSqft: 4551.95, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-30", priceAed: 4950000, saleType: "secondary", ratePerSqft: 1310 },
  ] },
  { landSqft: 4605.01, project: "Saadiyat Beach District", transactions: [
    { date: "2024-11-11", priceAed: 7300000, saleType: "secondary", ratePerSqft: 1771 },
  ] },
  { landSqft: 4761.3, project: "Saadiyat Beach District", transactions: [
    { date: "2022-04-15", priceAed: 5500000, saleType: "secondary", ratePerSqft: 1456 },
  ] },
  { landSqft: 4766.79, project: "Saadiyat Beach District", transactions: [
    { date: "2024-03-11", priceAed: 6400000, saleType: "secondary", ratePerSqft: 1694 },
  ] },
  { landSqft: 4974.32, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-08-15", priceAed: 5100000, saleType: "secondary", ratePerSqft: 1173 },
    { date: "2024-05-27", priceAed: 6300000, saleType: "secondary", ratePerSqft: 1449 },
  ] },
  { landSqft: 5069.26, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-07-01", priceAed: 5750000, saleType: "secondary", ratePerSqft: 1522 },
    { date: "2024-10-15", priceAed: 7500000, saleType: "secondary", ratePerSqft: 1985 },
  ] },
  { landSqft: 5134.6, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-06-29", priceAed: 4700000, saleType: "secondary", ratePerSqft: 1244 },
    { date: "2025-06-13", priceAed: 6900000, saleType: "secondary", ratePerSqft: 1826 },
  ] },
  { landSqft: 5140.84, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-15", priceAed: 6450000, saleType: "secondary", ratePerSqft: 1707 },
  ] },
  { landSqft: 5146.65, project: "Saadiyat Beach District", transactions: [
    { date: "2023-06-02", priceAed: 5900000, saleType: "secondary", ratePerSqft: 1562 },
  ] },
  { landSqft: 5291.75, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-02-04", priceAed: 4550039, saleType: "secondary", ratePerSqft: 1204 },
  ] },
  { landSqft: 5490.77, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-21", priceAed: 5900000, saleType: "secondary", ratePerSqft: 1431 },
  ] },
  { landSqft: 5661.81, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-01-07", priceAed: 4900000, saleType: "secondary", ratePerSqft: 1297 },
  ] },
  { landSqft: 5748.89, project: "Saadiyat Beach District", transactions: [
    { date: "2021-11-21", priceAed: 3250000, saleType: "secondary", ratePerSqft: 860 },
    { date: "2023-01-25", priceAed: 3530000, saleType: "secondary", ratePerSqft: 934 },
    { date: "2023-07-06", priceAed: 4500000, saleType: "secondary", ratePerSqft: 1191 },
    { date: "2024-06-05", priceAed: 6050000, saleType: "secondary", ratePerSqft: 1601 },
  ] },
  { landSqft: 8231.05, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-02", priceAed: 9500000, saleType: "secondary", ratePerSqft: 2251 },
  ] },
  { landSqft: 8232.88, project: "Saadiyat Beach District", transactions: [
    { date: "2024-12-27", priceAed: 9000000, saleType: "secondary", ratePerSqft: 1608 },
  ] },
  { landSqft: 8377.22, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 6320000, saleType: "secondary", ratePerSqft: 1498 },
  ] },
  { landSqft: 8391.21, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 9600000, saleType: "secondary", ratePerSqft: 1715 },
  ] },
  { landSqft: 8473.88, project: "Saadiyat Beach Villas", transactions: [
    { date: "2023-01-31", priceAed: 7400000, saleType: "secondary", ratePerSqft: 1754 },
    { date: "2024-05-20", priceAed: 11220000, saleType: "secondary", ratePerSqft: 2659 },
  ] },
  { landSqft: 8561.82, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-17", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1273 },
  ] },
  { landSqft: 8574.31, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-07-14", priceAed: 6000000, saleType: "secondary", ratePerSqft: 1422 },
  ] },
  { landSqft: 8726.08, project: "Saadiyat Beach District", transactions: [
    { date: "2023-11-27", priceAed: 6320000, saleType: "secondary", ratePerSqft: 1498 },
  ] },
  { landSqft: 9088.07, project: "Saadiyat Beach District", transactions: [
    { date: "2022-05-17", priceAed: 9900000, saleType: "secondary", ratePerSqft: 1769 },
  ] },
  { landSqft: 9093.45, project: "Saadiyat Beach Villas", transactions: [
    { date: "2020-10-07", priceAed: 5700000, saleType: "secondary", ratePerSqft: 1351 },
  ] },
  { landSqft: 9335.42, project: "Saadiyat Beach District", transactions: [
    { date: "2021-09-22", priceAed: 8500000, saleType: "secondary", ratePerSqft: 1803 },
  ] },
  { landSqft: 9458.45, project: "Saadiyat Beach District", transactions: [
    { date: "2025-09-11", priceAed: 15000000, saleType: "secondary", ratePerSqft: 2680 },
  ] },
  { landSqft: 9654.68, project: "Saadiyat Beach District", transactions: [
    { date: "2024-03-05", priceAed: 8300000, saleType: "secondary", ratePerSqft: 1483 },
  ] },
  { landSqft: 10019.47, project: "Saadiyat Beach District", transactions: [
    { date: "2022-12-08", priceAed: 9000000, saleType: "secondary", ratePerSqft: 1909 },
  ] },
  { landSqft: 10064.78, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-09", priceAed: 6200000, saleType: "secondary", ratePerSqft: 1315 },
    { date: "2022-01-06", priceAed: 8000000, saleType: "secondary", ratePerSqft: 1697 },
  ] },
  { landSqft: 10402.34, project: "Saadiyat Beach District", transactions: [
    { date: "2019-09-16", priceAed: 7000000, saleType: "secondary", ratePerSqft: 1485 },
  ] },
  { landSqft: 10586.4, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-02-22", priceAed: 9800000, saleType: "secondary", ratePerSqft: 1012 },
  ] },
  { landSqft: 11009.42, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-09-02", priceAed: 5000000, saleType: "secondary", ratePerSqft: 1185 },
    { date: "2021-10-14", priceAed: 6450000, saleType: "secondary", ratePerSqft: 1529 },
    { date: "2025-12-10", priceAed: 3765000, saleType: "secondary", ratePerSqft: 892 },
  ] },
  { landSqft: 11193.7, project: "Saadiyat Beach District", transactions: [
    { date: "2024-04-01", priceAed: 11800000, saleType: "secondary", ratePerSqft: 1218 },
  ] },
  { landSqft: 11332.02, project: "Saadiyat Beach District", transactions: [
    { date: "2020-09-29", priceAed: 5650000, saleType: "secondary", ratePerSqft: 1198 },
  ] },
  { landSqft: 11369.15, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-23", priceAed: 12862293, saleType: "secondary", ratePerSqft: 1669 },
    { date: "2023-02-09", priceAed: 3000000, saleType: "secondary", ratePerSqft: 389 },
    { date: "2025-03-20", priceAed: 12000000, saleType: "secondary", ratePerSqft: 1557 },
  ] },
  { landSqft: 11575.28, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-16", priceAed: 9500000, saleType: "secondary", ratePerSqft: 1233 },
  ] },
  { landSqft: 11721.13, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-08", priceAed: 9500000, saleType: "secondary", ratePerSqft: 1233 },
  ] },
  { landSqft: 12288.71, project: "Saadiyat Beach District", transactions: [
    { date: "2023-08-03", priceAed: 9400000, saleType: "secondary", ratePerSqft: 1994 },
  ] },
  { landSqft: 12578.69, project: "Saadiyat Beach District", transactions: [
    { date: "2022-02-08", priceAed: 13000000, saleType: "secondary", ratePerSqft: 1687 },
  ] },
  { landSqft: 12768.57, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-18", priceAed: 12013990, saleType: "secondary", ratePerSqft: 941 },
  ] },
  { landSqft: 13136.37, project: "Saadiyat Beach District", transactions: [
    { date: "2024-10-07", priceAed: 22000000, saleType: "secondary", ratePerSqft: 2271 },
  ] },
  { landSqft: 13138.63, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-02", priceAed: 15000000, saleType: "secondary", ratePerSqft: 1548 },
  ] },
  { landSqft: 13824.18, project: "Saadiyat Beach District", transactions: [
    { date: "2022-09-28", priceAed: 14190821, saleType: "secondary", ratePerSqft: 1027 },
    { date: "2023-04-27", priceAed: 18500000, saleType: "secondary", ratePerSqft: 2400 },
  ] },
  { landSqft: 13848.08, project: "Saadiyat Beach District", transactions: [
    { date: "2024-07-02", priceAed: 20400000, saleType: "secondary", ratePerSqft: 2129 },
  ] },
  { landSqft: 14016.86, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-10-23", priceAed: 8000000, saleType: "secondary", ratePerSqft: 1038 },
    { date: "2023-07-17", priceAed: 14000000, saleType: "secondary", ratePerSqft: 1817 },
  ] },
  { landSqft: 14051.84, project: "Saadiyat Beach District", transactions: [
    { date: "2021-05-16", priceAed: 14700000, saleType: "secondary", ratePerSqft: 1517 },
  ] },
  { landSqft: 14447.52, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-04-29", priceAed: 10500000, saleType: "secondary", ratePerSqft: 1096 },
  ] },
  { landSqft: 14462.38, project: "Saadiyat Beach Villas", transactions: [
    { date: "2022-06-01", priceAed: 14000000, saleType: "secondary", ratePerSqft: 1461 },
  ] },
  { landSqft: 14474.97, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-08", priceAed: 12500000, saleType: "secondary", ratePerSqft: 1290 },
  ] },
  { landSqft: 16294.82, project: "Saadiyat Beach District", transactions: [
    { date: "2026-03-24", priceAed: 23500000, saleType: "secondary", ratePerSqft: 3049 },
  ] },
  { landSqft: 16331.74, project: "Saadiyat Beach District", transactions: [
    { date: "2024-04-23", priceAed: 16000000, saleType: "secondary", ratePerSqft: 2076 },
    { date: "2024-06-13", priceAed: 19600000, saleType: "secondary", ratePerSqft: 2543 },
  ] },
  { landSqft: 16826.77, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-03-21", priceAed: 13500000, saleType: "secondary", ratePerSqft: 1752 },
  ] },
  { landSqft: 17752.36, project: "Saadiyat Beach District", transactions: [
    { date: "2024-05-23", priceAed: 20000000, saleType: "secondary", ratePerSqft: 2065 },
  ] },
  { landSqft: 18270.54, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-05", priceAed: 89394097, saleType: "primary", ratePerSqft: 4660 },
  ] },
  { landSqft: 18296.15, project: "Saadiyat Beach Villas", transactions: [
    { date: "2021-07-13", priceAed: 16000000, saleType: "secondary", ratePerSqft: 1313 },
    { date: "2024-01-30", priceAed: 17500000, saleType: "secondary", ratePerSqft: 1436 },
  ] },
  { landSqft: 18334.15, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-08", priceAed: 89459797, saleType: "primary", ratePerSqft: 4663 },
  ] },
  { landSqft: 18520.26, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-01", priceAed: 96392323, saleType: "primary", ratePerSqft: 5025 },
  ] },
  { landSqft: 18967.71, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-12", priceAed: 90166117, saleType: "primary", ratePerSqft: 4700 },
  ] },
  { landSqft: 19041.98, project: "Saadiyat Beach District", transactions: [
    { date: "2021-06-07", priceAed: 18200000, saleType: "secondary", ratePerSqft: 1492 },
  ] },
  { landSqft: 19094.51, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-13", priceAed: 90307477, saleType: "primary", ratePerSqft: 4707 },
  ] },
  { landSqft: 19142.63, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-06-08", priceAed: 87440079, saleType: "primary", ratePerSqft: 4558 },
  ] },
  { landSqft: 19157.27, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-01-16", priceAed: 85030567, saleType: "primary", ratePerSqft: 4432 },
  ] },
  { landSqft: 19171.91, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-06-10", priceAed: 85759803, saleType: "primary", ratePerSqft: 4470 },
  ] },
  { landSqft: 19696.32, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-26", priceAed: 90918697, saleType: "primary", ratePerSqft: 4739 },
  ] },
  { landSqft: 19997.5, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-01", priceAed: 13671945, saleType: "secondary", ratePerSqft: 1411 },
  ] },
  { landSqft: 20298.24, project: "Saadiyat Beach Villas", transactions: [
    { date: "2019-03-24", priceAed: 21000000, saleType: "secondary", ratePerSqft: 1722 },
  ] },
  { landSqft: 20742.14, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 10479907, saleType: "secondary", ratePerSqft: 505 },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 723 },
  ] },
  { landSqft: 20881.64, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-09", priceAed: 94305332, saleType: "primary", ratePerSqft: 4551 },
  ] },
  { landSqft: 21022.65, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 9445410, saleType: "secondary", ratePerSqft: 449 },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 714 },
  ] },
  { landSqft: 21160.54, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-19", priceAed: 9264373, saleType: "secondary", ratePerSqft: 438 },
    { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 709 },
  ] },
  { landSqft: 21654.92, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-10", priceAed: 96831248, saleType: "primary", ratePerSqft: 4672 },
  ] },
  { landSqft: 21979.99, project: "Saadiyat Beach District", transactions: [
    { date: "2019-10-03", priceAed: 17692223, saleType: "secondary", ratePerSqft: 805 },
  ] },
  { landSqft: 22080.42, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-28", priceAed: 93099178, saleType: "primary", ratePerSqft: 4492 },
  ] },
  { landSqft: 22277.94, project: "Saadiyat Beach District", transactions: [
    { date: "2023-03-02", priceAed: 23000000, saleType: "secondary", ratePerSqft: 1888 },
  ] },
  { landSqft: 22456.94, project: "Saadiyat Beach District", transactions: [
    { date: "2024-06-04", priceAed: 22000000, saleType: "secondary", ratePerSqft: 1804 },
  ] },
  { landSqft: 22581.69, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-09", priceAed: 99399944, saleType: "primary", ratePerSqft: 4796 },
  ] },
  { landSqft: 22591.38, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-01-13", priceAed: 94781852, saleType: "primary", ratePerSqft: 4574 },
  ] },
  { landSqft: 23346.58, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-08-06", priceAed: 93452068, saleType: "primary", ratePerSqft: 4509 },
  ] },
  { landSqft: 23388.99, project: "Saadiyat Beach District", transactions: [
    { date: "2020-12-13", priceAed: 8167281, saleType: "secondary", ratePerSqft: 349 },
  ] },
  { landSqft: 23641.83, project: "Faya Al Saadiyat", transactions: [
    { date: "2024-12-26", priceAed: 97385018, saleType: "primary", ratePerSqft: 4699 },
  ] },
  { landSqft: 23650.01, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-25", priceAed: 15000000, saleType: "secondary", ratePerSqft: 1231 },
  ] },
  { landSqft: 23853.99, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-09-01", priceAed: 94363620, saleType: "primary", ratePerSqft: 4553 },
  ] },
  { landSqft: 24047.52, project: "Saadiyat Beach District", transactions: [
    { date: "2025-05-15", priceAed: 35000000, saleType: "secondary", ratePerSqft: 2872 },
  ] },
  { landSqft: 24109.95, project: "Saadiyat Beach District", transactions: [
    { date: "2025-11-14", priceAed: 26000000, saleType: "secondary", ratePerSqft: 2132 },
  ] },
  { landSqft: 24447.72, project: "Saadiyat Beach District", transactions: [
    { date: "2023-10-04", priceAed: 24000000, saleType: "secondary", ratePerSqft: 1970 },
  ] },
  { landSqft: 24854.38, project: "Saadiyat Beach District", transactions: [
    { date: "2023-05-29", priceAed: 8000000, saleType: "secondary", ratePerSqft: 549 },
    { date: "2023-07-27", priceAed: 27250000, saleType: "secondary", ratePerSqft: 1870 },
  ] },
  { landSqft: 25246.62, project: "Saadiyat Beach District", transactions: [
    { date: "2020-04-14", priceAed: 8789479, saleType: "secondary", ratePerSqft: 348 },
  ] },
  { landSqft: 25247.8, project: "Saadiyat Beach District", transactions: [
    { date: "2022-04-05", priceAed: 8778234, saleType: "secondary", ratePerSqft: 348 },
    { date: "2024-03-18", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2178 },
    { date: "2024-05-30", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2178 },
  ] },
  { landSqft: 25879.21, project: "Saadiyat Beach District", transactions: [
    { date: "2020-01-05", priceAed: 9933803, saleType: "secondary", ratePerSqft: 384 },
  ] },
  { landSqft: 25894.39, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-03-12", priceAed: 100323224, saleType: "primary", ratePerSqft: 4841 },
  ] },
  { landSqft: 26478.76, project: "Saadiyat Beach District", transactions: [
    { date: "2023-07-13", priceAed: 22000000, saleType: "secondary", ratePerSqft: 1804 },
  ] },
  { landSqft: 27050.33, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 9007650, saleType: "secondary", ratePerSqft: 333 },
  ] },
  { landSqft: 27468.07, project: "Saadiyat Beach District", transactions: [
    { date: "2021-03-25", priceAed: 9149125, saleType: "secondary", ratePerSqft: 333 },
    { date: "2022-08-23", priceAed: 22000000, saleType: "secondary", ratePerSqft: 966 },
    { date: "2025-11-28", priceAed: 76500000, saleType: "secondary", ratePerSqft: 3359 },
  ] },
  { landSqft: 28295.28, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-05", priceAed: 9846465, saleType: "secondary", ratePerSqft: 348 },
  ] },
  { landSqft: 28602.91, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 9958910, saleType: "secondary", ratePerSqft: 440 },
  ] },
  { landSqft: 30488.85, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-19", priceAed: 10109373, saleType: "secondary", ratePerSqft: 332 },
    { date: "2024-03-27", priceAed: 75000000, saleType: "secondary", ratePerSqft: null },
  ] },
  { landSqft: 30559.36, project: "Saadiyat Beach District", transactions: [
    { date: "2020-08-17", priceAed: 10134361, saleType: "secondary", ratePerSqft: 332 },
  ] },
  { landSqft: 30624.91, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-28", priceAed: 10173628, saleType: "secondary", ratePerSqft: null },
  ] },
  { landSqft: 31102.18, project: "Faya Al Saadiyat", transactions: [
    { date: "2025-04-09", priceAed: 96614799, saleType: "primary", ratePerSqft: 4662 },
  ] },
  { landSqft: 31803.34, project: "Saadiyat Beach District", transactions: [
    { date: "2025-12-29", priceAed: 10000000, saleType: "secondary", ratePerSqft: null },
  ] },
  { landSqft: 32282.55, project: "Saadiyat Beach District", transactions: [
    { date: "2022-03-04", priceAed: 23500000, saleType: "secondary", ratePerSqft: 1929 },
  ] },
  { landSqft: 32296.01, project: "Saadiyat Beach District", transactions: [
    { date: "2022-01-17", priceAed: 24000000, saleType: "secondary", ratePerSqft: 1631 },
  ] },
  { landSqft: 32323.35, project: "Saadiyat Beach District", transactions: [
    { date: "2025-12-29", priceAed: 10000000, saleType: "secondary", ratePerSqft: null },
  ] },
  { landSqft: 34369.99, project: "Saadiyat Beach District", transactions: [
    { date: "2025-07-23", priceAed: 30000000, saleType: "secondary", ratePerSqft: 2058 },
  ] },
  { landSqft: 39267.57, project: "Saadiyat Beach District", transactions: [
    { date: "2020-11-26", priceAed: 13699593, saleType: "secondary", ratePerSqft: 349 },
  ] },
  { landSqft: 39526.76, project: "Saadiyat Beach District", transactions: [
    { date: "2020-06-02", priceAed: 15558891, saleType: "secondary", ratePerSqft: 394 },
  ] },
  { landSqft: 40014.58, project: "Saadiyat Beach District", transactions: [
    { date: "2023-06-07", priceAed: 13931980, saleType: "secondary", ratePerSqft: 348 },
  ] },
  { landSqft: 52370.89, project: "Saadiyat Beach District", transactions: [
    { date: "2019-11-17", priceAed: 18242386, saleType: "secondary", ratePerSqft: 348 },
  ] },
  { landSqft: 57587.51, project: "Saadiyat Beach District", transactions: [
    { date: "2021-10-11", priceAed: 20026518, saleType: "secondary", ratePerSqft: 348 },
  ] },
  { landSqft: 65152.49, project: "Saadiyat Beach District", transactions: [
    { date: "2019-08-29", priceAed: 23837854, saleType: "secondary", ratePerSqft: 366 },
  ] },
  { landSqft: 70624.64, project: "Faya Al Saadiyat", transactions: [
    { date: "2026-02-12", priceAed: 400808101, saleType: "primary", ratePerSqft: 7268 },
  ] },
];

/**
 * Find transactions for a plot by its land area (sqft).
 * Uses exact match first, then falls back to ±20 sqft tolerance.
 */
export function findSDN2Transactions(landSqft: number): PlotTransaction[] | undefined {
  // Exact match
  const exact = sdn2PlotRecords.find(r => r.landSqft === landSqft);
  if (exact) return exact.transactions;
  // Fuzzy match (±20 sqft)
  const fuzzy = sdn2PlotRecords.find(r => Math.abs(r.landSqft - landSqft) < 20);
  return fuzzy?.transactions;
}

/**
 * Get all SDN2 plot records for a specific land area range.
 * Useful for filtering Golf Views (large plots) vs SBV (small plots).
 */
export function getSDN2ByLandRange(minSqft: number, maxSqft: number): SDN2PlotRecord[] {
  return sdn2PlotRecords.filter(r => r.landSqft >= minSqft && r.landSqft <= maxSqft);
}

/** Golf Views / Premium plots (land > 8000 sqft) */
export const golfViewsRecords = sdn2PlotRecords.filter(r => r.landSqft > 8000);

/** SBV gate villas (land 3000-8000 sqft) */
export const sbvGateRecords = sdn2PlotRecords.filter(r => r.landSqft >= 3000 && r.landSqft <= 8000);

/** Summary */
export const SDN2_SUMMARY = {
  totalTransactions: 171,
  uniquePlots: 143,
  golfViewsPlots: 97,
  sbvPlots: 46,
  dateRange: { from: "2019-02-04", to: "2026-06-08" },
};
