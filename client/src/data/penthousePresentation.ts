export type PenthousePresentationProject = {
  title: string;
  narrative: string;
  imageUrl: string;
  imageAlt: string;
  sourceLabel: string;
  gallery?: readonly PenthousePresentationImage[];
};

export type PenthousePresentationImage = {
  url: string;
  alt: string;
  label: string;
};

const DECK_SOURCE_LABEL = "User-supplied penthouse presentation deck · Project rendering · Illustrative, not an exact-unit view";

/** User-supplied One Saadiyat / Baccarat category imagery. None is asserted to depict an exact unit. */
const ONE_SAADIYAT_PENTHOUSE_GALLERY = [
  { url: "/manus-storage/IMG_0068_437a571c.png", alt: "One Saadiyat penthouse terrace pool with Guggenheim Abu Dhabi outlook", label: "Guggenheim outlook" },
  { url: "/manus-storage/IMG_0069_998ac788.png", alt: "One Saadiyat penthouse spa and Guggenheim Abu Dhabi outlook", label: "Wellness suite" },
  { url: "/manus-storage/IMG_0070_0b9c97a5.png", alt: "One Saadiyat arrival drive and residence façade", label: "Private arrival" },
  { url: "/manus-storage/IMG_0071_1b65b739.png", alt: "Baccarat Residences lobby rendering", label: "Baccarat lobby" },
  { url: "/manus-storage/IMG_0072_29263c50.png", alt: "Baccarat penthouse dining interior rendering", label: "Dining salon" },
  { url: "/manus-storage/IMG_0073_f88cebce.png", alt: "Baccarat penthouse kitchen and dining interior rendering", label: "Kitchen & dining" },
  { url: "/manus-storage/IMG_0074_134af0c3.png", alt: "Baccarat penthouse living interior rendering", label: "Living salon" },
  { url: "/manus-storage/IMG_0075_3a85cc9a.png", alt: "Baccarat penthouse bedroom interior rendering", label: "Primary suite" },
  { url: "/manus-storage/IMG_0076_1c6458ad.png", alt: "One Saadiyat residence pool with Guggenheim outlook", label: "Poolside outlook" },
  { url: "/manus-storage/IMG_0077_e00d084e.png", alt: "Saadiyat Cultural District aerial rendering with Guggenheim Abu Dhabi", label: "Cultural District panorama" },
] as const satisfies readonly PenthousePresentationImage[];

export const PENTHOUSES_GUGGENHEIM_HERO = {
  ...ONE_SAADIYAT_PENTHOUSE_GALLERY[0],
  sourceLabel: "User-supplied One Saadiyat / Baccarat category rendering · Guggenheim outlook · Not an exact-unit view",
} as const;

const PROJECT_PRESENTATIONS: Record<string, PenthousePresentationProject> = {
  "nobu-residences": {
    title: "Nobu top-floor residences",
    narrative: "A top-floor Nobu Residences presentation centred on its full-floor scale, coastal Saadiyat setting and private-residence character. Confirm the exact outlook, terrace, pool and parking from the official unit record and registered documents.",
    imageUrl: "/manus-storage/penthouse-004_adead2cc.jpg",
    imageAlt: "Illustrative Saadiyat project rendering for a Nobu Residences presentation",
    sourceLabel: "Presentation image is an illustrative Saadiyat project rendering, not a Nobu exact-unit image",
  },
  onesaadiyat: {
    title: "Cultural District panorama",
    narrative: "A refined Saadiyat Cultural District setting designed for a client conversation around landmark architecture, museum-side living and sunset-facing project context. Confirm exact unit outlook, terrace and parking against the official unit record.",
    imageUrl: PENTHOUSES_GUGGENHEIM_HERO.url,
    imageAlt: PENTHOUSES_GUGGENHEIM_HERO.alt,
    sourceLabel: PENTHOUSES_GUGGENHEIM_HERO.sourceLabel,
    gallery: ONE_SAADIYAT_PENTHOUSE_GALLERY,
  },
  fountainviewresidences: {
    title: "Branded cultural outlook",
    narrative: "A presentation perspective for Mandarin Oriental Residences, centred on the Cultural District setting, private-residence lifestyle and landmark-facing project context. Exact outlook and terraces remain unit-specific and should be verified from the official record.",
    imageUrl: "/manus-storage/penthouse-002_3fb118cf.jpg",
    imageAlt: "Mandarin Oriental Residences project rendering with Cultural District outlook",
    sourceLabel: DECK_SOURCE_LABEL,
  },
  thearthouse: {
    title: "Creative waterfront setting",
    narrative: "A presentation perspective for The Arthouse, focused on its Cultural District setting and project-level rooftop, wellness and gallery-lifestyle context. Review the exact unit card for all published specifications.",
    imageUrl: "/manus-storage/penthouse-004_adead2cc.jpg",
    imageAlt: "The Arthouse project rendering in Saadiyat Cultural District",
    sourceLabel: DECK_SOURCE_LABEL,
  },
  "yas-links-luxury-living": {
    title: "Yas Links lifestyle",
    narrative: "A Yas Island presentation perspective around golf-course, mangrove and waterfront project context. Open the official unit record to confirm the exact penthouse orientation and any published outdoor space.",
    imageUrl: "/manus-storage/penthouse-005_107dd803.jpg",
    imageAlt: "Yas Links branded residences project rendering",
    sourceLabel: DECK_SOURCE_LABEL,
  },
  fahidbeachterraces: {
    title: "Beachfront arrival",
    narrative: "A project-level beachfront presentation for Fahid Beach Terraces, framing the waterfront promenade and landscaped coastal setting. The image is illustrative; confirm exact unit view and floor-plan details from the linked card documents.",
    imageUrl: "/manus-storage/penthouse-006_6e49452a.jpg",
    imageAlt: "Fahid Beach Terraces project rendering",
    sourceLabel: DECK_SOURCE_LABEL,
  },
};

export function isPenthousePresentationUnit(unit: {
  unit_name?: string | null;
  unit_type?: string | null;
  unit_category?: string | null;
  unit_model?: string | null;
  total_rooms?: string | null;
}, projectSlug?: string | null) {
  const officialLabel = [unit.unit_type, unit.unit_category, unit.unit_model, unit.total_rooms]
    .some(value => /penthouse/i.test(value ?? ""));
  const topFloorArthouse = projectSlug === "thearthouse"
    && /-08-02$/i.test(unit.unit_name ?? "")
    && /5BR\+M\s*\(SV\)/i.test(unit.unit_category ?? unit.unit_model ?? "");
  const topFloorNobu = projectSlug === "nobu-residences"
    && ["NobuResidences-B2-East-05-01", "NobuResidences-B2-West-05-01"].includes(unit.unit_name ?? "");
  return officialLabel || topFloorArthouse || topFloorNobu;
}

export function getPenthouseProjectPresentation(projectSlug: string | null | undefined) {
  return projectSlug ? PROJECT_PRESENTATIONS[projectSlug] ?? null : null;
}
