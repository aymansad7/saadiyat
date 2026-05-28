/**
 * Lagoons availability index — combines three independent resale sources:
 *
 *   1. NAS Luxury Resale (server/data/nas_luxury_lagoons.json)
 *      Listings personally handled by NAS Luxury. Highest confidence.
 *
 *   2. Aldar Resale (server/data/aldar_resale.json, filtered to Saadiyat Lagoons)
 *      Listings published in the official Aldar resale workbook.
 *
 *   3. Others Resale (client/src/data/lagoonsResale.ts)
 *      Broker codes from older workbooks where the exact villa is ambiguous;
 *      candidate villas are flagged but the source itself is uncertain.
 *
 * Each villa unit_number (e.g. "Lagoons-AlSidr-V-065-01") maps to the union of
 * source flags so cards can render a colored badge and pages can filter by source.
 */

import { LAGOONS_RESALE, type ResaleListing } from "./lagoonsResale";
import NAS_LUXURY_RAW from "../../../server/data/nas_luxury_lagoons.json";
import ALDAR_RESALE_RAW from "../../../server/data/aldar_resale.json";

export type ResaleSource = "nas-luxury" | "aldar" | "others";

export interface NasLuxuryListing {
  option: number;
  aldar_unit_name: string;
  short_code: string;
  cluster_label: string;
  bedrooms: number | null;
  unit_type: string | null;
  plot_sqm: number | null;
  built_up_sqft: number | null;
  built_up_sqm?: number | null;
  position: string | null;
  finishing: string | null;
  specification: string | null;
  pod: boolean;
  premium: boolean;
  original_price_aed: number | null;
  selling_price_aed: number | null;
  payment_plan: string | null;
  paid_percent: number | null;
  highlights: string | null;
  signature_deal: boolean;
  aldar_url: string | null;
  lagoons_unit_number: string | null;
}

export interface AldarResaleListing {
  unit_number: string;
  project_resale_name: string;
  asking_price_aed: number | null;
  bedrooms: string | null;
  saleable_area_sqft: number | null;
  aldar_url: string | null;
  property_id: string;
}

export interface OthersResaleListing {
  code: string;
  cluster: string;
  bedrooms: number;
  plotSqm: number;
  sellingAed: number;
  paymentPlan: string;
  candidateCount: number;
}

// ----- NAS Luxury -----
const nasListings = (NAS_LUXURY_RAW as { listings: NasLuxuryListing[] }).listings;

/** unit_number (Lagoons-AlSidr-V-065-01 style) -> NAS Luxury listing */
export const NAS_LUXURY_BY_UNIT: Record<string, NasLuxuryListing> = {};
for (const l of nasListings) {
  if (l.lagoons_unit_number) {
    NAS_LUXURY_BY_UNIT[l.lagoons_unit_number] = l;
  }
}
export const NAS_LUXURY_LISTINGS = nasListings;

// ----- Aldar Resale (Saadiyat Lagoons subset only) -----
const aldarItems = (ALDAR_RESALE_RAW as { items: AldarResaleListing[] }).items;
const aldarLagoons = aldarItems.filter(
  (x) => x.project_resale_name === "Saadiyat Lagoons",
);

/**
 * Map Aldar's "Lagoons-Al Sidr-SL5-V-065" -> dataset's "Lagoons-AlSidr-V-065-01"
 * The dataset uses normalized cluster slugs and "-01"/"-02" suffix for the two
 * villa rows per plot. We map by stripping cluster spaces and dropping the
 * SL{n} subdivision, then we cannot pinpoint the row suffix — so we list both.
 */
