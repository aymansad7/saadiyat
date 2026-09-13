export type PenthousePresentationProject = {
  title: string;
  narrative: string;
  imageUrl: string;
  imageAlt: string;
  sourceLabel: string;
};

const DECK_SOURCE_LABEL = "User-supplied penthouse presentation deck · Project rendering · Illustrative, not an exact-unit view";

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
    imageUrl: "/manus-storage/penthouse-001_8d7858f4.jpg",
    imageAlt: "Baccarat Residences project rendering in Saadiyat Cultural District",
    sourceLabel: DECK_SOURCE_LABEL,
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
