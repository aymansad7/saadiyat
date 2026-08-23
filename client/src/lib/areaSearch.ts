export const SQFT_PER_SQM = 10.764;

export type AreaUnit = "sqm" | "sqft";

export interface AreaValues {
  sqm?: number | null;
  sqft?: number | null;
}

export function sqmToSqft(sqm: number): number {
  return sqm * SQFT_PER_SQM;
}

export function sqftToSqm(sqft: number): number {
  return sqft / SQFT_PER_SQM;
}

export function normalizeArea(values: AreaValues): { sqm?: number; sqft?: number } {
  const sqm = values.sqm ?? (values.sqft != null ? sqftToSqm(values.sqft) : undefined);
  const sqft = values.sqft ?? (values.sqm != null ? sqmToSqft(values.sqm) : undefined);
  return { sqm: sqm ?? undefined, sqft: sqft ?? undefined };
}

export function areaValue(values: AreaValues, unit: AreaUnit): number | undefined {
  return normalizeArea(values)[unit];
}

export function parseAreaNumber(value: string): number | undefined {
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function detectAreaUnit(query: string): AreaUnit | undefined {
  const normalized = query.toLowerCase().replace(/²/g, "2");
  if (/\b(sq\s*ft|sqft|ft2|feet|foot)\b/.test(normalized)) return "sqft";
  if (/\b(sq\s*m|sqm|m2|meter|metre)\b/.test(normalized)) return "sqm";
  return undefined;
}

export function matchesAreaQuery(query: string, values: AreaValues): boolean {
  const target = parseAreaNumber(query);
  if (target == null) return false;
  const normalized = normalizeArea(values);
  const explicitUnit = detectAreaUnit(query);

  const matches = (actual: number | undefined, unit: AreaUnit) => {
    if (actual == null) return false;
    const minimumTolerance = unit === "sqm" ? 1 : 10;
    const tolerance = Math.max(minimumTolerance, target * 0.001);
    return Math.abs(actual - target) <= tolerance;
  };

  if (explicitUnit) return matches(normalized[explicitUnit], explicitUnit);
  return matches(normalized.sqm, "sqm") || matches(normalized.sqft, "sqft");
}

export function isWithinAreaRange(
  values: AreaValues,
  unit: AreaUnit,
  minText: string,
  maxText: string,
): boolean {
  const actual = areaValue(values, unit);
  if (actual == null) return !minText && !maxText;
  const min = minText ? Number(minText.replace(/,/g, "")) : undefined;
  const max = maxText ? Number(maxText.replace(/,/g, "")) : undefined;
  if (min != null && Number.isFinite(min) && actual < min) return false;
  if (max != null && Number.isFinite(max) && actual > max) return false;
  return true;
}

export function convertAreaInput(value: string, from: AreaUnit, to: AreaUnit): string {
  if (!value || from === to) return value;
  const parsed = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) return value;
  const converted = from === "sqm" ? sqmToSqft(parsed) : sqftToSqm(parsed);
  return String(Math.round(converted));
}

export function formatArea(values: AreaValues, unit: AreaUnit): string {
  const value = areaValue(values, unit);
  if (value == null) return "—";
  return `${new Intl.NumberFormat("en-AE", { maximumFractionDigits: unit === "sqm" ? 0 : 0 }).format(value)} ${unit === "sqm" ? "m²" : "sqft"}`;
}
