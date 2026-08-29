# Yas Bay 360 Public Data Audit

**Audit date:** 29 Aug 2026  
**Source:** `https://www.yasbay.ae/360/`

## Initial public-resource finding

The supplied URL is a visual 360-degree masterplan experience, not an observable real-estate inventory portal. Its browser-accessible resources include `tour.xml`, `tour.js`, panorama image tiles, location preview images, hotspot images, and a masterplan graphic. No XHR, JSON, GraphQL, or price/inventory endpoint was loaded in the initial page session.

The public tour declares 19 scenes: Flat Masterplan, Flat Gallery, Masterplan, Gallery, West Residences, Communal Areas, West Waterfront, Skate Park, School Plots, twofour54 Plaza, Waterfront Entrance, Waterfront Centre, Pier71, twofour54, Hilton Hotel, Beach Club, Etihad Arena, Waterfront East, and East Residences.

The raw public tour file contains neither a price/AED marker nor a structured unit-price payload. It does include generic references to units and APIs inside the panorama viewer implementation; those are not evidence of a property-inventory API. No project, unit, availability, price, owner, or transaction data will be imported from this source without a separately documented public endpoint.

## Runtime check

The public `tour.js` runtime contains no `fetch()` calls and no third-party inventory, pricing, or GraphQL endpoint. Its only extracted URLs point to the panorama-viewer vendor documentation, the local viewer testing server, Miral, and Yas Bay itself. The single generic XHR reference belongs to the visual-tour runtime and is not an inventory request. Accordingly, the public 360 experience currently provides location and masterplan presentation assets only.
