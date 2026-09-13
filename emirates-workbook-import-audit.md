# Emirates Non-Aldar Projects — Source Audit

**Private source file:** `EmiratesOne_All_Properties.xlsx`, supplied by the owner on 13 September 2026. The workbook remains a private source artifact and is not exposed as a public website download.

## Source structure

The workbook contains a combined **All Properties** sheet with 1,020 available source rows, plus project-specific source sheets. The source does not provide sale prices, payment-plan values, geographic coordinates, or official developer URLs. It does provide unit identifiers, availability status, source-labelled internal/external/total area fields, property type, occasional floor/view/rating/description values, and a source explorer link.

| Requested display project | User-supplied location | Source sheet / source project | Source rows | Unique source unit numbers | Import decision |
|---|---|---|---:|---:|---|
| Jumeirah | Al Maryah Island | `Al Maryah Tower` | 255 | 253 | Import with a preserved source-name label; use the user-provided display name and location without changing source unit facts. |
| Elie Saab | Yas Island | `Stellar By Elie Saab` | 155 | 155 | Import as the documented source project behind the user-provided display name. |
| Hilton | Yas Island | `Hilton Al Raha` | 206 | 176 | Import as the selected Hilton source project behind the user-provided display name. |

The workbook also includes a separate `Hilton JLT` sheet with 404 source rows. It is not included in the requested three-project scope because the user requested Hilton on Yas Island. No attempt will be made to infer a connection between that excluded sheet and the requested Yas project.

## Data-integrity rules

1. The source column labels for areas will be retained verbatim. No area-unit conversion or reinterpretation will be performed.
2. A source row is **Available** only because the supplied workbook marks it so; it is not developer-verified operational availability.
3. There are no source prices, payment-plan facts, or map coordinates in this workbook. These fields will remain absent rather than inferred.
4. The Excel `ID` and project/source-row provenance will be retained so a future import can be audited without overwriting Aldar inventory.
