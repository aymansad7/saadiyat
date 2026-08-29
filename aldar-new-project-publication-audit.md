# Aldar New-Project Publication Audit

## Scope

This audit examines the public World of Aldar experience for newly surfaced projects or inventory in Saadiyat Cultural District and Marsa Al Saadiyat. It records only data that can be confirmed from official public pages. A project label alone is not treated as a published project inventory record.

## Initial public-map findings — 29 Aug 2026

The official Abu Dhabi World of Aldar map exposes selectable districts for **Saadiyat Cultural District**, **Fahid Island**, and **Marsa Al Saadiyat**. After selecting Saadiyat Cultural District, the visible product cards include Manarat Living III, Manarat Living, The Source Terraces, Mamsha Garden, Mamsha Palm, The Arthouse, The Source, The Source II, Manarat Living II, Mandarin Oriental, Nobu Residences, Louvre Abu Dhabi Residences, The Row Saadiyat, Saadiyat Grove, and Baccarat Residences Saadiyat.

**Pulse District** appears as a district label on the official map but, in the public page state inspected, has no Explore card, linked project URL, unit identifier, availability count, or price. It is therefore recorded provisionally as **Coming Soon / no published unit inventory found on the map**. This status must be rechecked against a direct official page or public API response before any site entry is considered.

Marsa Al Saadiyat is exposed as a separate map district and is being checked separately against Aldar's official project and launch information.

## Marsa Al Saadiyat public availability result

The official Marsa Al Saadiyat landing page is a master-plan and registration page. It describes future private mansions, luxury villas, waterfront apartments, and branded residences, but it does **not** publish a project-by-project product list, individual unit identifiers, availability states, unit prices, or downloadable price list. The official World of Aldar Marsa map state similarly shows district amenity markers only; its rendered DOM provided no project hyperlinks for a unit-level page.

The official Aldar launch announcement is dated 22 July 2026 and confirms the district launch. It does not add a purchasable project name, number of units, individual inventory, or price in the page text retrieved. Marsa Al Saadiyat must therefore be reported as an official new destination/master-plan announcement, not as a new inventory-bearing project in the site.

## Evidence — Marsa

- Official destination page: `https://www.aldar.com/properties/en/marsaalsaadiyat`
- Official launch announcement: `https://www.aldar.com/en/news-and-media/his-highness-sheikh-khaled-bin-mohamed-bin-zayed-al-nahyan-inaugurates-aed-100-billion-marsa-al-saadiyat`
- Official World of Aldar Marsa map state: `https://world.aldar.com/uae/abudhabi?v=2`

## Cultural District public units result

The official Saadiyat Cultural District page links to Aldar's residential-units catalogue filtered for Saadiyat Island: `https://www.aldar.com/properties/en/units?dst=Saadiyat+Island`. In the public browser session inspected, that catalogue loaded its page shell and cards' loading placeholders but did not expose rendered project names, unit identifiers, availability, prices, or a Pulse District product record in extracted text. It cannot be used as evidence for a price or a unit entry without a rendered official record.

The official Cultural District page itself remains a registration/marketing page. It contains no Pulse District inventory or price.

## Public-resource inspection — Pulse District

The public World of Aldar map downloads a visual overlay named `pulseDistrictOverlay.svg`, confirming that Pulse District has been placed visually in the Cultural District experience. The page's observed public data requests included a breadcrumb request to `propertyservice.world.aldar.com`, but no observed public resource or request identified Pulse District as a purchasable project, provided a product route, unit identifier, price, or availability record. A visual map overlay is not evidence of inventory.

DOM inspection of the public map confirms the same state. The Pulse marker has the test identifier `project-marker-pulseDistrict-pin-disabled`, an empty `data-code`, and no anchor (`href`) to an Explore or unit page. It is therefore a disabled, Coming Soon map marker rather than a public product release. No unit or price can be reported from it.

## Existing-project match — The Row Saadiyat

The Row Saadiyat is **not a new site addition**. It is already present in the stored Aldar resale snapshot with seven exact unit records. The current stored asking prices range from AED 8,300,789 to AED 11,281,700 for the following two- and three-bedroom apartments: `B4-04-01`, `B4-04-06`, `B1-01-15`, `B1-01-04`, `B5-03-12`, `B4-04-05`, and `B1-01-14`. These are existing snapshot values rather than a newly retrieved live offer; the project’s official October 2025 release confirms that the first phase comprised 315 one-, two-, and three-bedroom apartments, but it does not publish unit-level prices.

Pulse District and Marsa Al Saadiyat have zero project-name matches in the current Aldar sale and resale snapshots.

## Evidence

- World of Aldar official Abu Dhabi map: `https://world.aldar.com/uae/abudhabi?v=0`
- Browser inspection timestamp: 29 Aug 2026 (Gulf time)

## Integrity rule

No project, unit, price, or availability value from this audit is written to Saadiyat Resale Hub unless an official public source gives a stable identity and the exact field being recorded.
