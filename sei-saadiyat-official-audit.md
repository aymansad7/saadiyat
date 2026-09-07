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

The supplied locator for `SeiSaadiyat-T6-16-02` also opened the official Sei interactive environment and focused the **Sei Six** building. The reviewed route does not publish a separate stable URL parameter for Floor 16, so any website label may identify `Building 6 · Floor 16` from the source unit code, but must continue to open the exact supplied locator rather than fabricate a floor-only World of Aldar URL.

## Sync boundary

The workbook is an owner-supplied Aldar export and records `New` as its source status. It contains no published unit prices at capture. A subsequent official price sync may update a unit only when an official source supplies a value tied to that exact source unit code or supplied unit identifier.

## Hourly official price monitoring — Sep 7, 2026

- The live official page `https://world.aldar.com/uae/abudhabi/seisaadiyat` returned all 778 source unit codes at the time of verification.
- Its current unit `price` fields were blank; the known AED 1 placeholder is explicitly excluded from price-publication detection.
- Heartbeat task `HXDpFLpNDP7FMuqLNLkYw6` (`sei-saadiyat-hourly-price-monitor`) invokes `/api/scheduled/seiPriceMonitor` each hour from 08:00 through 23:00 Gulf time (`0 0 4-19 * * *` UTC). The handler skips runs before 2026-09-08 08:00 Gulf, so its first effective monitoring window is tomorrow.
- On the first valid official unit price, the handler records the unit-level price history, notifies the project owner, archives the captured official HTML privately in OneDrive, then pauses this monitoring task. It does not treat AED 0, a blank value, or AED 1 as a published price.

## Preview verification

On 7 September 2026, the Sei project route in the preview resolved to the protected Saadiyat Resale Hub sign-in gate without a session. This confirms that project data is not exposed in the unauthenticated preview. Server tests verify the imported six-building structure; an authenticated Master Admin session is needed for a visual card review.
