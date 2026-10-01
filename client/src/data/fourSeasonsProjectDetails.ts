export const FOUR_SEASONS_PROJECT_DETAILS = {
  sourceLabel: "Official fact sheet · V5 · 5 September 2025",
  sourceNote: "Project-level source. Specifications, materials, and brands remain subject to the developer’s final confirmation and may be substituted by the developer.",
  collections: [
    "Golf Villas",
    "Garden Villas",
    "Golf View Villas",
    "Sea Side Villas",
    "The Beach Mansions",
    "Royal Beach Mansion",
  ],
  residenceCollections: ["Golf", "Garden", "Sea", "Royal"],
  amenities: [
    "Beach lounge",
    "Adult, kids and lap pools",
    "Poolside bar",
    "Thermo and treatment rooms",
    "Gym with fitness studio",
    "Padel court",
    "Golf simulation room",
    "Meeting room",
    "Multi-use tennis court with pavilion",
    "Kids play areas",
    "Pet grooming",
    "Theatre",
    "Owners lounge",
    "Cigar lounge",
    "Multi-function room",
  ],
  interiorPalettes: ["Light", "Semi-Dark"],
  serviceCharges: [
    { residenceType: "Villas", aedPerSqft: 24, aedPerSqm: 258.33 },
    { residenceType: "Apartments", aedPerSqft: 61, aedPerSqm: 656.6 },
  ],
  serviceChargeSource: "Owner-supplied service-charge reference · 1 October 2026. The source did not specify a fiscal period or escalation.",
  indicativeSpecifications: [
    "Chef’s kitchens by Molteni with Gaggenau appliances; secondary kitchens by Fabal Casa or Nolte with Miele appliances.",
    "Bathrooms with Gessi fittings, Agape bathtubs and basins, and Toto WC units.",
    "Principal-bedroom wardrobes by Molteni and MisuraEmme.",
    "Travertine in living/dining/terrace areas, wood flooring in bedrooms, and porcelain in service areas.",
    "Smart lighting by Lutron with Lasvit lighting in key areas; a safe in each principal bedroom.",
  ],
  nearbyMinutes: [
    { destination: "Saadiyat Beach Golf Club", minutes: 5 },
    { destination: "Guggenheim Museum Abu Dhabi", minutes: 10 },
    { destination: "Louvre Abu Dhabi", minutes: 10 },
    { destination: "NYU Abu Dhabi", minutes: 10 },
    { destination: "Harrow International School Abu Dhabi", minutes: 15 },
    { destination: "ADGM / Al Maryah Island", minutes: 20 },
    { destination: "Zayed International Airport", minutes: 20 },
    { destination: "Al Bateen Executive Airport / Jetex Abu Dhabi", minutes: 25 },
    { destination: "Al Maktoum International Airport", minutes: 60 },
  ],
} as const;

export type FourSeasonsProjectDocumentLinks = {
  factSheetUrl: string;
  numberedMasterPlanUrl: string;
  collectionsMasterPlanUrl: string;
};

export const FOUR_SEASONS_PROJECT_DOCUMENT_LINKS: FourSeasonsProjectDocumentLinks = {
  factSheetUrl: "https://nasluxury-my.sharepoint.com/:b:/p/ayman/IQBP-XONAy9xR4blczXk768_AdkJGFG1MlOMVUXwB0Ltbno",
  numberedMasterPlanUrl: "https://nasluxury-my.sharepoint.com/:b:/p/ayman/IQCSVqolGdAnRbXtrNKOWExtAeV6w2JrL0xc7GiY8lD-MtU",
  collectionsMasterPlanUrl: "https://nasluxury-my.sharepoint.com/:b:/p/ayman/IQAppKSGrxipRY7YkUTRq87RAUha_KHkJphzgS6-vd9XnWU",
};
