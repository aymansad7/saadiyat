export type FahidOwnerSourceRow = {
  sourceRow: number;
  sourceUnit: string;
  ownerName: string;
  ownerPhone: string | null;
  rawMobile: string;
};

export type FahidUnitCandidate = {
  projectName: string;
  projectSlug: string;
  buildingKey: string;
  buildingName: string;
  unitName: string;
  unitTypeKey: string | null;
  bedrooms: number | null;
};

export type FahidProjectCandidate = {
  projectName: string;
  projectSlug: string;
  units: FahidUnitCandidate[];
};

export type FahidLinkedRecord = FahidOwnerSourceRow & FahidUnitCandidate & {
  status: "linked";
  community: "aldar-other";
  villaKey: string;
  matchBasis: string;
};

export type FahidUnlinkedRecord = FahidOwnerSourceRow & {
  status: "unlinked";
  community: null;
  villaKey: null;
  reason: "invalid_unit_format" | "no_exact_unit_in_identified_project" | "ambiguous_unit_in_identified_project";
};

export type FahidImportPlan = {
  identifiedProject: { name: string; slug: string };
  projectEvidenceCounts: Record<string, number>;
  linked: FahidLinkedRecord[];
  unlinked: FahidUnlinkedRecord[];
};

const unitPattern = /^B\d+-\d{2}-\d{2}$/i;

export function normalizeOwnerPhone(value: string | null | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw || raw === "***") return null;
  return raw.replace(/[^0-9+]/g, "") || null;
}

/**
 * Contacts without an actual phone value never merge merely because their label
 * is generic (for example, VIP/VVIP); each source unit remains separately
 * reviewable in the owner directory.
 */
export function ownerIdentityKey(input: { ownerName: string; ownerPhone?: string | null; sourceUnit: string }) {
  const name = input.ownerName.trim().replace(/\s+/g, " ").toLocaleUpperCase();
  const phone = normalizeOwnerPhone(input.ownerPhone);
  return phone ? `${name}|${phone}` : `${name}|${input.sourceUnit.trim().toLocaleUpperCase()}`;
}

function unitCode(unitName: string) {
  const parts = unitName.trim().split("-");
  return parts.length >= 4 ? parts.slice(-3).join("-").toLocaleUpperCase() : null;
}

/**
 * The workbook deliberately omits a project prefix. B8–B11 give source-backed
 * project evidence because their exact codes occur only under The Beach House
 * Fahid in the loaded inventory. Once the project is selected, every row still
 * needs an exact unit-code match; no area/name/price heuristic is allowed.
 */
export function planFahidOwnerImport(
  rows: FahidOwnerSourceRow[],
  projects: FahidProjectCandidate[],
): FahidImportPlan {
  const indexes = new Map<string, Map<string, FahidUnitCandidate[]>>();
  for (const project of projects) {
    const index = new Map<string, FahidUnitCandidate[]>();
    for (const unit of project.units) {
      const code = unitCode(unit.unitName);
      if (!code) continue;
      const candidates = index.get(code) ?? [];
      candidates.push(unit);
      index.set(code, candidates);
    }
    indexes.set(project.projectSlug, index);
  }

  const highBuildingCodes = rows
    .map(row => row.sourceUnit.trim().toLocaleUpperCase())
    .filter(code => /^B(?:8|9|10|11)-/.test(code));
  const projectEvidenceCounts = Object.fromEntries(projects.map(project => {
    const index = indexes.get(project.projectSlug)!;
    const count = highBuildingCodes.filter(code => (index.get(code) ?? []).length === 1).length;
    return [project.projectSlug, count];
  }));
  const ranking = [...projects]
    .map(project => ({ project, evidence: projectEvidenceCounts[project.projectSlug] ?? 0 }))
    .sort((a, b) => b.evidence - a.evidence || a.project.projectSlug.localeCompare(b.project.projectSlug));
  const winner = ranking[0];
  if (!winner || winner.evidence === 0 || ranking[1]?.evidence === winner.evidence) {
    throw new Error("FAHAD project cannot be identified uniquely from B8–B11 evidence.");
  }

  const selectedIndex = indexes.get(winner.project.projectSlug)!;
  const linked: FahidLinkedRecord[] = [];
  const unlinked: FahidUnlinkedRecord[] = [];
  for (const row of rows) {
    const sourceUnit = row.sourceUnit.trim().toLocaleUpperCase();
    if (!unitPattern.test(sourceUnit)) {
      unlinked.push({ ...row, sourceUnit, status: "unlinked", community: null, villaKey: null, reason: "invalid_unit_format" });
      continue;
    }
    const candidates = selectedIndex.get(sourceUnit) ?? [];
    if (candidates.length !== 1) {
      unlinked.push({
        ...row,
        sourceUnit,
        status: "unlinked",
        community: null,
        villaKey: null,
        reason: candidates.length === 0 ? "no_exact_unit_in_identified_project" : "ambiguous_unit_in_identified_project",
      });
      continue;
    }
    const unit = candidates[0]!;
    linked.push({
      ...row,
      ...unit,
      sourceUnit,
      status: "linked",
      community: "aldar-other",
      villaKey: `aldar-other/${winner.project.projectSlug}/${unit.buildingKey}/${unit.unitName}`,
      matchBasis: "Workbook B8–B11 sequence uniquely identifies the selected Fahid project; exact unit code matched in that project.",
    });
  }
  return {
    identifiedProject: { name: winner.project.projectName, slug: winner.project.projectSlug },
    projectEvidenceCounts,
    linked,
    unlinked,
  };
}
