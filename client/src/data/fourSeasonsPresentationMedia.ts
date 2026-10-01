export type FourSeasonsPresentationImage = {
  url: string;
  alt: string;
  title: string;
  description: string;
  kind: "sales-centre" | "lifestyle";
  featured?: boolean;
};

/**
 * Official project and lifestyle imagery supplied through the Al Ain Broker
 * Portal. These images are project-level and illustrative only — never an
 * asserted view, interior, or photograph of a specific villa.
 */
export const FOUR_SEASONS_PRESENTATION_IMAGES: readonly FourSeasonsPresentationImage[] = [
  {
    url: "/manus-storage/lifestyle-beach_2a3391df.jpg",
    alt: "Official Four Seasons lifestyle image of musicians gathered at Saadiyat Beach",
    title: "Saadiyat Beach",
    description: "Official project lifestyle imagery — illustrative of the Four Seasons experience, not a view from a specific residence.",
    kind: "lifestyle",
    featured: true,
  },
  {
    url: "/manus-storage/sales-centre-4_3f193309.jpg",
    alt: "Four Seasons sales centre beach terrace with an open sea outlook",
    title: "Beachside setting",
    description: "Official project sales-centre imagery — illustrative only and not a residence-specific terrace or view.",
    kind: "sales-centre",
  },
  {
    url: "/manus-storage/sales-centre-2_02b2496c.jpg",
    alt: "Four Seasons sales centre display lounge with curated interior finishes",
    title: "Curated interiors",
    description: "Official project sales-centre imagery — indicative of the project design direction, not an exact villa interior.",
    kind: "sales-centre",
  },
  {
    url: "/manus-storage/sales-centre-3_71773810.jpg",
    alt: "Four Seasons sales centre master plan and reception interior",
    title: "Designed around the coast",
    description: "Official project sales-centre imagery — a project reference, not a specific villa or floor plan.",
    kind: "sales-centre",
  },
  {
    url: "/manus-storage/lifestyle-sea_18ba0684.jpg",
    alt: "Official Four Seasons lifestyle image looking toward the sea",
    title: "The sea, at your pace",
    description: "Official project lifestyle imagery — illustrative only and not a promised or exact residence view.",
    kind: "lifestyle",
  },
  {
    url: "/manus-storage/lifestyle-garden_36fe4e15.jpg",
    alt: "Official Four Seasons lifestyle image in landscaped greenery",
    title: "A quieter rhythm",
    description: "Official project lifestyle imagery — illustrative of the wider project character, not an exact villa garden.",
    kind: "lifestyle",
  },
  {
    url: "/manus-storage/sales-centre-1_b6f04f8b.jpg",
    alt: "Four Seasons Private Residences sales centre entrance",
    title: "Four Seasons Private Residences",
    description: "Official project sales-centre imagery, included as a project-level reference only.",
    kind: "sales-centre",
  },
] as const;

export const FOUR_SEASONS_PRESENTATION_HERO = FOUR_SEASONS_PRESENTATION_IMAGES.find((image) => image.featured)!;
