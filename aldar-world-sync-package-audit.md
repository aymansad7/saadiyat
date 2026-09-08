# Aldar World Sync Integration Package — Review Notes

## Scope and safety

The project-owner supplied `Aldar_World_Sync_Integration_Package.zip` on 8 September 2026. Its archive was indexed without executing the included Python reference script. The package contained an Arabic API guide, findings, route metadata, discovery audit JSON, and a reference Python file.

## Claimed public source flow requiring independent verification

The guide describes a two-stage public World of Aldar flow:

1. Request the Sei project page as React Server Components Flight data at `https://world.aldar.com/uae/abudhabi/seisaadiyat` using `Accept: text/x-component` and `RSC: 1`. It claims the page exposes unit records with `unitNumber`, `locationId`, `unitStatus`, and a raw `price` field.
2. Request `https://propertyservice.world.aldar.com/api/v2/units/unit-detail?location_id={LOCATION_ID}&kiosk=false` for unit-level fields. The guide identifies `data.unitDetail.SellingPrice__c`, `CurrencyIsoCode`, `Status__c`, reservation, payment plans, and offers as relevant fields.

These are **claims from the supplied package**, not adopted production behavior until independently confirmed against the official endpoint.

## Sei-specific pricing rule

The guide identifies blank values, zero, and AED 1 as non-published/placeholder values for Sei. The existing project rule independently matches this: a price is eligible only when it is a finite AED value greater than 1. The live Sei page checked on 8 September 2026 returned 778 unit records and no eligible prices.

## Integration implications

The existing hourly Sei monitor currently checks the official project page and captures unit records. The package may improve it by adding an independently verified `unit-detail` request for exact `locationId` values; that would enable price, reservation, payment-plan, and offer detection earlier than the project page alone, but should use bounded concurrency, retry/backoff, source provenance, and no browser-side requests.

## Independent verification and adopted improvement

On 8 September 2026, the public `unit-detail` endpoint returned HTTP 200 for the exact Sei source `locationId` and identified the same source unit code, AED currency, `New` status, AED 1 placeholder price, and AED 100,000 reservation amount. The Sei monitor now uses the official project capture to obtain exact `locationId` values and resolves details server-side with a concurrency limit of eight requests. It accepts `SellingPrice__c` only where `CurrencyIsoCode` is AED and the numeric value exceeds 1. It records reservation, payment-plan, and offer fields only when present, retains source location provenance, and archives verified source evidence only on first price publication.

## Primary URLs to verify

- `https://world.aldar.com/uae/abudhabi/seisaadiyat`
- `https://propertyservice.world.aldar.com/api/v2/units/unit-detail?location_id=a2DTq000013gDWWMA2&kiosk=false`
