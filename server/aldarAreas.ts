/**
 * Area classification for "Other Aldar" projects.
 *
 * Each non-Saadiyat Aldar project is grouped under a real Abu Dhabi / UAE area
 * so the Master-only "Other Projects" view can be browsed area-by-area.
 *
 * Sources: aldar.com community pages + project listings (verified Jun 2026).
 * Note: "Nouran Living" is physically in Saadiyat Marina District, but it ships
 * inside aldar_other.json, so we surface it under its true area "Saadiyat".
 */

export type AreaKey =
  | "yas-island"
  | "al-shamkha"
  | "al-ghadeer"
  | "saadiyat"
  | "ras-al-khaimah"
  | "dubai"
  | "fahid-island"
  | "other";

export type AreaMeta = {
  key: AreaKey;
  /** Display label (English). */
  name: string;
  /** Short Arabic label for the UI. */
  nameAr: string;
  /** Sort order for area sections (lower = higher on the page). */
  order: number;
};

export const AREAS: Record<AreaKey, AreaMeta> = {
  "yas-island": { key: "yas-island", name: "Yas Island", nameAr: "جزيرة ياس", order: 1 },
  "al-shamkha": { key: "al-shamkha", name: "Al Shamkha", nameAr: "الشامخة", order: 2 },
  "al-ghadeer": { key: "al-ghadeer", name: "Al Ghadeer", nameAr: "الغدير", order: 3 },
  "saadiyat": { key: "saadiyat", name: "Saadiyat Island", nameAr: "جزيرة السعديات", order: 4 },
  "ras-al-khaimah": { key: "ras-al-khaimah", name: "Ras Al Khaimah", nameAr: "رأس الخيمة", order: 5 },
  "dubai": { key: "dubai", name: "Dubai", nameAr: "دبي", order: 6 },
  "fahid-island": { key: "fahid-island", name: "Fahid Island", nameAr: "جزيرة الفاهد", order: 7 },
  "other": { key: "other", name: "Other Areas", nameAr: "مناطق أخرى", order: 99 },
};

/**
 * Map from project slug (as found in aldar_other.json) to its area key.
 * Keep this list aligned with the dataset's project slugs.
 */
const PROJECT_AREA: Record<string, AreaKey> = {
  // --- Yas Island ---
  "gardenia-bay": "yas-island",
  "mayan": "yas-island",
  "noya": "yas-island",
  "noyaluma": "yas-island",
  "noyaviva": "yas-island",
  "sama-yas": "yas-island",
  "the-sustainable-city-yas-island": "yas-island",
  "yas-links-luxury-living": "yas-island",
  "yas-living": "yas-island",
  "yas-park-gate": "yas-island",
  "yas-park-place": "yas-island",
  "yas-park-views": "yas-island",
  "yas-riva": "yas-island",
  "yasacres-the-dahlias": "yas-island",
  "yasacres-the-magnolias": "yas-island",
  "al-deem-townhomes": "yas-island",
  "the-canopies": "yas-island",

  // --- Al Shamkha ---
  "fay-alreeman": "al-shamkha",
  "fay-al-reeman-ii": "al-shamkha",
  "reeman-living": "al-shamkha",
  "rise-by-athlon-1": "dubai",
  "rise-by-athlon-2": "dubai",
  "rise-by-athlon-3": "dubai",
  "rise-by-athlon-4": "dubai",

  // --- Al Ghadeer ---
  "al-ghadeer-gardens": "al-ghadeer",

  // --- Saadiyat (physically Saadiyat Marina District) ---
  "nouran-living": "saadiyat",

  // --- Ras Al Khaimah ---
  "almarjan": "ras-al-khaimah",
  "rosso-bay-residences": "ras-al-khaimah",

  // --- Dubai ---
  // --- Fahid Island ---
  "fahidbeachterraces": "fahid-island",
  "thebeachhouse": "fahid-island",
  "fahidbeachresidences": "fahid-island",
  "haven": "dubai",
  "verdes": "dubai",
  "wilds": "dubai",
  "athlon": "dubai",
};

/** Resolve the area for a given project slug (falls back to "other"). */
export function areaForProject(slug: string): AreaKey {
  return PROJECT_AREA[slug] ?? "other";
}

/** All area metas sorted by display order. */
export function orderedAreas(): AreaMeta[] {
  return Object.values(AREAS).sort((a, b) => a.order - b.order);
}
