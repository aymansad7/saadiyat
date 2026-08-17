/**
 * Jawaher Al Saadiyat — ADREC Transaction History
 * Source: Abu Dhabi Real Estate Transactions (ad-transactions.com)
 * Data: Updated 16 Aug 2026, Generated 17 Aug 2026
 *
 * Matching: Transactions are grouped by land area (sqft) which is unique per plot.
 * 83 primary sales + 47 secondary sales = 130 total transactions.
 * Date range: Dec 2019 – Jul 2026.
 */

export interface JawaherTransaction {
  date: string;
  priceAed: number;
  saleType: "primary" | "secondary";
  ratePerSqft: number | null;
  propertyType: string;
  bedrooms: number | null;
  areaSqft: number | null;
  landSqft: number;
}

export interface JawaherPlotHistory {
  /** Land area in sqft — unique identifier for matching */
  landSqft: number;
  transactions: JawaherTransaction[];
}

/**
 * All Jawaher plots with recorded transactions, indexed by land area.
 * Each plot may have one primary (developer) sale and zero or more secondary (resale) sales.
 */
export const jawaherPlotHistories: JawaherPlotHistory[] = [
  { landSqft: 5008.12, transactions: [
    { date: "2021-09-20", priceAed: 4965188, saleType: "primary", ratePerSqft: 991, propertyType: "villa", bedrooms: 4, areaSqft: 5008.12, landSqft: 5008.12 },
  ] },
  { landSqft: 5008.34, transactions: [
    { date: "2020-03-25", priceAed: 4965188, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 5008.34 },
  ] },
  { landSqft: 5009.52, transactions: [
    { date: "2020-04-01", priceAed: 4965188, saleType: "primary", ratePerSqft: 227, propertyType: "villa", bedrooms: 4, areaSqft: 21857.82, landSqft: 5009.52 },
  ] },
  { landSqft: 5010.27, transactions: [
    { date: "2021-08-31", priceAed: 4965188, saleType: "primary", ratePerSqft: 991, propertyType: "villa", bedrooms: 4, areaSqft: 5010.27, landSqft: 5010.27 },
  ] },
  { landSqft: 5011.03, transactions: [
    { date: "2020-06-23", priceAed: 4965188, saleType: "primary", ratePerSqft: 991, propertyType: "villa", bedrooms: 4, areaSqft: 5011.03, landSqft: 5011.03 },
  ] },
  { landSqft: 5012.53, transactions: [
    { date: "2020-09-02", priceAed: 4965188, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 5012.53 },
  ] },
  { landSqft: 5393.58, transactions: [
    { date: "2020-10-13", priceAed: 5411250, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 5393.58 },
    { date: "2025-04-14", priceAed: 11600000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 5393.58 },
  ] },
  { landSqft: 5432.0, transactions: [
    { date: "2020-02-20", priceAed: 5411250, saleType: "primary", ratePerSqft: 996, propertyType: "villa", bedrooms: 4, areaSqft: 5431.89, landSqft: 5432.0 },
    { date: "2022-05-09", priceAed: 7800000, saleType: "secondary", ratePerSqft: 1436, propertyType: "villa", bedrooms: 4, areaSqft: 5431.89, landSqft: 5432.0 },
  ] },
  { landSqft: 5453.53, transactions: [
    { date: "2020-02-06", priceAed: 5114144, saleType: "primary", ratePerSqft: 236, propertyType: "villa", bedrooms: 4, areaSqft: 21709.93, landSqft: 5453.53 },
  ] },
  { landSqft: 5797.97, transactions: [
    { date: "2019-12-15", priceAed: 5390775, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 5797.97 },
    { date: "2020-01-30", priceAed: 5390775, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 5797.97 },
    { date: "2020-10-05", priceAed: 4990000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 5797.97 },
  ] },
  { landSqft: 6258.35, transactions: [
    { date: "2020-02-23", priceAed: 5557500, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 6258.35 },
  ] },
  { landSqft: 6421.64, transactions: [
    { date: "2020-02-09", priceAed: 5390775, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6421.64 },
    { date: "2020-02-18", priceAed: 5390775, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6421.64 },
    { date: "2025-06-04", priceAed: 10600000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6421.64 },
  ] },
  { landSqft: 6426.26, transactions: [
    { date: "2020-03-25", priceAed: 5557500, saleType: "primary", ratePerSqft: 865, propertyType: "villa", bedrooms: 4, areaSqft: 6426.26, landSqft: 6426.26 },
  ] },
  { landSqft: 6578.03, transactions: [
    { date: "2019-12-09", priceAed: 5557500, saleType: "primary", ratePerSqft: 844, propertyType: "villa", bedrooms: 4, areaSqft: 6587.51, landSqft: 6578.03 },
    { date: "2020-02-03", priceAed: 5557500, saleType: "secondary", ratePerSqft: 844, propertyType: "villa", bedrooms: 4, areaSqft: 6587.51, landSqft: 6578.03 },
    { date: "2022-10-12", priceAed: 7800000, saleType: "secondary", ratePerSqft: 1184, propertyType: "villa", bedrooms: 4, areaSqft: 6587.51, landSqft: 6578.03 },
  ] },
  { landSqft: 6639.82, transactions: [
    { date: "2020-05-20", priceAed: 5557500, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6639.82 },
    { date: "2026-03-09", priceAed: 12250000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6639.82 },
  ] },
  { landSqft: 6748.53, transactions: [
    { date: "2020-11-29", priceAed: 6113250, saleType: "primary", ratePerSqft: 906, propertyType: "villa", bedrooms: 3, areaSqft: 6748.53, landSqft: 6748.53 },
  ] },
  { landSqft: 6766.08, transactions: [
    { date: "2020-01-30", priceAed: 6022660, saleType: "primary", ratePerSqft: 285, propertyType: "villa", bedrooms: 4, areaSqft: 21143.21, landSqft: 6766.08 },
    { date: "2020-02-18", priceAed: 6022660, saleType: "secondary", ratePerSqft: 285, propertyType: "villa", bedrooms: 4, areaSqft: 21143.21, landSqft: 6766.08 },
  ] },
  { landSqft: 6852.94, transactions: [
    { date: "2019-12-11", priceAed: 5822037, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6852.94 },
    { date: "2020-01-12", priceAed: 5822037, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6852.94 },
    { date: "2021-12-23", priceAed: 7500000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 6852.94 },
  ] },
  { landSqft: 7088.14, transactions: [
    { date: "2020-09-06", priceAed: 5557500, saleType: "primary", ratePerSqft: 784, propertyType: "villa", bedrooms: null, areaSqft: 7088.14, landSqft: 7088.14 },
  ] },
  { landSqft: 7228.6, transactions: [
    { date: "2020-05-20", priceAed: 5557500, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 7228.6 },
    { date: "2025-11-03", priceAed: 12500000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 7228.6 },
  ] },
  { landSqft: 8511.77, transactions: [
    { date: "2020-10-13", priceAed: 6414525, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 8511.77 },
    { date: "2023-07-12", priceAed: 10000000, saleType: "secondary", ratePerSqft: null, propertyType: "villa", bedrooms: null, areaSqft: null, landSqft: 8511.77 },
  ] },
  { landSqft: 8569.36, transactions: [
    { date: "2020-06-23", priceAed: 7638750, saleType: "primary", ratePerSqft: 2090, propertyType: "villa", bedrooms: null, areaSqft: 3655.53, landSqft: 8569.36 },
    { date: "2020-07-19", priceAed: 7638750, saleType: "secondary", ratePerSqft: 2090, propertyType: "villa", bedrooms: null, areaSqft: 3655.53, landSqft: 8569.36 },
  ] },
  { landSqft: 8611.98, transactions: [
    { date: "2020-02-27", priceAed: 7158375, saleType: "primary", ratePerSqft: 831, propertyType: "villa", bedrooms: 4, areaSqft: 8611.98, landSqft: 8611.98 },
  ] },
  { landSqft: 8696.05, transactions: [
    { date: "2020-05-19", priceAed: 7717500, saleType: "primary", ratePerSqft: 2294, propertyType: "villa", bedrooms: null, areaSqft: 3364.47, landSqft: 8696.05 },
    { date: "2021-12-21", priceAed: 10500000, saleType: "secondary", ratePerSqft: 3121, propertyType: "villa", bedrooms: null, areaSqft: 3364.47, landSqft: 8696.05 },
  ] },
  { landSqft: 8903.9, transactions: [
    { date: "2020-04-09", priceAed: 8711397, saleType: "primary", ratePerSqft: 2487, propertyType: "villa", bedrooms: 4, areaSqft: 3502.57, landSqft: 8903.9 },
  ] },
  { landSqft: 8978.81, transactions: [
    { date: "2020-06-23", priceAed: 7775591, saleType: "primary", ratePerSqft: 1547, propertyType: "villa", bedrooms: 4, areaSqft: 5024.91, landSqft: 8978.81 },
    { date: "2026-04-13", priceAed: 17000000, saleType: "secondary", ratePerSqft: 3383, propertyType: "villa", bedrooms: 4, areaSqft: 5024.91, landSqft: 8978.81 },
  ] },
  { landSqft: 9131.88, transactions: [
    { date: "2020-06-23", priceAed: 6883040, saleType: "primary", ratePerSqft: 754, propertyType: "villa", bedrooms: 4, areaSqft: 9131.88, landSqft: 9131.88 },
  ] },
  { landSqft: 9579.44, transactions: [
    { date: "2020-06-24", priceAed: 8553150, saleType: "primary", ratePerSqft: 893, propertyType: "villa", bedrooms: 4, areaSqft: 9579.44, landSqft: 9579.44 },
  ] },
  { landSqft: 9702.36, transactions: [
    { date: "2020-09-03", priceAed: 7087500, saleType: "primary", ratePerSqft: 1172, propertyType: "villa", bedrooms: null, areaSqft: 6048.56, landSqft: 9702.36 },
  ] },
  { landSqft: 9736.49, transactions: [
    { date: "2020-06-23", priceAed: 829658, saleType: "primary", ratePerSqft: 136, propertyType: "villa", bedrooms: 4, areaSqft: 6091.08, landSqft: 9736.49 },
    { date: "2025-06-02", priceAed: 13500000, saleType: "secondary", ratePerSqft: 2216, propertyType: "villa", bedrooms: 4, areaSqft: 6091.08, landSqft: 9736.49 },
  ] },
  { landSqft: 9836.59, transactions: [
    { date: "2020-03-30", priceAed: 7775591, saleType: "primary", ratePerSqft: 1524, propertyType: "villa", bedrooms: null, areaSqft: 5102.41, landSqft: 9836.59 },
  ] },
  { landSqft: 9853.27, transactions: [
    { date: "2020-06-23", priceAed: 7715138, saleType: "primary", ratePerSqft: 1255, propertyType: "villa", bedrooms: null, areaSqft: 6147.91, landSqft: 9853.27 },
    { date: "2020-10-12", priceAed: 7715138, saleType: "secondary", ratePerSqft: 1255, propertyType: "villa", bedrooms: null, areaSqft: 6147.91, landSqft: 9853.27 },
  ] },
  { landSqft: 9868.67, transactions: [
    { date: "2020-06-24", priceAed: 8296568, saleType: "primary", ratePerSqft: 1364, propertyType: "villa", bedrooms: 4, areaSqft: 6081.07, landSqft: 9868.67 },
    { date: "2024-09-05", priceAed: 13500000, saleType: "secondary", ratePerSqft: 2220, propertyType: "villa", bedrooms: 4, areaSqft: 6081.07, landSqft: 9868.67 },
  ] },
  { landSqft: 9871.03, transactions: [
    { date: "2020-04-01", priceAed: 7875000, saleType: "primary", ratePerSqft: 1177, propertyType: "villa", bedrooms: null, areaSqft: 6691.81, landSqft: 9871.03 },
  ] },
  { landSqft: 9976.74, transactions: [
    { date: "2020-02-09", priceAed: 7875000, saleType: "primary", ratePerSqft: 1188, propertyType: "villa", bedrooms: null, areaSqft: 6629.7, landSqft: 9976.74 },
  ] },
  { landSqft: 9985.89, transactions: [
    { date: "2020-02-11", priceAed: 8553150, saleType: "primary", ratePerSqft: 1512, propertyType: "villa", bedrooms: 4, areaSqft: 5656.0, landSqft: 9985.89 },
  ] },
  { landSqft: 10014.41, transactions: [
    { date: "2020-08-30", priceAed: 7875000, saleType: "primary", ratePerSqft: 1086, propertyType: "villa", bedrooms: null, areaSqft: 7251.42, landSqft: 10014.41 },
    { date: "2024-05-01", priceAed: 15500000, saleType: "secondary", ratePerSqft: 2138, propertyType: "villa", bedrooms: null, areaSqft: 7251.42, landSqft: 10014.41 },
    { date: "2026-05-13", priceAed: 16000000, saleType: "secondary", ratePerSqft: 2206, propertyType: "villa", bedrooms: null, areaSqft: 7251.42, landSqft: 10014.41 },
  ] },
  { landSqft: 10148.53, transactions: [
    { date: "2020-03-24", priceAed: 7542323, saleType: "primary", ratePerSqft: 1125, propertyType: "villa", bedrooms: null, areaSqft: 6705.48, landSqft: 10148.53 },
  ] },
  { landSqft: 10154.66, transactions: [
    { date: "2020-02-18", priceAed: 7875000, saleType: "primary", ratePerSqft: 1180, propertyType: "villa", bedrooms: null, areaSqft: 6675.34, landSqft: 10154.66 },
    { date: "2022-08-23", priceAed: 9000000, saleType: "secondary", ratePerSqft: 1348, propertyType: "villa", bedrooms: null, areaSqft: 6675.34, landSqft: 10154.66 },
  ] },
  { landSqft: 10178.67, transactions: [
    { date: "2020-06-23", priceAed: 8164370, saleType: "primary", ratePerSqft: 2358, propertyType: "villa", bedrooms: 4, areaSqft: 3461.78, landSqft: 10178.67 },
    { date: "2025-12-16", priceAed: 14000000, saleType: "secondary", ratePerSqft: 4044, propertyType: "villa", bedrooms: 4, areaSqft: 3461.78, landSqft: 10178.67 },
  ] },
  { landSqft: 10181.47, transactions: [
    { date: "2020-03-18", priceAed: 7638750, saleType: "primary", ratePerSqft: 1125, propertyType: "villa", bedrooms: 4, areaSqft: 6791.7, landSqft: 10181.47 },
    { date: "2026-02-23", priceAed: 17500000, saleType: "secondary", ratePerSqft: 2577, propertyType: "villa", bedrooms: 4, areaSqft: 6791.7, landSqft: 10181.47 },
  ] },
  { landSqft: 10405.03, transactions: [
    { date: "2020-02-24", priceAed: 7638750, saleType: "primary", ratePerSqft: 1139, propertyType: "villa", bedrooms: null, areaSqft: 6708.39, landSqft: 10405.03 },
    { date: "2020-03-02", priceAed: 7638750, saleType: "secondary", ratePerSqft: 1139, propertyType: "villa", bedrooms: null, areaSqft: 6708.39, landSqft: 10405.03 },
  ] },
  { landSqft: 10424.84, transactions: [
    { date: "2020-03-19", priceAed: 7867913, saleType: "primary", ratePerSqft: 1284, propertyType: "villa", bedrooms: null, areaSqft: 6126.49, landSqft: 10424.84 },
  ] },
  { landSqft: 10469.4, transactions: [
    { date: "2020-06-24", priceAed: 9126225, saleType: "primary", ratePerSqft: 872, propertyType: "villa", bedrooms: 4, areaSqft: 10469.4, landSqft: 10469.4 },
  ] },
  { landSqft: 10511.92, transactions: [
    { date: "2020-05-03", priceAed: 8941929, saleType: "primary", ratePerSqft: 2660, propertyType: "villa", bedrooms: 4, areaSqft: 3361.89, landSqft: 10511.92 },
  ] },
  { landSqft: 10514.29, transactions: [
    { date: "2020-06-24", priceAed: 7638750, saleType: "primary", ratePerSqft: 1014, propertyType: "villa", bedrooms: 4, areaSqft: 7534.73, landSqft: 10514.29 },
    { date: "2020-11-16", priceAed: 7950000, saleType: "secondary", ratePerSqft: 1055, propertyType: "villa", bedrooms: 4, areaSqft: 7534.73, landSqft: 10514.29 },
    { date: "2023-09-28", priceAed: 13000000, saleType: "secondary", ratePerSqft: 1725, propertyType: "villa", bedrooms: 4, areaSqft: 7534.73, landSqft: 10514.29 },
  ] },
  { landSqft: 10540.98, transactions: [
    { date: "2020-06-22", priceAed: 7638750, saleType: "primary", ratePerSqft: 1253, propertyType: "villa", bedrooms: 5, areaSqft: 6096.35, landSqft: 10540.98 },
  ] },
  { landSqft: 10692.97, transactions: [
    { date: "2020-03-18", priceAed: 7386811, saleType: "primary", ratePerSqft: 976, propertyType: "villa", bedrooms: 4, areaSqft: 7564.76, landSqft: 10692.97 },
  ] },
  { landSqft: 10787.9, transactions: [
    { date: "2019-12-12", priceAed: 7875000, saleType: "primary", ratePerSqft: 705, propertyType: "villa", bedrooms: null, areaSqft: 11163.03, landSqft: 10787.9 },
    { date: "2020-02-24", priceAed: 7875000, saleType: "secondary", ratePerSqft: 705, propertyType: "villa", bedrooms: null, areaSqft: 11163.03, landSqft: 10787.9 },
  ] },
  { landSqft: 10866.37, transactions: [
    { date: "2020-12-31", priceAed: 6714986, saleType: "primary", ratePerSqft: null, propertyType: "villa", bedrooms: 4, areaSqft: null, landSqft: 10866.37 },
  ] },
  { landSqft: 10973.04, transactions: [
    { date: "2020-02-17", priceAed: 7875000, saleType: "primary", ratePerSqft: 1316, propertyType: "villa", bedrooms: null, areaSqft: 5982.36, landSqft: 10973.04 },
    { date: "2020-03-01", priceAed: 7875000, saleType: "secondary", ratePerSqft: 1316, propertyType: "villa", bedrooms: null, areaSqft: 5982.36, landSqft: 10973.04 },
    { date: "2020-06-01", priceAed: 7600000, saleType: "secondary", ratePerSqft: 1270, propertyType: "villa", bedrooms: null, areaSqft: 5982.36, landSqft: 10973.04 },
  ] },
  { landSqft: 11295.96, transactions: [
    { date: "2020-05-27", priceAed: 7875000, saleType: "primary", ratePerSqft: 1469, propertyType: "villa", bedrooms: 5, areaSqft: 5361.5, landSqft: 11295.96 },
    { date: "2020-07-09", priceAed: 8032000, saleType: "secondary", ratePerSqft: 1498, propertyType: "villa", bedrooms: 5, areaSqft: 5361.5, landSqft: 11295.96 },
  ] },
  { landSqft: 11411.46, transactions: [
    { date: "2020-06-23", priceAed: 6851394, saleType: "primary", ratePerSqft: 654, propertyType: "villa", bedrooms: 4, areaSqft: 10469.4, landSqft: 11411.46 },
    { date: "2026-07-01", priceAed: 13500000, saleType: "secondary", ratePerSqft: 1289, propertyType: "villa", bedrooms: 4, areaSqft: 10469.4, landSqft: 11411.46 },
  ] },
  { landSqft: 11442.89, transactions: [
    { date: "2020-03-19", priceAed: 7715138, saleType: "primary", ratePerSqft: 1242, propertyType: "villa", bedrooms: null, areaSqft: 6212.17, landSqft: 11442.89 },
  ] },
  { landSqft: 11654.29, transactions: [
    { date: "2020-03-23", priceAed: 7481250, saleType: "primary", ratePerSqft: 1194, propertyType: "villa", bedrooms: 4, areaSqft: 6264.59, landSqft: 11654.29 },
  ] },
  { landSqft: 11964.94, transactions: [
    { date: "2020-03-18", priceAed: 9126225, saleType: "primary", ratePerSqft: 1794, propertyType: "villa", bedrooms: 4, areaSqft: 5085.73, landSqft: 11964.94 },
  ] },
  { landSqft: 12538.65, transactions: [
    { date: "2020-02-25", priceAed: 8211656, saleType: "primary", ratePerSqft: 753, propertyType: "villa", bedrooms: 4, areaSqft: 10904.69, landSqft: 12538.65 },
    { date: "2022-06-22", priceAed: 10000000, saleType: "secondary", ratePerSqft: 917, propertyType: "villa", bedrooms: 4, areaSqft: 10904.69, landSqft: 12538.65 },
  ] },
  { landSqft: 13269.41, transactions: [
    { date: "2020-03-16", priceAed: 12604096, saleType: "primary", ratePerSqft: 829, propertyType: "villa", bedrooms: null, areaSqft: 15207.78, landSqft: 13269.41 },
  ] },
  { landSqft: 13504.39, transactions: [
    { date: "2024-11-06", priceAed: 13074800, saleType: "primary", ratePerSqft: 845, propertyType: "villa", bedrooms: null, areaSqft: 15475.58, landSqft: 13504.39 },
  ] },
  { landSqft: 13638.18, transactions: [
    { date: "2020-03-16", priceAed: 12154546, saleType: "primary", ratePerSqft: 771, propertyType: "villa", bedrooms: null, areaSqft: 15757.38, landSqft: 13638.18 },
  ] },
  { landSqft: 13764.77, transactions: [
    { date: "2020-12-09", priceAed: 10500000, saleType: "primary", ratePerSqft: 715, propertyType: "villa", bedrooms: null, areaSqft: 14678.19, landSqft: 13764.77 },
  ] },
  { landSqft: 13877.79, transactions: [
    { date: "2020-08-17", priceAed: 12172320, saleType: "primary", ratePerSqft: 921, propertyType: "villa", bedrooms: null, areaSqft: 13215.81, landSqft: 13877.79 },
    { date: "2025-05-29", priceAed: 28500000, saleType: "secondary", ratePerSqft: 2157, propertyType: "villa", bedrooms: null, areaSqft: 13215.81, landSqft: 13877.79 },
  ] },
  { landSqft: 14112.98, transactions: [
    { date: "2020-07-06", priceAed: 11300000, saleType: "primary", ratePerSqft: 801, propertyType: "villa", bedrooms: 5, areaSqft: 14112.98, landSqft: 14112.98 },
  ] },
  { landSqft: 14140.21, transactions: [
    { date: "2020-03-16", priceAed: 12214903, saleType: "primary", ratePerSqft: 758, propertyType: "villa", bedrooms: null, areaSqft: 16122.82, landSqft: 14140.21 },
  ] },
  { landSqft: 14615.98, transactions: [
    { date: "2020-06-04", priceAed: 12645024, saleType: "primary", ratePerSqft: 812, propertyType: "villa", bedrooms: null, areaSqft: 15577.09, landSqft: 14615.98 },
    { date: "2020-07-29", priceAed: 13052928, saleType: "secondary", ratePerSqft: 838, propertyType: "villa", bedrooms: null, areaSqft: 15577.09, landSqft: 14615.98 },
  ] },
  { landSqft: 14694.66, transactions: [
    { date: "2020-11-17", priceAed: 13335800, saleType: "primary", ratePerSqft: 972, propertyType: "villa", bedrooms: null, areaSqft: 13714.28, landSqft: 14694.66 },
  ] },
  { landSqft: 15182.59, transactions: [
    { date: "2020-06-23", priceAed: 13500000, saleType: "primary", ratePerSqft: 889, propertyType: "villa", bedrooms: 5, areaSqft: 15177.1, landSqft: 15182.59 },
    { date: "2020-11-15", priceAed: 12960000, saleType: "secondary", ratePerSqft: 854, propertyType: "villa", bedrooms: 5, areaSqft: 15177.1, landSqft: 15182.59 },
  ] },
  { landSqft: 15266.98, transactions: [
    { date: "2020-06-23", priceAed: 13050000, saleType: "primary", ratePerSqft: 2822, propertyType: "villa", bedrooms: null, areaSqft: 4624.17, landSqft: 15266.98 },
    { date: "2020-11-04", priceAed: 11092500, saleType: "secondary", ratePerSqft: 2399, propertyType: "villa", bedrooms: null, areaSqft: 4624.17, landSqft: 15266.98 },
  ] },
  { landSqft: 15306.27, transactions: [
    { date: "2020-06-23", priceAed: 13050000, saleType: "primary", ratePerSqft: 2675, propertyType: "villa", bedrooms: null, areaSqft: 4878.2, landSqft: 15306.27 },
    { date: "2020-11-05", priceAed: 10500000, saleType: "secondary", ratePerSqft: 2152, propertyType: "villa", bedrooms: null, areaSqft: 4878.2, landSqft: 15306.27 },
    { date: "2026-01-23", priceAed: 33000000, saleType: "secondary", ratePerSqft: 6765, propertyType: "villa", bedrooms: null, areaSqft: 4878.2, landSqft: 15306.27 },
  ] },
  { landSqft: 16804.17, transactions: [
    { date: "2020-03-03", priceAed: 12421060, saleType: "primary", ratePerSqft: 2437, propertyType: "villa", bedrooms: null, areaSqft: 5096.06, landSqft: 16804.17 },
  ] },
  { landSqft: 17291.02, transactions: [
    { date: "2020-03-24", priceAed: 12354570, saleType: "primary", ratePerSqft: 797, propertyType: "villa", bedrooms: null, areaSqft: 15495.82, landSqft: 17291.02 },
  ] },
  { landSqft: 18719.39, transactions: [
    { date: "2020-06-23", priceAed: 13095000, saleType: "primary", ratePerSqft: 2809, propertyType: "villa", bedrooms: null, areaSqft: 4661.52, landSqft: 18719.39 },
    { date: "2020-08-31", priceAed: 11500000, saleType: "secondary", ratePerSqft: 2467, propertyType: "villa", bedrooms: null, areaSqft: 4661.52, landSqft: 18719.39 },
  ] },
  { landSqft: 19538.42, transactions: [
    { date: "2020-04-16", priceAed: 13095000, saleType: "primary", ratePerSqft: 886, propertyType: "villa", bedrooms: null, areaSqft: 14783.57, landSqft: 19538.42 },
  ] },
  { landSqft: 19982.0, transactions: [
    { date: "2020-03-03", priceAed: 14062613, saleType: "primary", ratePerSqft: 939, propertyType: "villa", bedrooms: null, areaSqft: 14974.74, landSqft: 19982.0 },
  ] },
  { landSqft: 20849.24, transactions: [
    { date: "2020-01-27", priceAed: 17775000, saleType: "primary", ratePerSqft: 1419, propertyType: "villa", bedrooms: null, areaSqft: 12524.34, landSqft: 20849.24 },
    { date: "2020-02-10", priceAed: 17775000, saleType: "secondary", ratePerSqft: 1419, propertyType: "villa", bedrooms: null, areaSqft: 12524.34, landSqft: 20849.24 },
  ] },
  { landSqft: 22265.56, transactions: [
    { date: "2020-06-24", priceAed: 19800000, saleType: "primary", ratePerSqft: 889, propertyType: "villa", bedrooms: 6, areaSqft: 22265.56, landSqft: 22265.56 },
  ] },
  { landSqft: 22414.1, transactions: [
    { date: "2020-04-06", priceAed: 13607888, saleType: "primary", ratePerSqft: 2125, propertyType: "residential complex", bedrooms: null, areaSqft: 6404.2, landSqft: 22414.1 },
    { date: "2025-02-06", priceAed: 33000000, saleType: "secondary", ratePerSqft: 5153, propertyType: "residential complex", bedrooms: null, areaSqft: 6404.2, landSqft: 22414.1 },
  ] },
  { landSqft: 23446.25, transactions: [
    { date: "2020-06-07", priceAed: 15209467, saleType: "primary", ratePerSqft: 3132, propertyType: "villa", bedrooms: 6, areaSqft: 4855.6, landSqft: 23446.25 },
  ] },
  { landSqft: 23642.91, transactions: [
    { date: "2020-01-15", priceAed: 17460000, saleType: "primary", ratePerSqft: 1428, propertyType: "villa", bedrooms: null, areaSqft: 12226.71, landSqft: 23642.91 },
    { date: "2020-02-10", priceAed: 17460000, saleType: "secondary", ratePerSqft: 1428, propertyType: "villa", bedrooms: null, areaSqft: 12226.71, landSqft: 23642.91 },
  ] },
  { landSqft: 23991.55, transactions: [
    { date: "2020-12-23", priceAed: 19552500, saleType: "primary", ratePerSqft: 938, propertyType: "villa", bedrooms: null, areaSqft: 20837.08, landSqft: 23991.55 },
    { date: "2021-07-18", priceAed: 3750000, saleType: "secondary", ratePerSqft: 180, propertyType: "villa", bedrooms: null, areaSqft: 20837.08, landSqft: 23991.55 },
  ] },
  { landSqft: 24415.22, transactions: [
    { date: "2020-06-24", priceAed: 19800000, saleType: "primary", ratePerSqft: 1032, propertyType: "villa", bedrooms: null, areaSqft: 19185.79, landSqft: 24415.22 },
    { date: "2021-06-20", priceAed: 18315000, saleType: "secondary", ratePerSqft: 955, propertyType: "villa", bedrooms: null, areaSqft: 19185.79, landSqft: 24415.22 },
  ] },
  { landSqft: 27363.99, transactions: [
    { date: "2020-06-24", priceAed: 17241750, saleType: "primary", ratePerSqft: 1377, propertyType: "villa", bedrooms: null, areaSqft: 12517.55, landSqft: 27363.99 },
  ] },
  { landSqft: 27505.96, transactions: [
    { date: "2020-06-24", priceAed: 19552500, saleType: "primary", ratePerSqft: 942, propertyType: "villa", bedrooms: null, areaSqft: 20765.93, landSqft: 27505.96 },
    { date: "2021-04-19", priceAed: 18183825, saleType: "secondary", ratePerSqft: 876, propertyType: "villa", bedrooms: null, areaSqft: 20765.93, landSqft: 27505.96 },
  ] },
];

/** All transactions flat (for summary stats) */
export const allJawaherTransactions: JawaherTransaction[] = jawaherPlotHistories.flatMap(p => p.transactions);

/** Get transactions for a specific plot by land area */
export function getJawaherPlotTransactions(landSqft: number): JawaherTransaction[] {
  const plot = jawaherPlotHistories.find(p => Math.abs(p.landSqft - landSqft) < 50);
  return plot?.transactions ?? [];
}

/** Summary stats */
export const JAWAHER_TX_SUMMARY = {
  totalTransactions: 130,
  primaryCount: 83,
  secondaryCount: 47,
  uniquePlots: 83,
  avgPriceAed: 10246145,
  totalValueAed: 1331998897,
  dateRange: { from: "2019-12-09", to: "2026-07-01" },
};
