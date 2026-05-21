/**
 * Marketing names that override the raw Aldar building_section codes.
 * Add new mappings here whenever Aldar names a sub-building.
 *
 * Lookup is by exact raw building name first (case-sensitive),
 * then a normalized version (lowercased, no spaces).
 */
const RAW: Record<string, string> = {
  // The Grove → Heart 1..5
  "Grove-Heart1": "Beach Views",
  "Grove-Heart2": "Uptown Views",
  "Grove-Heart3": "Gallery Views",
  "Grove-Heart4": "Fountain Views",
  "Grove-Heart5": "Museum Views",
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s_-]+/g, "");
}

const NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [norm(k), v]),
);

export function buildingMarketingName(rawName: string): string | null {
  if (RAW[rawName]) return RAW[rawName];
  const n = norm(rawName);
  return NORMALIZED[n] ?? null;
}

export function buildingDisplayName(rawName: string): {
  primary: string;
  secondary?: string;
} {
  const marketing = buildingMarketingName(rawName);
  if (marketing) {
    return { primary: marketing, secondary: rawName };
  }
  return { primary: rawName };
}
