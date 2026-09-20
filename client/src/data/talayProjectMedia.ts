export type TalayProjectImage = {
  url: string;
  alt: string;
  label: string;
};

/**
 * User-supplied Talay / Marsa Al Saadiyat project visuals. These visuals are
 * project marketing imagery and must never be represented as an exact villa,
 * plot, view, or unit-specific rendering.
 */
export const TALAY_PROJECT_IMAGES: TalayProjectImage[] = [
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-14_e4122737.jpg",
    alt: "Talay at Marsa Al Saadiyat villa community perspective",
    label: "Talay at Marsa Al Saadiyat · community perspective",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-17_2f39df34.jpg",
    alt: "Talay green corridor through the villa community",
    label: "The green corridor · project perspective",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-24_6ce99404.jpg",
    alt: "Talay green corridor Arabic project artwork",
    label: "The green corridor · Arabic project artwork",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-18_08d0d1ea.jpg",
    alt: "Talay kids discovery garden",
    label: "Kids’ discovery garden · project amenity",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-19_409882aa.jpg",
    alt: "Talay exploration garden",
    label: "Made for exploration · project amenity",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-25_9505f2c4.jpg",
    alt: "Talay kids discovery garden Arabic project artwork",
    label: "Kids’ discovery garden · Arabic project artwork",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-27_2f3bdead.jpg",
    alt: "Talay children’s play area Arabic project artwork",
    label: "Designed to inspire exploration · project amenity",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-22_7300fb9f.jpg",
    alt: "Talay Marsa Al Saadiyat aerial community Arabic project artwork",
    label: "Luxury address at Marsa Al Saadiyat · Arabic project artwork",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-21_5b443f63.jpg",
    alt: "Talay brand artwork unforgettable for generations",
    label: "Unforgettable for generations · project artwork",
  },
  {
    url: "/manus-storage/PHOTO-2026-09-20-13-25-28_e0eaf5de.jpg",
    alt: "Talay Marsa Al Saadiyat Arabic brand artwork",
    label: "Talay at Marsa Al Saadiyat · Arabic project artwork",
  },
];

export function isTalayProjectSlug(projectSlug: string | null | undefined) {
  return projectSlug === "talay-at-marsa-al-saadiyat";
}
