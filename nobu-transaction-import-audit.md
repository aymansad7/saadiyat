# Nobu Registered Sale Prices — Matching Audit

**Source file:** `AbuDhabi-Transactions-MasterExport_Column-Project-Nam-Nobu_2026-09-13.csv` (user-supplied on 2026-09-13)

## Source profile

The supplied export contains **99** Nobu transaction rows across *Nobu Residences 1* and *Nobu Residences 2*. Its fields identify a transaction date, project/building number, property type, bedroom layout, sold area, registered sale price, rate per square metre, and primary/secondary sequence. It contains **no exact unit reference**.

## Deterministic area matching

Matching against the stored Aldar Nobu inventory uses building number, apartment/duplex type, bedroom count, and saleable area with a documented decimal tolerance of 0.50 m². The analysis found:

| Result | Rows | Handling |
|---|---:|---|
| Unique unit candidate | 20 | Eligible for a unit-specific registered-sale history item after import validation. |
| Multiple unit candidates | 79 | Not assigned to any exact card. These remain project/model-area market evidence because the export has no exact unit code. |
| No candidate | 0 | N/A. |

No supplied transaction replaces an Aldar official price, availability state, or an earlier transaction. An imported record must appear as **Registered Selling Price**, retaining its date, source-file identity, sale sequence, sold area, and matching confidence.

## Import result

The idempotent import completed on 2026-09-13 with **99 source rows inserted** and no pre-existing rows retained on the first run. The append-only transaction table now holds 20 `unit_exact` rows with a named unit and 79 `area_group` rows with `matchedUnitName = NULL`. The card-level history is restricted to Master Admin and reads only the 20 uniquely matched rows; it never displays an ambiguous transaction as an individual unit sale.

## Nobu penthouse classification evidence

The client-facing Penthouses collection includes only the documented top-floor residences:

| Unit | Building | Floor | Saleable area | Stored Aldar state | Rationale |
|---|---|---:|---:|---|---|
| `NobuResidences-B2-East-05-01` | B2 East | 5 | 1,435.42 m² | Available | Documented full-floor top residence; Aldar unit search lists a 3BR Penthouse at about 15,451 sqft. |
| `NobuResidences-B2-West-05-01` | B2 West | 5 | 1,430.34 m² | Sold | Matches Aldar's official 18 March 2024 Nobu penthouse sale announcement by price-per-m² scale and top-floor/full-floor profile. |

The other floor-eight B1 Nobu apartments are not classified as penthouses merely because of their floor position. The two B2 residences use the visible label **Top-floor penthouse** rather than inventing an unprovided individual unit label.

## External source

1. [Aldar — AED 137 Million Penthouse at Aldar Nobu Residences](https://www.aldar.com/en/news-and-media/aed-137-million-penthouse-at-aldar-nobu-residences), published 18 March 2024.
