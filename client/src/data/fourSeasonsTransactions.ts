import { FOUR_SEASONS_PENDING_TRANSACTIONS } from "@/data/fourSeasonsPendingTransactions";

export type FourSeasonsTransactionConfidence = "confirmed" | "possible";

export type FourSeasonsTransactionMatch = {
  id: string;
  sourceRow: number;
  villaKey: string;
  villaNumber: number;
  date: string;
  priceAed: number;
  landAreaSqm: number;
  builtUpAreaSqm: number;
  saleSequence: string;
  saleApplicationType: string;
  confidence: FourSeasonsTransactionConfidence;
  matchBasis: "user_confirmed" | "unique_exact_plot_area" | "possible_plot_and_sellable_area";
  plotAreaSqm: number | null;
  landDifferenceSqm: number | null;
  sellableDifferenceSqm: number | null;
  note: string;
};

type MatchDecision = Pick<
  FourSeasonsTransactionMatch,
  | "sourceRow"
  | "villaNumber"
  | "confidence"
  | "matchBasis"
  | "plotAreaSqm"
  | "landDifferenceSqm"
  | "sellableDifferenceSqm"
  | "note"
>;

/**
 * Explicit, reviewable decisions only. Nothing is auto-assigned at runtime.
 * Developer documents label the internal total as Sellable Area, while ADREC
 * labels its field BUA, so sellable/BUA is secondary evidence only.
 */
const MATCH_DECISIONS: readonly MatchDecision[] = [
  {
    sourceRow: 2,
    villaNumber: 9,
    confidence: "confirmed",
    matchBasis: "user_confirmed",
    plotAreaSqm: null,
    landDifferenceSqm: null,
    sellableDifferenceSqm: null,
    note: "Confirmed by the user on 23 Aug 2026: the AED 350M municipal sale belongs to Villa 9.",
  },
  {
    sourceRow: 5,
    villaNumber: 38,
    confidence: "confirmed",
    matchBasis: "unique_exact_plot_area",
    plotAreaSqm: 13662 / 10.764,
    landDifferenceSqm: Math.abs(1269.23 - 13662 / 10.764),
    sellableDifferenceSqm: Math.abs(1621.27 - 17451 / 10.764),
    note: "Exact plot-area match to the supplied Villa 38 developer floorplan; nearest alternative is materially less precise.",
  },
  {
    sourceRow: 7,
    villaNumber: 40,
    confidence: "confirmed",
    matchBasis: "unique_exact_plot_area",
    plotAreaSqm: 13709 / 10.764,
    landDifferenceSqm: Math.abs(1273.62 - 13709 / 10.764),
    sellableDifferenceSqm: Math.abs(1621.27 - 17451 / 10.764),
    note: "Exact plot-area match to the supplied Villa 40 developer floorplan; nearest alternative is materially less precise.",
  },
  {
    sourceRow: 3,
    villaNumber: 14,
    confidence: "possible",
    matchBasis: "possible_plot_and_sellable_area",
    plotAreaSqm: 14116 / 10.764,
    landDifferenceSqm: Math.abs(1304.38 - 14116 / 10.764),
    sellableDifferenceSqm: Math.abs(1776.63 - 19123 / 10.764),
    note: "Possible only: plot-area delta is within 10 m² and the developer Sellable Area closely aligns with ADREC BUA.",
  },
  {
    sourceRow: 11,
    villaNumber: 21,
    confidence: "possible",
    matchBasis: "possible_plot_and_sellable_area",
    plotAreaSqm: 13938 / 10.764,
    landDifferenceSqm: Math.abs(1299.45 - 13938 / 10.764),
    sellableDifferenceSqm: Math.abs(1621.27 - 17451 / 10.764),
    note: "Possible only: plot-area delta is within 5 m² and the developer Sellable Area closely aligns with ADREC BUA.",
  },
] as const;

const RAW_BY_SOURCE_ROW = new Map<number, (typeof FOUR_SEASONS_PENDING_TRANSACTIONS)[number]>(
  FOUR_SEASONS_PENDING_TRANSACTIONS.map((transaction) => [transaction.sourceRow, transaction] as const),
);

export const FOUR_SEASONS_TRANSACTION_MATCHES = MATCH_DECISIONS.map((decision) => {
  const raw = RAW_BY_SOURCE_ROW.get(decision.sourceRow);
  if (!raw) throw new Error(`Missing Four Seasons source row ${decision.sourceRow}`);
  return {
    id: raw.id,
    sourceRow: raw.sourceRow,
    villaKey: `four-seasons/villa-${decision.villaNumber}`,
    villaNumber: decision.villaNumber,
    date: raw.date,
    priceAed: raw.priceAed,
    landAreaSqm: raw.landAreaSqm,
    builtUpAreaSqm: raw.builtUpAreaSqm,
    saleSequence: raw.saleSequence,
    saleApplicationType: raw.saleApplicationType,
    confidence: decision.confidence,
    matchBasis: decision.matchBasis,
    plotAreaSqm: decision.plotAreaSqm,
    landDifferenceSqm: decision.landDifferenceSqm,
    sellableDifferenceSqm: decision.sellableDifferenceSqm,
    note: decision.note,
  } satisfies FourSeasonsTransactionMatch;
});

const MATCHES_BY_VILLA = new Map<number, FourSeasonsTransactionMatch[]>();
for (const transaction of FOUR_SEASONS_TRANSACTION_MATCHES) {
  const current = MATCHES_BY_VILLA.get(transaction.villaNumber) ?? [];
  current.push(transaction);
  current.sort((a, b) => a.date.localeCompare(b.date));
  MATCHES_BY_VILLA.set(transaction.villaNumber, current);
}

export function getFourSeasonsTransactions(villaNumber: number): readonly FourSeasonsTransactionMatch[] {
  return MATCHES_BY_VILLA.get(villaNumber) ?? [];
}

const DECIDED_SOURCE_ROWS = new Set(FOUR_SEASONS_TRANSACTION_MATCHES.map((transaction) => transaction.sourceRow));

export const FOUR_SEASONS_UNMATCHED_TRANSACTIONS = FOUR_SEASONS_PENDING_TRANSACTIONS.filter(
  (transaction) => !DECIDED_SOURCE_ROWS.has(transaction.sourceRow),
);

export const FOUR_SEASONS_TRANSACTION_SUMMARY = {
  total: FOUR_SEASONS_PENDING_TRANSACTIONS.length,
  confirmed: FOUR_SEASONS_TRANSACTION_MATCHES.filter((transaction) => transaction.confidence === "confirmed").length,
  possible: FOUR_SEASONS_TRANSACTION_MATCHES.filter((transaction) => transaction.confidence === "possible").length,
  unmatched: FOUR_SEASONS_UNMATCHED_TRANSACTIONS.length,
} as const;
