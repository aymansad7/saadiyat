import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const yandexAddresses = JSON.parse(readFileSync(resolve(root, "scripts/source-data/nudra-yandex-addresses.json"), "utf8")).locations;
const userSuppliedYandexControls = [
  {
    addressNumber: "1",
    returnedAddress: "1, 1 Street, SDN1, Saadiyat Island, Abu Dhabi",
    latitude: 24.537638,
    longitude: 54.415915,
    yandexUrl: "https://yandex.com/maps/121477/emirate-of-abu-dhabi/house/YU0YcgZlQEQCQFxufXlydnpgbA==/?ll=54.416089%2C24.538335&z=18.51",
  },
];
const allYandexAddressPoints = [...userSuppliedYandexControls, ...yandexAddresses];

const shores = [
  ["S-1", 1900, 2832.2], ["S-2", 1900, 2489.6], ["S-3", 1900, 2565.3], ["S-4", 1900, 2653],
];
const beachOne = [1135.6, 1247.7, 1253.8, 1222.9, 1097, 1056.8].map((plotAreaSqm, index) => [`B-1-${index + 1}`, 1261, plotAreaSqm]);
const beachTwo = [1000.1, 1000.9, 1007.1, 1007.4, 1004.5].map((plotAreaSqm, index) => [`B-2-${index + 1}`, 1262, plotAreaSqm]);
const dunesOne = [865.3, 885, 933, 910.7, 832.3, 681.2, 637.7, 637.7, 699.5, 827.8, 827.7, 743.4, 771.7, 732.8, 941.2].map((plotAreaSqm, index) => [`D-1-${index + 1}`, 855, plotAreaSqm]);
const dunesTwo = [691.6, 691.7, 691.7, 667.9, 642.2, 642.2, 679.6, 767.6].map((plotAreaSqm, index) => [`D-2-${index + 1}`, 852, plotAreaSqm]);

const launchPrices = new Map([
  ["S-2", { fiveYear: 26334777, sevenYear: 27650777 }],
  ["B-1-1", { fiveYear: 15477777, sevenYear: 16251777 }],
  ["B-1-4", { fiveYear: 16677777, sevenYear: 17511777 }],
  ["B-2-1", { fiveYear: 15647777, sevenYear: 16429777 }],
  ["B-2-4", { fiveYear: 15877777, sevenYear: 16671777 }],
  ["D-1-1", { fiveYear: 12977777, sevenYear: 13626777 }],
  ["D-1-7", { fiveYear: 9677777, sevenYear: 10161777 }],
  ["D-1-12", { fiveYear: 10877777, sevenYear: 11421777 }],
]);

const primary = [
  ["2019-12-18", 26334777, 2489.69, undefined, "S-2", "confirmed", "Land Δ 0.09 m²"],
  ["2019-10-27", 33899777, 2402.04, 806.59, undefined, "unmatched", "No unique schedule land-area match"],
  ["2019-09-08", 34199777, 2832.81, undefined, "S-1", "confirmed", "Land Δ 0.61 m²"],
  ["2019-08-25", 24915777, 2525.35, undefined, undefined, "unmatched", "No unique schedule land-area match"],
  ["2019-08-25", 26674777, 2688.35, 103.14, undefined, "unmatched", "No unique schedule land-area match"],
  ["2024-08-02", 10036777, 729.74, 854.99, "D-1-14", "possible", "Land Δ 3.06 m²; saleable area aligns"],
  ["2023-10-03", 17161777, 1220.13, 1261.7, "B-1-4", "possible", "Land Δ 2.77 m²; saleable area aligns"],
  ["2023-02-02", 22707777, 1243.21, 1261.7, "B-1-2", "possible", "Land Δ 4.49 m²; saleable area aligns"],
];
const secondary = [
  ["2025-02-06", 40000000, 826.73, 854.99, "D-1-10", "confirmed", "Land Δ 1.07 m²; saleable area aligns"],
  ["2023-06-08", 26674777, 2688.35, 103.14, undefined, "unmatched", "No unique schedule land-area match"],
  ["2023-06-02", 24915777, 2525.35, undefined, undefined, "unmatched", "No unique schedule land-area match"],
  ["2021-12-23", 26334777, 2489.69, undefined, "S-2", "confirmed", "Land Δ 0.09 m²"],
  ["2020-10-22", 34199777, 2832.81, undefined, "S-1", "confirmed", "Land Δ 0.61 m²"],
];

