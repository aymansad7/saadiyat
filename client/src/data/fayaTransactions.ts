export type FayaTransaction = {
  id: string;
  date: string;
  priceAed: number;
  landAreaSqm: number;
  builtUpAreaSqm: number;
  saleType: "primary" | "secondary";
  readiness: string;
  sharedUnitNames: readonly string[];
  note: string;
};

export const FAYA_LARGEST_UNITS = [
  "FayaAlSaadiyat-SB45-V-21-01",
  "FayaAlSaadiyat-SB45-V-20-01",
] as const;

export const FAYA_SHARED_TRANSACTION: FayaTransaction = {
  id: "faya-combined-2026-07-15-190m",
  date: "2026-07-15",
  priceAed: 190_000_000,
  landAreaSqm: 6_478.16,
  builtUpAreaSqm: 16_032.32,
  saleType: "primary",
  readiness: "ready",
  sharedUnitNames: FAYA_LARGEST_UNITS,
  note: "Combined ADREC transaction shared across Faya's two largest units; price and areas are not split per unit.",
};

export function getFayaTransactions(unitName: string | null | undefined): FayaTransaction[] {
  if (!unitName || !FAYA_SHARED_TRANSACTION.sharedUnitNames.includes(unitName as typeof FAYA_LARGEST_UNITS[number])) {
    return [];
  }
  return [FAYA_SHARED_TRANSACTION];
}

