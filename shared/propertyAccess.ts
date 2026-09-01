export type PropertyScope = {
  areaKey: string;
  projectKey: string;
  phaseKey?: string | null;
  buildingKey?: string | null;
  unitTypeKey?: string | null;
  bedrooms?: number | null;
};

export type GrantLike = {
  areaKey: string | null;
  projectKey: string | null;
  phaseKey?: string | null;
  buildingKey?: string | null;
  unitTypeKey?: string | null;
  bedrooms?: number | null;
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canViewOwnerDocuments?: boolean;
  canEditProperties: boolean;
};

export type PropertyPermissions = {
  canAccess: boolean;
  canViewOriginalPrice: boolean;
  canViewOwnerName: boolean;
  canViewOwnerPhone: boolean;
  canViewOwnerDocuments: boolean;
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

/** Source-backed phase labels that can be delegated without exposing an entire project. */
export const PROPERTY_PHASE_OPTIONS = [
  { value: "lagoons::SL2", projectKey: "lagoons", phaseKey: "SL2", label: "Saadiyat Lagoons · SL2 · Ethir" },
  { value: "lagoons::SL3", projectKey: "lagoons", phaseKey: "SL3", label: "Saadiyat Lagoons · SL3 · Al Sidr" },
  { value: "lagoons::SL4", projectKey: "lagoons", phaseKey: "SL4", label: "Saadiyat Lagoons · SL4 · Al Ghaf" },
  { value: "lagoons::SL5", projectKey: "lagoons", phaseKey: "SL5", label: "Saadiyat Lagoons · SL5 · Al Sidr" },
  { value: "lagoons::SL7", projectKey: "lagoons", phaseKey: "SL7", label: "Saadiyat Lagoons · SL7 · Al Ghaf" },
  { value: "lagoons::SL8", projectKey: "lagoons", phaseKey: "SL8", label: "Saadiyat Lagoons · SL8 · Al Ghaf" },
  { value: "saadiyat-reserve::PHASE-1", projectKey: "saadiyat-reserve", phaseKey: "PHASE-1", label: "Saadiyat Reserve · Phase 1" },
  { value: "saadiyat-reserve::PHASE-2", projectKey: "saadiyat-reserve", phaseKey: "PHASE-2", label: "Saadiyat Reserve · Phase 2" },
  { value: "saadiyat-reserve::PHASE-3", projectKey: "saadiyat-reserve", phaseKey: "PHASE-3", label: "Saadiyat Reserve · Phase 3 · Dunes" },
] as const;

/**
 * A stable client key for an exact access scope. Keeping all narrowing fields
 * in the key prevents a permission granted for one building, type, or bedroom
 * count from being reused by another property in the same project or phase.
 */
export function propertyScopeKey(scope: Pick<PropertyScope, "projectKey" | "phaseKey" | "buildingKey" | "unitTypeKey" | "bedrooms">): string;
export function propertyScopeKey(projectKey: string, phaseKey?: string | null, buildingKey?: string | null, unitTypeKey?: string | null, bedrooms?: number | null): string;
export function propertyScopeKey(
  scopeOrProject: Pick<PropertyScope, "projectKey" | "phaseKey" | "buildingKey" | "unitTypeKey" | "bedrooms"> | string,
  phaseKey?: string | null,
  buildingKey?: string | null,
  unitTypeKey?: string | null,
  bedrooms?: number | null,
) {
  const scope = typeof scopeOrProject === "string"
    ? { projectKey: scopeOrProject, phaseKey, buildingKey, unitTypeKey, bedrooms }
    : scopeOrProject;
  return [
    scope.projectKey,
    scope.phaseKey ?? "",
    scope.buildingKey ?? "",
    scope.unitTypeKey ?? "",
    scope.bedrooms ?? "",
  ].join("::");
}

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

export function grantAppliesToScope(
  grant: Pick<GrantLike, "areaKey" | "projectKey" | "phaseKey" | "buildingKey" | "unitTypeKey" | "bedrooms">,
  scope: PropertyScope,
) {
  if (grant.phaseKey) {
    if (grant.projectKey !== scope.projectKey || grant.phaseKey !== scope.phaseKey) return false;
  } else if (!(grant.projectKey === scope.projectKey || (!grant.projectKey && grant.areaKey === scope.areaKey))) {
    return false;
  }
  // Every extra constraint makes a grant narrower. Missing source metadata must
  // never accidentally satisfy a building/type/bedroom-specific grant.
  if (grant.buildingKey && grant.buildingKey !== scope.buildingKey) return false;
  if (grant.unitTypeKey && grant.unitTypeKey !== scope.unitTypeKey) return false;
  if (grant.bedrooms != null && grant.bedrooms !== scope.bedrooms) return false;
  return true;
}

export function resolvePropertyPermissions(
  role: string | null | undefined,
  grants: GrantLike[],
  scope: PropertyScope,
): PropertyPermissions {
  // Master Admin alone has universal operational visibility. Every other
  // account, including role=admin, must satisfy an explicit, scoped grant.
  if (role === "master") {
    return {
      canAccess: true,
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: true,
      canViewOwnerDocuments: true,
      canEditProperties: true,
    };
  }

  const applicable = grants.filter(grant => grantAppliesToScope(grant, scope));
  return {
    canAccess: applicable.length > 0,
    canViewOriginalPrice: applicable.some(grant => grant.canViewOriginalPrice),
    canViewOwnerName: applicable.some(grant => grant.canViewOwnerName),
    canViewOwnerPhone: applicable.some(grant => grant.canViewOwnerPhone),
    canViewOwnerDocuments: applicable.some(grant => Boolean(grant.canViewOwnerDocuments)),
    canEditProperties: applicable.some(grant => grant.canEditProperties),
  };
}
