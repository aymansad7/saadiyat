import type { FourSeasonsVilla } from "@/data/fourSeasons";
import type { ListingIndexEntry } from "@/hooks/useListingIndex";

export const PRESENTATION_BEDROOMS = [5, 6, 7] as const;
export type PresentationBedroom = (typeof PRESENTATION_BEDROOMS)[number];

export const DEFAULT_FIVE_BEDROOM_SELECTION = [16, 19, 20, 21, 44, 45] as const;

export type PresentationCandidate = {
  villa: FourSeasonsVilla;
  listing: ListingIndexEntry;
};

export function parsePresentationBedroom(search: string): PresentationBedroom {
  const value = new URLSearchParams(search).get("beds");
  const parsed = Number(value);
  return PRESENTATION_BEDROOMS.includes(parsed as PresentationBedroom)
    ? (parsed as PresentationBedroom)
    : 5;
}

export function parsePresentationVillaSelection(search: string, bedroom: PresentationBedroom): number[] {
  const raw = new URLSearchParams(search).get("villas");
  if (!raw && bedroom === 5) return [...DEFAULT_FIVE_BEDROOM_SELECTION];
  if (!raw) return [];
  return Array.from(new Set(raw.split(",").map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0))).sort((a, b) => a - b);
}

export function isClientPresentation(search: string) {
  return new URLSearchParams(search).get("mode") === "present";
}

/** A client selection uses only an active owner/NAS listing, never a stale reference availability label. */
export function getAvailablePresentationCandidates(
  villas: readonly FourSeasonsVilla[],
  listingIndex: ReadonlyMap<string, ListingIndexEntry>,
  bedrooms: PresentationBedroom,
): PresentationCandidate[] {
  return villas
    .map((villa) => ({ villa, listing: listingIndex.get(villa.villaKey) }))
    .filter((row): row is PresentationCandidate => (
      Boolean(row.listing)
      && row.listing?.status === "available"
      && row.villa.bedrooms === bedrooms
    ))
    .sort((left, right) => left.villa.villaNumber - right.villa.villaNumber);
}

/** The builder shows all current residences of the chosen type; client mode shows the curated selection only. */
export function getPresentationPlanCandidates(
  candidates: readonly PresentationCandidate[],
  selectedVillaNumbers: ReadonlySet<number>,
  clientMode: boolean,
) {
  return clientMode
    ? candidates.filter((row) => selectedVillaNumbers.has(row.villa.villaNumber))
    : [...candidates];
}

export function buildPresentationSearch(input: {
  bedrooms: PresentationBedroom;
  villaNumbers: readonly number[];
  clientView?: boolean;
}) {
  const params = new URLSearchParams({
    beds: String(input.bedrooms),
    villas: Array.from(new Set(input.villaNumbers)).sort((a, b) => a - b).join(","),
  });
  if (input.clientView) params.set("mode", "present");
  return `?${params.toString()}`;
}
