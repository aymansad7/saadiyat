# Aldar Official Link Integrity Notes

The unit data currently carries `aldar_link` only where an official World of Aldar source URL was captured. Across the published inventory snapshot, 672 of 1,066 purchasable (`Available` or `New`) records have a source-backed URL; the remaining 394 do not.

The reported mobile evidence demonstrates that at least one linked World of Aldar unit page now returns a 404. An official URL must therefore be kept only as recorded source evidence and surfaced as an explicitly-labelled external source action, not reconstructed from project or unit names. Cards without a source-backed URL must not receive a guessed URL.

Direct verification on 27 Aug 2026: the official Mamsha Garden project page at `https://world.aldar.com/uae/abudhabi/mamshagarden` resolves and exposes Towers B1–B7, while the stored individual property URL for `MamshaGarden-B5-01-05` returns HTTP 404. This confirms the upstream individual property route has been withdrawn or changed; it is not safe to redirect that record to a different guessed unit path.

The live project page calls `propertyservice.world.aldar.com`, but its unit query endpoint returned HTTP 401 when inspected in the browser. It cannot be treated as a public live unit source or used to fabricate replacement URLs without Aldar-authorized credentials or a documented feed.

Opening Tower B5 on the live Mamsha Garden project experience confirms that the public interface presents project/building navigation. It did not expose a documented replacement unit URL for the withdrawn `MamshaGarden-B5-01-05` link. The fallback therefore remains the internal exact unit card, not a guessed external destination.

The user-provided current Aldar URL for `THESOURCETERRACES-R22-05-02` was verified on 27 Aug 2026. It resolves to **The Source Terraces · Floor 5 · Unit 5-02 · 4 Bedroom Apartment**, and uses the official format `/uae/abudhabi/thesourceterraces/property/R22-05-02/0?unitstate=floorplan&scheme=S1&furnished=true`. This is an approved source-backed alternate representation: the full inventory code has the project prefix `THESOURCETERRACES-`, while Aldar's current URL uses the terminal unit code `R22-05-02` followed by `/0` and optional visual-state query parameters.

## All-project URL probe — 27 Aug 2026

The read-only probe found live current individual-unit responses for these projects: Gardenia Bay, Rise By Athlon 1–4, Sama Yas, Yas Links Luxury Living, Yas Park Place, Faya Al Saadiyat, Faya Al Saadiyat II, Mamsha Gardens, Mamsha Palm, The Row Saadiyat, and The Source Terraces. All current URL shapes use a project-specific route plus `/property/<short-or-full-unit-code>/0?unitstate=floorplan&scheme=S1&furnished=true`.

For the remaining active projects, the test returned no source base, no live candidate, or a project page without a verified individual-unit route. Those projects are intentionally held out of the automatic URL transformation until their current official format is confirmed; no URL will be fabricated.

The Wilds is served by Aldar under the city path `/uae/dubai/wilds`, not the earlier Abu Dhabi path. Its public project map exposes the P2 and P5 areas present in the source inventory; the individual-unit path still requires a separately verified code format before it is added to the cards.

The Wilds current unit form was then verified as `/uae/dubai/wilds/property/P5-005-01/0?unitstate=floorplan&scheme=S1&furnished=true`; all 15 active source units responded with HTTP 200. The public `www.aldar.com` text search for the full Nobu code returned zero properties after the page loaded, so it is not a valid replacement destination for that unit.

World of Aldar redirects the Al Ghadeer Gardens project to `/uae/abudhabi/alghadeergardens/r2`. Its live interactive map enumerates the dataset keys `AlGhadeerGardens-R2-V-001…` and displays official visible labels such as `V 078-01` as well as `TH 001-01…`. The remaining direct property path must use this documented instance suffix rather than the first failed no-suffix attempts.

The Nobu project is available as `/uae/abudhabi/noburesidences`, and the official map identifies the relevant building as `Nobu Residences 2 East`. The next verification step is to open this building and extract the direct unit route for `B2-East-05-01`; no generic project URL will be used as a substitute for a unit link.

Opening the official Nobu Residences 2 East building confirms that the World of Aldar project map contains 19 units in that building, including the applicable apartment and penthouse inventory. The individual official route must still be obtained by selecting the numbered unit; no direct URL has been inferred.

Nobu B2 East navigates through the official hierarchy `/uae/abudhabi/noburesidences/b2e/05`. The Floor 5 plan exposes the individual official map key `noburesidences_b2e_05_01` and the visual unit label `05-01`, matching the source unit suffix. The final property page route will be captured only after opening this exact map key.

The former World of Aldar path `/uae/abudhabi/louvresidences` now returns the official 404 page. As a result, it cannot be used to construct a current individual Louvre unit URL; a current official project/unit route must be independently found before this source record is relinked.

World of Aldar redirects Al Deem Townhomes to `/uae/abudhabi/aldeemtownhomes/aldeem`. The official interactive map enumerates the key `aldeemtownhomes_aldeem_399_01` and displays `399-01`, matching the available source record `AlDeemTownhomes-AlDeem-TH-399`. The exact individual property route still needs capture from this key rather than a guessed `property/399-01` URL.

Opening the verified map key gave the exact official route `/uae/abudhabi/aldeemtownhomes/property/AlDeem-399-01/0?unitstate=floorplan&scheme=S1&furnished=true` for the source record `AlDeemTownhomes-AlDeem-TH-399`. This current link has now been added using the documented `AlDeem-{number}-01` format.
