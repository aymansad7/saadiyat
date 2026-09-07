# Sei Saadiyat — Official Source Audit

## Supplied unit workbook

The project-owner supplied `Aldar_Sei_Saadiyat_778_Units_FULL.xlsx` on 7 September 2026. Its `All Units` sheet contains 778 source rows, assigned to six source towers: T1–T6.

| Website building | Source tower | Source units | Price source state | Source status |
|---|---:|---:|---|---|
| Building 1 | T1 | 57 | `publishedPriceAED` is zero for all rows | New |
| Building 2 | T2 | 208 | `publishedPriceAED` is zero for all rows | New |
| Building 3 | T3 | 70 | `publishedPriceAED` is zero for all rows | New |
| Building 4 | T4 | 129 | `publishedPriceAED` is zero for all rows | New |
| Building 5 | T5 | 147 | `publishedPriceAED` is zero for all rows | New |
| Building 6 | T6 | 167 | `publishedPriceAED` is zero for all rows | New |

The total is 778. A zero price is treated as **unpublished**, not as AED 0 and not as an operational availability value.

## Official link validation

On 7 September 2026, the supplied link for `SeiSaadiyat-T4-05-07` loaded the official World of Aldar **Sei Saadiyat** interactive environment with its supplied `unit` identifier as the query parameter. It did not expose a stable path containing the human unit code. The import must therefore retain the supplied URL verbatim as its exact source route and must not derive a lookalike unit path.

## Sync boundary

The workbook is an owner-supplied Aldar export and records `New` as its source status. It contains no published unit prices at capture. A subsequent official price sync may update a unit only when an official source supplies a value tied to that exact source unit code or supplied unit identifier.

## Preview verification

On 7 September 2026, the Sei project route in the preview resolved to the protected Saadiyat Resale Hub sign-in gate without a session. This confirms that project data is not exposed in the unauthenticated preview. Server tests verify the imported six-building structure; an authenticated Master Admin session is needed for a visual card review.
