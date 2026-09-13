/** Extract the short numeric / floor-unit suffix from a full Aldar Unit_Name. */
export function shortUnitNumber(unitName: string | null | undefined): string {
  if (!unitName) return "";
  const parts = unitName.split("-");
  if (parts.length <= 2) return unitName;
  // Take last 1-2 segments, e.g. "MamshaGarden-B5-03-02" -> "03-02"
  const tail = parts.slice(-2).join("-");
  return tail || unitName;
}

export function fmtAed(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

export function fmtArea(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return `${n.toFixed(2)} m²`;
}

/** Project convention: one square metre equals 10.764 square feet. */
export const SQFT_PER_SQM = 10.764;

export type UnitPriceMetrics = {
  areaSqm: number;
  areaSource: "saleable" | "total";
  pricePerSqmAed: number;
  pricePerSqftAed: number;
};

/**
 * Derive price density only from a valid official price and documented living
 * area. Saleable area is preferred; total/BUA is used only when saleable area
 * was not supplied by Aldar. AED 1 is a known unpublished placeholder.
 */
export function getUnitPriceMetrics(
  priceAed: number | null | undefined,
  saleableAreaSqm: number | null | undefined,
  totalAreaSqm: number | null | undefined,
): UnitPriceMetrics | null {
  if (priceAed == null || !Number.isFinite(priceAed) || priceAed <= 1) return null;
  const saleable = saleableAreaSqm != null && Number.isFinite(saleableAreaSqm) && saleableAreaSqm > 0
    ? saleableAreaSqm
    : null;
  const total = totalAreaSqm != null && Number.isFinite(totalAreaSqm) && totalAreaSqm > 0
    ? totalAreaSqm
    : null;
  const areaSqm = saleable ?? total;
  if (!areaSqm) return null;
  return {
    areaSqm,
    areaSource: saleable ? "saleable" : "total",
    pricePerSqmAed: priceAed / areaSqm,
    pricePerSqftAed: priceAed / (areaSqm * SQFT_PER_SQM),
  };
}
