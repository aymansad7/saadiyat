export type AldarOfficialPenthouseGallery = {
  label: string;
  sourceLabel: string;
  images: Array<{ url: string; alt: string }>;
};

const MANDARIN_PENTHOUSE_UNITS = new Set([
  "FountainViewResidences-B1-09-01",
  "FountainViewResidences-B2-09-01",
]);

/**
 * Aldar publishes these under the Mandarin Oriental Penthouse gallery. They are
 * category-level project visuals, never represented as a photo of either exact unit.
 */
const MANDARIN_PENTHOUSE_GALLERY: AldarOfficialPenthouseGallery = {
  label: "Official Penthouse Gallery",
  sourceLabel: "Official Aldar project gallery · Penthouse category",
  images: [
    {
      url: "/manus-storage/mandarin-oriental-penthouses-slide-4_902132b6.webp",
      alt: "Mandarin Oriental Residences penthouse gallery image 1",
    },
    {
      url: "/manus-storage/mandarin-oriental-penthouses-slide-5_fa29efcf.webp",
      alt: "Mandarin Oriental Residences penthouse gallery image 2",
    },
  ],
};

export function getAldarOfficialPenthouseGallery(
  projectSlug: string | null | undefined,
  unitName: string | null | undefined,
): AldarOfficialPenthouseGallery | null {
  if (projectSlug !== "fountainviewresidences" || !unitName) return null;
  return MANDARIN_PENTHOUSE_UNITS.has(unitName) ? MANDARIN_PENTHOUSE_GALLERY : null;
}
