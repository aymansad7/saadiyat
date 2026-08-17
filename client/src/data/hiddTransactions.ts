/**
 * Hidd Al Saadiyat — ADREC Transaction History
 * Source: ad-transactions.com (exported 17 Aug 2026)
 * 219 transactions across 131 unique plots
 */

export interface HiddTransaction {
  date: string;
  project: string;
  layout: string;
  priceAed: number;
  buaSqm: number;
  rateSqm: number;
  landSqm: number;
  saleType: "primary" | "secondary";
}

export interface HiddPlotRecord {
  landSqm: number;
  landSqft: number;
  project: string;
  transactions: HiddTransaction[];
}

export const hiddPlotRecords: HiddPlotRecord[] = [
  { landSqm: 595.05, landSqft: 6405.06, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-07-04", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 7800000, buaSqm: 423.57, rateSqm: 18414.9, landSqm: 595.05, saleType: "secondary" },
  ] },
  { landSqm: 612.2, landSqft: 6589.66, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-03-09", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6800000, buaSqm: 423.31, rateSqm: 16063.88, landSqm: 612.2, saleType: "secondary" },
    { date: "2026-06-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 13500000, buaSqm: 423.31, rateSqm: 31891.52, landSqm: 612.2, saleType: "secondary" },
  ] },
  { landSqm: 612.49, landSqft: 6592.78, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-02-25", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6081400, buaSqm: 423.56, rateSqm: 14357.82, landSqm: 612.49, saleType: "primary" },
  ] },
  { landSqm: 612.5, landSqft: 6592.89, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-03-12", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6000000, buaSqm: 423.31, rateSqm: 14174.01, landSqm: 612.5, saleType: "secondary" },
    { date: "2020-08-27", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6000000, buaSqm: 423.31, rateSqm: 14174.01, landSqm: 612.5, saleType: "secondary" },
    { date: "2021-06-22", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 7000000, buaSqm: 423.3, rateSqm: 16536.74, landSqm: 612.5, saleType: "secondary" },
    { date: "2022-05-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "3 beds", priceAed: 8600000, buaSqm: 423.56, rateSqm: 20304.09, landSqm: 612.5, saleType: "secondary" },
    { date: "2023-05-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 13000000, buaSqm: 423.47, rateSqm: 30698.75, landSqm: 612.5, saleType: "secondary" },
    { date: "2025-03-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 14000000, buaSqm: 423.32, rateSqm: 33071.91, landSqm: 612.5, saleType: "secondary" },
    { date: "2025-09-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 14000000, buaSqm: 423.31, rateSqm: 33072.69, landSqm: 612.5, saleType: "secondary" },
  ] },
  { landSqm: 612.52, landSqft: 6593.1, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-08-18", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 8300000, buaSqm: 423.3, rateSqm: 19607.84, landSqm: 612.52, saleType: "secondary" },
  ] },
  { landSqm: 612.65, landSqft: 6594.5, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-01-31", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6200000, buaSqm: 423.47, rateSqm: 14640.94, landSqm: 612.65, saleType: "primary" },
    { date: "2019-02-11", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6000000, buaSqm: 423.47, rateSqm: 14168.65, landSqm: 612.65, saleType: "secondary" },
  ] },
  { landSqm: 613.06, landSqft: 6598.92, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-10-06", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 11500000, buaSqm: 423.3, rateSqm: 27167.49, landSqm: 613.06, saleType: "secondary" },
  ] },
  { landSqm: 614.17, landSqft: 6610.86, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-12-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6450000, buaSqm: 423.46, rateSqm: 15231.66, landSqm: 614.17, saleType: "secondary" },
  ] },
  { landSqm: 615.18, landSqft: 6621.74, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-11-14", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 14650000, buaSqm: 424.46, rateSqm: 34514.44, landSqm: 615.18, saleType: "secondary" },
  ] },
  { landSqm: 615.23, landSqft: 6622.27, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-09-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6000000, buaSqm: 423.62, rateSqm: 14163.64, landSqm: 615.23, saleType: "primary" },
  ] },
  { landSqm: 616.33, landSqft: 6634.11, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-12-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 8700000, buaSqm: 424.5, rateSqm: 20494.7, landSqm: 616.33, saleType: "secondary" },
  ] },
  { landSqm: 617.39, landSqft: 6645.52, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-04-14", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 10000000, buaSqm: 423.81, rateSqm: 23595.48, landSqm: 617.39, saleType: "primary" },
  ] },
  { landSqm: 622.42, landSqft: 6699.67, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-02-03", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8120000, buaSqm: 435.99, rateSqm: 18624.28, landSqm: 622.42, saleType: "secondary" },
    { date: "2026-02-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 15300000, buaSqm: 435.99, rateSqm: 35092.55, landSqm: 622.42, saleType: "secondary" },
  ] },
  { landSqm: 623.24, landSqft: 6708.49, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-01-31", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 6100000, buaSqm: 437.41, rateSqm: 13945.73, landSqm: 623.24, saleType: "primary" },
  ] },
  { landSqm: 625.02, landSqft: 6727.65, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-08-12", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 5500000, buaSqm: 423.31, rateSqm: 12992.84, landSqm: 625.02, saleType: "secondary" },
  ] },
  { landSqm: 627.92, landSqft: 6758.87, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-07-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7600000, buaSqm: 437.76, rateSqm: 17361.11, landSqm: 627.92, saleType: "secondary" },
    { date: "2025-02-26", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12500000, buaSqm: 437.76, rateSqm: 28554.46, landSqm: 627.92, saleType: "secondary" },
  ] },
  { landSqm: 630.0, landSqft: 6781.26, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-05-01", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 6400000, buaSqm: 437.39, rateSqm: 14632.25, landSqm: 630.0, saleType: "secondary" },
    { date: "2019-06-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7000000, buaSqm: 558.79, rateSqm: 12527.07, landSqm: 630.0, saleType: "secondary" },
    { date: "2019-06-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6200000, buaSqm: 423.32, rateSqm: 14646.13, landSqm: 630.0, saleType: "secondary" },
    { date: "2020-07-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 5885000, buaSqm: 423.3, rateSqm: 13902.67, landSqm: 630.0, saleType: "secondary" },
    { date: "2020-11-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7300000, buaSqm: 556.97, rateSqm: 13106.63, landSqm: 630.0, saleType: "secondary" },
    { date: "2020-11-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8600000, buaSqm: 558.81, rateSqm: 15389.85, landSqm: 630.0, saleType: "secondary" },
    { date: "2021-01-06", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 9000000, buaSqm: 558.78, rateSqm: 16106.52, landSqm: 630.0, saleType: "secondary" },
    { date: "2021-01-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 7200000, buaSqm: 423.3, rateSqm: 17009.21, landSqm: 630.0, saleType: "secondary" },
    { date: "2021-03-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 10000000, buaSqm: 558.83, rateSqm: 17894.53, landSqm: 630.0, saleType: "secondary" },
    { date: "2021-04-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 6800000, buaSqm: 423.3, rateSqm: 16064.26, landSqm: 630.0, saleType: "secondary" },
    { date: "2022-04-11", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8500000, buaSqm: 437.4, rateSqm: 19433.01, landSqm: 630.0, saleType: "secondary" },
    { date: "2023-09-15", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 10600000, buaSqm: 423.32, rateSqm: 25040.16, landSqm: 630.0, saleType: "secondary" },
    { date: "2023-10-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12500000, buaSqm: 437.27, rateSqm: 28586.46, landSqm: 630.0, saleType: "secondary" },
    { date: "2023-11-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 13400000, buaSqm: 437.51, rateSqm: 30627.87, landSqm: 630.0, saleType: "secondary" },
    { date: "2024-03-18", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 13000000, buaSqm: 556.97, rateSqm: 23340.57, landSqm: 630.0, saleType: "secondary" },
    { date: "2024-05-01", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 14000000, buaSqm: 437.39, rateSqm: 32008.05, landSqm: 630.0, saleType: "secondary" },
    { date: "2024-07-03", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 12600000, buaSqm: 423.3, rateSqm: 29766.12, landSqm: 630.0, saleType: "secondary" },
    { date: "2025-01-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 13000000, buaSqm: 423.31, rateSqm: 30710.35, landSqm: 630.0, saleType: "secondary" },
    { date: "2025-09-08", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 15350000, buaSqm: 437.39, rateSqm: 35094.54, landSqm: 630.0, saleType: "secondary" },
    { date: "2025-12-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 16100000, buaSqm: 556.97, rateSqm: 28906.4, landSqm: 630.0, saleType: "secondary" },
    { date: "2026-05-08", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 15850000, buaSqm: 437.39, rateSqm: 36237.68, landSqm: 630.0, saleType: "secondary" },
    { date: "2026-07-02", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 16000000, buaSqm: 423.31, rateSqm: 37797.36, landSqm: 630.0, saleType: "secondary" },
  ] },
  { landSqm: 632.53, landSqft: 6808.49, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-06-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 12000000, buaSqm: 423.3, rateSqm: 28348.69, landSqm: 632.53, saleType: "secondary" },
  ] },
  { landSqm: 634.91, landSqft: 6834.11, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-05-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 10700000, buaSqm: 559.39, rateSqm: 19127.98, landSqm: 634.91, saleType: "secondary" },
  ] },
  { landSqm: 645.7, landSqft: 6950.25, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2024-03-06", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 13500000, buaSqm: 423.65, rateSqm: 31865.93, landSqm: 645.7, saleType: "secondary" },
    { date: "2025-12-23", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 16265557, buaSqm: 423.65, rateSqm: 38393.86, landSqm: 645.7, saleType: "secondary" },
  ] },
  { landSqm: 646.72, landSqft: 6961.23, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-07-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7600000, buaSqm: 437.66, rateSqm: 17365.08, landSqm: 646.72, saleType: "secondary" },
    { date: "2024-10-11", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12500000, buaSqm: 437.66, rateSqm: 28560.98, landSqm: 646.72, saleType: "secondary" },
  ] },
  { landSqm: 656.03, landSqft: 7061.44, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-10-18", project: "Hidd Al Saadiyat - Al Suhoul", layout: "4 beds", priceAed: 7400000, buaSqm: 423.32, rateSqm: 17480.87, landSqm: 656.03, saleType: "secondary" },
  ] },
  { landSqm: 658.12, landSqft: 7083.94, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-05-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 6500000, buaSqm: 558.78, rateSqm: 11632.49, landSqm: 658.12, saleType: "primary" },
  ] },
  { landSqm: 665.0, landSqft: 7157.99, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-02-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7900000, buaSqm: 558.83, rateSqm: 14136.68, landSqm: 665.0, saleType: "secondary" },
    { date: "2021-03-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 10000000, buaSqm: 559.15, rateSqm: 17884.29, landSqm: 665.0, saleType: "secondary" },
    { date: "2025-06-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 14000000, buaSqm: 558.77, rateSqm: 25055.03, landSqm: 665.0, saleType: "secondary" },
  ] },
  { landSqm: 670.62, landSqft: 7218.49, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-09-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7800000, buaSqm: 558.81, rateSqm: 13958.23, landSqm: 670.62, saleType: "secondary" },
  ] },
  { landSqm: 675.48, landSqft: 7270.8, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-06-19", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 21000000, buaSqm: 559.18, rateSqm: 37554.99, landSqm: 675.48, saleType: "secondary" },
  ] },
  { landSqm: 676.89, landSqft: 7285.98, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-06-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 9900000, buaSqm: 563.33, rateSqm: 17574.07, landSqm: 676.89, saleType: "secondary" },
    { date: "2024-03-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 17200000, buaSqm: 563.33, rateSqm: 30532.73, landSqm: 676.89, saleType: "secondary" },
  ] },
  { landSqm: 676.99, landSqft: 7287.05, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-03-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 10000000, buaSqm: 559.62, rateSqm: 17869.27, landSqm: 676.99, saleType: "secondary" },
  ] },
  { landSqm: 681.11, landSqft: 7331.4, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-07-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 18500000, buaSqm: 560.26, rateSqm: 33020.38, landSqm: 681.11, saleType: "secondary" },
  ] },
  { landSqm: 684.61, landSqft: 7369.07, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-09-01", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 9500000, buaSqm: 559.08, rateSqm: 16992.2, landSqm: 684.61, saleType: "secondary" },
  ] },
  { landSqm: 687.08, landSqft: 7395.66, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-02-04", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 9500000, buaSqm: 558.8, rateSqm: 17000.72, landSqm: 687.08, saleType: "secondary" },
  ] },
  { landSqm: 689.83, landSqft: 7425.26, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-01-27", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12000000, buaSqm: 560.0, rateSqm: 21428.57, landSqm: 689.83, saleType: "secondary" },
  ] },
  { landSqm: 696.66, landSqft: 7498.78, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-05-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12000000, buaSqm: 559.01, rateSqm: 21466.52, landSqm: 696.66, saleType: "primary" },
  ] },
  { landSqm: 710.89, landSqft: 7651.95, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-09-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7300000, buaSqm: 558.8, rateSqm: 13063.71, landSqm: 710.89, saleType: "secondary" },
  ] },
  { landSqm: 711.25, landSqft: 7655.82, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-07-09", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7100000, buaSqm: 558.81, rateSqm: 12705.57, landSqm: 711.25, saleType: "secondary" },
  ] },
  { landSqm: 713.75, landSqft: 7682.73, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-06-25", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 16000000, buaSqm: 558.96, rateSqm: 28624.59, landSqm: 713.75, saleType: "secondary" },
  ] },
  { landSqm: 726.86, landSqft: 7823.85, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2026-07-14", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 20000000, buaSqm: 558.8, rateSqm: 35790.98, landSqm: 726.86, saleType: "secondary" },
  ] },
  { landSqm: 729.47, landSqft: 7851.94, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-09-08", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8300000, buaSqm: 559.49, rateSqm: 14834.94, landSqm: 729.47, saleType: "secondary" },
  ] },
  { landSqm: 764.78, landSqft: 8232.02, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-01-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7800000, buaSqm: 559.26, rateSqm: 13947.0, landSqm: 764.78, saleType: "secondary" },
  ] },
  { landSqm: 784.37, landSqft: 8442.88, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-12-31", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7800000, buaSqm: 559.15, rateSqm: 13949.75, landSqm: 784.37, saleType: "secondary" },
  ] },
  { landSqm: 797.15, landSqft: 8580.44, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-03-03", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7700000, buaSqm: 560.1, rateSqm: 13747.55, landSqm: 797.15, saleType: "secondary" },
    { date: "2019-07-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7700000, buaSqm: 560.1, rateSqm: 13747.55, landSqm: 797.15, saleType: "secondary" },
    { date: "2024-02-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8000000, buaSqm: 560.1, rateSqm: 14283.16, landSqm: 797.15, saleType: "secondary" },
  ] },
  { landSqm: 797.74, landSqft: 8586.79, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-12-23", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7750000, buaSqm: 559.26, rateSqm: 13857.6, landSqm: 797.74, saleType: "secondary" },
  ] },
  { landSqm: 799.52, landSqft: 8605.95, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-10-02", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 8100000, buaSqm: 559.3, rateSqm: 14482.39, landSqm: 799.52, saleType: "primary" },
  ] },
  { landSqm: 804.18, landSqft: 8656.11, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-07-28", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7600000, buaSqm: 438.23, rateSqm: 17342.49, landSqm: 804.18, saleType: "secondary" },
    { date: "2025-02-10", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12000000, buaSqm: 438.23, rateSqm: 27382.88, landSqm: 804.18, saleType: "secondary" },
  ] },
  { landSqm: 810.86, landSqft: 8728.02, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2026-05-11", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 18800000, buaSqm: 559.65, rateSqm: 33592.42, landSqm: 810.86, saleType: "secondary" },
  ] },
  { landSqm: 828.75, landSqft: 8920.58, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-09-05", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7000000, buaSqm: 558.94, rateSqm: 12523.71, landSqm: 828.75, saleType: "secondary" },
  ] },
  { landSqm: 847.71, landSqft: 9124.67, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-07-24", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 15500000, buaSqm: 559.36, rateSqm: 27710.24, landSqm: 847.71, saleType: "secondary" },
  ] },
  { landSqm: 902.97, landSqft: 9719.48, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-01-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 7000000, buaSqm: 689.77, rateSqm: 10148.31, landSqm: 902.97, saleType: "secondary" },
  ] },
  { landSqm: 906.49, landSqft: 9757.37, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-01-26", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 20000000, buaSqm: 689.61, rateSqm: 29001.9, landSqm: 906.49, saleType: "secondary" },
    { date: "2025-10-14", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 21000000, buaSqm: 689.61, rateSqm: 30451.99, landSqm: 906.49, saleType: "secondary" },
  ] },
  { landSqm: 906.95, landSqft: 9762.32, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-05-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 25000000, buaSqm: 689.06, rateSqm: 36281.31, landSqm: 906.95, saleType: "secondary" },
  ] },
  { landSqm: 907.25, landSqft: 9765.55, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-07-05", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 16000000, buaSqm: 689.36, rateSqm: 23209.93, landSqm: 907.25, saleType: "primary" },
  ] },
  { landSqm: 914.91, landSqft: 9848.0, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-09-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 12000000, buaSqm: 689.06, rateSqm: 17415.03, landSqm: 914.91, saleType: "secondary" },
  ] },
  { landSqm: 925.06, landSqft: 9957.25, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-04-18", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 18000000, buaSqm: 690.19, rateSqm: 26079.78, landSqm: 925.06, saleType: "secondary" },
  ] },
  { landSqm: 947.16, landSqft: 10195.14, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-07-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 35000000, buaSqm: 689.61, rateSqm: 50753.32, landSqm: 947.16, saleType: "secondary" },
  ] },
  { landSqm: 948.08, landSqft: 10205.04, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-12-23", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 11500000, buaSqm: 689.61, rateSqm: 16676.09, landSqm: 948.08, saleType: "secondary" },
  ] },
  { landSqm: 948.09, landSqft: 10205.15, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-12-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 11500000, buaSqm: 689.61, rateSqm: 16676.09, landSqm: 948.09, saleType: "secondary" },
  ] },
  { landSqm: 948.12, landSqft: 10205.47, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-12-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 11500000, buaSqm: 689.61, rateSqm: 16676.09, landSqm: 948.12, saleType: "secondary" },
    { date: "2023-09-13", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 29800000, buaSqm: 689.61, rateSqm: 43212.83, landSqm: 948.12, saleType: "secondary" },
    { date: "2025-07-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 35000000, buaSqm: 689.61, rateSqm: 50753.32, landSqm: 948.12, saleType: "secondary" },
  ] },
  { landSqm: 948.13, landSqft: 10205.58, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-08-08", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 26500000, buaSqm: 689.05, rateSqm: 38458.75, landSqm: 948.13, saleType: "secondary" },
    { date: "2026-06-16", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 1, buaSqm: 689.05, rateSqm: 0.0, landSqm: 948.13, saleType: "secondary" },
  ] },
  { landSqm: 978.33, landSqft: 10530.65, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-01-20", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 8850000, buaSqm: 801.67, rateSqm: 11039.46, landSqm: 978.33, saleType: "secondary" },
  ] },
  { landSqm: 979.56, landSqft: 10543.89, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2021-03-22", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 10500000, buaSqm: 801.67, rateSqm: 13097.66, landSqm: 979.56, saleType: "primary" },
    { date: "2025-10-21", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 23250000, buaSqm: 801.67, rateSqm: 29001.96, landSqm: 979.56, saleType: "secondary" },
  ] },
  { landSqm: 980.0, landSqft: 10548.62, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-05-20", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9000000, buaSqm: 801.67, rateSqm: 11226.56, landSqm: 980.0, saleType: "primary" },
    { date: "2020-11-04", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9211780, buaSqm: 801.67, rateSqm: 11490.74, landSqm: 980.0, saleType: "primary" },
    { date: "2021-03-24", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 10700000, buaSqm: 801.68, rateSqm: 13346.97, landSqm: 980.0, saleType: "primary" },
    { date: "2021-05-19", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 11400000, buaSqm: 801.67, rateSqm: 14220.32, landSqm: 980.0, saleType: "secondary" },
  ] },
  { landSqm: 991.12, landSqft: 10668.32, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2026-02-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 22000000, buaSqm: 1072.02, rateSqm: 20522.01, landSqm: 991.12, saleType: "secondary" },
  ] },
  { landSqm: 996.5, landSqft: 10726.23, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-07-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 35000000, buaSqm: 689.61, rateSqm: 50753.32, landSqm: 996.5, saleType: "secondary" },
  ] },
  { landSqm: 998.85, landSqft: 10751.52, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2026-02-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 22000000, buaSqm: 1072.02, rateSqm: 20522.01, landSqm: 998.85, saleType: "secondary" },
  ] },
  { landSqm: 1000.0, landSqft: 10763.9, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2021-09-12", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 12000000, buaSqm: 801.03, rateSqm: 14980.71, landSqm: 1000.0, saleType: "primary" },
    { date: "2022-07-04", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 15500000, buaSqm: 801.67, rateSqm: 19334.64, landSqm: 1000.0, saleType: "secondary" },
    { date: "2023-06-15", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 22000000, buaSqm: 801.67, rateSqm: 27442.71, landSqm: 1000.0, saleType: "secondary" },
  ] },
  { landSqm: 1000.01, landSqft: 10764.01, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2021-02-02", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9500000, buaSqm: 801.67, rateSqm: 11850.26, landSqm: 1000.01, saleType: "primary" },
    { date: "2022-07-18", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 14000000, buaSqm: 801.67, rateSqm: 17463.54, landSqm: 1000.01, saleType: "secondary" },
  ] },
  { landSqm: 1013.1, landSqft: 10904.91, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2025-07-17", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 35000000, buaSqm: 689.61, rateSqm: 50753.32, landSqm: 1013.1, saleType: "secondary" },
  ] },
  { landSqm: 1013.63, landSqft: 10910.61, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2021-02-03", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9700000, buaSqm: 801.67, rateSqm: 12099.74, landSqm: 1013.63, saleType: "primary" },
    { date: "2024-03-21", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 19750000, buaSqm: 801.67, rateSqm: 24636.07, landSqm: 1013.63, saleType: "secondary" },
  ] },
  { landSqm: 1017.93, landSqft: 10956.9, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2019-04-21", project: "Hidd Al Saadiyat - Al Suhoul", layout: "5 beds", priceAed: 14000000, buaSqm: 689.05, rateSqm: 20317.83, landSqm: 1017.93, saleType: "secondary" },
  ] },
  { landSqm: 1021.46, landSqft: 10994.89, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-05-10", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 13500000, buaSqm: 802.45, rateSqm: 16823.48, landSqm: 1021.46, saleType: "primary" },
  ] },
  { landSqm: 1032.0, landSqft: 11108.34, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2022-04-01", project: "Hidd Al Saadiyat - Al Suhoul", layout: "6+ beds", priceAed: 25000000, buaSqm: 792.61, rateSqm: 31541.36, landSqm: 1032.0, saleType: "secondary" },
  ] },
  { landSqm: 1079.46, landSqft: 11619.2, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-05-30", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 10300000, buaSqm: 801.56, rateSqm: 12849.94, landSqm: 1079.46, saleType: "secondary" },
  ] },
  { landSqm: 1136.92, landSqft: 12237.69, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2026-06-24", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 23600000, buaSqm: 985.97, rateSqm: 23935.82, landSqm: 1136.92, saleType: "secondary" },
  ] },
  { landSqm: 1138.43, landSqft: 12253.95, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-10-27", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 9800000, buaSqm: 742.46, rateSqm: 13199.36, landSqm: 1138.43, saleType: "secondary" },
  ] },
  { landSqm: 1141.41, landSqft: 12286.02, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-10-26", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 18000000, buaSqm: 926.08, rateSqm: 19436.77, landSqm: 1141.41, saleType: "primary" },
  ] },
  { landSqm: 1153.72, landSqft: 12418.53, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-04-13", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 14500000, buaSqm: 984.4, rateSqm: 14729.78, landSqm: 1153.72, saleType: "primary" },
  ] },
  { landSqm: 1154.97, landSqft: 12431.98, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2025-04-09", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 83000000, buaSqm: 910.34, rateSqm: 91174.73, landSqm: 1154.97, saleType: "secondary" },
  ] },
  { landSqm: 1155.0, landSqft: 12432.3, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-01-31", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 11500000, buaSqm: 979.82, rateSqm: 11736.85, landSqm: 1155.0, saleType: "primary" },
    { date: "2019-05-29", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9000000, buaSqm: 979.82, rateSqm: 9185.36, landSqm: 1155.0, saleType: "secondary" },
    { date: "2019-07-16", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9700000, buaSqm: 922.48, rateSqm: 10515.13, landSqm: 1155.0, saleType: "primary" },
    { date: "2019-12-18", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9500000, buaSqm: 964.77, rateSqm: 9846.91, landSqm: 1155.0, saleType: "primary" },
    { date: "2020-01-09", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9000000, buaSqm: 922.48, rateSqm: 9756.31, landSqm: 1155.0, saleType: "primary" },
    { date: "2020-01-28", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9000000, buaSqm: 922.48, rateSqm: 9756.31, landSqm: 1155.0, saleType: "primary" },
    { date: "2020-04-15", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 9000000, buaSqm: 964.77, rateSqm: 9328.65, landSqm: 1155.0, saleType: "primary" },
    { date: "2020-10-21", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 8719920, buaSqm: 965.02, rateSqm: 9036.0, landSqm: 1155.0, saleType: "secondary" },
    { date: "2021-08-10", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 14000000, buaSqm: 979.81, rateSqm: 14288.48, landSqm: 1155.0, saleType: "secondary" },
    { date: "2022-03-08", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 12600000, buaSqm: 922.73, rateSqm: 13655.13, landSqm: 1155.0, saleType: "secondary" },
    { date: "2023-05-09", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 24000000, buaSqm: 922.48, rateSqm: 26016.82, landSqm: 1155.0, saleType: "primary" },
    { date: "2023-05-25", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 19000000, buaSqm: 981.05, rateSqm: 19367.0, landSqm: 1155.0, saleType: "secondary" },
    { date: "2023-09-13", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 50000000, buaSqm: 910.35, rateSqm: 54923.93, landSqm: 1155.0, saleType: "secondary" },
    { date: "2024-02-21", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 18000000, buaSqm: 964.77, rateSqm: 18657.3, landSqm: 1155.0, saleType: "secondary" },
    { date: "2024-11-15", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 28000000, buaSqm: 964.77, rateSqm: 29022.46, landSqm: 1155.0, saleType: "secondary" },
    { date: "2026-04-29", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 30000000, buaSqm: 979.82, rateSqm: 30617.87, landSqm: 1155.0, saleType: "secondary" },
    { date: "2026-05-01", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 36000000, buaSqm: 964.77, rateSqm: 37314.59, landSqm: 1155.0, saleType: "secondary" },
  ] },
  { landSqm: 1155.43, landSqft: 12436.93, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-09-30", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 32000000, buaSqm: 981.17, rateSqm: 32614.12, landSqm: 1155.43, saleType: "secondary" },
  ] },
  { landSqm: 1163.46, landSqft: 12523.37, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-10-13", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 14850000, buaSqm: 804.74, rateSqm: 18453.16, landSqm: 1163.46, saleType: "secondary" },
  ] },
  { landSqm: 1165.31, landSqft: 12543.28, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2026-03-17", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 23750000, buaSqm: 804.77, rateSqm: 29511.54, landSqm: 1165.31, saleType: "secondary" },
  ] },
  { landSqm: 1167.94, landSqft: 12571.59, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2024-08-29", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 20500000, buaSqm: 804.77, rateSqm: 25473.12, landSqm: 1167.94, saleType: "secondary" },
  ] },
  { landSqm: 1179.34, landSqft: 12694.3, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-02-19", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 10000000, buaSqm: 747.28, rateSqm: 13381.86, landSqm: 1179.34, saleType: "primary" },
  ] },
  { landSqm: 1182.5, landSqft: 12728.31, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-03-30", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 35000000, buaSqm: 983.73, rateSqm: 35578.87, landSqm: 1182.5, saleType: "secondary" },
  ] },
  { landSqm: 1187.5, landSqft: 12782.13, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-11-25", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 10300000, buaSqm: 792.82, rateSqm: 12991.6, landSqm: 1187.5, saleType: "secondary" },
  ] },
  { landSqm: 1190.83, landSqft: 12817.98, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2021-02-25", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 11400000, buaSqm: 747.3, rateSqm: 15254.92, landSqm: 1190.83, saleType: "secondary" },
  ] },
  { landSqm: 1201.83, landSqft: 12936.38, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2026-04-14", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 91300000, buaSqm: 910.35, rateSqm: 100291.1, landSqm: 1201.83, saleType: "secondary" },
  ] },
  { landSqm: 1210.0, landSqft: 13024.32, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-04-21", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 19500000, buaSqm: 980.04, rateSqm: 19897.15, landSqm: 1210.0, saleType: "secondary" },
    { date: "2019-09-16", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 9543600, buaSqm: 747.28, rateSqm: 12771.12, landSqm: 1210.0, saleType: "primary" },
    { date: "2019-11-19", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "5 beds", priceAed: 12250000, buaSqm: 748.75, rateSqm: 16360.6, landSqm: 1210.0, saleType: "secondary" },
    { date: "2020-10-18", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 15000000, buaSqm: 980.04, rateSqm: 15305.5, landSqm: 1210.0, saleType: "secondary" },
    { date: "2024-02-01", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 25000000, buaSqm: 747.1, rateSqm: 33462.72, landSqm: 1210.0, saleType: "secondary" },
  ] },
  { landSqm: 1220.73, landSqft: 13139.82, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-11-22", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 15200000, buaSqm: 748.62, rateSqm: 20304.03, landSqm: 1220.73, saleType: "secondary" },
  ] },
  { landSqm: 1223.45, landSqft: 13169.09, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-08-25", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 14200000, buaSqm: 747.72, rateSqm: 18991.07, landSqm: 1223.45, saleType: "secondary" },
  ] },
  { landSqm: 1224.34, landSqft: 13178.67, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-07-21", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 12000000, buaSqm: 748.47, rateSqm: 16032.71, landSqm: 1224.34, saleType: "secondary" },
  ] },
  { landSqm: 1225.59, landSqft: 13192.13, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-02-26", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 18520000, buaSqm: 922.48, rateSqm: 20076.32, landSqm: 1225.59, saleType: "secondary" },
  ] },
  { landSqm: 1232.85, landSqft: 13270.27, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-05-05", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 12366134, buaSqm: 747.25, rateSqm: 16548.86, landSqm: 1232.85, saleType: "primary" },
  ] },
  { landSqm: 1266.94, landSqft: 13637.22, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2024-06-13", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 55000000, buaSqm: 924.84, rateSqm: 59469.75, landSqm: 1266.94, saleType: "secondary" },
  ] },
  { landSqm: 1271.1, landSqft: 13681.99, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-11-24", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 27500000, buaSqm: 747.23, rateSqm: 36802.59, landSqm: 1271.1, saleType: "secondary" },
  ] },
  { landSqm: 1320.84, landSqft: 14217.39, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2023-07-28", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 19500000, buaSqm: 985.52, rateSqm: 19786.51, landSqm: 1320.84, saleType: "secondary" },
    { date: "2025-02-24", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 35000000, buaSqm: 985.52, rateSqm: 35514.25, landSqm: 1320.84, saleType: "secondary" },
  ] },
  { landSqm: 1366.67, landSqft: 14710.7, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-02-25", project: "Hidd Al Saadiyat - Al Seef", layout: "5 beds", priceAed: 15000000, buaSqm: 747.64, rateSqm: 20063.13, landSqm: 1366.67, saleType: "secondary" },
  ] },
  { landSqm: 1375.0, landSqft: 14800.36, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-07-01", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 14250000, buaSqm: 840.32, rateSqm: 16957.83, landSqm: 1375.0, saleType: "secondary" },
    { date: "2022-03-24", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 24250000, buaSqm: 840.32, rateSqm: 28858.05, landSqm: 1375.0, saleType: "secondary" },
    { date: "2024-05-16", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 38000000, buaSqm: 866.46, rateSqm: 43856.61, landSqm: 1375.0, saleType: "secondary" },
    { date: "2026-02-18", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 12250000, buaSqm: 840.32, rateSqm: 14577.78, landSqm: 1375.0, saleType: "secondary" },
  ] },
  { landSqm: 1375.01, landSqft: 14800.47, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-04-17", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 15850000, buaSqm: 837.51, rateSqm: 18925.15, landSqm: 1375.01, saleType: "secondary" },
  ] },
  { landSqm: 1398.6, landSqft: 15054.39, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-03-29", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 14250000, buaSqm: 856.55, rateSqm: 16636.51, landSqm: 1398.6, saleType: "secondary" },
  ] },
  { landSqm: 1400.0, landSqft: 15069.46, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-03-29", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 14250000, buaSqm: 856.55, rateSqm: 16636.51, landSqm: 1400.0, saleType: "secondary" },
  ] },
  { landSqm: 1429.49, landSqft: 15386.89, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2022-02-11", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 8000000, buaSqm: 847.98, rateSqm: 9434.18, landSqm: 1429.49, saleType: "secondary" },
  ] },
  { landSqm: 1432.17, landSqft: 15415.73, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2021-01-12", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "5 beds", priceAed: 16000000, buaSqm: 749.93, rateSqm: 21335.32, landSqm: 1432.17, saleType: "secondary" },
  ] },
  { landSqm: 1439.45, landSqft: 15494.1, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2025-11-28", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 30000000, buaSqm: 1122.59, rateSqm: 26723.92, landSqm: 1439.45, saleType: "primary" },
  ] },
  { landSqm: 1441.44, landSqft: 15515.52, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2021-03-07", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 26000000, buaSqm: 1122.9, rateSqm: 23154.33, landSqm: 1441.44, saleType: "secondary" },
  ] },
  { landSqm: 1517.32, landSqft: 16332.28, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2024-09-09", project: "Hidd Al Saadiyat - Al Seef", layout: "4 beds", priceAed: 130000000, buaSqm: 984.56, rateSqm: 132038.68, landSqm: 1517.32, saleType: "secondary" },
  ] },
  { landSqm: 1625.0, landSqft: 17491.34, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-12-11", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 18600000, buaSqm: 1143.58, rateSqm: 16264.71, landSqm: 1625.0, saleType: "secondary" },
    { date: "2020-06-22", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 15000000, buaSqm: 1138.58, rateSqm: 13174.3, landSqm: 1625.0, saleType: "secondary" },
  ] },
  { landSqm: 1625.05, landSqft: 17491.88, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-06-25", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 23000000, buaSqm: 988.12, rateSqm: 23276.53, landSqm: 1625.05, saleType: "secondary" },
  ] },
  { landSqm: 1652.13, landSqft: 17783.36, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-11-08", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "5 beds", priceAed: 13000000, buaSqm: 748.94, rateSqm: 17357.87, landSqm: 1652.13, saleType: "primary" },
  ] },
  { landSqm: 1668.57, landSqft: 17960.32, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2020-11-26", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 22500000, buaSqm: 1139.55, rateSqm: 19744.64, landSqm: 1668.57, saleType: "secondary" },
  ] },
  { landSqm: 1689.94, landSqft: 18190.35, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-11-30", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 24225000, buaSqm: 1148.73, rateSqm: 21088.51, landSqm: 1689.94, saleType: "secondary" },
    { date: "2021-06-27", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 27000000, buaSqm: 1148.73, rateSqm: 23504.22, landSqm: 1689.94, saleType: "secondary" },
    { date: "2021-10-14", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 29000000, buaSqm: 1148.3, rateSqm: 25254.72, landSqm: 1689.94, saleType: "secondary" },
    { date: "2022-03-08", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 33000000, buaSqm: 1148.3, rateSqm: 28738.13, landSqm: 1689.94, saleType: "secondary" },
    { date: "2024-01-23", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 1, buaSqm: 1148.73, rateSqm: 0.0, landSqm: 1689.94, saleType: "secondary" },
    { date: "2026-03-02", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 88000000, buaSqm: 1148.73, rateSqm: 76606.34, landSqm: 1689.94, saleType: "secondary" },
  ] },
  { landSqm: 1689.95, landSqft: 18190.45, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-11-11", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 24250000, buaSqm: 1148.3, rateSqm: 21118.17, landSqm: 1689.95, saleType: "secondary" },
    { date: "2024-06-25", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 65000000, buaSqm: 1148.3, rateSqm: 56605.42, landSqm: 1689.95, saleType: "secondary" },
    { date: "2025-03-12", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 63000000, buaSqm: 1148.3, rateSqm: 54863.71, landSqm: 1689.95, saleType: "secondary" },
  ] },
  { landSqm: 1695.82, landSqft: 18253.64, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-12-20", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 24250000, buaSqm: 1148.3, rateSqm: 21118.17, landSqm: 1695.82, saleType: "secondary" },
  ] },
  { landSqm: 1750.0, landSqft: 18836.83, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2026-01-22", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 50000000, buaSqm: 861.23, rateSqm: 58056.5, landSqm: 1750.0, saleType: "secondary" },
  ] },
  { landSqm: 1754.99, landSqft: 18890.54, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-08-25", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 20000000, buaSqm: 1138.6, rateSqm: 17565.43, landSqm: 1754.99, saleType: "secondary" },
  ] },
  { landSqm: 1755.11, landSqft: 18891.83, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2019-08-08", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 18600000, buaSqm: 1139.6, rateSqm: 16321.52, landSqm: 1755.11, saleType: "secondary" },
    { date: "2023-11-27", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 45000000, buaSqm: 1139.6, rateSqm: 39487.54, landSqm: 1755.11, saleType: "secondary" },
  ] },
  { landSqm: 1813.09, landSqft: 19515.92, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2021-04-08", project: "Hidd Al Saadiyat - Al Suhoul", layout: "6+ beds", priceAed: 22000000, buaSqm: 1207.03, rateSqm: 18226.56, landSqm: 1813.09, saleType: "secondary" },
    { date: "2025-10-01", project: "Hidd Al Saadiyat - Al Suhoul", layout: "6+ beds", priceAed: 80000000, buaSqm: 1207.03, rateSqm: 66278.39, landSqm: 1813.09, saleType: "secondary" },
  ] },
  { landSqm: 1851.15, landSqft: 19925.59, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2023-11-30", project: "Hidd Al Saadiyat - Al Suhoul", layout: "6+ beds", priceAed: 21500000, buaSqm: 1389.25, rateSqm: 15475.98, landSqm: 1851.15, saleType: "primary" },
  ] },
  { landSqm: 1867.26, landSqft: 20099.0, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2026-01-22", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 65000000, buaSqm: 979.71, rateSqm: 66346.16, landSqm: 1867.26, saleType: "secondary" },
  ] },
  { landSqm: 1867.27, landSqft: 20099.11, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2026-01-22", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 65000000, buaSqm: 979.72, rateSqm: 66345.49, landSqm: 1867.27, saleType: "secondary" },
  ] },
  { landSqm: 1872.66, landSqft: 20157.12, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2024-11-26", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "5 beds", priceAed: 78000000, buaSqm: 1298.06, rateSqm: 60089.67, landSqm: 1872.66, saleType: "secondary" },
  ] },
  { landSqm: 1873.96, landSqft: 20171.12, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2023-04-19", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 62360000, buaSqm: 1126.23, rateSqm: 55370.57, landSqm: 1873.96, saleType: "secondary" },
  ] },
  { landSqm: 1991.17, landSqft: 21432.75, project: "Hidd Al Saadiyat - Al Suhoul", transactions: [
    { date: "2020-11-29", project: "Hidd Al Saadiyat - Al Suhoul", layout: "6+ beds", priceAed: 21000000, buaSqm: 1368.07, rateSqm: 15350.09, landSqm: 1991.17, saleType: "secondary" },
  ] },
  { landSqm: 2016.39, landSqft: 21704.22, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2021-08-25", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 44000000, buaSqm: 1613.44, rateSqm: 27270.92, landSqm: 2016.39, saleType: "secondary" },
  ] },
  { landSqm: 2603.88, landSqft: 28027.9, project: "Hidd Al Saadiyat - Al Seef", transactions: [
    { date: "2024-07-26", project: "Hidd Al Saadiyat - Al Seef", layout: "6+ beds", priceAed: 70000000, buaSqm: 1661.53, rateSqm: 42129.84, landSqm: 2603.88, saleType: "secondary" },
  ] },
  { landSqm: 2606.92, landSqft: 28060.63, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-01-21", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 29000000, buaSqm: 1422.16, rateSqm: 20391.52, landSqm: 2606.92, saleType: "secondary" },
  ] },
  { landSqm: 2628.29, landSqft: 28290.65, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-04-01", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 42000000, buaSqm: 1399.65, rateSqm: 30007.5, landSqm: 2628.29, saleType: "secondary" },
  ] },
  { landSqm: 2991.32, landSqft: 32198.27, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-05-06", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 40000000, buaSqm: 1984.29, rateSqm: 20158.34, landSqm: 2991.32, saleType: "secondary" },
    { date: "2023-03-29", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 50000000, buaSqm: 1984.29, rateSqm: 25197.93, landSqm: 2991.32, saleType: "secondary" },
  ] },
  { landSqm: 3024.33, landSqft: 32553.59, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2023-09-19", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 34000000, buaSqm: 1987.07, rateSqm: 17110.62, landSqm: 3024.33, saleType: "secondary" },
  ] },
  { landSqm: 3178.47, landSqft: 34212.73, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2020-03-24", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 32647801, buaSqm: 1984.08, rateSqm: 16454.88, landSqm: 3178.47, saleType: "primary" },
    { date: "2020-06-23", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 45000000, buaSqm: 1984.08, rateSqm: 22680.54, landSqm: 3178.47, saleType: "secondary" },
  ] },
  { landSqm: 3455.28, landSqft: 37192.29, project: "Hidd Al Saadiyat - Ras Al Hidd", transactions: [
    { date: "2022-01-27", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 80000000, buaSqm: 4864.14, rateSqm: 16446.9, landSqm: 3455.28, saleType: "secondary" },
    { date: "2024-07-19", project: "Hidd Al Saadiyat - Ras Al Hidd", layout: "6+ beds", priceAed: 85000000, buaSqm: 4864.14, rateSqm: 17474.83, landSqm: 3455.28, saleType: "secondary" },
  ] },
];

export const HIDD_SUMMARY = {
  totalTransactions: 219,
  uniquePlots: 131,
  dateRange: { from: "2019-01-31", to: "2026-07-14" },
};
