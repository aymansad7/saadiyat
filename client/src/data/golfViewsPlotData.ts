/**
 * Golf Views Plot Land Areas & Transaction History
 * DCR land areas are the authoritative plot identifiers.
 * Transactions source: ADREC SDN2 CSV supplied 23 Aug 2026.
 * Matching policy: only near-exact or clearly unique land-area matches are included.
 * Imported: 28 transactions across 19 plots; ambiguous/unmatched rows are excluded.
 */
import type { PlotTransaction } from "@/components/SimplePlotCard";

export interface GolfViewsPlotData {
  villaKey: string;
  landSqft: number;
  landSqm: number;
  transactions: PlotTransaction[];
}

/** Map of villaKey -> DCR plot area plus confirmed transaction history. */
export const golfViewsPlotData: Record<string, GolfViewsPlotData> = {
  "golf-views/SDN2_6-1_2": {
    villaKey: "golf-views/SDN2_6-1_2",
    landSqft: 57512.16,
    landSqm: 5343.06,
    transactions: [
      { date: "2021-10-11", priceAed: 20026518, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_3": {
    villaKey: "golf-views/SDN2_6_3",
    landSqft: 28278.7,
    landSqm: 2627.18,
    transactions: [
      { date: "2021-10-05", priceAed: 9846465, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_4": {
    villaKey: "golf-views/SDN2_6_4",
    landSqft: 35950.35,
    landSqm: 3339.9,
    transactions: [
    ],
  },
  "golf-views/SDN2_6_5": {
    villaKey: "golf-views/SDN2_6_5",
    landSqft: 40016.95,
    landSqm: 3717.7,
    transactions: [
      { date: "2023-06-07", priceAed: 13931980, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_6": {
    villaKey: "golf-views/SDN2_6_6",
    landSqft: 25203.89,
    landSqm: 2341.52,
    transactions: [
    ],
  },
  "golf-views/SDN2_6_7-6_8": {
    villaKey: "golf-views/SDN2_6_7-6_8",
    landSqft: 52385.43,
    landSqm: 4866.77,
    transactions: [
      { date: "2019-11-17", priceAed: 18242386, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_9": {
    villaKey: "golf-views/SDN2_6_9",
    landSqft: 28602.91,
    landSqm: 2657.3,
    transactions: [
      { date: "2020-11-26", priceAed: 9958910, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_10": {
    villaKey: "golf-views/SDN2_6_10",
    landSqft: 30484.33,
    landSqm: 2832.09,
    transactions: [
      { date: "2021-10-19", priceAed: 10109373, saleType: "primary", ratePerSqft: 332 },
      { date: "2024-03-27", priceAed: 75000000, saleType: "secondary", ratePerSqft: 2460 },
    ],
  },
  "golf-views/SDN2_6_11": {
    villaKey: "golf-views/SDN2_6_11",
    landSqft: 25246.62,
    landSqm: 2345.49,
    transactions: [
      { date: "2020-04-14", priceAed: 8789479, saleType: "primary", ratePerSqft: 348 },
      { date: "2022-04-05", priceAed: 8778234, saleType: "primary", ratePerSqft: 348 },
      { date: "2024-03-18", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2179 },
      { date: "2024-05-30", priceAed: 55000000, saleType: "secondary", ratePerSqft: 2179 },
    ],
  },
  "golf-views/SDN2_6_12": {
    villaKey: "golf-views/SDN2_6_12",
    landSqft: 25893.96,
    landSqm: 2405.63,
    transactions: [
      { date: "2020-01-05", priceAed: 9933803, saleType: "primary", ratePerSqft: 384 },
    ],
  },
  "golf-views/SDN2_6_13": {
    villaKey: "golf-views/SDN2_6_13",
    landSqft: 39513.63,
    landSqm: 3670.94,
    transactions: [
      { date: "2020-06-02", priceAed: 15558891, saleType: "primary", ratePerSqft: 394 },
    ],
  },
  "golf-views/SDN2_6_14": {
    villaKey: "golf-views/SDN2_6_14",
    landSqft: 27588.2,
    landSqm: 2563.03,
    transactions: [
    ],
  },
  "golf-views/SDN2_6_15": {
    villaKey: "golf-views/SDN2_6_15",
    landSqft: 30676.9,
    landSqm: 2849.98,
    transactions: [
    ],
  },
  "golf-views/SDN2_6_16": {
    villaKey: "golf-views/SDN2_6_16",
    landSqft: 32377.81,
    landSqm: 3008,
    transactions: [
      { date: "2022-01-17", priceAed: 24000000, saleType: "secondary", ratePerSqft: 741 },
      { date: "2022-03-04", priceAed: 23500000, saleType: "secondary", ratePerSqft: 726 },
      { date: "2025-12-29", priceAed: 10000000, saleType: "primary", ratePerSqft: 309 },
    ],
  },
  "golf-views/SDN2_6_17": {
    villaKey: "golf-views/SDN2_6_17",
    landSqft: 31860.61,
    landSqm: 2959.95,
    transactions: [
      { date: "2025-12-29", priceAed: 10000000, saleType: "primary", ratePerSqft: 314 },
    ],
  },
  "golf-views/SDN2_6_18": {
    villaKey: "golf-views/SDN2_6_18",
    landSqft: 30559.36,
    landSqm: 2839.06,
    transactions: [
      { date: "2020-08-17", priceAed: 10134361, saleType: "primary", ratePerSqft: 332 },
    ],
  },
  "golf-views/SDN2_6_19": {
    villaKey: "golf-views/SDN2_6_19",
    landSqft: 20730.09,
    landSqm: 1925.89,
    transactions: [
      { date: "2020-08-19", priceAed: 10479907, saleType: "primary", ratePerSqft: 506 },
      { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 724 },
    ],
  },
  "golf-views/SDN2_6_20": {
    villaKey: "golf-views/SDN2_6_20",
    landSqft: 21017.38,
    landSqm: 1952.58,
    transactions: [
      { date: "2020-08-19", priceAed: 9445410, saleType: "primary", ratePerSqft: 449 },
      { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 714 },
    ],
  },
  "golf-views/SDN2_6_21": {
    villaKey: "golf-views/SDN2_6_21",
    landSqft: 21174.85,
    landSqm: 1967.21,
    transactions: [
      { date: "2020-08-19", priceAed: 9264373, saleType: "primary", ratePerSqft: 438 },
      { date: "2022-04-22", priceAed: 15000000, saleType: "secondary", ratePerSqft: 708 },
    ],
  },
  "golf-views/SDN2_6_22": {
    villaKey: "golf-views/SDN2_6_22",
    landSqft: 27050.33,
    landSqm: 2513.06,
    transactions: [
      { date: "2020-11-26", priceAed: 9007650, saleType: "primary", ratePerSqft: 333 },
    ],
  },
  "golf-views/SDN2_6_23-6_24": {
    villaKey: "golf-views/SDN2_6_23-6_24",
    landSqft: 65199.1,
    landSqm: 6057.2,
    transactions: [
      { date: "2019-08-29", priceAed: 23837854, saleType: "primary", ratePerSqft: 366 },
    ],
  },
  "golf-views/SDN2_6_25": {
    villaKey: "golf-views/SDN2_6_25",
    landSqft: 39339.58,
    landSqm: 3654.77,
    transactions: [
      { date: "2020-11-26", priceAed: 13699593, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_26": {
    villaKey: "golf-views/SDN2_6_26",
    landSqft: 23455.29,
    landSqm: 2179.07,
    transactions: [
      { date: "2020-12-13", priceAed: 8167281, saleType: "primary", ratePerSqft: 348 },
    ],
  },
  "golf-views/SDN2_6_27": {
    villaKey: "golf-views/SDN2_6_27",
    landSqft: 20980.56,
    landSqm: 1949.16,
    transactions: [
    ],
  },
  "golf-views/SDN2_p38": {
    villaKey: "golf-views/SDN2_p38",
    landSqft: 32828.6,
    landSqm: 3049.88,
    transactions: [
    ],
  },
};

/** Get plot data by villaKey. */
export function getGolfViewsPlot(villaKey: string): GolfViewsPlotData | undefined {
  return golfViewsPlotData[villaKey];
}

/** Confirmed plot histories for the Golf Views summary table. */
export const golfViewsTransactionRecords = Object.values(golfViewsPlotData)
  .filter((plot) => plot.transactions.length > 0);

export const GOLF_VIEWS_TRANSACTION_SUMMARY = {
  totalTransactions: 28,
  matchedPlots: 19,
  plotsWithDcrArea: 25,
  primaryTransactions: 20,
  secondaryTransactions: 8,
  dateRange: { from: "2019-08-29", to: "2025-12-29" },
  excludedAmbiguousRows: 1,
  excludedUnmatchedRows: 92,
} as const;
