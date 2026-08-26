export type PropertyScope = {
  areaKey: string;
  projectKey: string;
};

export type GrantLike = {
  areaKey: string | null;
  projectKey: string | null;
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canEditProperties: boolean;
};

export type PropertyPermissions = {
  canAccess: boolean;
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canEditProperties: boolean;
};

const SAADIYAT_PROJECTS = new Set([
  "st-regis",
  "jawaher",
  "saadiyat-beach-villas",
  "saadiyat-golf-views",
  "hidd",
  "private-villas",
  "lagoons",
  "four-seasons",
  "huge-plot",
  "saadiyat-reserve",
  "lagoons-hidden-sl9",
  "lagoons-hidden-sl10",
  "lagoons-sl13",
  "nudra",
  "private-owners-vip",
  "building-plots-sdw4",
]);

export const PROPERTY_AREA_OPTIONS = [
  { value: "saadiyat", label: "Saadiyat Island" },
  { value: "yas-island", label: "Yas Island" },
  { value: "fahid-island", label: "Fahid Island" },
  { value: "al-shamkha", label: "Al Shamkha" },
  { value: "al-ghadeer", label: "Al Ghadeer" },
  { value: "dubai", label: "Dubai" },
  { value: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { value: "other", label: "Other projects" },
] as const;

export const PROPERTY_PROJECT_OPTIONS = [
  { value: "st-regis", label: "St. Regis Villas" },
  { value: "jawaher", label: "Jawaher" },
  { value: "saadiyat-beach-villas", label: "Saadiyat Beach Villas" },
  { value: "saadiyat-golf-views", label: "Saadiyat Beach Golf Views" },
  { value: "hidd", label: "Hidd Al Saadiyat" },
  { value: "private-villas", label: "Private Villas · Four Seasons" },
  { value: "lagoons", label: "Saadiyat Lagoons" },
  { value: "four-seasons", label: "Four Seasons Private Residences" },
  { value: "huge-plot", label: "Huge Plot · Four Seasons / Omniyat" },
  { value: "saadiyat-reserve", label: "Saadiyat Reserve · Dunes" },
  { value: "lagoons-hidden-sl9", label: "Lagoons · Hidden Phase SL9" },
  { value: "lagoons-hidden-sl10", label: "Lagoons · Hidden Phase SL10" },
  { value: "lagoons-sl13", label: "Lagoons · Phase SL13" },
  { value: "nudra", label: "Nudra by IMKAN" },
  { value: "private-owners-vip", label: "Private Owners VIP" },
  { value: "building-plots-sdw4", label: "Building Plots SDW4 · NYU Precinct" },
] as const;

/** Turns a canonical community/project key into the scope used by grants. */
export function getPropertyScope(projectKey: string): PropertyScope {
  if (SAADIYAT_PROJECTS.has(projectKey) || projectKey === "aldar-saadiyat" || projectKey.includes("saadiyat")) {
    return { areaKey: "saadiyat", projectKey };
  }
  if (projectKey === "aldar-other") {
    return { areaKey: "other", projectKey };
  }
  if (projectKey.includes("yas") || projectKey.includes("noya")) {
    return { areaKey: "yas-island", projectKey };
  }
  if (projectKey.includes("dubai") || projectKey.includes("athlon")) {
    return { areaKey: "dubai", projectKey };
  }
  if (projectKey.includes("fahid")) {
    return { areaKey: "fahid-island", projectKey };
  }
  if (projectKey.includes("shamkha") || projectKey.includes("reeman")) {
    return { areaKey: "al-shamkha", projectKey };
  }
  if (projectKey.includes("ghadeer")) {
    return { areaKey: "al-ghadeer", projectKey };
  }
  if (projectKey.includes("marjan")) {
    return { areaKey: "ras-al-khaimah", projectKey };
  }
  return { areaKey: "other", projectKey };
}

export function grantAppliesToScope(grant: Pick<GrantLike, "areaKey" | "projectKey">, scope: PropertyScope) {
  return grant.projectKey === scope.projectKey || (!grant.projectKey && grant.areaKey === scope.areaKey);
}

export function resolvePropertyPermissions(
  role: string | null | undefined,
  grants: GrantLike[],
  scope: PropertyScope,
): PropertyPermissions {
  // Preserve the established admin/master operational model. Grants let a
  // Master selectively delegate visibility and editing to standard users.
  if (role === "master" || role === "admin") {
    return {
      canAccess: true,
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: true,
      canEditProperties: true,
    };
  }

  const applicable = grants.filter(grant => grantAppliesToScope(grant, scope));
  return {
    canAccess: applicable.length > 0,
    canViewOriginalPrice: applicable.some(grant => grant.canViewOriginalPrice),
    canViewOwnerName: applicable.some(grant => grant.canViewOwnerName),
    canViewOwnerPhone: applicable.some(grant => grant.canViewOwnerPhone),
    canEditProperties: applicable.some(grant => grant.canEditProperties),
  };
}