const units = [...shores, ...beachOne, ...beachTwo, ...dunesOne, ...dunesTwo].map(([unitNumber, saleableAreaSqm, plotAreaSqm]) => {
  const category = unitNumber.startsWith("S-") ? "Shores private mansion plot" : unitNumber.startsWith("B-") ? "Beach villa" : "Dunes villa";
  const bedrooms = unitNumber.startsWith("S-") ? undefined : unitNumber.startsWith("B-") ? "6" : "4";
  const price = launchPrices.get(unitNumber);
  const transactions = [
    ...primary.filter(([, , , , match]) => match === unitNumber).map(([date, priceAed, landAreaSqm, saleableAreaSqm, _match, confidence, note]) => ({ date, priceAed, landAreaSqm, saleableAreaSqm, confidence, note, saleType: "primary" })),
    ...secondary.filter(([, , , , match]) => match === unitNumber).map(([date, priceAed, landAreaSqm, saleableAreaSqm, _match, confidence, note]) => ({ date, priceAed, landAreaSqm, saleableAreaSqm, confidence, note, saleType: "secondary" })),
  ];
  return {
    unitNumber,
    villaKey: `nudra/${unitNumber}`,
    category,
    bedrooms,
    saleableAreaSqm,
    plotAreaSqm,
    originalPriceFiveYearAed: price?.fiveYear,
    originalPriceSevenYearAed: price?.sevenYear,
    paymentPlan: price ? "IMKAN launch price: 5-year or 7-year post-handover payment plan" : undefined,
    transactions,
  };
});

const output = `/** Generated from supplied IMKAN Nudra site plan, Sept-2019 availability list, and primary/secondary transaction exports. */
export type NudraTransactionConfidence = "confirmed" | "possible";
export interface NudraTransaction { date: string; priceAed: number; landAreaSqm?: number; saleableAreaSqm?: number; saleType: "primary" | "secondary"; confidence: NudraTransactionConfidence; note: string; }
export interface NudraUnit { unitNumber: string; villaKey: string; category: string; bedrooms?: string; saleableAreaSqm: number; plotAreaSqm: number; originalPriceFiveYearAed?: number; originalPriceSevenYearAed?: number; paymentPlan?: string; transactions: NudraTransaction[]; }
export interface NudraAddressPoint { addressNumber: string; returnedAddress: string; latitude: number; longitude: number; yandexUrl: string; }
export const NUDRA_UNITS: NudraUnit[] = ${JSON.stringify(units, null, 2)};
export const NUDRA_YANDEX_ADDRESS_POINTS: NudraAddressPoint[] = ${JSON.stringify(allYandexAddressPoints.map(({ addressNumber, returnedAddress, latitude, longitude, yandexUrl }) => ({ addressNumber, returnedAddress, latitude, longitude, yandexUrl })), null, 2)};
export const NUDRA_UNMATCHED_TRANSACTIONS = ${JSON.stringify([...primary, ...secondary].filter(([, , , , match]) => !match).map(([date, priceAed, landAreaSqm, saleableAreaSqm, , , note]) => ({ date, priceAed, landAreaSqm, saleableAreaSqm, note })), null, 2)};
export const NUDRA_PAYMENT_PLAN_NOTE = "Launch payment options in the supplied IMKAN availability list: 5-year plan (20% signing & handover, 20% July 2019, 60% across 10 equal semi-annual post-handover instalments) or 7-year plan (60% across 14 equal semi-annual instalments).";
export const NUDRA_SOURCE_LINKS = {
  factsheet: "/manus-storage/NudraFactsheet-V1-EnglishFactsheet_41133707.pdf",
  sitePlan: "/manus-storage/NudraSitePlan_a477c3db.pdf",
  availability: "/manus-storage/NudraAvailabilityList-Sept19_12d2f1fd.pdf",
} as const;
`;
writeFileSync(resolve(root, "client/src/data/nudra.ts"), output);
console.log(JSON.stringify({ units: units.length, mappedYandexAddresses: yandexAddresses.length, confirmedTransactions: units.flatMap((unit) => unit.transactions).filter((transaction) => transaction.confidence === "confirmed").length }, null, 2));
