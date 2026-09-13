export const NOBU_REGISTERED_SALES_SOURCE_FILE = "AbuDhabi-Transactions-MasterExport_Column-Project-Nam-Nobu_2026-09-13.csv";
export const NOBU_REGISTERED_SALES_ACTOR = "owner-supplied-nobu-transactions-2026-09-13";

export type NobuTransactionRow = {
  sourceRow: number;
  saleApplicationDate: string;
  assetClass: string | null;
  propertyType: string | null;
  propertyLayout: string | null;
  projectName: string;
  registeredSellingPriceAed: number;
  saleableAreaSqm: number;
  registeredRateAedSqm: number | null;
  soldShare: number | null;
  landPlotGroundAreaSqm: number | null;
  saleApplicationType: string | null;
  saleSequence: string | null;
};

export type NobuSourceUnit = {
  unitName: string;
  buildingName: string;
  bedrooms: number | null;
  propertyType: "apartment" | "duplex";
  saleableAreaSqm: number | null;
};

export type NobuTransactionMatch = NobuTransactionRow & {
  buildingNumber: number | null;
  candidates: NobuSourceUnit[];
  matchType: "unit_exact" | "area_group";
  matchedUnitName: string | null;
  matchEvidence: string;
};

export function numberOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function bedroomsFromLayout(value: string | null | undefined): number | null {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function buildingNumberFromNobuLabel(value: string | null | undefined): number | null {
  const match = String(value ?? "").match(/(?:nobu\s*residences\s+|[-\s]b)(\d+)/i);
  return match ? Number(match[1]) : null;
}

export function normalizedNobuPropertyType(value: string | null | undefined): "apartment" | "duplex" {
  return /duplex/i.test(String(value ?? "")) ? "duplex" : "apartment";
}

export function matchNobuTransaction(row: NobuTransactionRow, units: NobuSourceUnit[]): NobuTransactionMatch {
  const buildingNumber = buildingNumberFromNobuLabel(row.projectName);
  const bedrooms = bedroomsFromLayout(row.propertyLayout);
  const propertyType = normalizedNobuPropertyType(row.propertyType);
  const candidates = units.filter(unit =>
    buildingNumberFromNobuLabel(unit.buildingName) === buildingNumber
    && unit.bedrooms === bedrooms
    && unit.propertyType === propertyType
    && unit.saleableAreaSqm != null
    && Math.abs(unit.saleableAreaSqm - row.saleableAreaSqm) <= 0.5,
  );
  const matchType = candidates.length === 1 ? "unit_exact" : "area_group";
  const matchedUnitName = matchType === "unit_exact" ? candidates[0]!.unitName : null;
  const candidateNames = candidates.map(candidate => candidate.unitName).join(", ");
  const matchEvidence = `${row.projectName} · ${row.propertyLayout ?? "layout not stated"} · ${propertyType} · ${row.saleableAreaSqm.toFixed(2)} m² · ${candidates.length === 1 ? `unique unit candidate ${matchedUnitName}` : `${candidates.length} matching unit candidates (${candidateNames || "none"})`}`;
  return { ...row, buildingNumber, candidates, matchType, matchedUnitName, matchEvidence };
}