function aldarToDatasetCandidates(aldarUnit: string): string[] {
  // "Lagoons-Al Sidr-SL5-V-065" -> ["Lagoons-AlSidr-V-065-01", "Lagoons-AlSidr-V-065-02"]
  const m = aldarUnit.match(/^Lagoons-(.+?)-SL\d+-V-(\d+)$/);
  if (!m) return [];
  const cluster = m[1].replace(/\s+/g, "");
  const num = m[2];
  // "Wilds" maps to "AlGhaf" in the dataset (Wilds is sub-zone of Al Ghaf)
  const clusterMapped = cluster === "Wilds" ? "AlGhaf" : cluster;
  return [
    `Lagoons-${clusterMapped}-V-${num}-01`,
    `Lagoons-${clusterMapped}-V-${num}-02`,
    `Lagoons-${clusterMapped}-V-${num}-03`,
  ];
}

export const ALDAR_RESALE_BY_UNIT: Record<string, AldarResaleListing[]> = {};
for (const l of aldarLagoons) {
  const candidates = aldarToDatasetCandidates(l.unit_number);
  for (const c of candidates) {
    if (!ALDAR_RESALE_BY_UNIT[c]) ALDAR_RESALE_BY_UNIT[c] = [];
    ALDAR_RESALE_BY_UNIT[c].push(l);
  }
}
export const ALDAR_RESALE_LISTINGS = aldarLagoons;

// ----- Others (broker codes) -----
export const OTHERS_RESALE_BY_UNIT: Record<string, ResaleListing[]> = {};
for (const r of LAGOONS_RESALE) {
  for (const cand of r.candidates) {
    // candidates use "AlSidr-042-01" — prepend "Lagoons-" and inject "V" segment
    // dataset format is "Lagoons-AlSidr-V-042-01"
    const m = cand.match(/^(\w+)-(\d+)-(\d+)$/);
    if (!m) continue;
    const key = `Lagoons-${m[1]}-V-${m[2]}-${m[3]}`;
    if (!OTHERS_RESALE_BY_UNIT[key]) OTHERS_RESALE_BY_UNIT[key] = [];
    OTHERS_RESALE_BY_UNIT[key].push(r);
  }
}
export const OTHERS_RESALE_LISTINGS = LAGOONS_RESALE;

// ----- combined helper -----
export interface VillaAvailability {
  sources: ResaleSource[];
  nasLuxury: NasLuxuryListing | null;
  aldar: AldarResaleListing[];
  others: ResaleListing[];
}

export function getAvailability(unitNumber: string): VillaAvailability {
  const nas = NAS_LUXURY_BY_UNIT[unitNumber] ?? null;
  const aldar = ALDAR_RESALE_BY_UNIT[unitNumber] ?? [];
  const others = OTHERS_RESALE_BY_UNIT[unitNumber] ?? [];
  const sources: ResaleSource[] = [];
  if (nas) sources.push("nas-luxury");
  if (aldar.length) sources.push("aldar");
  if (others.length) sources.push("others");
  return { sources, nasLuxury: nas, aldar, others };
}

export const AVAILABILITY_COUNTS = {
  nasLuxury: nasListings.length,
  aldar: aldarLagoons.length,
  others: LAGOONS_RESALE.length,
  uniqueVillasWithNasLuxury: Object.keys(NAS_LUXURY_BY_UNIT).length,
  uniqueVillasWithAldar: Object.keys(ALDAR_RESALE_BY_UNIT).length,
  uniqueVillasWithOthers: Object.keys(OTHERS_RESALE_BY_UNIT).length,
};

export const SOURCE_META: Record<
  ResaleSource,
  { label: string; shortLabel: string; cls: string; cardCls: string }
> = {
  "nas-luxury": {
    label: "Available with NAS Luxury",
    shortLabel: "NAS Luxury",
    // emerald — confirmed availability
    cls: "border-emerald-500/70 text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
    cardCls: "ring-1 ring-emerald-500/50",
  },
  aldar: {
    label: "Available · Aldar Resale",
    shortLabel: "Aldar Resale",
    // amber — official source but availability subject to confirmation
    cls: "border-amber-500/60 text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30",
    cardCls: "",
  },
  others: {
    label: "Might be available with others",
    shortLabel: "Other broker",
    // neutral / subdued — unverified
    cls: "border-foreground/25 text-muted-foreground bg-muted/40",
    cardCls: "",
  },
};
