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
